#version 300 es
precision mediump float;

out vec4 outColor;

uniform vec3 albedo;

void main(void) {
	outColor = vec4(albedo, 1.0);
}
