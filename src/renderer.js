import Camera from '@/camera';

class Renderer {
  constructor({
    mount,
  }) {
    const canvas = document.createElement('canvas');
    mount.appendChild(canvas);
    this.canvas = canvas;
    const context = canvas.getContext('webgl2', {
      alpha: false,
      antialias: true,
      depth: true,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
      stencil: false,
    });
    context.enable(context.DEPTH_TEST);
    // This is just temporary while there's only single face triangles
    context.disable(context.CULL_FACE);
    context.clearColor(0.1, 0.1, 0.1, 1);
    this.context = context;
    this.camera = new Camera();
    window.addEventListener('resize', this.onResize.bind(this));
    this.onResize();
    this.lastTick = window.performance.now();
    this.onAnimationTick();
  }

  onAnimationTick() {
    requestAnimationFrame(this.onAnimationTick.bind(this));
    const { camera, context: GL, lastTick } = this;
    const time = window.performance.now();
    const delta = time - lastTick;
    this.lastTick = time;
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    if (this.onAnimationFrame) {
      this.onAnimationFrame({
        camera,
        GL,
        time,
        delta,
      });
    }
  }

  onResize() {
    const { camera, canvas, context: GL } = this;
    const { innerWidth: width, innerHeight: height } = window;
    canvas.width = width;
    canvas.height = height;
    GL.viewport(0, 0, GL.drawingBufferWidth, GL.drawingBufferHeight);
    camera.setAspect(GL.drawingBufferWidth / GL.drawingBufferHeight);
  }
}

export default Renderer;
