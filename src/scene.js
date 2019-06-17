import Material from '@/material';
import {
  PostprocessingVertex,
  PostprocessingFragment,
} from '@/shaders';

class Scene {
  constructor({ renderer, postprocessing }) {
    this.geometries = new Map();
    this.lights = [...Array(16)].map(() => ({
      position: new Float32Array([0, 0, 0]),
      color: new Float32Array([0, 0, 0]),
    }));
    this.materials = new Map();
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
    this.renderer = renderer;
    this.root = [];
  }

  add(mesh) {
    const {
      geometries,
      materials,
      renderer: { physics },
      root,
    } = this;
    root.push(mesh);
    if (!geometries.has(mesh.geometry.vao)) {
      geometries.set(mesh.geometry.vao, mesh.geometry);
    }
    if (!materials.has(mesh.material.program)) {
      materials.set(mesh.material.program, mesh.material);
    }
    if (mesh.physics) {
      if (mesh.geometry.collision.then) {
        mesh.physics.body = mesh.geometry.collision.then(() => (
          physics.addBody(mesh)
        ));
        return;
      }
      physics.addBody(mesh);
    }
  }

  animate({ delta, time }) {
    const { root } = this;
    root.forEach((mesh) => {
      if (mesh.onAnimationFrame) {
        mesh.onAnimationFrame({ delta, time });
      }
    });
  }

  dispose() {
    const {
      geometries,
      materials,
    } = this;
    geometries.forEach(geometry => (
      geometry.dispose()
    ));
    materials.forEach(material => (
      material.dispose()
    ));
  }
}

export default Scene;
