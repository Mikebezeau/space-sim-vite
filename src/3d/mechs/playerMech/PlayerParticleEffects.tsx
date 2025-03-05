import React, { memo, useRef } from "react";
import { Object3D } from "three";
import { useFrame } from "@react-three/fiber";
import useStore from "../../../stores/store";
import usePlayerControlsStore from "../../../stores/playerControlsStore";
import useParticleStore from "../../../stores/particleStore";
import Particles from "../../Particles";
import { COMPONENT_RENDER_ORDER, FPS } from "../../../constants/constants";

const PlayerParticleEffects = () => {
  useStore.getState().updateRenderInfo("PlayerMechEngineParticles");

  const player = useStore((state) => state.player);

  const playerWarpToPosition = usePlayerControlsStore(
    (state) => state.playerWarpToPosition
  );
  const particleSystem = useParticleStore(
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
    lifetime: number;

  //moving camera, ship, altering crosshairs, weapon lights (activates only while flying)
  useFrame((_, delta) => {
    delta = Math.min(delta, 0.1); // cap delta to 100ms

    particleOriginObj.current.rotation.copy(player.object3d.rotation);

    if (playerWarpToPosition !== null) {
      particleOriginObj.current.position.set(0, 0, 0);
      particleOriginObj.current.translateZ(100);
      // set particle effect properties
      speed = -3;
      // adjust numParticles based on frame rate
      numParticles = 10;
      size = 0.1;
      positionRadius = 25;
      positionRadiusMin = 5;
      lifetime = 1;
      // TODO fix this
      const playerWarpSpeed = usePlayerControlsStore.getState().playerWarpSpeed;
      playerParticleEffects.addWarpStars(
        particleOriginObj.current.position,
        particleOriginObj.current.rotation
        /*
        // negative speed to have exhuast move in opposite direction of ship
        speed,
        numParticles,
        size,
        positionRadius,
        positionRadiusMin,
        lifetime*/
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
    lifetime = 0.2 / (1 + Math.abs(speed));
    playerParticleEffects.addEngineExhaust(
      particleOriginObj.current.position,
      particleOriginObj.current.rotation,
      // negative speed to have exhuast move in opposite direction of ship
      speed,
      numParticles,
      size,
      positionRadius,
      positionRadiusMin,
      lifetime
    );

    particleSystem.position.copy(player.object3d.position);
  }, COMPONENT_RENDER_ORDER.postPositionsUpdate);

  return <Particles isPlayerParticles />;
};

export default memo(PlayerParticleEffects);
