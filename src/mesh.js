class Mesh {
  constructor({
    albedo,
    context: GL,
    position,
  }) {
    const vbo = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, vbo);
    GL.bufferData(GL.ARRAY_BUFFER, position, GL.STATIC_DRAW, 0);
    this.albedo = albedo;
    this.vbo = vbo;
  }
}

export default Mesh;
