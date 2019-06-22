import Worker from '@/physics.worker';
import { quat, vec3 } from 'gl-matrix';

class Physics {
  constructor() {
    this.bodies = {
      all: [],
      dynamic: [],
      emitters: [],
      index: new Map(),
    };
    this.buffer = new Float32Array();
    this.lastTick = window.performance.now();
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
            emitContacts: !!mesh.onContact,
            collision: mesh.geometry.collision,
          },
          position: mesh.position,
          rotation: mesh.rotation,
        },
      })
      .then(({ id }) => {
        mesh.physics.body = id;
        this.bodies.index.set(id, mesh);
      });
    bodies.all.push(mesh);
    if (mesh.physics.mass !== 0.0 && !mesh.physics.kinematic) {
      bodies.dynamic.push(mesh);
      this.bufferNeedsUpdate = true;
    }
    if (mesh.onContact) {
      bodies.emitters.push(mesh);
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
    this.bodies.all.length = 0;
    this.bodies.dynamic.length = 0;
    this.bodies.emitters.length = 0;
    this.bodies.index = new Map();
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
      this.buffer = new Float32Array(this.bodies.dynamic.length * 7);
    }
    const { buffer, debug, lastTick } = this;
    const time = window.performance.now();
    if (debug) {
      debug(time - lastTick);
      this.lastTick = time;
    }
    return this.request({
      action: 'step',
      buffers: [buffer.buffer],
      payload: {
        buffer,
      },
    })
      .then(({ buffer, contacts }) => {
        if (!this.bufferNeedsUpdate) {
          this.buffer = buffer;
          this.bodies.dynamic.forEach((mesh, index) => {
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
        if (contacts) {
          this.bodies.emitters.forEach((mesh) => {
            if (contacts.has(mesh.physics.body)) {
              mesh.onContact(contacts.get(mesh.physics.body));
            }
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
