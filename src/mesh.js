import { mat4, vec3, quat } from 'gl-matrix';

class Mesh {
  constructor({
    albedo,
    context: GL,
    geometry,
    position = [0, 0, 0],
    rotation = [0, 0, 0, 1],
    scale = [1, 1, 1],
    onAnimationFrame,
  }) {
    const vbo = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, vbo);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(geometry.position), GL.STATIC_DRAW, 0);
    this.albedo = new Float32Array(albedo);
    this.vbo = vbo;
    this.count = geometry.position.length / 3;
    this.transform = mat4.create();
    this.position = vec3.fromValues(...position);
    this.rotation = quat.fromValues(...rotation);
    this.scale = vec3.fromValues(...scale);
    this.updateTransform();
    if (onAnimationFrame) {
      this.onAnimationFrame = onAnimationFrame.bind(this);
    }
  }

  updateTransform() {
    const {
      position,
      rotation,
      transform,
      scale,
    } = this;
    mat4.fromRotationTranslationScale(transform, rotation, position, scale);
  }
}

export default Mesh;
