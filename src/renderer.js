import Camera from '@/camera';
import Geometry from '@/geometry';
import Input from '@/input';
import Framebuffer from '@/framebuffer';

class Renderer {
  constructor({
    mount,
  }) {
    const canvas = document.createElement('canvas');
    mount.appendChild(canvas);
    this.canvas = canvas;
    const context = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: true,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
      stencil: false,
    });
    // This is just temporary while there's only single face triangles
    context.disable(context.CULL_FACE);
    context.getExtension('EXT_color_buffer_float');
    context.clearColor(0, 0, 0, 1);
    this.context = context;
    this.camera = new Camera();
    this.input = new Input({ mount });
    this.frame = new Geometry({
      context,
      position: new Float32Array([
        -1, 1, 0,
        1, 1, 0,
        1, -1, 0,
        1, -1, 0,
        -1, -1, 0,
        -1, 1, 0,
      ]),
    });
    window.addEventListener('resize', this.onResize.bind(this));
    this.onResize();
    this.lastTick = window.performance.now();
    this.onAnimationTick();
  }

  onAnimationTick() {
    requestAnimationFrame(this.onAnimationTick.bind(this));
    const {
      camera,
      context: GL,
      input,
      lastTick,
      framebuffer: {
        attachments,
        renderBuffer,
        outputBuffer,
      },
      scene,
    } = this;
    const time = window.performance.now();
    const delta = time - lastTick;
    this.lastTick = time;
    if (scene) {
      camera.processInput({ input, delta, time });
      scene.animate({ delta, time });

      // First multisampled pass
      GL.bindFramebuffer(GL.FRAMEBUFFER, renderBuffer);
      GL.drawBuffers(attachments);
      this.render();
      GL.bindFramebuffer(GL.FRAMEBUFFER, null);

      // Blit first pass into textures
      GL.bindFramebuffer(GL.READ_FRAMEBUFFER, renderBuffer);
      GL.bindFramebuffer(GL.DRAW_FRAMEBUFFER, outputBuffer);
      Framebuffer.textures.forEach(({ id, attachment }) => {
        if (id === 'depth') {
          GL.readBuffer(GL.NONE);
          GL.drawBuffers([GL.NONE]);
        } else {
          const buffer = GL[attachment];
          GL.readBuffer(buffer);
          GL.drawBuffers(
            attachments.map(attachment => (
              buffer === attachment ? buffer : GL.NONE
            ))
          );
        }
        GL.blitFramebuffer(
          0, 0,
          GL.drawingBufferWidth, GL.drawingBufferHeight,
          0, 0,
          GL.drawingBufferWidth, GL.drawingBufferHeight,
          id === 'depth' ? GL.DEPTH_BUFFER_BIT : GL.COLOR_BUFFER_BIT,
          id === 'depth' ? GL.NEAREST : GL.LINEAR
        );
      });
      GL.bindFramebuffer(GL.READ_FRAMEBUFFER, null);
      GL.bindFramebuffer(GL.DRAW_FRAMEBUFFER, null);

      // Post-Processing pass
      this.postprocess();
    }
  }

  onResize() {
    const {
      camera,
      canvas,
      context: GL,
      framebuffer,
    } = this;
    const { innerWidth: width, innerHeight: height } = window;
    canvas.width = width;
    canvas.height = height;
    GL.viewport(0, 0, GL.drawingBufferWidth, GL.drawingBufferHeight);
    camera.setAspect(GL.drawingBufferWidth / GL.drawingBufferHeight);
    if (framebuffer) {
      framebuffer.dispose();
    }
    this.framebuffer = new Framebuffer({ context: GL });
  }

  postprocess() {
    const {
      camera,
      context: GL,
      frame,
      framebuffer,
      scene: { postprocessing },
    } = this;
    GL.clear(GL.COLOR_BUFFER_BIT);
    GL.useProgram(postprocessing.program);
    GL.uniform3fv(postprocessing.uniforms.camera, camera.position);
    Framebuffer.textures.forEach(({ id }, index) => {
      const texture = `${id}Texture`;
      GL.activeTexture(GL[`TEXTURE${index}`]);
      GL.bindTexture(GL.TEXTURE_2D, framebuffer[texture]);
      GL.uniform1i(postprocessing.uniforms[texture], index);
    });
    GL.bindVertexArray(frame.vao);
    GL.drawArrays(GL.TRIANGLES, 0, frame.count);
    GL.bindVertexArray(null);
  }

  render() {
    const {
      camera,
      context: GL,
      scene: { root },
    } = this;
    root
      .reduce((materials, { material }) => {
        if (materials.indexOf(material) === -1) {
          materials.push(material);
        }
        return materials;
      }, [])
      .forEach((material) => {
        GL.useProgram(material.program);
        GL.uniformMatrix4fv(material.uniforms.camera, false, camera.transform);
      });

    GL.enable(GL.DEPTH_TEST);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    root.forEach(({
      albedo,
      transform,
      geometry,
      material,
    }) => {
      GL.useProgram(material.program);
      GL.uniformMatrix4fv(material.uniforms.transform, false, transform);
      GL.uniform3fv(material.uniforms.albedo, albedo);
      GL.bindVertexArray(geometry.vao);
      if (geometry.ebo) {
        GL.drawElements(GL.TRIANGLES, geometry.count, GL.UNSIGNED_SHORT, 0);
      } else {
        GL.drawArrays(GL.TRIANGLES, 0, geometry.count);
      }
      GL.bindVertexArray(null);
    });
    GL.disable(GL.DEPTH_TEST);
  }

  setScene(Scene) {
    this.scene = new Scene({ renderer: this });
  }
}

export default Renderer;
