export const glowVertHead = `
varying vec3 vGlowNormal;
varying vec3 cameraVector;
varying vec3 vGlowWorldPosition;
`;

export const glowVertMain = `
vGlowNormal = normal;
// this must be world position
vGlowWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
cameraVector = cameraPosition - vGlowWorldPosition;
`;

export const glowFragHead = `
uniform mat4 u_rotationMat4; // rotation matrix
varying vec3 vGlowNormal;
varying vec3 vGlowWorldPosition;
varying vec3 cameraVector;

mat3 extractRotationMatrix( mat4 mat ) {
    return mat3( mat[0].xyz, mat[1].xyz, mat[2].xyz );
}
`;

export const glowFragMain = `
vec3 rotatedNormal = extractRotationMatrix( u_rotationMat4 ) * vGlowNormal;
vec3 light = normalize(-vGlowWorldPosition);
vec3 cameraDir = normalize(cameraVector);
float MathPI = 3.14159265358979323846264;

float lightAngle = max(0.0, dot(rotatedNormal, light));
float viewAngle = max(0.0, dot(rotatedNormal, cameraDir));
//float adjustedLightAngle = min(0.6, lightAngle) / 0.6;
//float adjustedViewAngle = min(0.65, viewAngle) / 0.65;
float invertedViewAngle = pow(acos(viewAngle), 3.0) * 0.4;

float dProd = 0.0;
dProd += 0.5 * lightAngle;
dProd += 0.2 * lightAngle * (invertedViewAngle - 0.1);
//dProd += invertedViewAngle * 0.5 * (max(-0.35, dot(rotatedNormal, light)) + 0.35);
dProd += invertedViewAngle * 1.5 * (max(-0.35, dot(rotatedNormal, light)) + 0.35);
dProd *= 0.7 + pow(invertedViewAngle/(MathPI/2.0), 2.0);

dProd *= 0.5;

//vec4 atmColor = vec4( vec3( dProd ), 1.0 );
// applying 'outer_fade' fresnel effect (called previously in material shader)
vec4 atmColor = vec4( vec3( dProd ) * ( 1.0-outer_fade ), 1.0 );

//vec4 texelColor = texture2D(map, vUv) * min(asin(lightAngle), 1.0);
//vec4 texelColor = gl_FragColor + min(asin(lightAngle), 1.0);
//gl_FragColor = texelColor + min(atmColor, 0.8);
//gl_FragColor = gl_FragColor + min(atmColor, 0.8);

gl_FragColor = gl_FragColor + atmColor;// vec4(vec3(lightAngle), 1.0);

//gl_FragColor = atmColor;
`;
