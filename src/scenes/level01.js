import { quat } from 'gl-matrix';
import Geometry from '@/geometry';
import Material from '@/material';
import Mesh from '@/mesh';
import FetchModel from '@/model';
import Physics from '@/physics';
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
      physics,
      renderer: { context },
      root,
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
          shape: {
            type: 'box',
            radius: [10, 1, 10],
            offset: [0, -1, 0],
          },
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
    ].forEach((data) => {
      const mesh = new Mesh(data);
      root.push(mesh);
      if (mesh.physics) {
        physics.addBody(mesh);
      }
    });

    FetchModel(Monkey)
      .then((model) => {
        const mesh = new Mesh({
          position: new Float32Array([4, 2, -4]),
          geometry: new Geometry({
            ...model,
            context,
          }),
          material: materials.standard,
          onAnimationFrame: ({ time }) => {
            const animation = Math.sin(time * 0.001);
            quat.fromEuler(mesh.rotation, animation * 30, 0, 0);
            mesh.updateTransform();
          },
        });
        root.push(mesh);
      });

    FetchModel(Sphere)
      .then((model) => {
        const mesh = new Mesh({
          position: new Float32Array([0, 1, -4]),
          geometry: new Geometry({
            ...model,
            context,
          }),
          material: materials.standard,
          physics: {
            mass: 0.1,
            shape: {
              type: 'sphere',
              radius: 0.5,
            },
          },
        });
        root.push(mesh);
        physics.addBody(mesh);
        Physics.applyImpulse(mesh.physics.body, [-0.1, 0, 0]);
      });

    this.lights.forEach(({ position, color }, index) => {
      position.set([
        (index - 16) * 1.5, 1, -6 + (index % 2) * 2,
      ]);
      color.set([Math.random(), Math.random(), Math.random()]);
    });
  }
}

export default Level01;
