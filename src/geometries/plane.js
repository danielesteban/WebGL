import Geometry from '@/geometry';

class Plane extends Geometry {
  constructor({
    context,
    width,
    height,
  }) {
    const position = new Float32Array([
      width * -0.5, 0, height * 0.5,
      width * 0.5, 0, height * 0.5,
      width * 0.5, 0, height * -0.5,
      width * -0.5, 0, height * -0.5,
    ]);
    const normal = new Float32Array([
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
    ]);
    const index = new Uint16Array([
      0, 1, 2,
      2, 3, 0,
    ]);
    super({
      context,
      position,
      normal,
      index,
      collision: {
        type: 'box',
        radius: [
          width * 0.5,
          1,
          height * 0.5,
        ],
        offset: [0, -1, 0],
      },
    });
  }
}

export default Plane;
