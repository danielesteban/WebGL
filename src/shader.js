class Shader {
  constructor({
    context: GL,
    shaders,
  }) {
    this.context = GL;
    const vertex = this.compile('VERTEX_SHADER', shaders.vertex);
    const fragment = this.compile('FRAGMENT_SHADER', shaders.fragment);
    const program = GL.createProgram();
    GL.attachShader(program, vertex);
    GL.attachShader(program, fragment);
    GL.linkProgram(program);
    if (!GL.getProgramParameter(program, GL.LINK_STATUS)) {
      console.log(`${shaders.vertex}\n${shaders.fragment}`);
    }
    this.program = program;
    this.attributes = {
      position: GL.getAttribLocation(program, 'position'),
    };
    this.uniforms = {
      albedo: GL.getUniformLocation(program, 'albedo'),
      camera: GL.getUniformLocation(program, 'camera'),
      transform: GL.getUniformLocation(program, 'transform'),
    };
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
}

export default Shader;
