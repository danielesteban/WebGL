import CANNON from 'cannon';

class Physics {
  static getShape({ type, radius }) {
    switch (type) {
      case 'box':
        return new CANNON.Box(
          new CANNON.Vec3(radius[0], radius[1], radius[2])
        );
      default:
        return new CANNON.Sphere(
          radius
        );
    }
  }

  constructor() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.8, 0);
  }

  addBody({
    geometry,
    physics,
    position,
    rotation,
  }) {
    const { world } = this;
    const body = new CANNON.Body({
      mass: physics.mass,
      type: physics.mass <= 0.0 ? CANNON.Body.STATIC : CANNON.Body.DYNAMIC,
    });
    body.addShape(
      geometry.collision.shape,
      geometry.collision.offset ? (
        new CANNON.Vec3(
          geometry.collision.offset[0],
          geometry.collision.offset[1],
          geometry.collision.offset[2]
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
    world.step(1 / 60, delta, 3);
  }
}

export default Physics;
