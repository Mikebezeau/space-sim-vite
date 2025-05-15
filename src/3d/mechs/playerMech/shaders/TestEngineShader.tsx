import React from "react";
import { BoxGeometry, FrontSide, ShaderMaterial } from "three";
import useStore from "../../../../stores/store";
const TestEngineShader = () => {
  useStore.getState().updateRenderInfo("TestEngineShader");

  const engineShaderMaterial = new ShaderMaterial({
    side: FrontSide, // using depthWrite: false possible preformance upgrade
    transparent: true,
    depthTest: true, // default is true
    depthWrite: false, // must have true for uv mapping unless use THREE.FrontSide
    uniforms: {
      u_time: {
        value: 0.0,
      },
    },
    //blending: THREE.AdditiveBlending,
    vertexShader: `
  
  #include <common>
  #include <logdepthbuf_pars_vertex>
  
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    #include <logdepthbuf_vertex>
  }
  `,
    fragmentShader: `  
  uniform sampler2D u_texture;
  
  varying vec2 vUv;
  varying vec3 vPosition;

  #include <common>
  #include <logdepthbuf_pars_fragment>
  
  void main() {
    #include <logdepthbuf_fragment>
  
    gl_FragColor = vec4( vec3( 1.0 ), 0.3 - abs( vPosition.x ) - abs( vPosition.z / 2.0 ) );
  }
  `,
  });

  return (
    <mesh
      position={[0, 0.4, -6]}
      geometry={new BoxGeometry(0.6, 0.6, 3)}
      material={engineShaderMaterial}
    />
  );
};

export default TestEngineShader;
