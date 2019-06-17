class Material {
  constructor({
    context: GL,
    shaders,
    uniforms = [
      'albedo',
      'camera',
      'transform',
    ],
  }) {
    this.context = GL;
    const vertex = this.compile('VERTEX_SHADER', shaders.vertex);
    const fragment = this.compile('FRAGMENT_SHADER', shaders.fragment);
    const program = GL.createProgram();
    this.shaders = {
      vertex: GL.attachShader(program, vertex),
      fragment: GL.attachShader(program, fragment),
    };
    GL.linkProgram(program);
    if (!GL.getProgramParameter(program, GL.LINK_STATUS)) {
      console.log(`${shaders.vertex}\n${shaders.fragment}`);
    }
    this.program = program;
    this.uniforms = uniforms.reduce((locations, id) => {
      locations[id] = GL.getUniformLocation(program, id);
      return locations;
    }, {});
  }

  compile(type, source) {
    const { context: GL } = this;
    const shader = GL.createShader(GL[type]);
    GL.shaderSource(shader, source);
    GL.compileShader(shader);
    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
      console.log(`${source}\n`, GL.getShaderInfoLog(shader));
    }
    return shader;
  }

  dispose() {
    const {
      context: GL,
      program,
      shaders: {
        vertex,
        fragment,
      },
    } = this;
    GL.deleteProgram(program);
    GL.deleteShader(vertex);
    GL.deleteShader(fragment);
  }
}

export default Material;
