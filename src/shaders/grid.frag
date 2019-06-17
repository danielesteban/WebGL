#version 300 es
precision mediump float;

in vec3 fragNormal;
in vec3 fragPosition;

layout(location = 0) out vec4 outColor;
layout(location = 1) out vec4 outNormal;
layout(location = 2) out vec4 outPosition;

uniform vec3 albedo;
vec3 gridColor = vec3(0.8, 0.8, 0.8);

void main(void) {
  vec2 coord = fragPosition.xz;
  vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
  float fcoord = length(fragPosition.xz);
  float fgrid = abs(fract(fcoord - 0.5) - 0.5) / fwidth(fcoord);
  float factor = 1.0 - min(min(grid.x, min(grid.y, fgrid)), 1.0);
  outColor = vec4(mix(albedo, gridColor, factor), 1.0);
  outPosition = vec4(fragPosition, 1.0);
  outNormal = vec4(fragNormal, 1.0);
}
