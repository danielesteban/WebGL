import { Box, Plane } from '@/geometries';
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
      renderer,
    } = this;
    const { context } = renderer;

    const geometries = {
      ground: new Plane({
        renderer,
        width: 512,
        height: 512,
      }),
      box: new Box({
        renderer,
        width: 1,
        height: 1,
        depth: 1,
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

    // Spawn Ground
    this.add(new Mesh({
      albedo: new Float32Array([0.2, 0.3, 0.2]),
      geometry: geometries.ground,
      material: materials.grid,
    }));

    // Spawn some boxes
    for (let i = 0; i < this.lights.length; i += 1) {
      const scale = 0.5 + Math.random();
      const box = new Mesh({
        albedo: new Float32Array([
          Math.random(),
          Math.random(),
          Math.random(),
        ]),
        position: new Float32Array([
          (Math.random() * 8 - 4) * 2 * scale,
          scale * 0.5,
          (Math.random() * 8 - 4) * 2 * scale,
        ]),
        scale: new Float32Array([scale, scale, scale]),
        geometry: geometries.box,
        material: materials.standard,
      });
      this.add(box);
      const light = this.lights[i];
      light.position.set([
        box.position[0],
        box.position[1] + scale,
        box.position[2],
      ]);
      light.color.set(box.albedo);
    }
  }
}

export default Level02;
