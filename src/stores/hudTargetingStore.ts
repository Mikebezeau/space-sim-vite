import { create } from "zustand";
import { Vector3 } from "three";
import useStore from "./store";
import useEnemyStore from "./enemyStore";
import useGalaxyMapStore from "./galaxyMapStore";
import { distance, getSystemScaleDistanceLabel } from "../util/gameUtil";
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
  id: string;
  objectType: number;
  objectIndex: number | null;
  label: string;
  color: string;
  divElement?: HTMLDivElement;
  viewAngle?: number;
};

// reusable objects
const dummyVec3 = new Vector3();

interface hudTargetingGalaxyMapStoreState {
  // CSS HUD targets
  isMouseOutOfHudCircle: boolean;
  hudRadiusPx: number;
  targetDiameterPx: number;
  setTargetDiameterPx: (targetDiameterPx: number) => void;
  htmlHudTargets: htmlHudTargetType[];
  focusedHudTargetId: string;
  isWarpToStarAngleShowButton: boolean;
  // HTML HUD player direction control target
  playerHudCrosshairDiv: HTMLDivElement | null;
  updatePlayerHudCrosshairDiv: () => void;
  // HTML HUD Targets
  generateTargets: () => void;
  getTargetPosition: (
    xn: number,
    yn: number,
    angleDiff: number
  ) => { marginLeftPx: number; marginTopPx: number };
  // planet scanning
  checkScanDistanceToPlanet: (planetIndex: number) => void;
  scanningPlanetId: number;
  isScanDistanceToPlanet: boolean;
  scanPlanet: () => void;
  scanPlanetProgress: number;

  // call each frame to update target div elements
  updateTargetHUD: (camera: any) => void;
}

const useHudTargtingStore = create<hudTargetingGalaxyMapStoreState>()(
  (set, get) => ({
    // HUD Targeting CSS HUD
    hudRadiusPx: 0,
    targetDiameterPx: 0,
    setTargetDiameterPx: (targetDiameterPx) => {
      set(() => ({ targetDiameterPx }));
    },
    htmlHudTargets: [],
    focusedHudTargetId: "",
    isWarpToStarAngleShowButton: false,
    isMouseOutOfHudCircle: false,
    playerHudCrosshairDiv: null,
    updatePlayerHudCrosshairDiv: () => {
      const mouseControlNormalVec2 =
        useStore.getState().mutation.mouseControlNormalVec2;

      if (get().playerHudCrosshairDiv !== null) {
        get().playerHudCrosshairDiv!.style.marginLeft = `${
          mouseControlNormalVec2.x * get().hudRadiusPx
        }px`;
        get().playerHudCrosshairDiv!.style.marginTop = `${
          mouseControlNormalVec2.y * get().hudRadiusPx
        }px`;
      }
    },
    generateTargets: () => {
      const htmlHudTargets: htmlHudTargetType[] = [];
      // planets
      if (useStore.getState().planets.length > 0) {
        const targetsPlanets: htmlHudTargetType[] = [];
        useStore.getState().planets.forEach((planet, index) => {
          if (!planet.isActive) return;
          targetsPlanets.push({
            id: `${HTML_HUD_TARGET_TYPE.PLANET}-${index}`,
            objectType: HTML_HUD_TARGET_TYPE.PLANET,
            objectIndex: index,
            label: planet.rngSeed,
            color: planet.textureMapOptions.baseColor || "",
          });
        });
        htmlHudTargets.push(...targetsPlanets);
      }
      // stations
      if (useStore.getState().stations.length > 0) {
        const targetsStations: htmlHudTargetType[] = [];
        useStore.getState().stations.forEach((station, index) => {
          targetsStations.push({
            id: `${HTML_HUD_TARGET_TYPE.STATION}-${index}`,
            objectType: HTML_HUD_TARGET_TYPE.STATION,
            objectIndex: index,
            label: station.name,
            color: "gray",
          });
        });
        htmlHudTargets.push(...targetsStations);
      }
      // enemy groups
      htmlHudTargets.push({
        id: `${HTML_HUD_TARGET_TYPE.ENEMY}`, //-${index}`,
        objectType: HTML_HUD_TARGET_TYPE.ENEMY,
        objectIndex: 0,
        label: "ENEMY",
        color: "red",
      });

      // warp to star
      htmlHudTargets.push({
        id: `${HTML_HUD_TARGET_TYPE.WARP_TO_STAR}`,
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

      const isTargetBehindCamera = Math.abs(angleDiff) >= Math.PI / 2;
      // adjust position values if behind camera by flipping them
      if (isTargetBehindCamera) {
        pxNorm *= -1;
        pyNorm *= -1;
      }

      // if x, y is outside HUD circle, adjust x, y to be on egde of HUD circle
      // also always set x, y on edge if angle is greater than 90 degrees
      if (
        Math.sqrt(pxNorm * pxNorm + pyNorm * pyNorm) > get().hudRadiusPx ||
        isTargetBehindCamera
      ) {
        const atan2Angle = Math.atan2(pyNorm, pxNorm);
        pxNorm = Math.cos(atan2Angle) * get().hudRadiusPx;
        pyNorm = Math.sin(atan2Angle) * get().hudRadiusPx;
      }
      // set position of target div
      const marginLeftPx = pxNorm - get().targetDiameterPx / 2;
      const marginTopPx = pyNorm - get().targetDiameterPx / 2;
      return { marginLeftPx, marginTopPx };
    },

    checkScanDistanceToPlanet: (planetIndex) => {
      if (get().scanningPlanetId !== planetIndex) {
        set({ scanningPlanetId: planetIndex });
        set({ scanPlanetProgress: 0 });
      }
      const playerRealWorldPosition =
        useStore.getState().playerRealWorldPosition;
      const planet = useStore.getState().planets[planetIndex];
      if (planet) {
        // warp to planet distance is planet.radius * 2
        const isScanDistanceToPlanet =
          planet.object3d.position.distanceTo(playerRealWorldPosition) <
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

    // update div elements for HUD targets each frame
    updateTargetHUD: (camera) => {
      get().htmlHudTargets.forEach((htmlHudTarget) => {
        if (!htmlHudTarget.divElement) return;
        let systemScaledDistance = 0;
        let distanceToTargetLabel = "";
        let screenPosition = { xn: 0, yn: 0, angleDiff: 0 };

        switch (htmlHudTarget.objectType) {
          case HTML_HUD_TARGET_TYPE.PLANET:
          case HTML_HUD_TARGET_TYPE.STATION:
            const targetArray =
              htmlHudTarget.objectType === HTML_HUD_TARGET_TYPE.PLANET
                ? useStore.getState().planets
                : useStore.getState().stations;
            const targetObject3d =
              targetArray[htmlHudTarget.objectIndex!].object3d;
            // get distance to object relative to playerRealWorldPosition
            // change to Au distance measurement? 1 Au = 150 million Km
            systemScaledDistance = distance(
              useStore.getState().playerRealWorldPosition,
              targetObject3d.position
            );

            distanceToTargetLabel =
              getSystemScaleDistanceLabel(systemScaledDistance);
            // get screen position of target
            // set dummyVec3 to target world position (required due to relative positioning to player)
            targetObject3d.getWorldPosition(dummyVec3);
            screenPosition = getScreenPosition(camera, dummyVec3);
            break;

          case HTML_HUD_TARGET_TYPE.ENEMY:
            // still working on multiple enemy groups
            systemScaledDistance = distance(
              useStore.getState().playerRealWorldPosition,
              useEnemyStore.getState().enemyGroup.enemyGroupLocalZonePosition
            );

            distanceToTargetLabel =
              getSystemScaleDistanceLabel(systemScaledDistance);
            // set dummyVec3 to target world position (required due to relative positioning to player)
            useEnemyStore
              .getState()
              .enemyGroup.enemyMechs[0].object3d.getWorldPosition(dummyVec3);
            // get screen position of target
            screenPosition = getScreenPosition(camera, dummyVec3);
            break;

          case HTML_HUD_TARGET_TYPE.WARP_TO_STAR:
            if (
              useGalaxyMapStore.getState().selectedWarpStarDirection === null
            ) {
              //screenPosition.angleDiff = 10; // for sorting
              htmlHudTarget.viewAngle = 10; // for sorting
              // send off screen if no target
              htmlHudTarget.divElement.style.marginLeft = `5000px`;
              // exit loop
              return;
            }
            distanceToTargetLabel =
              (
                useGalaxyMapStore.getState().selectedWarpStarDistance * 7
              ).toFixed(3) + " Ly";
            // get screen position of target
            screenPosition = getScreenPositionFromDirection(
              camera,
              useGalaxyMapStore.getState().selectedWarpStarDirection!
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

        // store angleDiff as viewAngle property
        htmlHudTarget.viewAngle = screenPosition.angleDiff;

        const { marginLeftPx, marginTopPx } = get().getTargetPosition(
          screenPosition.xn,
          screenPosition.yn,
          screenPosition.angleDiff
        );
        // set position of target div
        htmlHudTarget.divElement.style.marginLeft = `${marginLeftPx}px`;
        htmlHudTarget.divElement.style.marginTop = `${marginTopPx}px`;
        // casting as HTMLElement
        const targetChildInfoDiv = htmlHudTarget.divElement
          .children[0] as HTMLElement;
        // target text positioning
        targetChildInfoDiv.style.right = marginLeftPx <= 0 ? "100%" : "auto";
        targetChildInfoDiv.style.left = marginLeftPx > 0 ? "100%" : "auto";
        targetChildInfoDiv.style.textAlign =
          marginLeftPx <= 0 ? "right" : "left";
        // display the distance to target
        targetChildInfoDiv.children[1].textContent = distanceToTargetLabel;
      });
      // sort targets by viewAngle, smallest is last
      // this will make the target closest to the center of the screen on top
      // using the index in array to set z-index
      get().htmlHudTargets.sort((a, b) =>
        a.viewAngle! < b.viewAngle! ? 1 : -1
      );

      // TODO build error: ../assets/fonts/MIASMA.ttf didn't resolve at build time

      const currentFocusedTargetId =
        get().htmlHudTargets[get().htmlHudTargets.length - 1].id;

      // only update if focused target has changed
      if (get().focusedHudTargetId !== currentFocusedTargetId) {
        get().focusedHudTargetId = currentFocusedTargetId;

        get().htmlHudTargets.forEach((htmlHudTarget, index) => {
          if (htmlHudTarget.divElement) {
            // apply z-index to div elements
            htmlHudTarget.divElement.style.zIndex = index.toString();
            // add flight-hud-target-info-hidden class to all but last target
            const targetInfoDiv = htmlHudTarget.divElement
              .children[0] as HTMLElement;
            if (index === get().htmlHudTargets.length - 1) {
              targetInfoDiv.classList.remove("flight-hud-target-info-hidden");
            } else {
              targetInfoDiv.classList.add("flight-hud-target-info-hidden");
            }
          }
        });
      }
    },
  })
);

export default useHudTargtingStore;
