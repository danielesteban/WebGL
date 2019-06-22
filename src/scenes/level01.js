import { quat, vec3 } from 'gl-matrix';
import Geometry from '@/geometry';
import { Box, Heightfield, Plane } from '@/geometries';
import Material from '@/material';
import Mesh from '@/mesh';
import FetchModel from '@/model';
import Scene from '@/scene';
import {
  GridVertex,
  GridFragment,
  StandardVertex,
  StandardFragment,
} from '@/shaders';
import Monkey from '@/models/monkey.bin';
import Sphere from '@/models/sphere.bin';

class Level01 extends Scene {
  constructor(args) {
    super(args);
    const { ContactMaterials } = Level01;
    const { renderer } = this;
    const {
      camera,
      context,
      physics,
    } = renderer;

    // Setup camera
    camera.position[1] = 1.5;
    camera.position[2] = 10;
    camera.updateTransform();

    // Generate geometries
    const geometries = {
      ground: new Plane({
        renderer,
        width: 512,
        height: 512,
      }),
      heightfield: new Heightfield({
        renderer,
        map: [...Array(97)].map((v, x) => [...Array(97)].map((v, y) => {
          const d = Math.sqrt(((x - 48) ** 2) + ((y - 48) ** 2));
          if (d >= 32) {
            return 4 - Math.min((d - 32) * 0.2, 4) - Math.random() * 0.2;
          }
          if (d >= 24) {
            return 4 + Math.random() * 0.5;
          }
          if (d <= 12) {
            return 2 - Math.random() * 0.5;
          }
          return d * 0.2 - Math.random() * 0.2;
        })),
      }),
      light: new Box({
        renderer,
        width: 0.15,
        height: 0.05,
        depth: 0.15,
      }),
      hinge: new Box({
        renderer,
        width: 1,
        height: 0.2,
        depth: 0.2,
      }),
      target: new Box({
        renderer,
        width: 1,
        height: 2,
        depth: 0.1,
      }),
      box: new Box({
        renderer,
        width: 0.75,
        height: 0.75,
        depth: 0.75,
      }),
    };

    // Setup materials
    const materials = {
      grid: new Material({
        context,
        shaders: {
          vertex: GridVertex,
          fragment: GridFragment,
        },
      }),
      standard: new Material({
        context,
        shaders: {
          vertex: StandardVertex,
          fragment: StandardFragment,
        },
      }),
    };

    // Setup lights
    this.lightsAnimation = 0;
    this.lights.forEach(({ color }, index) => {
      vec3.set(color, Math.random(), Math.random(), Math.random());
      vec3.normalize(color, color);
      const mesh = new Mesh({
        albedo: vec3.scale(vec3.create(), color, 2.0),
        geometry: geometries.light,
        material: materials.standard,
        // physics: { mass: 0, kinematic: true },
      });
      this.add(mesh);
      this.lights[index].mesh = mesh;
    });

    // Setup a frictiony contact material for the boxes
    physics.addContactMaterial({
      materialA: 0,
      materialB: ContactMaterials.Frictiony,
      friction: 1.0,
      restitution: 0,
    });

    // Setup a bouncy contact material for the spheres
    physics.addContactMaterial({
      materialA: 0,
      materialB: ContactMaterials.Bouncy,
      friction: 0.8,
      restitution: 0.4,
    });

    function smoothAlbedoUpdate({ delta }) {
      const { albedo, albedoAnimation } = this;
      if (!albedoAnimation) {
        return;
      }
      if (!albedoAnimation.steps) {
        albedoAnimation.origin = new Float32Array(albedo);
        albedoAnimation.step = 0;
        albedoAnimation.steps = albedo.map((value, component) => (
          (albedoAnimation.target[component] - albedo[component])
        ));
      }
      albedo.forEach((value, component) => {
        const step = albedoAnimation.steps[component] * albedoAnimation.step;
        albedo[component] = (
          albedoAnimation.origin[component] + step
        );
      });
      albedoAnimation.step += delta * 0.001;
      if (albedoAnimation.step >= 1) {
        delete this.albedoAnimation;
        albedo.forEach((value, component) => {
          albedo[component] = albedoAnimation.target[component];
        });
      }
    }

    function copyAlbedoOnContact(bodies) {
      const body = physics.bodies.index.get(bodies[bodies.length - 1]);
      if (body && body.isSphere) {
        this.albedoAnimation = {
          target: new Float32Array(body.albedo),
        };
      }
    }

    // Spawn Ground & Heightfield
    this.add(new Mesh({
      albedo: new Float32Array([0.6, 0.6, 0.6]),
      position: new Float32Array([0, -2.5, 0]),
      geometry: geometries.ground,
      material: materials.standard,
      physics: { mass: 0 },
    }));
    this.add(new Mesh({
      albedo: new Float32Array([0.6, 0.6, 0.6]),
      position: new Float32Array([
        96 * 0.3 * -0.5,
        -4,
        96 * 0.3 * 0.5,
      ]),
      rotation: quat.fromEuler(quat.create(), -90, 0, 0),
      geometry: geometries.heightfield,
      material: materials.grid,
      physics: { mass: 0 },
    }));

    // Spawn hinge targets
    [
      // Targets
      {
        position: new Float32Array([-3, 2, 0]),
        geometry: geometries.target,
        material: materials.standard,
      },
      {
        position: new Float32Array([3, 2, 0]),
        geometry: geometries.target,
        material: materials.standard,
      },
    ].forEach((data) => {
      const mesh = new Mesh({
        ...data,
        physics: { mass: 10 },
        onAnimationFrame: smoothAlbedoUpdate,
        onContact: copyAlbedoOnContact,
      });
      this.add(mesh);
      const hinge = new Mesh({
        ...data,
        albedo: new Float32Array([0.3, 0.3, 0.3]),
        geometry: geometries.hinge,
        position: new Float32Array([
          data.position[0],
          data.position[1] + 1.15,
          data.position[2],
        ]),
        physics: { mass: 0 },
      });
      this.add(hinge);
      Promise.all([
        hinge.physics.body,
        mesh.physics.body,
      ])
        .then(() => (
          physics.addConstraint({
            type: 'hinge',
            bodyA: hinge.physics.body,
            bodyB: mesh.physics.body,
            pivotB: [0, 1.15, 0],
          })
        ));
    });

    // Spawn some boxes
    for (let i = 0; i < 8; i += 1) {
      const box = new Mesh({
        albedo: new Float32Array([
          Math.random(),
          Math.random(),
          Math.random(),
        ]),
        position: new Float32Array([
          Math.random() * 16 - 8,
          Math.random() * 6 + 8,
          Math.random() * 16 - 8,
        ]),
        geometry: geometries.box,
        material: materials.standard,
        physics: { mass: 5, material: ContactMaterials.Frictiony },
      });
      vec3.normalize(box.albedo, box.albedo);
      this.add(box);
    }

    // Spawn some spheres
    FetchModel(Sphere)
      .then((model) => {
        const geometry = new Geometry({
          ...model,
          renderer,
          collision: {
            type: 'sphere',
            radius: 0.25,
          },
        });
        this.sphere = 0;
        this.spheres = [...Array(24)].map(() => {
          const mesh = new Mesh({
            albedo: new Float32Array([Math.random(), Math.random(), Math.random()]),
            position: new Float32Array([
              Math.random() * 16 - 8,
              3 + Math.random() * 8,
              Math.random() * 16 - 8,
            ]),
            scale: new Float32Array([0.5, 0.5, 0.5]),
            geometry,
            material: materials.standard,
            physics: { mass: 5, material: ContactMaterials.Bouncy },
          });
          mesh.isSphere = true;
          vec3.normalize(mesh.albedo, mesh.albedo);
          this.add(mesh);
          return mesh;
        });
      });

    // Spawn a kinematic monkey
    FetchModel(Monkey)
      .then(model => (
        this.add(new Mesh({
          albedo: new Float32Array([0.6, 0.6, 0.6]),
          position: new Float32Array([0, 2.2, 0]),
          geometry: new Geometry({
            ...model,
            renderer,
            collision: {
              type: 'trimesh',
              ...model,
            },
          }),
          material: materials.standard,
          physics: {
            mass: 0,
            kinematic: true,
          },
          onAnimationFrame({ delta, time }) {
            const animation = Math.sin(time * 0.001);
            quat.fromEuler(this.rotation, 0, animation * 25, 0);
            this.updateTransform();
            if (this.physics.body.then) {
              return;
            }
            physics.resetBody({
              body: this.physics.body,
              rotation: [...this.rotation],
            });
            smoothAlbedoUpdate.bind(this)({ delta });
          },
          onContact: copyAlbedoOnContact,
        }))
      ));
  }

  animate(args) {
    super.animate(args);
    const {
      renderer: { camera, input, physics },
      sphere,
      spheres,
    } = this;

    // Launch spheres when the user clicks the mouse
    if (spheres && input.buttons.primaryDown) {
      const { albedo, physics: { body } } = spheres[sphere];
      vec3.set(albedo, Math.random(), Math.random(), Math.random());
      vec3.normalize(albedo, albedo);
      const aux = vec3.create();
      vec3.scaleAndAdd(aux, camera.position, camera.front, 0.5);
      physics.resetBody({
        body,
        position: [...aux],
        rotation: [0, 0, 0, 1],
        velocity: [...vec3.scale(aux, camera.front, 15)],
        angularVelocity: [0, 0, 0],
      });
      this.sphere = (sphere + 1) % spheres.length;
    }

    // Animate the lights
    const step = Math.PI * 2 / this.lights.length;
    this.lightsAnimation += args.delta * 0.0002;
    let a = (this.lightsAnimation * 0.25) % 1;
    a = a >= 0.5 ? 1 - a : a;
    const distance = 8 - a * 8;
    this.lights.forEach(({ mesh, position }, index) => {
      const angle = step * index - this.lightsAnimation;
      position[0] = Math.cos(angle) * distance;
      position[1] = Math.sin(distance + (index % 2)) + 2;
      position[2] = Math.sin(angle) * distance;
      vec3.copy(mesh.position, position);
      mesh.position[1] -= 0.1;
      mesh.updateTransform();
      // physics.resetBody({
      //   body: mesh.physics.body,
      //   position: [...this.position],
      // });
    });

    // TODO: Implement this once the physics worker has a raycasting action
    // Pull the player down to the closest scenery
    // const hit = physics.getClosestBody({
    //   origin: [
    //     camera.position[0],
    //     camera.position[1] + 10,
    //     camera.position[2],
    //   ],
    //   direction: [0, -20, 0],
    // });
    // if (hit) {
    //   const step = args.delta * 0.0025;
    //   camera.position[1] += Math.min(Math.max(
    //     (hit.hitPointWorld.y + 1.5) - camera.position[1],
    //     -step
    //   ), step);
    //   camera.updateTransform();
    // }
  }
}

Level01.ContactMaterials = {
  Frictiony: 1,
  Bouncy: 2,
};

export default Level01;
