#version 300 es
precision mediump float;

layout(location = 0) in vec3 position;
layout(location = 1) in vec3 normal;

out vec3 fragPosition;
out vec3 fragNormal;

uniform mat4 camera;
uniform mat4 transform;

void main(void) {
  fragNormal = normalize(transpose(inverse(mat3(transform))) * normal);
  fragPosition = vec3(transform * vec4(position, 1.0));
  gl_Position = camera * transform * vec4(position, 1.0);
}
