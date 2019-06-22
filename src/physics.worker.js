import {
  Body,
  Box,
  ContactMaterial,
  Heightfield,
  HingeConstraint,
  Material,
  NaiveBroadphase,
  PointToPointConstraint,
  Sphere,
  SplitSolver,
  Trimesh,
  Vec3,
  World,
} from 'cannon';

// eslint-disable-next-line no-restricted-globals
const context = self;

class Physics {
  constructor() {
    this.world = new World();
    this.world.gravity.set(0, -10, 0);
    this.world.broadphase = new NaiveBroadphase();
    this.world.solver.tolerance = 0.0001;
    this.world.solver = new SplitSolver(this.world.solver);

    this.constraints = new Map();
    this.bodies = new Map();
    this.materials = [];
    this.shapes = new Map();
    this.lastTick = context.performance.now();

    this.bodyId = 1;
    this.constraintId = 1;
    this.shapeId = 1;
  }

  addBody({
    physics,
    position,
    rotation,
  }) {
    const {
      bodyId,
      bodies,
      shapes,
      world,
    } = this;
    this.bodyId += 1;
    let type = physics.mass <= 0.0 ? Body.STATIC : Body.DYNAMIC;
    if (physics.kinematic) {
      type = Body.KINEMATIC;
    }
    const body = new Body({
      mass: physics.mass,
      material: this.getMaterial(physics.material || 0),
      type,
    });
    body.addShape(
      shapes.get(physics.collision.shape),
      physics.collision.offset ? (
        new Vec3(...physics.collision.offset)
      ) : undefined
    );
    body.position.set(...position);
    body.quaternion.set(...rotation);
    world.addBody(body);
    body.id = bodyId;
    if (physics.emitContacts) {
      body.addEventListener('collide', ({ body: { id: bodyB } }) => (
        this.onCollide({ bodyA: body.id, bodyB })
      ));
    }
    bodies.set(body.id, body);
    return body.id;
  }

  addContactMaterial({
    materialA,
    materialB,
    friction,
    restitution,
  }) {
    const { world } = this;
    world.addContactMaterial(new ContactMaterial(
      this.getMaterial(materialA),
      this.getMaterial(materialB),
      { friction, restitution }
    ));
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
    const {
      bodies,
      constraintId,
      constraints,
      world,
    } = this;
    this.constraintId += 1;
    let constraint;
    switch (type) {
      case 'hinge':
        constraint = new HingeConstraint(
          bodies.get(bodyA),
          bodies.get(bodyB),
          {
            axisA: axisA ? new Vec3(...axisA) : undefined,
            axisB: axisB ? new Vec3(...axisB) : undefined,
            pivotA: pivotA ? new Vec3(...pivotA) : undefined,
            pivotB: pivotB ? new Vec3(...pivotB) : undefined,
          }
        );
        break;
      case 'point':
        constraint = new PointToPointConstraint(
          bodies.get(bodyA),
          pivotA ? new Vec3(...pivotA) : undefined,
          bodies.get(bodyB),
          pivotB ? new Vec3(...pivotB) : undefined
        );
        break;
      default:
    }
    world.addConstraint(constraint);
    constraint.id = constraintId;
    constraints.set(constraint.id, constraint);
    return constraint.id;
  }

  resetBody({
    body: id,
    position,
    rotation,
    velocity,
    angularVelocity,
  }) {
    const { bodies } = this;
    const body = bodies.get(id);
    if (!body) {
      return;
    }
    if (position) {
      body.position.set(...position);
    }
    if (rotation) {
      body.quaternion.set(...rotation);
    }
    if (velocity) {
      body.velocity.set(...velocity);
    }
    if (angularVelocity) {
      body.angularVelocity.set(...angularVelocity);
    }
    body.sleepState = 0;
  }

  getMaterial(index) {
    const { materials } = this;
    if (!materials[index]) {
      materials[index] = new Material();
    }
    return materials[index];
  }

  getShape({
    type,
    elementSize,
    map,
    maxValue,
    minValue,
    radius,
    position,
    index,
  }) {
    const { shapeId, shapes } = this;
    this.shapeId += 1;
    let shape;
    switch (type) {
      case 'box':
        shape = new Box(
          new Vec3(...radius)
        );
        break;
      case 'heightfield':
        shape = new Heightfield(map, { elementSize, maxValue, minValue });
        break;
      case 'trimesh':
        shape = new Trimesh(position, index);
        break;
      default:
        shape = new Sphere(
          radius
        );
    }
    shape.id = shapeId;
    shapes.set(shape.id, shape);
    return shape.id;
  }

  onCollide({ bodyA, bodyB }) {
    const { contacts } = this;
    const bodies = contacts.get(bodyA) || [];
    if (bodies.indexOf(bodyB) === -1) {
      bodies.push(bodyB);
      contacts.set(bodyA, bodies);
    }
  }

  step({ buffer }) {
    this.contacts = new Map();
    const {
      bodies,
      contacts,
      lastTick,
      world,
    } = this;
    const time = context.performance.now();
    const delta = (time - lastTick) / 1000;
    this.lastTick = time;
    world.step(1 / 60, delta, 3);
    let index = 0;
    bodies.forEach(({
      type,
      position,
      quaternion,
    }) => {
      if (type === Body.DYNAMIC) {
        buffer.set(
          [...position.toArray(), ...quaternion.toArray()],
          index * 7
        );
        index += 1;
      }
    });
    return { buffer, contacts: contacts.size ? contacts : undefined };
  }
}

let worker = new Physics();
context.addEventListener('message', ({ data: { id, action, payload } }) => {
  let response;
  let buffers;
  switch (action) {
    case 'reset':
      worker = new Physics();
      break;
    case 'resetBody':
      worker.resetBody(payload);
      break;
    case 'step': {
      response = worker.step(payload);
      buffers = [
        response.buffer.buffer,
      ];
      break;
    }
    case 'addBody':
    case 'addConstraint':
    case 'getShape':
      response = {
        id: worker[action](payload),
      };
      break;
    case 'addContactMaterial':
      worker.addContactMaterial(payload);
      break;
    default:
  }
  context.postMessage({ id, response }, buffers);
});
