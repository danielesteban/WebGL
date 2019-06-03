import CANNON from 'cannon';

class Physics {
  static applyImpulse(body, impulse) {
    body.applyImpulse(new CANNON.Vec3(
      impulse[0],
      impulse[1],
      impulse[2]
    ), new CANNON.Vec3(0, 0, 0));
  }

  constructor() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.8, 0);
  }

  addBody({
    physics,
    position,
    rotation,
  }) {
    const { world } = this;
    const body = new CANNON.Body({
      mass: physics.mass,
      type: physics.mass <= 0.0 ? CANNON.Body.STATIC : CANNON.Body.DYNAMIC,
    });
    let shape;
    switch (physics.shape.type) {
      case 'box':
        shape = new CANNON.Box(
          new CANNON.Vec3(physics.shape.radius[0], physics.shape.radius[1], physics.shape.radius[2])
        );
        break;
      default:
        shape = new CANNON.Sphere(
          physics.shape.radius
        );
        break;
    }
    body.addShape(
      shape,
      physics.shape.offset ? (
        new CANNON.Vec3(
          physics.shape.offset[0],
          physics.shape.offset[1],
          physics.shape.offset[2]
        )
      ) : undefined
    );
    body.position.set(position[0], position[1], position[2]);
    body.quaternion.set(rotation[0], rotation[1], rotation[2], rotation[3]);
    world.addBody(body);
    physics.body = body;
  }

  step(delta) {
    const { world } = this;
    world.step(1 / 60, delta);
  }
}

export default Physics;
