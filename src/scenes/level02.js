import Geometry from '@/geometry';
import Material from '@/material';
import Mesh from '@/mesh';
import Scene from '@/scene';
import {
  GridVertex,
  GridFragment,
  StandardVertex,
  StandardFragment,
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
        position: [
          -10, 0, 10,
          10, 0, 10,
          10, 0, -10,
          -10, 0, -10,
        ],
        index: [
          0, 1, 2,
          2, 3, 0,
        ],
      }),
      triangle: new Geometry({
        context,
        position: [
          -0.5, -0.5, 0,
          0.5, -0.5, 0,
          0, 0.5, 0,
        ],
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
        albedo: [0.2, 0.3, 0.2],
        geometry: geometries.ground,
        material: materials.grid,
      },
      // Triangle
      {
        albedo: [0, 0.5, 0],
        position: [0, 0.5, -2],
        geometry: geometries.triangle,
        material: materials.standard,
      },
    ].forEach((data) => {
      const mesh = new Mesh(data);
      root.push(mesh);
    });
  }
}

export default Level02;
