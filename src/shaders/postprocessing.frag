#version 300 es
precision mediump float;

out vec4 outColor;
in vec2 fragUV;

uniform vec3 camera;
uniform sampler2D colorTexture;
uniform sampler2D depthTexture;
uniform sampler2D positionTexture;
uniform sampler2D normalTexture;

@import ./sobel;

void main(void) {
  vec2 resolution = vec2(textureSize(colorTexture, 0));

  vec3 color = texture(colorTexture, fragUV).rgb;
  vec3 position = texture(positionTexture, fragUV).rgb;

  // edge detection
  float edge = Sobel(depthTexture, resolution);
  if (edge >= 0.005) {
    color -= vec3(0.25);
  }

  // attenuation
  float distance = length(camera - position);
  float attenuation = 1.0 / (1.0 + 0.05 * distance + 0.016 * (distance * distance));  
  color *= attenuation * 2.0;

  // vignette
  float vignette = smoothstep(0.75, 0.5, length(fragUV - vec2(0.5)));
  color = mix(color, color * vignette, 0.5);

  outColor = vec4(color, 1.0);
}
