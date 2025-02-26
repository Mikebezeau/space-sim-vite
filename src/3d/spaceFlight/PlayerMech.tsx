import React, { memo, useEffect, useRef } from "react";
import * as THREE from "three";
import { BoxGeometry, FrontSide, Object3D, ShaderMaterial } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import useStore from "../../stores/store";
import usePlayerControlsStore from "../../stores/playerControlsStore";
import useParticleStore from "../../stores/particleStore";
import useEnemyStore from "../../stores/enemyStore";
import PlayerCrosshair from "./PlayerCrosshair";
//import BuildMech from "../buildMech/BuildMech";
import Particles from "../Particles";
import Mech from "../../classes/mech/Mech";
import { setVisible } from "../../util/gameUtil";
import { FPS, PLAYER } from "../../constants/constants";
//import { setCustomData } from "r3f-perf";

const PlayerMech = () => {
  useStore.getState().updateRenderInfo("PlayerMech");

  const { camera, gl, scene } = useThree();

  const player = useStore((state) => state.player);
  //const weaponFireLightTimer = useStore((state) => state.weaponFireLightTimer);

  const playerViewMode = usePlayerControlsStore(
    (state) => state.playerViewMode
  );
  const playerWarpToPosition = usePlayerControlsStore(
    (state) => state.playerWarpToPosition
  );
  const particleSystem = useParticleStore(
    (state) => state.playerParticleController.particleSystem
  );
  const playerParticleEffects = useParticleStore(
    (state) => state.playerEffects
  );

  const playerMechRef = useRef<any>(null);
  const secondaryGroupRef = useRef<THREE.Group | null>(null);
  const weaponFireLight = useRef<THREE.PointLight | null>(null);

  //
  const arrowHelper = useRef<THREE.ArrowHelper>(new THREE.ArrowHelper());
  useEffect(() => {
    //scene.add(arrowHelper.current);
    return () => {
      scene.remove(arrowHelper.current);
    };
  }, []);
  const handleMouseClick = (event: MouseEvent) => {
    const { clientX, clientY } = event;
    const width = gl.domElement.clientWidth;
    const height = gl.domElement.clientHeight;

    const mouse = new THREE.Vector2(
      (clientX / width) * 2 - 1,
      -(clientY / height) * 2 + 1
    );
    /*
    const raycaster = new THREE.Raycaster(
      player.object3d.getWorldPosition(new THREE.Vector3(0, 0, 0)),
      player.object3d.getWorldDirection(new THREE.Vector3(0, 0, 0))
    );
    */
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    raycaster.params.Points.threshold = 0.01;
    raycaster.near = 0.1;
    raycaster.far = 10000;

    arrowHelper.current.position.copy(raycaster.ray.origin);
    arrowHelper.current.setDirection(raycaster.ray.direction);
    arrowHelper.current.setLength(50);

    const objectsToTest = [
      //player.object3d,
      ...useStore.getState().stations.map((station) => station.object3d),
      ...useEnemyStore
        .getState()
        .enemyGroup.enemyMechs.map((enemy: Mech) =>
          enemy.useInstancedMesh ? null : enemy.object3d
        ),
      // instanceed meshes
      ...useEnemyStore
        .getState()
        .enemyGroup.instancedMeshRefs.map((instancedMesh) => instancedMesh),
    ];
    const intersects = raycaster.intersectObjects(
      objectsToTest.filter((obj) => obj !== null),
      true
    );

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      if (!intersectedObject) return;

      let object = intersects[0].object;

      if (object instanceof THREE.InstancedMesh) {
        const instanceId = intersects[0].instanceId;
        if (typeof instanceId === "undefined") {
          console.warn("instanceId undefined");
          return;
        }
        // expolde mech in enemyGroup corresponding to InstancedMesh object and instanceId
        useEnemyStore
          .getState()
          .enemyGroup.explodeInstancedEnemy(
            scene,
            object as THREE.InstancedMesh,
            instanceId
          );
        /*
        useEnemyStore
          .getState()
          .enemyGroup.updateInstancedColor(
            object as THREE.InstancedMesh,
            instanceId
          );
        */
      }
      // end if instanced mesh
      // else, is not instanced mesh
      else {
        while (!object.userData.mechId && object.parent) {
          object = object.parent;
        }
        const topParentMechObj = object;
        const intersectedObjectMechId = topParentMechObj.userData.mechId;

        if (!intersectedObjectMechId) {
          console.warn("No mech id found");
          return;
        }
        // find mech by the mech.id
        let intersectedMech: Mech | undefined = useEnemyStore
          .getState()
          .enemyGroup.enemyMechs.find(
            (enemy) => enemy.id === intersectedObjectMechId
          );
        // stations
        if (!intersectedMech) {
          intersectedMech = useStore
            .getState()
            .stations.find((station) => station.id === intersectedObjectMechId);
        }
        /*
        //hitting self
        if (!intersectedMech) {
          if (player.id === intersectedObjectMechId){
            intersectedMech = useStore.getState().player;
          }
        }
        */
        if (!intersectedMech)
          console.log("No mech found, id:", intersectedObjectMechId);
        intersectedMech?.explode();
      }
    }
  };

  useEffect(() => {
    //window.addEventListener("click", handleMouseClick);
    return () => {
      window.removeEventListener("click", handleMouseClick);
    };
  }, []);

  //

  //

  const particleOriginObj = new Object3D();
  let speed: number,
    numParticles: number,
    size: number,
    positionRadius: number,
    positionRadiusMin: number,
    lifetime: number;

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

    particleOriginObj.rotation.copy(player.object3d.rotation);

    if (playerWarpToPosition !== null) {
      particleOriginObj.position.set(0, 0, 0);
      particleOriginObj.translateZ(100);
      // set particle effect properties
      speed = -3;
      // adjust numParticles based on frame rate
      numParticles = 10;
      size = 0.1;
      positionRadius = 25;
      positionRadiusMin = 5;
      lifetime = 1;
      playerParticleEffects.addWarpStars(
        particleOriginObj.position,
        particleOriginObj.rotation,
        // negative speed to have exhuast move in opposite direction of ship
        speed,
        numParticles,
        size,
        positionRadius,
        positionRadiusMin,
        lifetime
      );
    }

    // move particleOriginObj to back of ship
    particleOriginObj.position.set(0, 0, 0);
    particleOriginObj.translateY(0.25);
    particleOriginObj.translateZ(-4.2);
    // set particle effect properties
    speed = Math.min(-0.05 - player.speed / 10, 0);
    speed = Math.max(speed, -1);
    // adjust numParticles based on frame rate
    numParticles = 1000 * delta * FPS * Math.abs(speed);
    size = 0.01;
    positionRadius = 0.6;
    positionRadiusMin = 0.1;
    lifetime = 0.2 / (1 + Math.abs(speed));
    playerParticleEffects.addEngineExhaust(
      particleOriginObj.position,
      particleOriginObj.rotation,
      // negative speed to have exhuast move in opposite direction of ship
      speed,
      numParticles,
      size,
      positionRadius,
      positionRadiusMin,
      lifetime
    );

    if (player.object3d && secondaryGroupRef.current) {
      //placed into SpaceFlightPlanetsScene to sync
      // relativePlayerGroupRef and enemyRelativePlayerGroupRef with playerWorldOffsetPosition
      //updatePlayerMechAndCamera(delta, camera);

      // player mech object3d directly linked to Buildmech ref: playerMechRef.current
      // update player particle system position
      particleSystem.position.copy(player.object3d.position);

      //setCustomData(particleSystem.position.x);
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
    // ordering sequence of useFrames so is after SpaceFlightPlanetsScene -> updatePlayerMechAndCamera
    // TODO create useFrame render order constant
  }, -1);

  return (
    <>
      <object3D
        ref={(mechRef) => {
          if (mechRef) {
            playerMechRef.current = mechRef;
            player.assignObject3dComponentRef(mechRef);
          }
        }}
      />
      <group ref={secondaryGroupRef}>
        <Particles isPlayerParticles />
        {/* TODO impliment option orb beside ship with weapon */}
        <mesh position={[-10, 0, 0]} geometry={new BoxGeometry(0.2, 0.2, 0.2)}>
          <meshBasicMaterial color={"blue"} />
        </mesh>
        <PlayerCrosshair />
        <pointLight
          ref={weaponFireLight}
          position={[0, 0, 0.2]}
          distance={3}
          intensity={0}
          color="lightgreen"
        />
        {/*}
        <mesh
          position={[0, 0.4, -6]}
          geometry={new BoxGeometry(0.6, 0.6, 3)}
          material={engineShaderMaterial}
        />*/}
      </group>
    </>
  );
};

//export default memo(PlayerMech);
export default memo(PlayerMech);
