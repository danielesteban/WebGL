#version 300 es
precision mediump float;

out vec4 outColor;
in vec2 fragUV;

uniform vec3 camera;
uniform sampler2D colorTexture;
uniform sampler2D positionTexture;
uniform sampler2D normalTexture;

float sobel(in vec2 resolution) {
	float x = 1.0 / resolution.x * 2.0;
	float y = 1.0 / resolution.y * 2.0;
  vec4 horizEdge = vec4(0.0);
	horizEdge -= texture(normalTexture, vec2(fragUV.x - x, fragUV.y - y)) * 1.0;
	horizEdge -= texture(normalTexture, vec2(fragUV.x - x, fragUV.y    )) * 2.0;
	horizEdge -= texture(normalTexture, vec2(fragUV.x - x, fragUV.y + y)) * 1.0;
	horizEdge += texture(normalTexture, vec2(fragUV.x + x, fragUV.y - y)) * 1.0;
	horizEdge += texture(normalTexture, vec2(fragUV.x + x, fragUV.y    )) * 2.0;
	horizEdge += texture(normalTexture, vec2(fragUV.x + x, fragUV.y + y)) * 1.0;
	vec4 vertEdge = vec4(0.0);
	vertEdge -= texture(normalTexture, vec2(fragUV.x - x, fragUV.y - y)) * 1.0;
	vertEdge -= texture(normalTexture, vec2(fragUV.x    , fragUV.y - y)) * 2.0;
	vertEdge -= texture(normalTexture, vec2(fragUV.x + x, fragUV.y - y)) * 1.0;
	vertEdge += texture(normalTexture, vec2(fragUV.x - x, fragUV.y + y)) * 1.0;
	vertEdge += texture(normalTexture, vec2(fragUV.x    , fragUV.y + y)) * 2.0;
	vertEdge += texture(normalTexture, vec2(fragUV.x + x, fragUV.y + y)) * 1.0;
	vec3 edge = sqrt((horizEdge.rgb * horizEdge.rgb) + (vertEdge.rgb * vertEdge.rgb));
	return edge.r + edge.g + edge.b;
}

void main(void) {
	vec2 resolution = vec2(textureSize(colorTexture, 0));

  vec3 color = texture(colorTexture, fragUV).rgb;
  vec3 position = texture(positionTexture, fragUV).rgb;

	// edge detection
	float edge = sobel(resolution);
	if (edge > 3.5) {
		color *= edge / 3.0;
	}

  // attenuation
  float distance = length(camera - position);
	float attenuation = 1.0 / (1.0 + 0.05 * distance + 0.032 * (distance * distance));  
	color *= attenuation;

  // vignette
	float vignette = smoothstep(0.75, 0.5, length(fragUV - vec2(0.5)));
	color = mix(color, color * vignette, 0.5);

	outColor = vec4(color, 1.0);
}
