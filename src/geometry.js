class Geometry {
  constructor({
    context: GL,
    index,
    position,
    normal,
    color,
    uv,
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
    createAndBindVBO(new Float32Array(position), 'position', 3);
    createAndBindVBO(new Float32Array(normal), 'normal', 3);
    createAndBindVBO(new Float32Array(color), 'color', 3);
    createAndBindVBO(new Float32Array(uv), 'uv', 2);
    if (index) {
      const ebo = GL.createBuffer();
      GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, ebo);
      GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(index), GL.STATIC_DRAW);
      this.ebo = ebo;
      this.count = index.length;
    } else {
      this.count = position.length / 3;
    }
    GL.bindVertexArray(null);
    this.context = GL;
    this.vao = vao;
    this.vbos = vbos;
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
