//=======================================================================================//
//
// Procedural Blue Planet
// by Julien Sulpis (https://twitter.com/jsulpis)
// https://www.shadertoy.com/view/Ds3XRl
//
//=======================================================================================//

export const planetFragMain = `
vec3 ro = vec3(CAMERA_POSITION);
vec3 rd = normalize(vec3(uv, -1));

vec3 color = radiance(ro, rd);

// color grading
color = simpleReinhardToneMapping(color);

// vignette
color *= 1. - 0.5 * pow(length(uv), 3.);

//fragColor = vec4(color, 1.0);
gl_fragColor = vec4(color, 1.0);

`;
