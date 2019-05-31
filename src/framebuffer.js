class Framebuffer {
  constructor({
    context: GL,
  }) {
    const { textures } = Framebuffer;
    const { drawingBufferWidth: width, drawingBufferHeight: height } = GL;
    this.context = GL;

    this.renderBuffer = GL.createFramebuffer();
    GL.bindFramebuffer(GL.FRAMEBUFFER, this.renderBuffer);
    textures.forEach(({ id, attachment }) => {
      this[`${id}Buffer`] = GL.createRenderbuffer();
      GL.bindRenderbuffer(GL.RENDERBUFFER, this[`${id}Buffer`]);
      GL.renderbufferStorageMultisample(
        GL.RENDERBUFFER,
        GL.getParameter(GL.MAX_SAMPLES),
        id === 'depth' ? GL.DEPTH_COMPONENT24 : GL.RGBA32F,
        width,
        height
      );
      GL.framebufferRenderbuffer(
        GL.FRAMEBUFFER,
        GL[attachment],
        GL.RENDERBUFFER,
        this[`${id}Buffer`]
      );
      GL.bindRenderbuffer(GL.RENDERBUFFER, null);
    });
    GL.bindFramebuffer(GL.FRAMEBUFFER, null);

    this.outputBuffer = GL.createFramebuffer();
    GL.bindFramebuffer(GL.FRAMEBUFFER, this.outputBuffer);
    textures.forEach(({ id, attachment }) => {
      this[`${id}Texture`] = GL.createTexture();
      GL.bindTexture(GL.TEXTURE_2D, this[`${id}Texture`]);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
      GL.texImage2D(
        GL.TEXTURE_2D,
        0,
        id === 'depth' ? GL.DEPTH_COMPONENT32F : GL.RGBA32F,
        width,
        height,
        0,
        id === 'depth' ? GL.DEPTH_COMPONENT : GL.RGBA,
        GL.FLOAT,
        null
      );
      GL.framebufferTexture2D(GL.FRAMEBUFFER, GL[attachment], GL.TEXTURE_2D, this[`${id}Texture`], 0);
      GL.bindTexture(GL.TEXTURE_2D, null);
    });
    GL.bindFramebuffer(GL.FRAMEBUFFER, null);
  }

  dispose() {
    const {
      context: GL,
      renderBuffer,
      outputBuffer,
    } = this;
    const { textures } = Framebuffer;
    textures.forEach(({ id }) => {
      GL.deleteRenderbuffer(this[`${id}Buffer`]);
      GL.deleteTexture(this[`${id}Texture`]);
    });
    GL.deleteFramebuffer(renderBuffer);
    GL.deleteFramebuffer(outputBuffer);
  }
}

Framebuffer.textures = [
  {
    id: 'color',
    attachment: 'COLOR_ATTACHMENT0',
  },
  {
    id: 'position',
    attachment: 'COLOR_ATTACHMENT1',
  },
  {
    id: 'normal',
    attachment: 'COLOR_ATTACHMENT2',
  },
  {
    id: 'depth',
    attachment: 'DEPTH_ATTACHMENT',
  },
];

export default Framebuffer;
