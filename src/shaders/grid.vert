#version 300 es
precision mediump float;

layout(location = 0) in vec3 position;
out vec3 fragPosition;

uniform mat4 camera;
uniform mat4 transform;

void main(void) {
	vec4 position = transform * vec4(position, 1.0);
	gl_Position = camera * position;
	fragPosition = vec3(position);
}
