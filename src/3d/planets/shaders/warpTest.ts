export const warpVertMain = `
`;

export const warpFunctions = `
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

export const warpFragMain = `
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

// Sample the base texture
vec4 baseColor = texture2D(u_texture, vUv);

// Create a cloud effect using noise
float cloudMask = fractalNoise(distortedP * 2.0 + vec3(u_time * 0.05)); // Larger clouds
cloudMask = smoothstep(0.3, 0.6, cloudMask); // Sharpen the noise to create cloud shapes

// Sample the base texture with fractal noise for cloud color
vec4 cloudColor = texture2D(u_texture, vUv + 0.1 * vec2(
    fractalNoise(p + vec3(u_time * 0.1, 0.0, 0.0)),
    fractalNoise(p + vec3(0.0, u_time * 0.1, 0.0))
));

// Mix clouds with base texture
gl_FragColor = mix(baseColor, cloudColor, cloudMask);
`;
