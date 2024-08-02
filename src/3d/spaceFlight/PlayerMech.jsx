import { useEffect, useLayoutEffect } from "react";
import { useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import useStore from "../../stores/store";
import usePlayerControlsStore from "../../stores/playerControlsStore";
import PlayerCrosshair from "./PlayerCrosshair";
import BuildMech from "../BuildMech";
//import MeshLineTrail from "./MeshLineTrail";
import { setVisible } from "../../util/gameUtil";
import { SCALE, PLAYER } from "../../constants/constants";

const PlayerMech = () => {
  console.log("PlayerMech rendered");
  const { camera } = useThree();
  const getPlayer = useStore((state) => state.getPlayer);
  const playerMechBP = getPlayer().mechBP;
  const weaponFireLightTimer = useStore((state) => state.weaponFireLightTimer);
  const mutation = useStore((state) => state.mutation);
  const { clock } = mutation;

  const playerViewMode = usePlayerControlsStore(
    (state) => state.playerViewMode
  );
  const updatePlayerFrame = usePlayerControlsStore(
    (state) => state.updatePlayerFrame
  );

  const mainGroupRef = useRef();
  const playerMechGroupRef = useRef();
  const weaponFireLight = useRef();
  const exhaust = useRef();
  const engineLight = useRef();
  const hitBoxRef = useRef(null);

  const servoHitNames = [];

  // starting position
  useLayoutEffect(() => {
    const player = getPlayer();
    mainGroupRef.current.position.copy(player.object3d.position);
    mainGroupRef.current.rotation.copy(player.object3d.rotation);
  }, [getPlayer]);

  // set bounding box for player mech once created
  useEffect(() => {
    if (playerMechGroupRef.current !== null) {
      const player = getPlayer();
      player.setHitBoxFromGroup(playerMechGroupRef.current);
      hitBoxRef.current = player.hitBox;
      console.log(player.hitBox);
    }
  }, [getPlayer, playerMechGroupRef]);

  // mech is invisible in cockpit view
  useEffect(() => {
    if (playerViewMode === PLAYER.view.firstPerson) {
      setVisible(playerMechGroupRef.current, false);
    } else {
      setVisible(playerMechGroupRef.current, true);
    }
  }, [playerViewMode]);

  //moving camera, ship, altering crosshairs, engine and weapon lights (activates only while flying)
  useFrame(() => {
    if (!mainGroupRef.current) return null;
    updatePlayerFrame(camera, mainGroupRef);
    const player = getPlayer();
    // setHitBoxFromGroup needs to use the same ref as updatePlayerFrame to work
    // otherwise using the child component ref will be updating 1 frame behind
    // change structure so that the crosshair and engine lights etc. are in a seperate ref
    player.setHitBoxFromGroup(mainGroupRef.current);
    hitBoxRef.current = player.hitBox;
    //engine flicker
    let flickerVal = Math.sin(clock.getElapsedTime() * 500);
    let speedRoof = player.speed > 25 ? 25 : player.speed;
    exhaust.current.position.z = speedRoof / -8;
    exhaust.current.scale.x = speedRoof / 10 + flickerVal * 5;
    exhaust.current.scale.y = speedRoof / 10 + flickerVal * 5;
    exhaust.current.scale.z = speedRoof + 1.5 + flickerVal * 5;
    player.speed > 2
      ? (exhaust.current.material.visible = 1)
      : (exhaust.current.material.visible = 0);
    engineLight.current.intensity = player.speed > 0 ? player.speed * 0.05 : 0;

    //weapon firing light blast
    weaponFireLight.current.intensity +=
      ((weaponFireLightTimer && Date.now() - weaponFireLightTimer < 100
        ? 1
        : 0) -
        weaponFireLight.current.intensity) *
      0.3;
  });

  return (
    <>
      {hitBoxRef.current !== null ? (
        <box3Helper box={hitBoxRef.current} color={0xffff00} />
      ) : null}
      <group ref={mainGroupRef} scale={SCALE}>
        <BuildMech
          ref={playerMechGroupRef}
          mechBP={playerMechBP}
          servoHitNames={servoHitNames}
          showAxisLines={false}
        />
        {/*player.boxHelper && (
          <mesh
            geometry={player.boxHelper.geometry}
            material={player.boxHelper.material}
          ></mesh>
        )*/}
        <PlayerCrosshair />
        <pointLight
          ref={weaponFireLight}
          position={[0, 0, 0.2]}
          distance={3 * SCALE}
          intensity={0}
          color="lightgreen"
        />
        <mesh ref={exhaust} position={[0, 0.2, 0]}>
          <dodecahedronGeometry attach="geometry" args={[0.05, 0]} />
          <meshLambertMaterial
            attach="material"
            color="lightblue"
            transparent
            opacity={0.3}
            emissive="lightblue"
            emissiveIntensity="0.3"
          />
        </mesh>
        <pointLight
          ref={engineLight}
          position={[0, 0.2, -0.75]}
          distance={3 * SCALE}
          intensity={0}
          color="lightblue"
        />
      </group>
      {/*<MeshLineTrail followRef={mainGroupRef} />*/}
    </>
  );
};

export default PlayerMech;
