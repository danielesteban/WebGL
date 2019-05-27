class Scene {
  constructor({ renderer }) {
    this.renderer = renderer;
    this.root = [];
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
  }
}

export default Scene;
