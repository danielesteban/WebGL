import { quat } from 'gl-matrix';
import Renderer from '@/renderer';
import Mesh from '@/mesh';
import Shader from '@/shader';
import {
  StandardVertex,
  StandardFragment,
} from '@/shaders';

const mount = document.getElementById('mount');
const renderer = new Renderer({
  mount,
});
const shader = new Shader({
  context: renderer.context,
  shaders: {
    vertex: StandardVertex,
    fragment: StandardFragment,
  },
});

function animateTriangle({ time }) {
  const animation = Math.sin(time * 0.001);
  quat.fromEuler(this.rotation, 0, animation * 180, 0);
  const scale = 1 + animation * 2;
  this.scale[0] = scale;
  this.scale[2] = scale;
  this.updateTransform();
}

const meshes = [
  // Ground
  {
    albedo: [0.2, 0.3, 0.2],
    geometry: {
      position: [
        -10, 0, 10,
        10, 0, 10,
        10, 0, -10,

        10, 0, -10,
        -10, 0, -10,
        -10, 0, 10,
      ],
    },
  },
  // Walls
  {
    albedo: [0, 0.5, 0],
    position: [-9, 1, -10],
    geometry: {
      position: [
        -1, 1, 0,
        1, 1, 0,
        1, -1, 0,

        1, -1, 0,
        -1, -1, 0,
        -1, 1, 0,
      ],
    },
  },
  {
    albedo: [0, 0, 1],
    position: [9, 1, -10],
    geometry: {
      position: [
        -1, 1, 0,
        1, 1, 0,
        1, -1, 0,

        1, -1, 0,
        -1, -1, 0,
        -1, 1, 0,
      ],
    },
  },
  // Animated triangles
  {
    albedo: [0, 0.5, 0],
    position: [-1, 0.5, -2],
    geometry: {
      position: [
        -0.5, -0.5, 0,
        0.5, -0.5, 0,
        0, 0.5, 0,
      ],
    },
    onAnimationFrame: animateTriangle,
  },
  {
    albedo: [0, 0, 1],
    position: [1, 0.5, -2],
    geometry: {
      position: [
        -0.5, -0.5, 0,
        0.5, -0.5, 0,
        0, 0.5, 0,
      ],
    },
    onAnimationFrame: animateTriangle,
  },
].map(mesh => (
  new Mesh({
    ...mesh,
    context: renderer.context,
  })
));

renderer.camera.position[1] = 1;
renderer.camera.updateVectors();

renderer.onAnimationFrame = ({
  camera,
  GL,
  delta,
  time,
}) => {
  const animation = Math.sin(time * 0.001);
  camera.position[2] = 3 + animation;
  camera.tilt = Math.PI * 1.5 + animation * 0.1;
  camera.updateVectors();

  GL.useProgram(shader.program);
  GL.uniformMatrix4fv(shader.uniforms.camera, false, camera.transform);
  GL.enableVertexAttribArray(shader.attributes.position);
  meshes.forEach(({
    albedo,
    count,
    transform,
    vbo,
    onAnimationFrame,
  }) => {
    if (onAnimationFrame) {
      onAnimationFrame({ delta, time });
    }
    GL.uniformMatrix4fv(shader.uniforms.transform, false, transform);
    GL.uniform3fv(shader.uniforms.albedo, albedo);
    GL.bindBuffer(GL.ARRAY_BUFFER, vbo);
    GL.vertexAttribPointer(shader.attributes.position, 3, GL.FLOAT, 0, 0, 0);
    GL.drawArrays(GL.TRIANGLES, 0, count);
  });
};
