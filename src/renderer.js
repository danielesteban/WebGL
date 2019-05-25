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
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
    context.clearColor(0.1, 0.1, 0.1, 1);
    this.context = context;
    window.addEventListener('resize', this.onResize.bind(this));
    this.onResize();
    this.lastTick = window.performance.now();
    this.onAnimationTick();
  }

  onAnimationTick() {
    requestAnimationFrame(this.onAnimationTick.bind(this));
    const { context: GL, lastTick } = this;
    const time = window.performance.now();
    const delta = time - lastTick;
    this.lastTick = time;
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    if (this.onAnimationFrame) {
      this.onAnimationFrame({ GL, time, delta });
    }
  }

  onResize() {
    const { canvas, context: GL } = this;
    const { innerWidth: width, innerHeight: height } = window;
    canvas.width = width;
    canvas.height = height;
    GL.viewport(0, 0, GL.drawingBufferWidth, GL.drawingBufferHeight);
  }
}

export default Renderer;
