const atmosGlowShader = {
  uniforms: {
    u_atmos: {
      value: 1,
    },
    u_planetRealPos: { value: null },
  },

  vertHead: `
varying vec3 cameraVector;
varying vec3 vGlowWorldPosition;
`,

  vertMain: `
vGlowWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
cameraVector = cameraPosition - vGlowWorldPosition;
`,

  fragHead: `
uniform bool u_atmos;
uniform vec3 u_planetRealPos;
varying vec3 vGlowWorldPosition;
varying vec3 cameraVector;
`,

  fragMain: `
if( u_atmos ) {
  // rotatedNormal set in rotatedNormalShader

  // lightDir not pointing to (0, 0, 0) due to relative position of sun and planets
  //vec3 lightDir = normalize(-vGlowWorldPosition);
  vec3 lightDir = normalize(-u_planetRealPos);
  vec3 cameraDir = normalize(cameraVector);

  // making the light shine more on the sides of planet: + 0.2
  float lightAngle = clamp(dot(rotatedNormal, lightDir) + 0.2, 0.0, 1.0);

  float viewAngle = max(0.0, dot(rotatedNormal, cameraDir));

  // making the angle greater for more glow
  float adjustedLightAngle = max(0.0, dot(rotatedNormal, lightDir) + 0.3 );

  // adjusting invertedViewAngle to glow more on edges, less in middle
  float invertedViewAngle = pow(1.0 - viewAngle, 3.0) * 2.0;

  float starAngle = dot(adjustedLightAngle, invertedViewAngle);
  float cameraTowardsStarAngle = max(0.0, dot(lightDir, -cameraDir));
  // similar to cameraAwayStarAngle to match up when rotating around planet
  float cameraAwayStarAngle = max(0.0, dot(lightDir, cameraDir) + 3.0);

  // outer glow when star behind planet
  float glowIntensity = starAngle * cameraTowardsStarAngle;

  // outer glow when star behind camera, camera facing planet
  float invertedglowIntensity = starAngle * cameraAwayStarAngle;

  // strengthen intensity of glow in band around outer edge of planet
  glowIntensity *= ( ( 1.0 - outer_fade ) * 2.5 );

  // lessen intensity of glow invertedglowIntensity away from edge
  invertedglowIntensity *= ( ( 1.0 - outer_fade ) * 0.75 );

  // clamp values to 0.0 - 1.0
  glowIntensity = clamp( glowIntensity, 0.0, 1.0 );
  invertedglowIntensity = clamp( invertedglowIntensity, 0.0, 1.0 );

  glowIntensity = glowIntensity + invertedglowIntensity;
  // adjusting glowIntensity again to glow less in middle
  glowIntensity *= ( ( 1.0 - outer_fade ) * 0.25 );

  vec3 shadedColor = gl_FragColor.rgb * lightAngle;

  gl_FragColor = vec4( shadedColor + glowIntensity, 1.0 );
  //gl_FragColor = vec4( vec3( lightAngle ), 1.0 );
}
`,
};

export default atmosGlowShader;
