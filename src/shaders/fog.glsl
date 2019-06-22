const float LOG2 = 1.442695;

vec3 Fog(float dist, float density, vec3 color, vec3 fogColor) {
  float factor = clamp(exp2(-density * density * dist * dist * LOG2), 0.0, 1.0);
  return mix(fogColor, color, factor);
}
