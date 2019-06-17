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
    } = this;

    const materials = {
      grid: new Material({
        context,
        shaders: {
          vertex: GridVertex,
          fragment: GridFragment,
        },
      }),
    };

    const geometries = {
      ground: new Geometry({
        context,
        position: new Float32Array([
          -20, 0, 20,
          20, 0, 20,
          20, 0, -20,
          -20, 0, -20,
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

    [
      // Ground
      {
        albedo: new Float32Array([0.2, 0.3, 0.2]),
        geometry: geometries.ground,
        material: materials.grid,
      },
    ].forEach(data => (
      this.add(new Mesh(data))
    ));

    this.lights.forEach(({ position, color }, index) => {
      position.set([
        (index - 8) * 1.5, 1, -6 + (index % 2) * 3,
      ]);
      color.set([Math.random(), Math.random(), Math.random()]);
    });
  }
}

export default Level02;
