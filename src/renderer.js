import Camera from '@/camera';
import Geometry from '@/geometry';
import Input from '@/input';
import Framebuffer from '@/framebuffer';
import Physics from '@/physics';
import Router from '@/router';

class Renderer {
  constructor({
    mount,
    scenes,
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
    context.enable(context.CULL_FACE);
    context.getExtension('EXT_color_buffer_float');
    this.context = context;
    this.camera = new Camera();
    this.input = new Input({ mount });
    this.frame = new Geometry({
      renderer: { context },
      position: new Float32Array([
        -1, -1, 0,
        1, -1, 0,
        1, 1, 0,
        1, 1, 0,
        -1, 1, 0,
        -1, -1, 0,
      ]),
    });
    window.addEventListener('resize', this.onResize.bind(this));
    this.onResize();
    this.lastTick = window.performance.now();
    this.physics = new Physics();
    this.router = new Router({
      scenes,
      onUpdate: this.setScene.bind(this),
    });
    // if (!__PRODUCTION__) {
    this.debug = document.createElement('div');
    this.debug.id = 'debug';
    this.debug.counters = ['render', 'physics'].reduce((counters, id) => {
      let count = 0;
      let tick = 0;
      const dom = document.createElement('div');
      const display = document.createElement('span');
      display.innerText = '.....';
      dom.appendChild(document.createTextNode(`${id}: `));
      dom.appendChild(display);
      this.debug.appendChild(dom);
      counters[id] = (delta) => {
        count += 1;
        tick += delta;
        if (tick >= 1000) {
          display.innerText = `${count}fps`;
          count = 0;
          tick = 0;
        }
      };
      return counters;
    }, {});
    this.physics.debug = this.debug.counters.physics;
    mount.appendChild(this.debug);
    // }
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
      debug,
      scene,
    } = this;
    const time = window.performance.now();
    const delta = time - lastTick;
    this.lastTick = time;

    if (debug) {
      debug.counters.render(delta);
    }

    camera.processInput({ input, delta, time });
    scene.animate({ delta, time });
    ['primaryDown', 'secondaryDown', 'primaryUp', 'secondaryUp'].forEach((button) => {
      input.buttons[button] = false;
    });

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
      scene: { lights, postprocessing },
    } = this;
    GL.clear(GL.COLOR_BUFFER_BIT);
    GL.useProgram(postprocessing.program);
    GL.uniform3fv(postprocessing.uniforms.camera, camera.position);
    lights.forEach(({ position, color }, index) => {
      GL.uniform3fv(postprocessing.uniforms[`lights[${index}].position`], position);
      GL.uniform3fv(postprocessing.uniforms[`lights[${index}].color`], color);
    });
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
      scene: { materials, root },
    } = this;

    materials.forEach((material) => {
      GL.useProgram(material.program);
      GL.uniformMatrix4fv(material.uniforms.camera, false, camera.transform);
    });

    GL.enable(GL.DEPTH_TEST);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    root
      .filter(({ culling }) => (
        camera.isInFrustum(culling)
      ))
      .forEach(({
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

  setScene(Scene, args) {
    const { physics, scene } = this;
    if (scene) {
      scene.dispose();
    }
    physics.reset();
    this.scene = new Scene({
      ...args,
      renderer: this,
    });
  }
}

export default Renderer;
