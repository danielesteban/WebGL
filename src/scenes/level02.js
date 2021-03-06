import Geometry from '@/geometry';
import Material from '@/material';
import Mesh from '@/mesh';
import Scene from '@/scene';
import {
  GridVertex,
  GridFragment,
} from '@/shaders';

class Level02 extends Scene {
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
    };

    const materials = {
      grid: new Material({
        context,
        shaders: {
          vertex: GridVertex,
          fragment: GridFragment,
        },
      }),
    };

    [
      // Ground
      {
        albedo: new Float32Array([0.2, 0.3, 0.2]),
        geometry: geometries.ground,
        material: materials.grid,
      },
    ].forEach((data) => {
      const mesh = new Mesh(data);
      root.push(mesh);
    });

    this.lights.forEach(({ position, color }, index) => {
      position.set([
        (index - 16) * 1.5, 1, -6 + (index % 2) * 3,
      ]);
      color.set([Math.random(), Math.random(), Math.random()]);
    });
  }
}

export default Level02;
