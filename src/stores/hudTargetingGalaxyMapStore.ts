import { create } from "zustand";
import * as THREE from "three";
import { Vector3 } from "three";
import useStore from "./store";
import usePlayerControlsStore from "./playerControlsStore";
//import useEnemyStore from "./enemyStore";
import { distance } from "../util/gameUtil";
import {
  getScreenPosition,
  getScreenPositionFromDirection,
} from "../util/cameraUtil";

export const HTML_HUD_TARGET_TYPE = {
  WARP_TO_STAR: 0,
  PLANET: 1,
  STATION: 2,
  ENEMY: 3,
};

export type htmlHudTargetType = {
  objectType: number;
  objectIndex: number | null;
  label: string;
  color: string;
  divElement?: HTMLDivElement;
};

interface hudTargetingGalaxyMapStoreState {
  // declare type for dictionary object
  //testDictionary: { [id: string]: boolean };

  // Galaxy Map - star system info and warp star selection
  showInfoHoveredStarIndex: number | null;
  showInfoTargetStarIndex: number | null;
  showInfoPlanetIndex: number | null;
  selectedWarpStar: number | null;
  // TODO update map to use these actions
  galaxyMapActions: {
    setShowInfoHoveredStarIndex: (
      showInfoHoveredStarIndex: number | null
    ) => void;
    getShowInfoTargetStarIndex: () => number | null;
    setShowInfoTargetStarIndex: (showInfoTargetStarIndex: number) => void;
    setShowInfoPanetIndex: (planetIndex: number | null) => void;
    setSelectedWarpStar: (selectedWarpStar: number | null) => void;
  };

  // CSS HUD targets
  hudDiameterPx: number;
  targetDiameterPx: number;
  setTargetDiameterPx: (targetDiameterPx: number) => void;
  htmlHudTargets: htmlHudTargetType[];
  selectedWarpStarDistance: number;
  isWarpToStarAngleShowButton: boolean;
  selectedWarpStarDirection: THREE.Vector3 | null;
  setSelectedWarpStarDirection: () => void;
  // HTML HUD player direction control target
  playerDirectionTargetDiv: React.RefObject<HTMLDivElement> | null;
  updatePlayerDirectionTargetHUD: () => void;
  // HTML HUD Targets
  generateTargets: () => void;
  getTargetPosition: (
    xn: number,
    yn: number,
    angleDiff: number
  ) => { marginLeft: string; marginTop: string };
  updateTargetHUD: (camera: any) => void;
  // 3d HUD Targets
  focusTargetIndex: number | null;
  selectedTargetIndex: number | null;
  focusPlanetIndex: number | null;
  selectedPanetIndex: number | null;
  getTargets: () => {
    focusPlanetIndex: number | null;
    selectedPanetIndex: number | null;
    focusTargetIndex: number | null;
    selectedTargetIndex: number | null;
  };
  // clear all targets above
  clearTargets: () => void;

  // planet scanning
  checkScanDistanceToPlanet: (planetIndex: number) => void;
  scanningPlanetId: number;
  isScanDistanceToPlanet: boolean;
  scanPlanet: () => void;
  scanPlanetProgress: number;

  // TODO clean up actions - what are actions
  actions: {
    // planet and enemy targeting
    // focused target is target closest to ray cast from front of player mech
    setFocusPlanetIndex: (focusPlanetIndex: number | null) => void;
    setFocusTargetIndex: (focusTargetIndex: number | null) => void;
    // selected enemy target
    setSelectedTargetIndex: () => void;
  };
}

// reusable objects
const dummyVec3 = new Vector3();
// for targeting weapons fireWeapon()
const flightCameraLookQuaternoin = new THREE.Quaternion();

const useHudTargtingGalaxyMapStore = create<hudTargetingGalaxyMapStoreState>()(
  (set, get) => ({
    // for galaxy map
    showInfoHoveredStarIndex: null, // used in galaxy map ui
    showInfoTargetStarIndex: null,
    showInfoPlanetIndex: null,
    selectedWarpStar: null,
    galaxyMapActions: {
      setShowInfoHoveredStarIndex(showInfoHoveredStarIndex) {
        set(() => ({ showInfoHoveredStarIndex }));
      },
      getShowInfoTargetStarIndex: () => get().showInfoTargetStarIndex,
      setShowInfoTargetStarIndex(showInfoTargetStarIndex) {
        set(() => ({ showInfoTargetStarIndex }));
      },
      // TODO setSelectedPanetIndex not used, plan to use for detailed planet data in Galaxy Map
      setShowInfoPanetIndex(planetIndex) {
        set(() => ({ showInfoPlanetIndex: planetIndex }));
      },
      setSelectedWarpStar(selectedWarpStar) {
        set(() => ({ selectedWarpStar }));
        get().setSelectedWarpStarDirection();
      },
    },

    // HUD Targeting CSS HUD
    hudDiameterPx: 0,
    targetDiameterPx: 0,
    setTargetDiameterPx: (targetDiameterPx) => {
      set(() => ({ targetDiameterPx }));
    },
    htmlHudTargets: [],
    selectedWarpStarDistance: 0,
    isWarpToStarAngleShowButton: false,
    selectedWarpStarDirection: null,
    setSelectedWarpStarDirection: () => {
      if (get().selectedWarpStar !== null) {
        const warpStarDirection = useStore
          .getState()
          .getDistanceCoordToBackgroundStar(get().selectedWarpStar!);
        // background star scene is rotated 90 degrees, so adjust direction
        const directionVec3 = new THREE.Vector3(
          warpStarDirection.x,
          warpStarDirection.y,
          warpStarDirection.z
        );
        set({
          selectedWarpStarDistance: directionVec3.length(),
        });
        const rotateVec3 = new THREE.Vector3(1, 0, 0);
        directionVec3.applyAxisAngle(rotateVec3, Math.PI / 2);
        set({
          selectedWarpStarDirection: directionVec3.normalize(),
        });
      } else {
        set({
          selectedWarpStarDirection: null,
        });
      }
    },
    playerDirectionTargetDiv: null,
    updatePlayerDirectionTargetHUD: () => {
      const mouse = useStore.getState().mutation.mouse;

      if (get().playerDirectionTargetDiv !== null) {
        get().playerDirectionTargetDiv!.current!.style.marginLeft = `${
          mouse.x * get().hudDiameterPx
        }px`;
        get().playerDirectionTargetDiv!.current!.style.marginTop = `${
          mouse.y * get().hudDiameterPx
        }px`;
      }
    },
    generateTargets: () => {
      const htmlHudTargets: htmlHudTargetType[] = [];
      if (useStore.getState().planets.length > 0) {
        const targetsPlanets: htmlHudTargetType[] = [];
        useStore.getState().planets.forEach((planet, index) => {
          if (!planet.isActive) return;
          targetsPlanets.push({
            objectType: HTML_HUD_TARGET_TYPE.PLANET,
            objectIndex: index,
            label: planet.rngSeed,
            color: planet.textureMapOptions.baseColor || "",
          });
        });
        htmlHudTargets.push(...targetsPlanets);
      }
      if (useStore.getState().stations.length > 0) {
        const targetsStations: htmlHudTargetType[] = [];
        useStore.getState().stations.forEach((station, index) => {
          targetsStations.push({
            objectType: HTML_HUD_TARGET_TYPE.STATION,
            objectIndex: index,
            label: station.name,
            color: "gray",
          });
        });
        htmlHudTargets.push(...targetsStations);
      }
      htmlHudTargets.push({
        objectType: HTML_HUD_TARGET_TYPE.WARP_TO_STAR,
        objectIndex: null,
        label: "SYSTEM WARP",
        color: "white",
      });
      set({ htmlHudTargets });
    },
    getTargetPosition: (xn: number, yn: number, angleDiff: number) => {
      let pxNorm = (xn * window.innerWidth) / 2;
      let pyNorm = (yn * window.innerHeight) / 2;

      const targetBehindCamera = Math.abs(angleDiff) >= Math.PI / 2;
      // adjust position values if behind camera by flipping them
      if (targetBehindCamera) {
        pxNorm *= -1;
        pyNorm *= -1;
      }

      // if x, y is outside HUD circle, adjust x, y to be on egde of HUD circle
      // also always set x, y on edge if angle is greater than 90 degrees
      if (
        Math.sqrt(pxNorm * pxNorm + pyNorm * pyNorm) >
          get().hudDiameterPx / 2 ||
        targetBehindCamera
      ) {
        const atan2Angle = Math.atan2(pyNorm, pxNorm);
        pxNorm = (Math.cos(atan2Angle) * get().hudDiameterPx) / 2;
        pyNorm = (Math.sin(atan2Angle) * get().hudDiameterPx) / 2;
      }
      // set position of target div
      const marginLeft = `${pxNorm - get().targetDiameterPx / 2}px`;
      const marginTop = `${pyNorm - get().targetDiameterPx / 2}px`;
      return { marginLeft, marginTop };
    },
    // update div elements for HUD targets
    updateTargetHUD: (camera) => {
      get().htmlHudTargets.forEach((htmlHudTarget) => {
        if (!htmlHudTarget.divElement) return;
        let distanceToTarget = "";
        let screenPosition = { xn: 0, yn: 0, angleDiff: 0 };

        switch (htmlHudTarget.objectType) {
          case HTML_HUD_TARGET_TYPE.PLANET:
          case HTML_HUD_TARGET_TYPE.STATION:
            // set dummyVec3 to planet world space position
            const targetArray =
              htmlHudTarget.objectType === HTML_HUD_TARGET_TYPE.PLANET
                ? useStore.getState().planets
                : useStore.getState().stations;
            const targetObject3d =
              targetArray[htmlHudTarget.objectIndex!].object3d;
            // set dummyVec3 to target world position (required due to relative positioning to player)
            targetObject3d.getWorldPosition(dummyVec3);
            // get distance to object relative to playerWorldPosition
            // TODO change to Au distance measurement
            distanceToTarget = distance(
              useStore.getState().playerWorldPosition,
              targetObject3d.position
            ).toFixed(0);
            // get screen position of target
            screenPosition = getScreenPosition(camera, dummyVec3);
            break;

          case HTML_HUD_TARGET_TYPE.WARP_TO_STAR:
            if (get().selectedWarpStarDirection === null) {
              // send off screen if no target
              htmlHudTarget.divElement!.style.marginLeft = `${window.innerWidth}px`;
              // exit loop
              return;
            }
            distanceToTarget =
              (get().selectedWarpStarDistance * 7).toFixed(3) + " Ly";
            // get screen position of target
            screenPosition = getScreenPositionFromDirection(
              camera,
              get().selectedWarpStarDirection!
            );
            // show button if angle is less than 0.3 radians
            const isWarpToStarAngleShowButton = screenPosition.angleDiff < 0.3;
            if (
              isWarpToStarAngleShowButton !== get().isWarpToStarAngleShowButton
            )
              set({ isWarpToStarAngleShowButton });
            break;

          default:
            console.error("Unknown htmlHudTarget.objectType");
            break;
        }
        const { marginLeft, marginTop } = get().getTargetPosition(
          screenPosition.xn,
          screenPosition.yn,
          screenPosition.angleDiff
        );
        // set position of target div
        htmlHudTarget.divElement!.style.marginLeft = marginLeft;
        htmlHudTarget.divElement!.style.marginTop = marginTop;
        // display the distance to planet
        htmlHudTarget.divElement!.children[0].textContent = distanceToTarget;
      });
    },

    // 3d HUD targeting
    focusTargetIndex: null,
    selectedTargetIndex: null,
    focusPlanetIndex: null,
    selectedPanetIndex: null,
    getTargets: () => {
      return {
        focusPlanetIndex: get().focusPlanetIndex,
        selectedPanetIndex: get().selectedPanetIndex,
        focusTargetIndex: get().focusTargetIndex,
        selectedTargetIndex: get().selectedTargetIndex,
      };
    },
    clearTargets: () => {
      set(() => ({
        focusPlanetIndex: null,
        selectedPanetIndex: null,
        focusTargetIndex: null,
        selectedTargetIndex: null,
        showInfoTargetStarIndex: null,
      }));
    },

    checkScanDistanceToPlanet: (planetIndex) => {
      if (get().scanningPlanetId !== planetIndex) {
        set({ scanningPlanetId: planetIndex });
        set({ scanPlanetProgress: 0 });
      }
      const playerWorldPosition = useStore.getState().playerWorldPosition;
      const planet = useStore.getState().planets[planetIndex];
      if (planet) {
        // warp to planet distance is planet.radius * 2
        const isScanDistanceToPlanet =
          planet.object3d.position.distanceTo(playerWorldPosition) <
          planet.radius * 3;
        if (isScanDistanceToPlanet !== get().isScanDistanceToPlanet) {
          set({ isScanDistanceToPlanet });
        }
      }
    },

    scanningPlanetId: -1,
    isScanDistanceToPlanet: false,
    scanPlanet: () => {
      if (get().scanPlanetProgress < 10) {
        const incrementScanProgress = () => {
          set((state) => ({
            scanPlanetProgress: state.scanPlanetProgress + 0.5,
          }));
          if (get().scanPlanetProgress < 10) {
            setTimeout(incrementScanProgress, 100);
          }
        };
        incrementScanProgress();
      }
    },
    scanPlanetProgress: 0,
    actions: {
      setFocusPlanetIndex(focusPlanetIndex) {
        if (get().focusPlanetIndex !== focusPlanetIndex) {
          set(() => ({ focusPlanetIndex }));
        }
      },
      setFocusTargetIndex(focusTargetIndex) {
        if (get().focusTargetIndex !== focusTargetIndex) {
          set(() => ({ focusTargetIndex }));
        }
      },
      // being called when player fires weapon OLD CODE
      setSelectedTargetIndex() {
        // weapon fire angle is based on player mouse/controls input position
        flightCameraLookQuaternoin.setFromAxisAngle(
          {
            x:
              usePlayerControlsStore.getState().flightCameraLookRotation
                .rotateY * 0.4,
            y:
              usePlayerControlsStore.getState().flightCameraLookRotation
                .rotateX * 0.4,
            z: 0,
          },
          Math.PI / 2
        ); //.normalize();//angle isn't big enough to need normalization
        useStore.getState().player.fireWeapon(flightCameraLookQuaternoin);
        //make work for enemies as well
        //set new target for current shooter
        let targetIndex: number | null = null;
        if (get().selectedTargetIndex !== get().focusTargetIndex) {
          targetIndex = get().focusTargetIndex;
        } /* else {
        useWeaponFireStore
          .getState()
          .actions.cancelWeaponFire(get().player.mechBP);
      }*/
        if (targetIndex !== null) {
          set(() => ({
            selectedTargetIndex: targetIndex,
          }));
        } /*
      useWeaponFireStore.getState().actions.shoot(
        get().player.mechBP,
        get().player,
        targetIndex === null
          ? null
          : useEnemyStore.getState().enemies[targetIndex],
        false, // auto fire
        false, // auto aim
        true // isPlayer
      );*/
      },
    },
  })
);

export default useHudTargtingGalaxyMapStore;
