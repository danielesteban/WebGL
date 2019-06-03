#version 300 es
precision mediump float;

out vec4 outColor;
in vec2 fragUV;

uniform vec3 camera;
uniform sampler2D colorTexture;
uniform sampler2D depthTexture;
uniform sampler2D positionTexture;
uniform sampler2D normalTexture;

@import ./lighting;
@import ./sobel;

void main(void) {
  vec2 resolution = vec2(textureSize(colorTexture, 0));

  vec3 color = texture(colorTexture, fragUV).rgb;
  vec3 normal = normalize(texture(normalTexture, fragUV).rgb);
  vec3 position = texture(positionTexture, fragUV).rgb;
  float distance = length(camera - position);

  // lighting
  color = Lighting(color, normal, position);

  // edge detection
  float edge = Sobel(depthTexture, resolution) * distance;
  if (edge >= 0.05) {
    color = mix(color, vec3(0), 0.5);
  }

  // vignette
  float vignette = smoothstep(0.75, 0.5, length(fragUV - vec2(0.5)));
  color = mix(color, color * vignette, 0.5);

  outColor = vec4(color, 1.0);
}
