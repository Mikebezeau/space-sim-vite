const starPointsShader = {
  uniforms: {
    uTexture: { value: null }, // TODO? performance option to draw circle instead of texture
    uTextureNebula: { value: null },
  },

  vertShader: `
  uniform float uBackground;
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aSelected;
  varying float vSize;
  varying vec4 vColor;
  varying float vSelected;

  void main() {
    float sqrtSize = sqrt(aSize);
    vColor = vec4( aColor, 1.0 );
    vSelected = aSelected;
    vSize = sqrtSize;
    //gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    if( round( vSelected ) == 2.0 ){
      vSize = sqrtSize * 30.0;
    }
    else if( round( vSelected ) == 1.0 ){
      vSize = sqrtSize * 34.0;
    }

    if( round( uBackground ) == 1.0) vSize = vSize / 2.0;

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_PointSize = min( vSize * 30.0 / -mvPosition.z, sqrtSize * 8.0 );
    gl_Position = projectionMatrix * mvPosition;
    
    if( round( uBackground ) == 1.0) {
      if( round( vSelected ) == -1.0 ){
        // discarding point that player is located at by setting position beyond clip plane
        gl_Position = vec4( 0.0 );
      }
     else if( round( vSelected ) == 1.0 ){
        gl_PointSize =  25.0;
        vColor = vec4( 0.2, 0.5, 0.8, 1.0 );
      }
      else{
        vColor = vec4( aColor, 1.0 + mvPosition.z * 0.06 );
        // discarding points that are too far away by setting position beyond clip plane
        if( vColor.w < 0.1 ) gl_Position = vec4( 0.0 );
      }
    }

  }
  `,

  fragShader: `
  uniform sampler2D uTexture;
  uniform sampler2D uTextureNebula;
  uniform float uBackground;
  varying vec4 vColor;
  varying float vSelected;

  void main() {
    if( round( vSelected ) == 4.0 ){
      // while point is dim, make it transparent
      gl_FragColor = texture2D( uTexture, gl_PointCoord ) * vec4( vColor.xyz, 0.03 );
    }
    //else if( round( vSelected ) == 3.0 ){} // tirtiarySelected
    //else if( round( vSelected ) == 2.0 ){} // secondarySelected
    else if( round( vSelected ) == 1.0 ){ // primarySelected or nebula selected
      if( round( uBackground ) == 1.0 ){
        // nebula in stars background
        gl_FragColor = texture2D( uTextureNebula, gl_PointCoord ) * vec4( vColor.xyz, 0.05 );
      }
      else {
       // primary selected in starmap
        gl_FragColor = texture2D( uTexture, gl_PointCoord ) * vec4( 0.0, 1.0, 0.0, 1 );
      }
    }
    else{
      gl_FragColor = texture2D( uTexture, gl_PointCoord ) * vColor;
    }
  }
`,
};

export default starPointsShader;
