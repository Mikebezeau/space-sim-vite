// result is float lightAngle is set for following frag shader commands

// NOT USING THIS FILE
export const glowVertHead = `
varying vec3 vLightAngleNormal;
varying vec3 vLightAnglePlanetPosition;
`;

export const glowVertMain = `
vLightAngleNormal = normal;
vLightAnglePlanetPosition = (modelMatrix * vec4(position, 1.0)).xyz;
`;

export const lightAngleFragHead = `
uniform mat4 u_rotationMat4;
varying vec3 vLightAngleNormal;
varying vec3 vLightAnglePlanetPosition;

mat3 extractRotationMatrix( mat4 mat ) {
    return mat3( mat[0].xyz, mat[1].xyz, mat[2].xyz );
}
`;

export const lightAngleFragMain = `
vec3 rotatedNormal = extractRotationMatrix( u_rotationMat4 ) * vLightAngleNormal;
vec3 light = normalize(-vLightAnglePlanetPosition);

float lightAngle = max(0.0, dot(rotatedNormal, light));
`;
