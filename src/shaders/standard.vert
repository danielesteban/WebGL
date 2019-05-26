#version 300 es
precision mediump float;

in vec3 position;

uniform mat4 camera;
uniform mat4 transform;

void main(void) {
	gl_Position = camera * transform * vec4(position, 1.0);
}
