import { quat } from 'gl-matrix';
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

class Level01 extends Scene {
  constructor(args) {
    super(args);
    const {
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

    function animateTriangle({ time }) {
      const animation = Math.sin(time * 0.001);
      quat.fromEuler(this.rotation, animation * 30, animation * 180, 0);
      const scale = 1 + animation;
      this.scale[0] = scale;
      this.scale[2] = scale;
      this.updateTransform();
    }

    [
      // Ground
      {
        albedo: new Float32Array([0.2, 0.3, 0.2]),
        geometry: geometries.ground,
        material: materials.grid,
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
      // Animated triangles
      {
        albedo: new Float32Array([0, 0.5, 0]),
        position: new Float32Array([-1, 1.5, -2]),
        geometry: geometries.triangle,
        onAnimationFrame: animateTriangle,
        material: materials.standard,
      },
      {
        albedo: new Float32Array([0, 0, 1]),
        position: new Float32Array([1, 1.5, -2]),
        geometry: geometries.triangle,
        onAnimationFrame: animateTriangle,
        material: materials.standard,
      },
    ].forEach((data) => {
      const mesh = new Mesh(data);
      root.push(mesh);
    });

    FetchModel(Monkey)
      .then((model) => {
        const mesh = new Mesh({
          albedo: new Float32Array([0.5, 0, 0]),
          position: new Float32Array([0, 2, -4]),
          geometry: new Geometry({
            ...model,
            context,
          }),
          material: materials.standard,
          onAnimationFrame: ({ time }) => {
            const animation = Math.sin(time * 0.001);
            quat.fromEuler(mesh.rotation, animation * 30, animation * 180, 0);
            mesh.updateTransform();
          },
        });
        root.push(mesh);
      });
  }
}

export default Level01;
