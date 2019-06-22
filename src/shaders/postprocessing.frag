#version 300 es
precision mediump float;

out vec4 outColor;
in vec2 fragUV;

uniform vec3 camera;
uniform sampler2D colorTexture;
uniform sampler2D depthTexture;
uniform sampler2D positionTexture;
uniform sampler2D normalTexture;

@import ./fog;
@import ./lighting;
@import ./sobel;

const vec3 background = vec3(0.2, 0.3, 0.4);

void main(void) {
  vec3 color = background;
  vec3 normal = texture(normalTexture, fragUV).rgb;

  if (
    normal.x != 0.0
    || normal.y != 0.0
    || normal.z != 0.0
  ) {
    vec2 resolution = vec2(textureSize(colorTexture, 0));
    vec3 position = texture(positionTexture, fragUV).rgb;

    // lighting
    color = Lighting(texture(colorTexture, fragUV).rgb, normalize(normal), position) * 2.0;
    // edge detection
    if (Sobel(depthTexture, resolution) >= 2.0) {
      color = mix(background * 0.5, color, 0.3);
    }
    // fog
    float distance = length(position);
    color = Fog(distance, 0.1, color, background);
  }

  // vignette
  float vignette = smoothstep(0.75, 0.5, length(fragUV - vec2(0.5)));
  color = mix(color, color * vignette, 0.3);

  outColor = vec4(color, 1.0);
}
