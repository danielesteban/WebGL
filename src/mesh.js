import { mat4, vec3, quat } from 'gl-matrix';

class Mesh {
  constructor({
    albedo,
    position = [0, 0, 0],
    rotation = [0, 0, 0, 1],
    scale = [1, 1, 1],
    geometry,
    material,
    onAnimationFrame,
  }) {
    this.albedo = new Float32Array(albedo);
    this.geometry = geometry;
    this.material = material;
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
