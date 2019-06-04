import { quat, vec3 } from 'gl-matrix';
import Geometry from '@/geometry';
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
    const {
      renderer: { context },
    } = this;

    const geometries = {
      ground: new Geometry({
        context,
        position: new Float32Array([
          -10, 0, 10,
          10, 0, 10,
          10, 0, -10,
          -10, 0, -10,
        ]),
        normal: new Float32Array([
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
        ]),
        index: new Uint16Array([
          0, 1, 2,
          2, 3, 0,
        ]),
        collision: {
          type: 'box',
          radius: [10, 1, 10],
          offset: [0, -1, 0],
        },
      }),
      wall: new Geometry({
        context,
        position: new Float32Array([
          -4.5, 1, 0,
          5, 1, 0,
          5, -1, 0,
          -4.5, -1, 0,
        ]),
        normal: new Float32Array([
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
        ]),
        index: new Uint16Array([
          0, 1, 2,
          2, 3, 0,
        ]),
      }),
      triangle: new Geometry({
        context,
        position: new Float32Array([
          -0.5, -0.5, 0,
          0.5, -0.5, 0,
          0, 0.5, 0,
        ]),
        normal: new Float32Array([
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
        ]),
      }),
    };

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

    [
      // Ground
      {
        albedo: new Float32Array([0.2, 0.3, 0.2]),
        geometry: geometries.ground,
        material: materials.grid,
        physics: {
          mass: 0,
        },
      },
      // Walls
      {
        albedo: new Float32Array([0, 0.5, 0]),
        position: new Float32Array([-5, 1.5, -10]),
        geometry: geometries.wall,
        material: materials.standard,
      },
      {
        albedo: new Float32Array([0, 0, 1]),
        position: new Float32Array([5, 1.5, -10]),
        geometry: geometries.wall,
        material: materials.standard,
      },
    ].forEach(data => (
      this.add(new Mesh(data))
    ));

    FetchModel(Monkey)
      .then(model => (
        this.add(new Mesh({
          position: new Float32Array([4, 2, -4]),
          geometry: new Geometry({
            ...model,
            context,
          }),
          material: materials.standard,
          onAnimationFrame({ time }) {
            const animation = Math.sin(time * 0.001);
            quat.fromEuler(this.rotation, animation * 30, 0, 0);
            this.updateTransform();
          },
        }))
      ));

    FetchModel(Sphere)
      .then((model) => {
        const geometry = new Geometry({
          ...model,
          collision: {
            type: 'sphere',
            radius: 0.5,
          },
          context,
        });
        this.sphere = 0;
        this.spheres = [...Array(32)].map(() => {
          const mesh = new Mesh({
            position: new Float32Array([Math.random() * 20 - 10, 1, Math.random() * 20 - 10]),
            geometry,
            material: materials.standard,
            physics: {
              mass: 0.5,
            },
          });
          this.add(mesh);
          return mesh;
        });
      });

    this.lights.forEach(({ position, color }, index) => {
      position.set([
        (index - 16) * 1.5, 1, -6 + (index % 2) * 2,
      ]);
      color.set([Math.random(), Math.random(), Math.random()]);
    });
  }

  animate(args) {
    super.animate(args);
    const {
      renderer: { camera, input },
      sphere,
      spheres,
    } = this;
    if (spheres && input.buttons.primaryDown) {
      const { albedo, physics: { body } } = spheres[sphere];
      const aux = vec3.create();
      vec3.scaleAndAdd(aux, camera.position, camera.front, 0.5);
      vec3.set(albedo, Math.random(), Math.random(), Math.random());
      body.position.set(
        aux[0],
        aux[1],
        aux[2]
      );
      body.quaternion.set(0, 0, 0, 1);
      body.velocity.set(...vec3.scale(aux, camera.front, 10));
      body.angularVelocity.set(0, 0, 0);
      body.sleepState = 0;
      this.sphere = (sphere + 1) % spheres.length;
    }
  }
}

export default Level01;
