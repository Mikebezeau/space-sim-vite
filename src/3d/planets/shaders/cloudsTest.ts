/*

USE AFTER planetGlow shaders, so "rotatedNormal" is set
frag requirements
uniform:
    u_time

varying:
    vUv
*/

export const cloudsVertHead = `
varying vec3 vCloudNormalView;
varying vec3 vCloudWorldPosition;
varying vec2 vUv;
`;

export const cloudsVertMain = `
vCloudNormalView = normalize( normalMatrix * normal );
vCloudWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
vUv = uv;
`;

export const cloudsFunctions = `
// Hash function for Perlin noise
float hash(float n) {
    return fract(sin(n) * 43758.5453123);
}

// 3D Perlin noise function
float perlinNoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);

    float n = dot(i, vec3(1.0, 57.0, 113.0));
    float res = mix(
        mix(mix(hash(n + 0.0), hash(n + 1.0), u.x),
            mix(hash(n + 57.0), hash(n + 58.0), u.x), u.y),
        mix(mix(hash(n + 113.0), hash(n + 114.0), u.x),
            mix(hash(n + 170.0), hash(n + 171.0), u.x), u.y), u.z
    );
    return res * res;
}

// Fractal noise for more complex patterns
float fractalNoise(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 2.0;
    for (int i = 0; i < 5; i++) { // 5 layers of noise
        value += amplitude * perlinNoise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}
`;

export const cloudsFragHead = `
uniform float u_time;
uniform vec3 u_cloudColor;
varying vec3 vCloudNormalView;
varying vec3 vCloudWorldPosition;
varying vec2 vUv;
`;

export const cloudsFragMain = `
// Convert UV coordinates to spherical coordinates
vec2 uv = vUv * 2.0 - 1.0;
float theta = uv.x * 3.14159265359;
float phi = uv.y * 1.57079632679;
vec3 p = vec3(cos(phi) * cos(theta), cos(phi) * sin(theta), sin(phi));

// Base UV coordinates with time-based distortion
vec3 distortedP = p + 0.1 * vec3(
    fractalNoise(p + vec3(u_time * 0.1, 0.0, 0.0)),
    fractalNoise(p + vec3(0.0, u_time * 0.1, 0.0)),
    fractalNoise(p + vec3(0.0, 0.0, u_time * 0.1))
);

// Create a cloud effect using noise
float cloudScale = 1.0; // 0.1 to 1 // increases overall scale, so clouds are also spread out more
float cloudMask = fractalNoise(distortedP * (1.0 / cloudScale) + vec3(u_time * 0.05)); // Increase scale factor for larger clouds
cloudMask = smoothstep(0.3, 0.6, cloudMask); // Sharpen the noise to create cloud shapes

// Calculate the light direction (assuming light is at (0, 0, 0))
vec3 lightDir = normalize(-vCloudWorldPosition);

// Calculate the surface normal
vec3 normalP = normalize(p);

// Calculate the shadow factor based on the angle between the light direction and the surface normal
//float shadowFactor = clamp(dot(lightDir, vCloudNormalView), 0.0, 1.0);//max(dot(normalP, lightDir), 0.0);

//float shadowFactor = clamp(dot(lightDir, normalP), 0.1, 0.8);
// USING THE rotatedNormal VARIABLE FROM planetGlow
float shadowFactor = clamp(dot(lightDir, rotatedNormal), 0.1, 0.8);

// Reduce cloudMask if in shadow
cloudMask *= shadowFactor;

// Mix the cloud effect with the base texture
vec4 baseCloudColor = vec4( u_cloudColor, 1.0 );//vec4(1.0, 1.0, 1.0, 1.0);
vec4 cloudColor = mix(gl_FragColor, baseCloudColor, cloudMask); // Mix with white color for clouds
gl_FragColor = cloudColor;
//gl_FragColor = vec4(vec3(shadowFactor), 1.0);
`;
