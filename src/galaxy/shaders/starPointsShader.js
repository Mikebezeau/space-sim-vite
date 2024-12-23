const starPointsShader = {
  uniforms: {
    uTexture: { value: null },
    uTextureNebula: { value: null },
    uBackground: { value: 0.0 }, // if is being displayed as background
  },

  vertShader: `
  uniform float uBackground;
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aSelected;
  varying float vSize;
  varying vec3 vColor;
  varying float vSelected;

  void main() {
    vColor = aColor;
    vSelected = aSelected;
    vSize = aSize;
    //gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    if( round( vSelected ) == 2.0 ){
      vSize = aSize * 30.0;
    }
    else if( round( vSelected ) == 1.0 ){
      vSize = aSize * 34.0;
    }

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    if( round( uBackground ) == 1.0) {
     if( round( vSelected ) == 1.0 ){
        gl_PointSize =  15.0;
      }
      else vColor = vColor + 0.5;
    }
    else{
      gl_PointSize = min( vSize * 30.0 / -mvPosition.z, aSize * 8.0 );
    }
    gl_Position = projectionMatrix * mvPosition;
  }
  `,

  fragShader: `
  uniform sampler2D uTexture;
  uniform sampler2D uTextureNebula;
  uniform float uBackground;
  varying vec3 vColor;
  varying float vSelected;

  void main() {
    if( round( vSelected ) == 4.0 ){
      // while point is dim, make it transparent
      gl_FragColor = texture2D( uTexture, gl_PointCoord ) * vec4( vColor, 0.03 );
    }
    //else if( round( vSelected ) == 3.0 ){} // tirtiarySelected
    //else if( round( vSelected ) == 2.0 ){} // secondarySelected
    else if( round( vSelected ) == 1.0 ){ // primarySelected or nebula selected
      if( round( uBackground ) == 1.0 ){
        // nebula in stars background
        gl_FragColor = texture2D( uTextureNebula, gl_PointCoord ) * vec4( vColor, 0.05 );
      }
      else {
       // primary selected in starmap
        gl_FragColor = texture2D( uTexture, gl_PointCoord ) * vec4( 0.0, 1.0, 0.0, 1 );
      }
    }
    else{
    gl_FragColor = texture2D( uTexture, gl_PointCoord ) * vec4( vColor, 1.0 );
    }
  }
`,
};

export default starPointsShader;
