import React, { useEffect, useRef } from "react";
import * as THREE from "three";
//import { EffectComposer } from "@react-three/postprocessing";
import { useFrame, useThree } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import useStore from "../stores/store";
import usePlayerControlsStore from "../stores/playerControlsStore";
import ScenePortalLayer from "./ScenePortalLayer";
//import SpaceFlightPlanetsScene from "./spaceFlight/SpaceFlightPlanetsScene";
import StarsBackgroundScene from "./spaceFlight/StarsBackgroundScene";
import BuildMech from "../3d/buildMech/BuildMech";
import Planets from "../3d/planets/Planets";
import Stations from "../3d/spaceFlight/Stations";
//import TransparentEffect from "../3d/effects/TransparentEffect";
//import GlitchEffect from "../3d/effects/GlitchEffect";

import { PLAYER } from "../constants/constants";

const NewCampaignScene = () => {
  console.log("NewCampaignScene rendered");
  const { camera } = useThree();
  const player = useStore((state) => state.player);
  const { setPlayerPosition, setPlayerCurrentStarIndex } = useStore(
    (state) => state.actions
  );
  const viewModeSelect = usePlayerControlsStore(
    (state) => state.actions.viewModeSelect
  );

  const planets = useStore((state) => state.planets);

  const setFlightSceneRendered = useStore(
    (state) => state.setFlightSceneRendered
  );

  const sceneRenderedRef = useRef<boolean>(false);
  const playerMechRef = useRef<THREE.Object3D | null>(null);
  const cameraControlsRef = useRef<any>(null);

  const sceneTime = useRef(0);

  useEffect(() => {
    if (!playerMechRef.current || !cameraControlsRef.current) return;
    viewModeSelect(PLAYER.view.thirdPerson); // just in case we start using main control loop
    //setPlayerCurrentStarIndex(666);
    const planetSun = planets[0];
    let targetPlanet =
      planets.find((planet) => planet.data.type === "Gas Giant") || planets[1];
    player.object3d.position.copy(targetPlanet.object3d.position);
    player.object3d.lookAt(planetSun.object3d.position);
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

    return () => {
      sceneRenderedRef.current = false;
      setFlightSceneRendered(false);
    };
  }, [playerMechRef.current, setPlayerPosition]);

  useFrame((_, delta) => {
    delta = Math.min(delta, 0.1); // cap delta to 100ms
    sceneTime.current += delta;
    // set sceneRenderedRef to make more efficient, propbably don't need this
    if (!sceneRenderedRef.current && delta < 0.1) {
      sceneRenderedRef.current = true;
      setFlightSceneRendered(true);
    }
    delta = Math.min(delta, 0.1); // cap delta to 100ms

    if (sceneTime.current < 7) {
      player.object3d.rotateZ((Math.PI * delta) / 100);
      camera.translateZ(-delta * 10);
    }
  });

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
            <BuildMech
              ref={(mechRef: THREE.Object3D) => {
                if (mechRef) {
                  playerMechRef.current = mechRef;
                  player.initObject3d(mechRef, true);
                }
              }}
              mechBP={player.mechBP}
            />
            <Planets />
            <Stations />
            {/*}
            <EffectComposer autoClear={false}>
              <TransparentEffect />
            </EffectComposer>
            */}
          </>
        }
      />
    </>
  );
};

export default NewCampaignScene;
