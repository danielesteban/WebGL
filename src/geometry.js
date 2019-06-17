import { vec3 } from 'gl-matrix';

class Geometry {
  constructor({
    renderer: {
      context: GL,
      physics,
    },
    index,
    position,
    normal,
    color,
    uv,
    collision,
  }) {
    const { attributes } = Geometry;
    const vao = GL.createVertexArray();
    GL.bindVertexArray(vao);
    const vbos = [];
    const createAndBindVBO = (data, attribute, size, type = GL.FLOAT) => {
      const buffer = GL.createBuffer();
      GL.bindBuffer(GL.ARRAY_BUFFER, buffer);
      GL.bufferData(GL.ARRAY_BUFFER, data, GL.STATIC_DRAW, 0);
      GL.enableVertexAttribArray(attributes[attribute]);
      GL.vertexAttribPointer(attributes[attribute], size, type, false, 0, 0);
      vbos.push(buffer);
    };
    createAndBindVBO(position, 'position', 3);
    if (normal) {
      createAndBindVBO(normal, 'normal', 3);
    }
    if (color) {
      createAndBindVBO(color, 'color', 3);
    }
    if (uv) {
      createAndBindVBO(uv, 'uv', 2);
    }
    if (index) {
      const ebo = GL.createBuffer();
      GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, ebo);
      GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, index, GL.STATIC_DRAW);
      this.ebo = ebo;
      this.count = index.length;
    } else {
      this.count = position.length / 3;
    }
    GL.bindVertexArray(null);
    this.context = GL;
    this.vao = vao;
    this.vbos = vbos;

    if (collision) {
      this.collision = physics
        .getShape(collision)
        .then(({ id }) => {
          this.collision = {
            shape: id,
            offset: collision.offset,
          };
        });
    }

    const min = vec3.create();
    const max = vec3.create();
    const aux = vec3.create();
    for (let i = 0; i < position.length; i += 3) {
      vec3.set(aux, position[i], position[i + 1], position[i + 2]);
      vec3.min(min, min, aux);
      vec3.max(max, max, aux);
    }
    vec3.sub(aux, max, min);
    this.origin = vec3.scaleAndAdd(vec3.create(), min, aux, 0.5);
    this.radius = vec3.distance(min, max) * 0.5;
  }

  dispose() {
    const {
      context: GL,
      ebo,
      vao,
      vbos,
    } = this;
    GL.deleteVertexArray(vao);
    vbos.forEach(buffer => (
      GL.deleteBuffer(buffer)
    ));
    if (ebo) {
      GL.deleteBuffer(ebo);
    }
  }
}

Geometry.attributes = {
  position: 0,
  normal: 1,
  color: 2,
  uv: 3,
};

export default Geometry;
