#version 300 es
precision mediump float;

in vec3 fragNormal;
in vec3 fragPosition;

layout(location = 0) out vec4 outColor;
layout(location = 1) out vec4 outNormal;
layout(location = 2) out vec4 outPosition;

uniform vec3 albedo;

void main(void) {
  outColor = vec4(albedo, 1.0);
  outPosition = vec4(fragPosition, 1.0);
  outNormal = vec4(fragNormal, 1.0);
}
