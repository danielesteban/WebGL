import { mat4, vec3 } from 'gl-matrix';

class Mesh {
  constructor({
    albedo = new Float32Array([1, 1, 1]),
    position = new Float32Array([0, 0, 0]),
    rotation = new Float32Array([0, 0, 0, 1]),
    scale = new Float32Array([1, 1, 1]),
    geometry,
    material,
    physics,
    onAnimationFrame,
    onContact,
  }) {
    this.albedo = albedo;
    this.geometry = geometry;
    this.material = material;
    this.physics = physics;
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
    this.culling = {
      origin: vec3.create(),
      radius: 0,
    };
    this.transform = mat4.create();
    this.updateTransform();
    if (onAnimationFrame) {
      this.onAnimationFrame = onAnimationFrame.bind(this);
    }
    if (onContact) {
      this.onContact = onContact.bind(this);
    }
  }

  updateTransform() {
    const {
      culling,
      geometry,
      position,
      rotation,
      transform,
      scale,
    } = this;
    mat4.fromRotationTranslationScale(transform, rotation, position, scale);
    vec3.transformMat4(culling.origin, geometry.origin, transform);
    culling.radius = geometry.radius * Math.max(scale[0], Math.max(scale[1], scale[2]));
  }
}

export default Mesh;
