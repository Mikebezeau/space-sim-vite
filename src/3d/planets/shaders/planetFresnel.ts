export const fresVertHead = `
varying vec3 vFresPosition;
varying vec3 vFresNormalView;
`;

export const fresVertMain = `
vFresPosition = normalize(vec3(modelViewMatrix * vec4(position, 1.0)).xyz);
vFresNormalView = normalize(normalMatrix * normal);
`;

export const fresFragHead = `
varying vec3 vFresPosition;
varying vec3 vFresNormalView;
`;

export const fresFragMain = `
float outer_fade = abs ( dot( vFresPosition, vFresNormalView ) );
gl_FragColor = vec4( gl_FragColor.xyz, outer_fade * 5.0 );
`;

/*
export const fresFragMain = `
float fresnelTerm_inner = 0.2 - 0.7 * min( dot( vFresPosition, vFresNormalView ), 0.0 );
fresnelTerm_inner = pow( fresnelTerm_inner, 5.0 );
float fresnelTerm_outer = 1.0 - abs( dot( vFresPosition, vFresNormalView ) );
fresnelTerm_outer = pow( fresnelTerm_outer, 2.0 );
float fresnelTerm = fresnelTerm_inner + fresnelTerm_outer;
//gl_FragColor = vec4( gl_FragColor.xyz, fresnelTerm );
float outer_fade = abs ( dot( vFresPosition, vFresNormalView ) );
//outer_fade = pow( outer_fade, 2.0 );
gl_FragColor = vec4( gl_FragColor.xyz, outer_fade * 5.0 );
`;
*/
