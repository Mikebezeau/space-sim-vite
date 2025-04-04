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
import SpaceStationMech from "../classes/mech/SpaceStationMech";
import EnemyMechGroup from "../classes/mech/EnemyMechGroup";
import CelestialBody from "../classes/solarSystem/CelestialBody";

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
  textColor?: string;
  color?: string;
  opacity?: number;
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
  // HTML HUD player direction control target
  playerHudCrosshairDiv: HTMLDivElement | null;
  updatePlayerHudCrosshairDiv: () => void;
  // HTML HUD Targets
  generateTargets: () => void;
  getHudTargetById: (id: string) => htmlHudTargetType | undefined;
  getWarpToHudTarget: () => htmlHudTargetType | undefined;
  getCurrentHudTarget: () => htmlHudTargetType | undefined;
  getHudTargetWorldPosition: (
    targetId: string
  ) => CelestialBody | SpaceStationMech | EnemyMechGroup | undefined;
  getTargetPosition: (
    xn: number,
    yn: number,
    angleDiff: number
  ) => { marginLeftPx: number; marginTopPx: number };
  // TODO scan anything, not just planets
  checkScanDistanceToPlanet: (planetIndex: number) => void;
  htmlHudTargets: htmlHudTargetType[];
  selectedHudTargetId: string | null;
  setSelectedHudTargetId: (selectedHudTargetId?: string) => void;
  focusedHudTargetId: string;
  isWarpToStarAngleShowButton: boolean;
  cancelWarpToStar: () => void;
  isPossibleWarpToTarget: boolean;
  isToCloseDistanceToWarp: boolean;
  // TODO replace with scan anything - scanningTargetId - use ID
  scanningPlanetIndex: number | null;
  isScanDistanceToHudTarget: boolean;
  scanHudTarget: () => void;
  scanProgressHudTarget: number;

  // call updateTargetHUD each frame to update target div elements
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
    isMouseOutOfHudCircle: false, // used in custom cursor
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
      if (useEnemyStore.getState().enemyGroup.enemyMechs.length > 0) {
        htmlHudTargets.push({
          id: `${HTML_HUD_TARGET_TYPE.ENEMY}`, //-${index}`,
          objectType: HTML_HUD_TARGET_TYPE.ENEMY,
          objectIndex: 0,
          label: "ENEMY",
          color: "red",
        });
      }

      // warp to star
      htmlHudTargets.push({
        id: `${HTML_HUD_TARGET_TYPE.WARP_TO_STAR}`,
        objectType: HTML_HUD_TARGET_TYPE.WARP_TO_STAR,
        objectIndex: null,
        label: "SYSTEM WARP",
        textColor: "yellow",
        color: "white",
        opacity: 1,
      });
      set({ htmlHudTargets });
    },
    getHudTargetById: (id: string) => {
      return get().htmlHudTargets.find((target) => target.id === id);
    },
    getWarpToHudTarget: () => {
      if (get().selectedHudTargetId === null) return undefined;
      return get().htmlHudTargets.find(
        (target) => target.id === get().selectedHudTargetId
      );
    },
    getCurrentHudTarget: () => {
      return get().htmlHudTargets.find(
        (target) => target.id === get().focusedHudTargetId
      );
    },
    getHudTargetWorldPosition: (targetId: string) => {
      const hudTarget = get().getHudTargetById(targetId);
      if (hudTarget) {
      }
      return undefined;
    },
    getTargetPosition: (xn: number, yn: number, angleDiff: number) => {
      // to place target within HUD circle
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
    checkWarpDistanceToTarget: (targetId: string) => {
      const targetEntity = get().getHudTargetWorldPosition(targetId);
      if (!targetEntity) {
        console.warn("checkWarpDistanceToTarget: Target entity not found");
        return;
      }

      const playerRealWorldPosition =
        useStore.getState().playerRealWorldPosition;
      let distanceToWarp = 0;
      let minDistanceToWarp = 100;
      let isToCloseDistanceToWarp = false;
      if (targetEntity instanceof CelestialBody) {
        distanceToWarp = targetEntity.object3d.position.distanceTo(
          playerRealWorldPosition
        );
        minDistanceToWarp = targetEntity.radius * 4;
      } else if (targetEntity instanceof SpaceStationMech) {
        distanceToWarp = targetEntity.object3d.position.distanceTo(
          playerRealWorldPosition
        );
        minDistanceToWarp = targetEntity.maxHalfWidth * 3;
      } else if (targetEntity instanceof EnemyMechGroup) {
        distanceToWarp = targetEntity.enemyGroupLocalZonePosition.distanceTo(
          playerRealWorldPosition
        );
        minDistanceToWarp = 500;
      }
      isToCloseDistanceToWarp = distanceToWarp > minDistanceToWarp;
      if (isToCloseDistanceToWarp !== get().isToCloseDistanceToWarp) {
        set({ isToCloseDistanceToWarp });
      }
    },
    checkScanDistanceToPlanet: (planetIndex) => {
      if (
        get().scanningPlanetIndex &&
        get().scanningPlanetIndex !== planetIndex
      ) {
        set({ scanningPlanetIndex: planetIndex });
        set({ scanProgressHudTarget: 0 });
      }
      const playerRealWorldPosition =
        useStore.getState().playerRealWorldPosition;
      const planet = useStore.getState().planets[planetIndex];
      if (planet) {
        // warp to planet distance is planet.radius * 2
        const isScanDistanceToHudTarget =
          planet.object3d.position.distanceTo(playerRealWorldPosition) <
          planet.radius * 3;
        if (isScanDistanceToHudTarget !== get().isScanDistanceToHudTarget) {
          set({ isScanDistanceToHudTarget });
        }
      }
    },

    htmlHudTargets: [],
    selectedHudTargetId: null,
    setSelectedHudTargetId(
      selectedHudTargetId: string = get().focusedHudTargetId
    ) {
      // only update if selected target has changed
      if (get().selectedHudTargetId === selectedHudTargetId) {
        return;
      }
      const selectedTarget = get().getHudTargetById(selectedHudTargetId);
      // if can warp to selected target, set isPossibleWarpToTarget to true
      if (selectedTarget) {
        if (
          selectedTarget.objectType === HTML_HUD_TARGET_TYPE.PLANET ||
          selectedTarget.objectType === HTML_HUD_TARGET_TYPE.STATION ||
          selectedTarget.objectType === HTML_HUD_TARGET_TYPE.ENEMY
        ) {
          set({
            isPossibleWarpToTarget: true,
          });
        } else if (
          selectedTarget.objectType === HTML_HUD_TARGET_TYPE.WARP_TO_STAR
        ) {
          // TODO include all together for warp stuff - and single component
          set({
            isPossibleWarpToTarget: false,
          });
        }
        if (selectedTarget.divElement) {
          // apply z-index to make appear on top
          selectedTarget.divElement.style.zIndex = "1000";
          // add flight-hud-target-selected class to div element
          const targetInfoDiv = selectedTarget.divElement
            .children[0] as HTMLElement;
          targetInfoDiv.classList.add("flight-hud-target-selected");
        }

        const currentSelectedTarget = get().getHudTargetById(
          get().selectedHudTargetId!
        );
        if (currentSelectedTarget && currentSelectedTarget.divElement) {
          currentSelectedTarget.divElement.classList.remove(
            "flight-hud-target-selected"
          );
        }
        set({ selectedHudTargetId });
      }
    },
    focusedHudTargetId: "",
    isWarpToStarAngleShowButton: false,
    cancelWarpToStar: () => {
      set({ isWarpToStarAngleShowButton: false });
    },
    isPossibleWarpToTarget: false,
    isToCloseDistanceToWarp: false,
    scanningPlanetIndex: null,
    isScanDistanceToHudTarget: false,
    scanHudTarget: () => {
      if (get().scanProgressHudTarget < 10) {
        const incrementScanProgress = () => {
          set((state) => ({
            scanProgressHudTarget: state.scanProgressHudTarget + 0.5,
          }));
          if (get().scanProgressHudTarget < 10) {
            setTimeout(incrementScanProgress, 100);
          }
        };
        incrementScanProgress();
      }
    },
    scanProgressHudTarget: 0,

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
            if (useEnemyStore.getState().enemyGroup.enemyMechs.length === 0)
              break;
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

      if (get().focusedHudTargetId !== currentFocusedTargetId) {
        // set focused target id
        set({
          focusedHudTargetId: currentFocusedTargetId,
        });

        get().htmlHudTargets.forEach((htmlHudTarget, index) => {
          if (htmlHudTarget.divElement) {
            // apply z-index to div elements
            htmlHudTarget.divElement.style.zIndex = index.toString();
            // add flight-hud-target-info-hidden class to all but last target
            const targetInfoDiv = htmlHudTarget.divElement
              .children[0] as HTMLElement;
            if (get().focusedHudTargetId === htmlHudTarget.id) {
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
