import Material from '@/material';
import {
  PostprocessingVertex,
  PostprocessingFragment,
} from '@/shaders';

class Scene {
  constructor({ renderer, postprocessing }) {
    this.renderer = renderer;
    this.root = [];
    this.postprocessing = postprocessing || new Material({
      context: renderer.context,
      shaders: {
        vertex: PostprocessingVertex,
        fragment: PostprocessingFragment,
      },
      uniforms: [
        'camera',
        'colorTexture',
        'depthTexture',
        'normalTexture',
        'positionTexture',
      ],
    });
  }

  animate({ delta, time }) {
    const { root } = this;
    root.forEach(({
      onAnimationFrame,
    }) => {
      if (onAnimationFrame) {
        onAnimationFrame({ delta, time });
      }
    });
  }
}

export default Scene;
