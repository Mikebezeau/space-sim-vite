import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import useStore from "../stores/store";
import usePlayerControlsStore from "../stores/playerControlsStore";
import ScenePortalLayer from "./spaceFlightSceneLayers/ScenePortalLayer";
import StarsBackgroundScene from "./spaceFlightSceneLayers/StarsBackgroundScene";
import SolarSystem from "../3d/solarSystem/SolarSystem";
import Stations from "../3d/mechs/Stations";
import { COMPONENT_RENDER_ORDER, PLAYER } from "../constants/constants";
import { PLANET_TYPE } from "../constants/solarSystemConstants";

const NewCampaignScene = () => {
  useStore.getState().updateRenderInfo("NewCampaignScene");

  const player = useStore((state) => state.player);
  const { setPlayerPosition, setPlayerCurrentStarIndex } = useStore(
    (state) => state.actions
  );
  const viewModeSelect = usePlayerControlsStore(
    (state) => state.actions.viewModeSelect
  );

  const stars = useStore((state) => state.stars);
  const planets = useStore((state) => state.planets);

  const playerMechRef = useRef<THREE.Object3D | null>(null);
  const cameraControlsRef = useRef<any>(null);

  const { camera } = useThree();

  const sceneTime = useRef(0);

  useEffect(() => {
    if (!playerMechRef.current || !cameraControlsRef.current) return;
    viewModeSelect(PLAYER.view.thirdPerson); // just in case we start using main control loop
    //setPlayerCurrentStarIndex(666);
    let targetPlanet =
      planets.find(
        (planet) => planet.data.planetType === PLANET_TYPE.earthLike
      ) || planets[0];
    player.object3d.position.copy(targetPlanet.object3d.position);
    player.object3d.lookAt(stars[0].object3d.position);
    player.object3d.translateY(-targetPlanet.radius * 0.1);
    player.object3d.translateX(targetPlanet.radius * 0.1);
    player.object3d.lookAt(targetPlanet.object3d.position);

    camera.position.copy(player.object3d.position);
    camera.lookAt(targetPlanet.object3d.position); //targetPlanet.object3d.position);
    camera.translateZ(100);
    player.object3d.rotateX(Math.PI / 6);
    player.object3d.rotateY(Math.PI / 2);
    player.object3d.rotateZ(-Math.PI / 2);
    cameraControlsRef.current.target.set(
      player.object3d.position.x,
      player.object3d.position.y,
      player.object3d.position.z
    );
  }, [playerMechRef.current, setPlayerPosition]);

  useFrame((_, delta) => {
    delta = Math.min(delta, 0.1); // cap delta to 100ms
    sceneTime.current += delta;

    delta = Math.min(delta, 0.1); // cap delta to 100ms

    if (sceneTime.current < 7) {
      player.object3d.rotateZ((Math.PI * delta) / 100);
      camera.translateZ(-delta * 10);
    }
  }, COMPONENT_RENDER_ORDER.postPositionsUpdate); // do this camera adjustment before StarsBackgroundScene

  return (
    <>
      <TrackballControls
        ref={(controlsRef) => {
          cameraControlsRef.current = controlsRef;
        }}
        rotateSpeed={3}
        panSpeed={0.5}
      />
      <ScenePortalLayer children={<StarsBackgroundScene />} />
      <ScenePortalLayer
        autoClear={false}
        children={
          <>
            <pointLight intensity={1} decay={0} />
            <ambientLight intensity={0.4} />
            <object3D
              ref={(mechRef) => {
                if (mechRef) {
                  playerMechRef.current = mechRef;
                  player.assignObject3dComponentRef(mechRef);
                }
              }}
            />
            <SolarSystem />
            <Stations />
          </>
        }
      />
    </>
  );
};

export default NewCampaignScene;
