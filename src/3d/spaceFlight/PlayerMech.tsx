import React, { useEffect, useRef } from "react";
import { Group, PointLight } from "three";
import { BoxGeometry, FrontSide, Object3D, ShaderMaterial } from "three";
import { useThree, useFrame } from "@react-three/fiber";
import useStore from "../../stores/store";
import usePlayerControlsStore from "../../stores/playerControlsStore";
import useParticleStore from "../../stores/particleStore";
import PlayerCrosshair from "./PlayerCrosshair";
import BuildMech from "../buildMech/BuildMech";
import Particles from "../Particles";
import { setVisible } from "../../util/gameUtil";
import { PLAYER } from "../../constants/constants";
//import { setCustomData } from "r3f-perf";

const PlayerMech = () => {
  useStore.getState().updateRenderInfo("PlayerMech");

  const { camera } = useThree();
  const player = useStore((state) => state.player);
  //const weaponFireLightTimer = useStore((state) => state.weaponFireLightTimer);

  const playerViewMode = usePlayerControlsStore(
    (state) => state.playerViewMode
  );
  const updatePlayerMechAndCameraFrame = usePlayerControlsStore(
    (state) => state.updatePlayerMechAndCameraFrame
  );

  const addEngineExhaust = useParticleStore(
    (state) => state.playerEffects.addEngineExhaust
  );

  const playerMechRef = useRef<any>(null);
  const secondaryGroupRef = useRef<Group | null>(null);
  const weaponFireLight = useRef<PointLight | null>(null);

  const tempEngineObject = new Object3D();

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

  // set mech to invisible in cockpit view
  useEffect(() => {
    if (playerMechRef.current !== null) {
      if (playerViewMode === PLAYER.view.firstPerson) {
        setVisible(playerMechRef.current, false);
      } else {
        setVisible(playerMechRef.current, true);
      }
    }
  }, [playerViewMode]);

  //moving camera, ship, altering crosshairs, weapon lights (activates only while flying)
  useFrame((_, delta) => {
    delta = Math.min(delta, 0.1); // cap delta to 100ms

    if (!playerMechRef.current) return null;
    tempEngineObject.position.copy(player.object3d.position);
    tempEngineObject.rotation.copy(player.object3d.rotation);
    tempEngineObject.translateZ(-4);
    addEngineExhaust(
      tempEngineObject.position,
      tempEngineObject.rotation,
      player.speed
    );

    if (player.object3d && secondaryGroupRef.current) {
      updatePlayerMechAndCameraFrame(delta, camera);

      // player mech object3d directly linked to Buildmech ref: playerMechRef.current
      // update secondary group (crosshair, weapon light)
      secondaryGroupRef.current.position.copy(player.object3d.position);
      secondaryGroupRef.current.rotation.copy(player.object3d.rotation);
      //weapon firing light blast
      if (weaponFireLight.current) {
        weaponFireLight.current.intensity += 0; /*
        ((weaponFireLightTimer && Date.now() - weaponFireLightTimer < 100
          ? 1
          : 0) -
          weaponFireLight.current.intensity) *
        0.3;*/
      }
    }
    // ordering sequence of useFrames so that Particles useFrame runs last
  }, -2);

  return (
    <>
      <BuildMech
        ref={(mechRef) => {
          if (mechRef) {
            playerMechRef.current = mechRef;
            // TODO fix TS error here
            // @ts-ignore
            player.initObject3d(mechRef);
          }
        }}
        mechBP={player.mechBP}
        //servoHitNames={[]}
      />
      <group ref={secondaryGroupRef}>
        <Particles isPlayerParticles />
        <PlayerCrosshair />
        <pointLight
          ref={weaponFireLight}
          position={[0, 0, 0.2]}
          distance={3}
          intensity={0}
          color="lightgreen"
        />
        <mesh
          position={[0, 0.4, -6]}
          geometry={new BoxGeometry(0.6, 0.6, 3)}
          material={engineShaderMaterial}
        />
      </group>
    </>
  );
};

export default PlayerMech;
