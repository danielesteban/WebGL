import Renderer from '@/renderer';
import Mesh from '@/mesh';
import Shader from '@/shader';
import {
  TestVertex,
  TestFragment,
} from '@/shaders';

const mount = document.getElementById('mount');
const renderer = new Renderer({
  mount,
});
const shader = new Shader({
  context: renderer.context,
  shaders: {
    vertex: TestVertex,
    fragment: TestFragment,
  },
});

const meshes = [
  {
    albedo: new Float32Array([0, 0.5, 0]),
    position: [
      -1, -0.5, 0,
      0, -0.5, 0,
      -0.5, 0.5, 0,
    ],
  },
  {
    albedo: new Float32Array([0, 0, 1]),
    position: [
      0, -0.5, 0,
      1, -0.5, 0,
      0.5, 0.5, 0,
    ],
  }
].map(({ albedo, position }) => (
  new Mesh({
    albedo,
    context: renderer.context,
    position: new Float32Array(position),
  })
));

renderer.onAnimationFrame = ({ GL, delta }) => {
  GL.useProgram(shader.program);
  GL.enableVertexAttribArray(shader.attributes.position);
  meshes.forEach(({ albedo, vbo }, i) => {
    albedo[i] = (albedo[i] + delta * 0.001) % 1;
    GL.uniform3fv(shader.uniforms.albedo, albedo);
    GL.bindBuffer(GL.ARRAY_BUFFER, vbo);
    GL.vertexAttribPointer(shader.attributes.position, 3, GL.FLOAT, 0, 0, 0);
    GL.drawArrays(GL.TRIANGLES, 0, 3);
  });
};
