import { vec3 } from 'gl-matrix';
import Geometry from '@/geometry';

class HeightField extends Geometry {
  constructor({
    renderer,
    map,
    elementSize = 0.3,
  }) {
    const { minValue, maxValue } = map.reduce(
      ({ minValue, maxValue }, row) => row.reduce(
        ({ minValue, maxValue }, value) => ({
          minValue: Math.min(minValue, value),
          maxValue: Math.max(maxValue, value),
        }),
        { minValue, maxValue }
      ),
      { minValue: Infinity, maxValue: -Infinity }
    );
    const width = map[0].length;
    const height = map.length;
    const position = new Float32Array((width * height) * 3);
    const normal = new Float32Array((width * height) * 3);
    const index = new Uint16Array(((width - 1) * (height - 1)) * 6);
    let offset = 0;
    let vertex = 0;
    const vertices = [];
    for (let y = 0; y < height; y += 1) {
      vertices[y] = [];
      for (let x = 0; x < width; x += 1, offset += 3, vertex += 1) {
        position[offset] = x * elementSize;
        position[offset + 1] = y * elementSize;
        position[offset + 2] = map[x][y];
        vertices[y][x] = vertex;
      }
    }
    offset = 0;
    const aux = {
      A: vec3.create(),
      B: vec3.create(),
      C: vec3.create(),
      CB: vec3.create(),
      AB: vec3.create(),
      N: vec3.create(),
    };
    const pushTriangle = (v1, v2, v3) => {
      index[offset] = v1;
      index[offset + 1] = v2;
      index[offset + 2] = v3;
      offset += 3;

      v1 *= 3;
      v2 *= 3;
      v3 *= 3;
      vec3.set(aux.A, position[v1], position[v1 + 1], position[v1 + 2]);
      vec3.set(aux.B, position[v2], position[v2 + 1], position[v2 + 2]);
      vec3.set(aux.C, position[v3], position[v3 + 1], position[v3 + 2]);
      vec3.sub(aux.CB, aux.C, aux.B);
      vec3.sub(aux.AB, aux.A, aux.B);
      vec3.cross(aux.N, aux.CB, aux.AB);
      const [x, y, z] = aux.N;
      [v1, v2, v3].forEach((v) => {
        normal[v] += x;
        normal[v + 1] += y;
        normal[v + 2] += z;
      });
    };
    for (let y = 0; y < height - 1; y += 1) {
      for (let x = 0; x < width - 1; x += 1) {
        pushTriangle(
          vertices[y][x],
          vertices[y][x + 1],
          vertices[y + 1][x + 1]
        );
        pushTriangle(
          vertices[y + 1][x + 1],
          vertices[y + 1][x],
          vertices[y][x]
        );
      }
    }
    for (let i = 0; i < normal.length; i += 3) {
      vec3.set(aux.N, normal[i], normal[i + 1], normal[i + 2]);
      vec3.normalize(aux.N, aux.N);
      const [x, y, z] = aux.N;
      normal[i] = x;
      normal[i + 1] = y;
      normal[i + 2] = z;
    }
    super({
      renderer,
      position,
      normal,
      index,
      collision: {
        type: 'heightfield',
        elementSize,
        map,
        minValue,
        maxValue,
      },
    });
  }
}

export default HeightField;
