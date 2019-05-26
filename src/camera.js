import { glMatrix, mat4, vec3 } from 'gl-matrix';

class Camera {
  constructor() {
    this.projection = mat4.create();
    this.transform = mat4.create();

    this.position = vec3.create();
    this.tilt = glMatrix.toRadian(270);
    this.pitch = 0;

    this.lookAt = vec3.create();
    this.front = vec3.create();
    this.right = vec3.create();
    this.up = vec3.create();
    this.worldUp = vec3.fromValues(0, 1, 0);

    this.transform = mat4.create();
    this.view = mat4.create();

    this.updateVectors();
  }

  onResize({ width, height }) {
    const aspect = width / height;
    mat4.perspective(this.projection, glMatrix.toRadian(60), aspect, 0.1, 1000);
    this.updateTransform();
  }

  updateVectors() {
    const {
      lookAt,
      front,
      right,
      up,
      tilt,
      pitch,
      worldUp,
    } = this;
    vec3.set(
      lookAt,
      Math.cos(tilt) * Math.cos(pitch),
      Math.sin(pitch),
      Math.sin(tilt) * Math.cos(pitch)
    );
    vec3.normalize(front, lookAt);
    vec3.cross(right, front, worldUp);
    vec3.normalize(right, right);
    vec3.cross(up, right, front);
    vec3.normalize(up, up);
    this.updateTransform();
  }

  updateTransform() {
    const {
      position,
      front,
      lookAt,
      worldUp,
      projection,
      transform,
      view,
    } = this;
    vec3.add(lookAt, position, front);
    mat4.lookAt(view, position, lookAt, worldUp);
    mat4.multiply(transform, projection, view);
  }
}

export default Camera;
