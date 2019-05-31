#version 300 es
precision mediump float;

layout(location = 0) in vec3 position;
out vec2 fragUV;

void main(void) {
	gl_Position = vec4(position, 1.0);
  fragUV = (position.xy + 1.0) * 0.5;
}
