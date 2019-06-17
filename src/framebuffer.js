class Framebuffer {
  constructor({
    context: GL,
  }) {
    const { textures } = Framebuffer;
    const { drawingBufferWidth: width, drawingBufferHeight: height } = GL;
    this.context = GL;

    this.renderBuffer = GL.createFramebuffer();
    GL.bindFramebuffer(GL.FRAMEBUFFER, this.renderBuffer);
    textures.forEach(({
      id,
      attachment,
      internalFormat = 'RGBA16F',
    }) => {
      this[`${id}Buffer`] = GL.createRenderbuffer();
      GL.bindRenderbuffer(GL.RENDERBUFFER, this[`${id}Buffer`]);
      GL.renderbufferStorageMultisample(
        GL.RENDERBUFFER,
        Math.min(GL.getParameter(GL.MAX_SAMPLES), 2),
        GL[internalFormat],
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
    textures.forEach(({
      id,
      attachment,
      internalFormat = 'RGBA16F',
      format = 'RGBA',
      type = 'FLOAT',
    }) => {
      this[`${id}Texture`] = GL.createTexture();
      GL.bindTexture(GL.TEXTURE_2D, this[`${id}Texture`]);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
      GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
      GL.texImage2D(
        GL.TEXTURE_2D,
        0,
        GL[internalFormat],
        width,
        height,
        0,
        GL[format],
        GL[type],
        null
      );
      GL.framebufferTexture2D(GL.FRAMEBUFFER, GL[attachment], GL.TEXTURE_2D, this[`${id}Texture`], 0);
      GL.bindTexture(GL.TEXTURE_2D, null);
    });
    GL.bindFramebuffer(GL.FRAMEBUFFER, null);

    const attachments = textures.reduce(({ max, index }, { attachment }) => {
      if (attachment.indexOf('COLOR_ATTACHMENT') === 0) {
        max = Math.max(max, parseInt(attachment.substr('COLOR_ATTACHMENT'.length), 10));
        index[attachment] = true;
      }
      return { max, index };
    }, {
      max: 0,
      index: {},
    });
    this.attachments = [...Array(attachments.max + 1)].map((v, i) => {
      const attachment = `COLOR_ATTACHMENT${i}`;
      return attachments.index[attachment] ? (
        GL[attachment]
      ) : (
        GL.NONE
      );
    });
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
    internalFormat: 'RGBA8',
    type: 'UNSIGNED_BYTE',
  },
  {
    id: 'depth',
    attachment: 'DEPTH_ATTACHMENT',
    internalFormat: 'DEPTH_COMPONENT24',
    format: 'DEPTH_COMPONENT',
    type: 'UNSIGNED_INT',
  },
  {
    id: 'normal',
    attachment: 'COLOR_ATTACHMENT1',
  },
  {
    id: 'position',
    attachment: 'COLOR_ATTACHMENT2',
  },
];

export default Framebuffer;
