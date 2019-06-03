import Material from '@/material';
import Physics from '@/physics';
import {
  PostprocessingVertex,
  PostprocessingFragment,
} from '@/shaders';

class Scene {
  constructor({ renderer, postprocessing }) {
    this.renderer = renderer;
    this.root = [];
    this.lights = [...Array(32)].map(() => ({
      position: new Float32Array([0, 0, 0]),
      color: new Float32Array([0, 0, 0]),
    }));
    this.physics = new Physics();
    this.postprocessing = new Material({
      context: renderer.context,
      shaders: {
        vertex: PostprocessingVertex,
        fragment: PostprocessingFragment,
        ...(postprocessing || {}),
      },
      uniforms: [
        'camera',
        'colorTexture',
        'depthTexture',
        'normalTexture',
        'positionTexture',
        ...this.lights.reduce((uniforms, v, index) => {
          uniforms.push(
            `lights[${index}].position`,
            `lights[${index}].color`
          );
          return uniforms;
        }, []),
      ],
    });
  }

  animate({ delta, time }) {
    const { physics, root } = this;
    physics.step(delta * 0.001);
    root.forEach((mesh) => {
      if (mesh.onAnimationFrame) {
        mesh.onAnimationFrame({ delta, time });
      }
      const {
        physics,
        position,
        rotation,
      } = mesh;
      if (physics && physics.body && physics.body.type === 1 && physics.body.sleepState === 0) {
        const { position: p, quaternion: r } = physics.body;
        position.set(p.toArray());
        rotation.set(r.toArray());
        mesh.updateTransform();
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  dispose() {
    // TODO: Dispose the allocated memory/buffers
  }
}

export default Scene;
