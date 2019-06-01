mat3 sobel_y = mat3( 
  1.0, 0.0, -1.0, 
  2.0, 0.0, -2.0, 
  1.0, 0.0, -1.0 
);

mat3 sobel_x = mat3(
  1.0, 2.0, 1.0, 
  0.0, 0.0, 0.0,
  -1.0, -2.0, -1.0
);

float near = 0.1;
float far = 1000.0;
  
float LinearizeDepth(float z) {
  return (2.0 * near) / (far + near - z * (far - near));
}

float Sobel(sampler2D targetTexture, vec2 resolution) {
  float x = 1.0 / resolution.x;
  float y = 1.0 / resolution.y;
  mat3 I;
  for (int i = 0; i < 5; i++) {
    for (int j = 0; j < 5; j++) {
      I[i][j] = length(LinearizeDepth(texture(targetTexture, fragUV + vec2(x * float(i - 2), y * float(j - 2))).r));
    }
  }
  float gx = dot(sobel_x[0], I[0]) + dot(sobel_x[1], I[1]) + dot(sobel_x[2], I[2]); 
  float gy = dot(sobel_y[0], I[0]) + dot(sobel_y[1], I[1]) + dot(sobel_y[2], I[2]);
  return sqrt(pow(gx, 2.0) + pow(gy, 2.0));
}
