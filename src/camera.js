import {
  glMatrix,
  mat4,
  vec3,
  vec2,
} from 'gl-matrix';

class Camera {
  constructor() {
    this.position = vec3.fromValues(0, 1.5, 0);
    this.yaw = glMatrix.toRadian(270);
    this.pitch = 0;

    this.lookAt = vec3.create();
    this.front = vec3.create();
    this.right = vec3.create();
    this.up = vec3.create();
    this.worldUp = vec3.fromValues(0, 1, 0);

    this.frustum = [...Array(6)].map(() => ({
      normal: vec3.create(),
      constant: 0,
    }));

    this.projection = mat4.create();
    this.transform = mat4.create();
    this.view = mat4.create();

    this.updateVectors();
  }

  processInput({
    input: {
      isLocked,
      keyboard,
      mouse,
    },
    delta,
  }) {
    if (!isLocked) {
      return;
    }
    if (mouse[0] !== 0 || mouse[1] !== 0) {
      const sensitivity = 0.003;
      this.yaw += mouse[0] * sensitivity;
      this.pitch -= mouse[1] * sensitivity;
      const PI_2 = Math.PI / 2 * 0.99;
      this.pitch = Math.max(-PI_2, Math.min(PI_2, this.pitch));
      vec2.set(mouse, 0, 0);
      this.updateVectors();
    }

    if (keyboard[0] !== 0 || keyboard[1] !== 0 || keyboard[2] !== 0) {
      const {
        front,
        lookAt,
        position,
        right,
        up,
      } = this;
      vec3.set(lookAt, 0, 0, 0);
      vec3.scaleAndAdd(lookAt, lookAt, right, keyboard[0]);
      vec3.scaleAndAdd(lookAt, lookAt, up, keyboard[1]);
      vec3.scaleAndAdd(lookAt, lookAt, front, keyboard[2]);
      vec3.normalize(lookAt, lookAt, lookAt);
      vec3.scaleAndAdd(position, position, lookAt, delta * 0.005);
      this.updateTransform();
    }
  }

  isInFrustum({ position, radius }) {
    const { frustum } = this;
    for (let i = 0; i < frustum.length; i += 1) {
      const distance = vec3.dot(frustum[i].normal, position) + frustum[i].constant;
      if (distance < -radius) {
        return false;
      }
    }
    return true;
  }

  setAspect(aspect) {
    mat4.perspective(this.projection, glMatrix.toRadian(60), aspect, 0.1, 1000);
    this.updateTransform();
  }

  updateFrustum() {
    const {
      frustum,
      transform: m,
    } = this;
    const updatePlane = (index, x, y, z, w) => {
      const plane = frustum[index];
      vec3.set(plane.normal, x, y, z);
      const inverseNormalLength = 1.0 / vec3.length(plane.normal);
      vec3.scale(plane.normal, plane.normal, inverseNormalLength);
      plane.constant = w * inverseNormalLength;
    };
    updatePlane(0, m[3] - m[0], m[7] - m[4], m[11] - m[8], m[15] - m[12]);
    updatePlane(1, m[3] + m[0], m[7] + m[4], m[11] + m[8], m[15] + m[12]);
    updatePlane(2, m[3] + m[1], m[7] + m[5], m[11] + m[9], m[15] + m[13]);
    updatePlane(3, m[3] - m[1], m[7] - m[5], m[11] - m[9], m[15] - m[13]);
    updatePlane(4, m[3] - m[2], m[7] - m[6], m[11] - m[10], m[15] - m[14]);
    updatePlane(5, m[3] + m[2], m[7] + m[6], m[11] + m[10], m[15] + m[14]);
  }

  updateVectors() {
    const {
      front,
      right,
      up,
      yaw,
      pitch,
      worldUp,
    } = this;
    vec3.set(
      front,
      Math.cos(yaw) * Math.cos(pitch),
      Math.sin(pitch),
      Math.sin(yaw) * Math.cos(pitch)
    );
    vec3.normalize(front, front);
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
    this.updateFrustum();
  }
}

export default Camera;
