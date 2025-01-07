const rotatedNormalShader = {
  vertHead: `
varying vec3 vRotateNormal;
`,

  vertMain: `
vRotateNormal = normal;
`,

  fragHead: `
uniform mat4 uObjectMatrixWorld; // object3d.matrixWorld
varying vec3 vRotateNormal;

const float PI = 3.14159265359;

mat3 extractRotationMatrix( mat4 mat ) {
    return mat3( mat[0].xyz, mat[1].xyz, mat[2].xyz );
}
`,

  fragMain: `
mat3 rotationMatrix = extractRotationMatrix( uObjectMatrixWorld );
vec3 rotatedNormal = rotationMatrix * vRotateNormal;
`,
};

export default rotatedNormalShader;
