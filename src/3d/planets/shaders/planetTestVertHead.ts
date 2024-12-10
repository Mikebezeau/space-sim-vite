//=======================================================================================//
//
// Procedural Blue Planet
// by Julien Sulpis (https://twitter.com/jsulpis)
// https://www.shadertoy.com/view/Ds3XRl
//
//=======================================================================================//

export const planetVertHead = `
//#version 300 es

precision highp float;

//in vec3 position;
uniform vec2 uResolution;
uniform vec2 sunDirectionXY;
uniform float uQuality;

out vec3 uSunDirection;
//out vec2 uv;
out vec2 oUv;
`;
