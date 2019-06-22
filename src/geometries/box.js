import Geometry from '@/geometry';

class Box extends Geometry {
  constructor({
    renderer,
    width,
    height,
    depth,
  }) {
    const position = new Float32Array([
      // South
      width * -0.5, height * -0.5, depth * 0.5,
      width * 0.5, height * -0.5, depth * 0.5,
      width * 0.5, height * 0.5, depth * 0.5,
      width * -0.5, height * 0.5, depth * 0.5,

      // East
      width * 0.5, height * -0.5, depth * 0.5,
      width * 0.5, height * -0.5, depth * -0.5,
      width * 0.5, height * 0.5, depth * -0.5,
      width * 0.5, height * 0.5, depth * 0.5,

      // North
      width * 0.5, height * -0.5, depth * -0.5,
      width * -0.5, height * -0.5, depth * -0.5,
      width * -0.5, height * 0.5, depth * -0.5,
      width * 0.5, height * 0.5, depth * -0.5,

      // West
      width * -0.5, height * -0.5, depth * -0.5,
      width * -0.5, height * -0.5, depth * 0.5,
      width * -0.5, height * 0.5, depth * 0.5,
      width * -0.5, height * 0.5, depth * -0.5,

      // Top
      width * -0.5, height * 0.5, depth * 0.5,
      width * 0.5, height * 0.5, depth * 0.5,
      width * 0.5, height * 0.5, depth * -0.5,
      width * -0.5, height * 0.5, depth * -0.5,

      // Bottom
      width * -0.5, height * -0.5, depth * -0.5,
      width * 0.5, height * -0.5, depth * -0.5,
      width * 0.5, height * -0.5, depth * 0.5,
      width * -0.5, height * -0.5, depth * 0.5,
    ]);
    const normal = new Float32Array([
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,

      1, 0, 0,
      1, 0, 0,
      1, 0, 0,
      1, 0, 0,

      0, 0, -1,
      0, 0, -1,
      0, 0, -1,
      0, 0, -1,

      -1, 0, 0,
      -1, 0, 0,
      -1, 0, 0,
      -1, 0, 0,

      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,

      0, -1, 0,
      0, -1, 0,
      0, -1, 0,
      0, -1, 0,
    ]);
    const index = new Uint16Array([
      0, 1, 2,
      2, 3, 0,

      4, 5, 6,
      6, 7, 4,

      8, 9, 10,
      10, 11, 8,

      12, 13, 14,
      14, 15, 12,

      16, 17, 18,
      18, 19, 16,

      20, 21, 22,
      22, 23, 20,
    ]);
    super({
      renderer,
      position,
      normal,
      index,
      collision: {
        type: 'box',
        radius: [
          width * 0.5,
          height * 0.5,
          depth * 0.5,
        ],
      },
    });
  }
}

export default Box;
