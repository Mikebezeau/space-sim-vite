// 2D Random
export const sunfunctions = `
float random (in vec3 st) {
  return fract(sin(dot(st,vec3(12.9898,78.233,23.112)))*12943.145);
}

float noise (in vec3 _pos, in float u_time) {
  vec3 i_pos = floor(_pos);
  vec3 f_pos = fract(_pos);

  float i_time = floor(u_time*0.2);
  float f_time = fract(u_time*0.2);

  // Four corners in 2D of a tile
  float aa = random(i_pos + i_time);
  float ab = random(i_pos + i_time + vec3(1., 0., 0.));
  float ac = random(i_pos + i_time + vec3(0., 1., 0.));
  float ad = random(i_pos + i_time + vec3(1., 1., 0.));
  float ae = random(i_pos + i_time + vec3(0., 0., 1.));
  float af = random(i_pos + i_time + vec3(1., 0., 1.));
  float ag = random(i_pos + i_time + vec3(0., 1., 1.));
  float ah = random(i_pos + i_time + vec3(1., 1., 1.));

  float ba = random(i_pos + (i_time + 1.));
  float bb = random(i_pos + (i_time + 1.) + vec3(1., 0., 0.));
  float bc = random(i_pos + (i_time + 1.) + vec3(0., 1., 0.));
  float bd = random(i_pos + (i_time + 1.) + vec3(1., 1., 0.));
  float be = random(i_pos + (i_time + 1.) + vec3(0., 0., 1.));
  float bf = random(i_pos + (i_time + 1.) + vec3(1., 0., 1.));
  float bg = random(i_pos + (i_time + 1.) + vec3(0., 1., 1.));
  float bh = random(i_pos + (i_time + 1.) + vec3(1., 1., 1.));

  // Smooth step
  vec3 t = smoothstep(0., 1., f_pos);
  float t_time = smoothstep(0., 1., f_time);

  // Mix 4 corners percentages
  return 
  mix(
      mix(
          mix(mix(aa,ab,t.x), mix(ac,ad,t.x), t.y),
          mix(mix(ae,af,t.x), mix(ag,ah,t.x), t.y), 
      t.z),
      mix(
          mix(mix(ba,bb,t.x), mix(bc,bd,t.x), t.y),
          mix(mix(be,bf,t.x), mix(bg,bh,t.x), t.y), 
      t.z), 
  t_time);
}

#define NUM_OCTAVES 6
float fBm ( in vec3 _pos, in float sz, in float u_time) {
  float v = 0.0;
  float a = 0.2;
  _pos *= sz;

  vec3 angle = vec3(-0.001*u_time,0.0001*u_time,0.0004*u_time);
  mat3 rotx = mat3(1, 0, 0,
                  0, cos(angle.x), -sin(angle.x),
                  0, sin(angle.x), cos(angle.x));
  mat3 roty = mat3(cos(angle.y), 0, sin(angle.y),
                  0, 1, 0,
                  -sin(angle.y), 0, cos(angle.y));
  mat3 rotz = mat3(cos(angle.z), -sin(angle.z), 0,
                  sin(angle.z), cos(angle.z), 0,
                  0, 0, 1);

  for (int i = 0; i < NUM_OCTAVES; ++i) {
      v += a * noise(_pos, u_time);
      _pos = rotx * roty * rotz * _pos * 2.0;
      a *= 0.8;
  }
  return v;
}
`;
// x coord: ( abs( vUv.x - 0.5 ) + 0.5 ) = 1.0 at either end of the x coordinate [0,1] (seam on sphere running top to bottom)
// y coord: vUv.y = 1.0 at the top of the sphere, 0.0 at the bottom - do not need to worry about any seam
// z coord: differentiate left and right sides of sphere (instead of mirrored noise)
// z explination: when vUv.x is between 0 and 0.5 get a scaling number that starts and ends in 1, over 0.5 get 1
// this gives a different noise value for the left and right side of the sphere
// max( abs( vUv.x - 0.25 ), 0.25 ) + 0.75 gets a scaling number that ranges
// from 1 - 0.75 - 1 when 0 < x < 0.5 and 1 when x > 0.5
export const sunFragMain = `
float x = abs( vUv.x - 0.5 );
float y = vUv.y;
float z = min( abs( vUv.x - 0.25 ), 0.25 ) + 0.75;
vec3 st = vec3( x, y, z );
vec3 q = vec3( 0.0 );
q.x = fBm( st, 5.0, u_time );
q.y = fBm( st + vec3( 1.2, 3.2, 1.52 ), 5.0, u_time );
q.z = fBm( st + vec3( 0.02, 0.12, 0.152 ), 5.0, u_time );
float n = fBm( st + q + vec3( 1.82, 1.32, 1.09 ), 5.0, u_time );
vec3 color = mix( gl_FragColor.xyz, vec3( 1.0, 1.0, 1.0 ), n * n );
color = mix( color, gl_FragColor.xyz, q * 0.7 );
gl_FragColor = vec4( 1.6 * color, 1.0 );
`;
