import Worker from '@/physics.worker';
import { quat, vec3 } from 'gl-matrix';

class Physics {
  constructor() {
    this.bodies = [];
    this.buffer = new Float32Array();
    this.promises = {};
    this.requestId = 1;
    this.worker = new Worker();
    this.worker.addEventListener('message', this.onMessage.bind(this));
    this.step();
  }

  addBody(mesh) {
    const { bodies } = this;
    const promise = this
      .request({
        action: 'addBody',
        payload: {
          physics: {
            ...mesh.physics,
            body: undefined,
            collision: mesh.geometry.collision,
          },
          position: mesh.position,
          rotation: mesh.rotation,
        },
      })
      .then(({ id }) => {
        mesh.physics.body = id;
      });
    if (mesh.physics.mass !== 0.0 && !mesh.physics.kinematic) {
      bodies.push(mesh);
      this.bufferNeedsUpdate = true;
    }
    mesh.physics.body = promise;
    return promise;
  }

  addContactMaterial({
    materialA,
    materialB,
    friction,
    restitution,
  }) {
    return this.request({
      action: 'addContactMaterial',
      payload: {
        materialA,
        materialB,
        friction,
        restitution,
      },
    });
  }

  addConstraint({
    axisA,
    axisB,
    bodyA,
    bodyB,
    pivotA,
    pivotB,
    type,
  }) {
    return this.request({
      action: 'addConstraint',
      payload: {
        axisA,
        axisB,
        bodyA,
        bodyB,
        pivotA,
        pivotB,
        type,
      },
    });
  }

  getShape(payload) {
    return this.request({
      action: 'getShape',
      payload,
    });
  }

  reset() {
    this.bodies = [];
    this.bufferNeedsUpdate = true;
    return this.request({
      action: 'reset',
    });
  }

  resetBody(payload) {
    return this.request({
      action: 'resetBody',
      payload,
    });
  }

  step() {
    if (this.bufferNeedsUpdate) {
      delete this.bufferNeedsUpdate;
      this.buffer = new Float32Array(this.bodies.length * 7);
    }
    const { buffer } = this;
    const time = window.performance.now();
    return this.request({
      action: 'step',
      buffers: [buffer.buffer],
      payload: {
        buffer,
      },
    })
      .then(({ buffer }) => {
        if (!this.bufferNeedsUpdate) {
          this.buffer = buffer;
          this.bodies.forEach((mesh, index) => {
            const o = index * 7;
            vec3.set(
              mesh.position,
              this.buffer[o],
              this.buffer[o + 1],
              this.buffer[o + 2]
            );
            quat.set(
              mesh.rotation,
              this.buffer[o + 3],
              this.buffer[o + 4],
              this.buffer[o + 5],
              this.buffer[o + 6]
            );
            mesh.updateTransform();
          });
        }
        const delta = window.performance.now() - time;
        setTimeout(() => this.step(), Math.max(0, ((1 / 60) * 1000) - delta));
      });
  }

  onMessage({ data: { id, response } }) {
    const { promises } = this;
    const { [id]: promise } = promises;
    if (promise) {
      delete promises[id];
      promise(response);
    }
  }

  request({ action, buffers, payload }) {
    const { promises, requestId: id, worker } = this;
    this.requestId += 1;
    return new Promise((resolve) => {
      promises[id] = resolve;
      worker.postMessage({
        id,
        action,
        payload,
      }, buffers);
    });
  }
}

export default Physics;
