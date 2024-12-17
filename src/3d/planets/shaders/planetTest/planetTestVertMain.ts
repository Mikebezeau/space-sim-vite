//=======================================================================================//
//
// Procedural Blue Planet
// by Julien Sulpis (https://twitter.com/jsulpis)
// https://www.shadertoy.com/view/Ds3XRl
//
//=======================================================================================//

export const planetVertMain = `
vec2 resolution = uResolution * uQuality;
//uv = (position.xy - 0.5) * resolution / min(resolution.y, resolution.x);
oUv = uv;
uSunDirection = normalize(vec3(sunDirectionXY, 0.));

//gl_Position = vec4(2.0 * position - 1.0, 1.0);
`;
