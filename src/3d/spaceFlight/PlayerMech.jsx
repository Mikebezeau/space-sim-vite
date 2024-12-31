import { useEffect, useLayoutEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import useStore from "../../stores/store";
import usePlayerControlsStore from "../../stores/playerControlsStore";
import PlayerCrosshair from "./PlayerCrosshair";
import BuildMech from "../buildMech/BuildMech";
import { MeshLineTrail } from "../Trail";
import { setVisible } from "../../util/gameUtil";
import { SCALE, PLAYER } from "../../constants/constants";

const PlayerMech = () => {
  console.log("PlayerMech rendered");
  const { camera } = useThree();
  const getPlayer = useStore((state) => state.getPlayer);
  const playerMechBP = getPlayer().mechBP;
  const weaponFireLightTimer = useStore((state) => state.weaponFireLightTimer);

  const playerViewMode = usePlayerControlsStore(
    (state) => state.playerViewMode
  );
  const updatePlayerMechAndCameraFrame = usePlayerControlsStore(
    (state) => state.updatePlayerMechAndCameraFrame
  );

  const playerMechGroupRef = useRef(null);
  const secondaryGroupRef = useRef(null);
  const weaponFireLight = useRef(null);
  const trailPositionRef = useRef(null);
  const hitBoxRef = useRef(null);

  const servoHitNames = [];

  // starting position
  useLayoutEffect(() => {
    const player = getPlayer();
    playerMechGroupRef.current.position.copy(player.object3d.position);
    playerMechGroupRef.current.rotation.copy(player.object3d.rotation);
  }, [getPlayer]);

  // set bounding box for player mech once created
  useEffect(() => {
    const player = getPlayer();
    if (playerMechGroupRef.current !== null) {
      // set player.object3d to playerMechGroupRef.current to store full mech group object data
      // updating player.object3d position and rotation will update the player mech group position and rotation
      player.object3d = playerMechGroupRef.current;
      // set hitbox for player mech
      player.setHitBox();
      // set hitBoxRef to show hitbox on screen
      hitBoxRef.current = player.hitBox;
      console.log("hitBoxRef player", hitBoxRef.current);
    }
  }, [getPlayer, playerMechGroupRef]);

  // set mech to invisible in cockpit view
  useEffect(() => {
    if (playerViewMode === PLAYER.view.firstPerson) {
      setVisible(playerMechGroupRef.current, false);
    } else {
      setVisible(playerMechGroupRef.current, true);
    }
  }, [playerViewMode]);

  //moving camera, ship, altering crosshairs, weapon lights (activates only while flying)
  useFrame((_, delta) => {
    delta = Math.min(delta, 0.1); // cap delta to 100ms
    if (!playerMechGroupRef.current) return null;
    updatePlayerMechAndCameraFrame(delta, camera);
    const player = getPlayer();
    // update trail position (trail is relative to player mech)
    trailPositionRef.current.position.copy(player.object3d.position);
    // update secondary group (crosshair, weapon light)
    secondaryGroupRef.current.position.copy(player.object3d.position);
    secondaryGroupRef.current.rotation.copy(player.object3d.rotation);
    // looking for way to update the hitbox without recreating it every frame
    // OBB hit detection and raycasting check: https://threejs.org/examples/#webgl_math_obb
    player.setHitBox();

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
      <group ref={playerMechGroupRef} scale={SCALE}>
        <BuildMech mechBP={playerMechBP} servoHitNames={servoHitNames} />
      </group>

      <MeshLineTrail
        ref={trailPositionRef}
        followObject3d={playerMechGroupRef.current}
      />

      <group ref={secondaryGroupRef} scale={SCALE}>
        <PlayerCrosshair />
        <pointLight
          ref={weaponFireLight}
          position={[0, 0, 0.2]}
          distance={3 * SCALE}
          intensity={0}
          color="lightgreen"
        />
      </group>
    </>
  );
};

export default PlayerMech;
