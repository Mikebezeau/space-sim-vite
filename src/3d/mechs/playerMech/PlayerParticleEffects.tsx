import React, { memo, useRef } from "react";
import { Object3D } from "three";
import { useFrame } from "@react-three/fiber";
import useStore from "../../../stores/store";
import usePlayerControlsStore from "../../../stores/playerControlsStore";
import useParticleStore from "../../../stores/particleStore";
import Particles from "../../Particles";
import { FPS } from "../../../constants/constants";

const PlayerParticleEffects = () => {
  useStore.getState().updateRenderInfo("PlayerParticleEffects");

  const player = useStore((state) => state.player);

  const playerWarpToPosition = usePlayerControlsStore(
    (state) => state.playerWarpToPosition
  );
  const playerParticleSystem = useParticleStore(
    (state) => state.playerParticleController.particleSystem
  );
  const playerParticleEffects = useParticleStore(
    (state) => state.playerEffects
  );

  const particleOriginObj = useRef<Object3D>(new Object3D());

  let speed: number,
    numParticles: number,
    size: number,
    positionRadius: number,
    positionRadiusMin: number,
    lifeTime: number;

  //moving camera, ship, altering crosshairs, weapon lights (activates only while flying)
  useFrame((_, delta) => {
    delta = Math.min(delta, 0.1); // cap delta to 100ms

    particleOriginObj.current.rotation.copy(player.object3d.rotation);

    // player warp particle effect
    if (playerWarpToPosition !== null) {
      // player particle system follows player mech object position
      // position (0, 0, 0) is the center of the player mech object
      particleOriginObj.current.position.set(0, 0, 0);
      particleOriginObj.current.translateZ(150);
      // can improve by incorporating playerWarpSpeed
      //const playerWarpSpeed = usePlayerControlsStore.getState().playerWarpSpeed;
      playerParticleEffects.addWarpStars(
        particleOriginObj.current.position,
        particleOriginObj.current.rotation
      );
    }

    // move particleOriginObj to back of ship
    particleOriginObj.current.position.set(0, 0, 0);
    particleOriginObj.current.translateY(0.25);
    particleOriginObj.current.translateZ(-4.2);
    // set particle effect properties
    speed = Math.min(-0.05 - player.speed / 10, 0);
    speed = Math.max(speed, -1);
    // adjust numParticles based on frame rate
    numParticles = 1000 * delta * FPS * Math.abs(speed);
    size = 0.01;
    positionRadius = 0.6;
    positionRadiusMin = 0.1;
    lifeTime = 0.2 / (1 + Math.abs(speed));
    playerParticleEffects.addEngineExhaust(
      particleOriginObj.current.position,
      particleOriginObj.current.rotation,
      // negative speed to have exhuast move in opposite direction of ship
      speed,
      numParticles,
      size,
      positionRadius,
      positionRadiusMin,
      lifeTime
    );

    playerParticleSystem.position.copy(player.object3d.position);
  });

  return <Particles isPlayerParticles />;
};

export default memo(PlayerParticleEffects);
