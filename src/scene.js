import Geometry from '@/geometry';
import Material from '@/material';
import {
  PostprocessingVertex,
  PostprocessingFragment,
} from '@/shaders';

class Scene {
  constructor({ renderer }) {
    this.renderer = renderer;
    this.root = [];
    this.frame = new Geometry({
      context: renderer.context,
      position: [
        -1, 1, 0,
        1, 1, 0,
        1, -1, 0,
        1, -1, 0,
        -1, -1, 0,
        -1, 1, 0,
      ],
    });
    this.postprocessing = new Material({
      context: renderer.context,
      shaders: {
        vertex: PostprocessingVertex,
        fragment: PostprocessingFragment,
      },
      uniforms: [
        'camera',
        'colorTexture',
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

  render() {
    const {
      renderer: { camera, context: GL },
      root,
    } = this;
    root
      .reduce((materials, { material }) => {
        if (materials.indexOf(material) === -1) {
          materials.push(material);
        }
        return materials;
      }, [])
      .forEach((material) => {
        GL.useProgram(material.program);
        GL.uniformMatrix4fv(material.uniforms.camera, false, camera.transform);
      });

    GL.enable(GL.DEPTH_TEST);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    root.forEach(({
      albedo,
      transform,
      geometry,
      material,
    }) => {
      GL.useProgram(material.program);
      GL.uniformMatrix4fv(material.uniforms.transform, false, transform);
      GL.uniform3fv(material.uniforms.albedo, albedo);
      GL.bindVertexArray(geometry.vao);
      if (geometry.ebo) {
        GL.drawElements(GL.TRIANGLES, geometry.count, GL.UNSIGNED_SHORT, 0);
      } else {
        GL.drawArrays(GL.TRIANGLES, 0, geometry.count);
      }
      GL.bindVertexArray(null);
    });
    GL.disable(GL.DEPTH_TEST);
  }

  postprocess({ colorTexture, normalTexture, positionTexture }) {
    const {
      renderer: { camera, context: GL },
      frame,
      postprocessing,
    } = this;
    GL.clear(GL.COLOR_BUFFER_BIT);
    GL.useProgram(postprocessing.program);
    GL.uniform3fv(postprocessing.uniforms.camera, camera.position);
    GL.activeTexture(GL.TEXTURE0);
    GL.bindTexture(GL.TEXTURE_2D, colorTexture);
    GL.uniform1i(postprocessing.uniforms.colorTexture, 0);
    GL.activeTexture(GL.TEXTURE1);
    GL.bindTexture(GL.TEXTURE_2D, normalTexture);
    GL.uniform1i(postprocessing.uniforms.normalTexture, 1);
    GL.activeTexture(GL.TEXTURE2);
    GL.bindTexture(GL.TEXTURE_2D, positionTexture);
    GL.uniform1i(postprocessing.uniforms.positionTexture, 2);
    GL.bindVertexArray(frame.vao);
    GL.drawArrays(GL.TRIANGLES, 0, frame.count);
    GL.bindVertexArray(null);
  }
}

export default Scene;
