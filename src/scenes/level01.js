import { quat } from 'gl-matrix';
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
      wall: new Geometry({
        context,
        position: [
          -1, 1, 0,
          1, 1, 0,
          1, -1, 0,
          -1, -1, 0,
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

    function animateTriangle({ time }) {
      const animation = Math.sin(time * 0.001);
      quat.fromEuler(this.rotation, 0, animation * 180, 0);
      const scale = 1 + animation * 2;
      this.scale[0] = scale;
      this.scale[2] = scale;
      this.updateTransform();
    }

    [
      // Ground
      {
        albedo: [0.2, 0.3, 0.2],
        geometry: geometries.ground,
        material: materials.grid,
      },
      // Walls
      {
        albedo: [0, 0.5, 0],
        position: [-9, 1, -10],
        geometry: geometries.wall,
        material: materials.standard,
      },
      {
        albedo: [0, 0, 1],
        position: [9, 1, -10],
        geometry: geometries.wall,
        material: materials.standard,
      },
      // Animated triangles
      {
        albedo: [0, 0.5, 0],
        position: [-1, 0.5, -2],
        geometry: geometries.triangle,
        onAnimationFrame: animateTriangle,
        material: materials.standard,
      },
      {
        albedo: [0, 0, 1],
        position: [1, 0.5, -2],
        geometry: geometries.triangle,
        onAnimationFrame: animateTriangle,
        material: materials.standard,
      },
    ].forEach((data) => {
      const mesh = new Mesh(data);
      root.push(mesh);
    });
  }

  animate(args) {
    super.animate(args);
    const { time } = args;
    const { renderer: { camera } } = this;
    const animation = Math.sin(time * 0.001);
    camera.position[2] = 3 + animation;
    camera.yaw = Math.PI * 1.5 + animation * 0.1;
    camera.updateVectors();
  }
}

export default Level01;
