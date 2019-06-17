struct Light {
  vec3 position;
  vec3 color;
};

const int NUM_LIGHTS = 16;
uniform Light lights[NUM_LIGHTS];

vec3 Lighting(vec3 color, vec3 normal, vec3 position) {
  vec3 lighting;
  vec3 viewDir = normalize(camera - position);
  for (int i = 0; i < NUM_LIGHTS; i += 1) {
      // diffuse
      vec3 lightDir = normalize(lights[i].position - position);
      vec3 diffuse = max(dot(normal, lightDir), 0.0) * color * lights[i].color;
      // specular
      vec3 halfwayDir = normalize(lightDir + viewDir);  
      float spec = pow(max(dot(normal, halfwayDir), 0.0), 16.0);
      vec3 specular = lights[i].color * spec * color;
      // attenuation
      float distance = length(lights[i].position - position);
      float attenuation = 1.0 / (1.0 + 0.35 * distance + 0.44 * distance * distance);
      lighting += (diffuse + specular) * attenuation;
  }
  return lighting;
}
