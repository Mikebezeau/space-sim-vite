export const SPRITE_TYPE = { circle: 1, smoke: 2 };
// function to draw a circle with faded edges, or a 4-ray star
export const DESIGN_TYPE = { circle: 1, star: 2 };
// function to draw a circle with faded edges, or a 4-ray star

const SHADER_SHAPE_FUNC = `
float starShape(vec2 pc) {
  float maxdist = 0.5;
  vec2 center = vec2(0.5);
  float falloff = smoothstep(0.0, 1.0, maxdist - length(center - pc));
  float x = pc.s - 0.5;
  float y = 0.5 - pc.t;
  float n = 1.0;
  float xy = x * y;
  if(xy != 0.0) n = abs(1.0 / xy);
  return falloff * n;
}
`;

const HSL_RBG = `
vec3 hslRgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
`;

export const GPU_PARTICLE_SHADER = {
  vertexShader: `
uniform float uTime;
uniform float uScale;
uniform bool reverseTime;
uniform float fadeIn;
uniform float fadeOut;

attribute float aSprite;
attribute float aDesign;
attribute vec3 positionStart;
attribute float startTime;
attribute vec3 velocity;
attribute vec3 acceleration;
attribute vec3 color;
attribute vec3 endColor;
attribute float aSize;
attribute float lifeTime;

varying float vSprite;
varying float vDesign;
varying vec4 vColor;
varying vec4 vEndColor;
varying float lifeLeft;
varying float alpha;
varying vec3 vPosition;

#include <common>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {
  vSprite = aSprite;
  vDesign = aDesign;
  vColor = vec4( color, 1.0 );
  vEndColor = vec4( endColor, 1.0);
  vPosition = position;
  
  vec3 newPosition;
  float timeElapsed = uTime - startTime;
  if(reverseTime) timeElapsed = lifeTime - timeElapsed;
  if(timeElapsed < fadeIn) {
    alpha = timeElapsed/fadeIn;
  }
  if(timeElapsed > lifeTime) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0); // make the point invisible
  } else {
   
    lifeLeft = 1.0 - ( timeElapsed / lifeTime );
  
    if(timeElapsed >= fadeIn && timeElapsed <= (lifeTime - fadeOut)) {
      alpha = 1.0;
    }
    if(timeElapsed > (lifeTime - fadeOut)) {
      alpha = 1.0 - (timeElapsed - (lifeTime-fadeOut))/fadeOut;
    }
    newPosition = positionStart 
      + (velocity * timeElapsed)
      + (acceleration * timeElapsed * timeElapsed)
      ;
    vec4 mvPosition = modelViewMatrix * vec4( newPosition, 1.0 );
    gl_PointSize = ( uScale * aSize / -mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;
    
    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>
  }
}
`,
  fragmentShader: `
uniform sampler2D tSprite;
uniform sampler2D uSprite1;

varying float vSprite;
varying float vDesign;
varying vec4 vColor;
varying vec4 vEndColor;
varying float lifeLeft;
varying float alpha;
varying vec3 vPosition;

#include <common>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

${SHADER_SHAPE_FUNC}

void main() {
  // set sprite or design type
  vec4 color = mix(vColor, vEndColor, 1.0-lifeLeft);
  if( vSprite > 0.0 ) {
    vec4 tex;
    if( vSprite == ${SPRITE_TYPE.circle}.0 ) tex = texture2D( tSprite, gl_PointCoord );
    else if( vSprite == ${SPRITE_TYPE.smoke}.0 ) tex = texture2D( uSprite1, gl_PointCoord );
    // color based on particle texture
    gl_FragColor = vec4( color.rgb*tex.rgb, alpha * tex.a);
  } 
  if( vDesign > 0.0) {
    if( vDesign == ${DESIGN_TYPE.circle}.0 ) {
      float circle = 1.0 - step(0.5, distance(gl_PointCoord, vec2(0.5)));
      gl_FragColor = color * circle;
    }
    else if( vDesign == ${DESIGN_TYPE.star}.0 ) {
      float star = starShape(gl_PointCoord);
      gl_FragColor = color * star;
    }
  }
  #include <clipping_planes_fragment>
  #include <logdepthbuf_fragment>
}
`,
};
