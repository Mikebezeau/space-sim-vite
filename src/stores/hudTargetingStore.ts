import { create } from "zustand";
import { Vector3 } from "three";
import useStore from "./store";
import usePlayerControlsStore from "./playerControlsStore";
import useEnemyStore from "./enemyStore";
import useGalaxyMapStore from "./galaxyMapStore";
import { getSystemScaleDistanceLabel } from "../util/gameUtil";
import {
  getScreenPosition,
  getScreenPositionFromDirection,
} from "../util/cameraUtil";
import SpaceStationMech from "../classes/mech/SpaceStationMech";
import EnemyMechGroup from "../classes/mech/EnemyMechGroup";
import CelestialBody from "../classes/solarSystem/CelestialBody";
import { IS_MOBILE, PLAYER } from "../constants/constants";
import { setCustomData } from "r3f-perf";

export const HTML_HUD_TARGET_TYPE = {
  WARP_TO_STAR: 0,
  PLANET: 1,
  STATION: 2,
  ENEMY: 3,
};

export type htmlHudTargetType = {
  id: string;
  targetType: number;
  viewAngle: number;
  label: string;
  scanProgressNorm: number;
  textColor?: string;
  color?: string;
  opacity?: number;
  divElement?: HTMLDivElement;
  entity?: SpaceStationMech | EnemyMechGroup | CelestialBody;
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
  //getWarpToHudTarget: () => htmlHudTargetType | undefined;
  getFocusedHudTarget: () => htmlHudTargetType | undefined;
  getSelectedHudTarget: () => htmlHudTargetType | undefined;
  getTargetPosition: (
    xn: number,
    yn: number,
    angleDiff: number
  ) => { marginLeftPx: number; marginTopPx: number };
  htmlHudTargets: htmlHudTargetType[];
  selectedHudTargetId: string | null;
  setSelectedHudTargetId: (selectedHudTargetId?: string | null) => void;
  focusedHudTargetId: string | null;
  setFocusedHudTargetId: (focusedHudTargetId: string | null) => void;
  scanningTargetId: string | null;
  scanProgressNormHudTarget: number; // used to trigger updates in ui with current value
  scanTargetTimeoutId: number | null;
  isShowWarpButton: boolean;
  isShowScanButton: boolean;
  doScanHudTarget: () => void;
  checkCanWarpToTarget: () => void;
  checkCanScanTarget: () => void;

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
            targetType: HTML_HUD_TARGET_TYPE.PLANET,
            viewAngle: 0,
            label: planet.rngSeed,
            color: planet.textureMapOptions.baseColor || "",
            entity: planet,
            scanProgressNorm: 0,
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
            targetType: HTML_HUD_TARGET_TYPE.STATION,
            viewAngle: 0,
            label: station.name,
            color: "gray",
            entity: station,
            scanProgressNorm: 0,
          });
        });
        htmlHudTargets.push(...targetsStations);
      }
      // enemy groups
      if (useEnemyStore.getState().enemyGroup.enemyMechs.length > 0) {
        htmlHudTargets.push({
          id: `${HTML_HUD_TARGET_TYPE.ENEMY}`, //-${index}`,
          targetType: HTML_HUD_TARGET_TYPE.ENEMY,
          viewAngle: 0,
          label: "ENEMY",
          color: "red",
          entity: useEnemyStore.getState().enemyGroup,
          scanProgressNorm: 0,
        });
      }

      // warp to star
      htmlHudTargets.push({
        id: `${HTML_HUD_TARGET_TYPE.WARP_TO_STAR}`,
        targetType: HTML_HUD_TARGET_TYPE.WARP_TO_STAR,
        viewAngle: 0,
        label: "SYSTEM WARP",
        textColor: "yellow",
        color: "white", // TODO get star color
        opacity: 1,
        scanProgressNorm: 0,
      });
      set({ htmlHudTargets });
    },
    getHudTargetById: (id: string) => {
      return get().htmlHudTargets.find((target) => target.id === id);
    },
    getFocusedHudTarget: () => {
      return get().htmlHudTargets.find(
        (target) => target.id === get().focusedHudTargetId
      );
    },
    getSelectedHudTarget: () => {
      return get().htmlHudTargets.find(
        (target) => target.id === get().selectedHudTargetId
      );
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
      const marginLeftPx = pxNorm;
      const marginTopPx = pyNorm;
      return { marginLeftPx, marginTopPx };
    },
    htmlHudTargets: [],
    selectedHudTargetId: null,
    setSelectedHudTargetId(
      selectedHudTargetId: string | null = get().focusedHudTargetId || null
    ) {
      // update selected target if in manual pilot control mode OR if is mobile
      if (
        (IS_MOBILE ||
          usePlayerControlsStore.getState().playerActionMode ===
            PLAYER.action.manualControl) &&
        // update if selected target has changed
        get().selectedHudTargetId !== selectedHudTargetId
      ) {
        set({ selectedHudTargetId });
      }
    },
    focusedHudTargetId: null,
    setFocusedHudTargetId(focusedHudTargetId: string | null) {
      if (
        // update if focused target has changed
        get().focusedHudTargetId !== focusedHudTargetId
      ) {
        set({ focusedHudTargetId });
      }
    },
    scanningTargetId: null,
    scanProgressNormHudTarget: 0, // used to trigger updates in ui with current value
    scanTargetTimeoutId: null,
    isShowScanButton: false,
    isShowWarpButton: false,

    doScanHudTarget: () => {
      // get current target
      const selectedTarget = get().getSelectedHudTarget();
      if (
        selectedTarget &&
        get().isShowScanButton &&
        get().scanTargetTimeoutId === null &&
        selectedTarget.scanProgressNorm < 1
      ) {
        const incrementScanProgress = () => {
          // only increment scan progress if target is still in range / angle
          if (get().isShowScanButton) {
            if (selectedTarget.scanProgressNorm < 1) {
              selectedTarget.scanProgressNorm += 0.1;
              get().scanTargetTimeoutId = setTimeout(
                incrementScanProgress,
                200
              );
            } else {
              selectedTarget.scanProgressNorm = 1;
              get().scanTargetTimeoutId = null;
            }
            // update scan progress norm for UI
            set({ scanProgressNormHudTarget: selectedTarget.scanProgressNorm });
          }
        };
        incrementScanProgress();
      }
    },

    checkCanWarpToTarget: () => {
      let isShowWarpButton = true;
      const selectedTarget = get().getSelectedHudTarget();
      // check if close enough to objects to warp to, used when inside the solar system
      const targetEntity = selectedTarget?.entity;
      if (targetEntity) {
        const playerPosition = useStore.getState().player.object3d.position;
        const distanceToWarpTarget =
          targetEntity.getRealWorldDistanceTo(playerPosition);
        const distanceAllowWarp = targetEntity.getMinDistanceAllowWarp();
        isShowWarpButton = distanceToWarpTarget > distanceAllowWarp;
      }

      if (selectedTarget) {
        // only allow warp if target near middle of hud circle
        // if in inspect mode do not hide warp button
        if (
          usePlayerControlsStore.getState().playerActionMode !==
            PLAYER.action.inspect &&
          selectedTarget.viewAngle > 0.3
        ) {
          isShowWarpButton = false;
        }
      }
      if (isShowWarpButton !== get().isShowWarpButton) {
        set({ isShowWarpButton });
      }
    },

    checkCanScanTarget: () => {
      let isShowScanButton = false;
      const selectedTarget = get().getSelectedHudTarget();
      const targetEntity = selectedTarget?.entity;
      if (!targetEntity) {
        // nothing to scan - only star warp target is not scannable ATM
        // - change button to "calculating course"?)
        return;
      }
      const playerPosition = useStore.getState().player.object3d.position;
      const distanceFromTarget =
        targetEntity.getRealWorldDistanceTo(playerPosition);
      const minDistanceToWarp = targetEntity.getMinDistanceAllowWarp();
      // using getMinDistanceAllowWarp to check if close enough to scan
      isShowScanButton = distanceFromTarget < minDistanceToWarp;
      // only allow scan if target near middle of hud circle
      // do not hide button in player is in inspect mode looking around
      if (
        usePlayerControlsStore.getState().playerActionMode !==
          PLAYER.action.inspect &&
        selectedTarget.viewAngle > 0.3
      ) {
        isShowScanButton = false;
      }
      // if
      if (isShowScanButton !== get().isShowScanButton) {
        set({ isShowScanButton });
        if (isShowScanButton) {
          if (get().scanningTargetId !== selectedTarget.id) {
            set({ scanningTargetId: selectedTarget.id });
            // scanProgressNormHudTarget is updated in doScanHudTarget()
            // clear previous scan timeout
            if (get().scanTargetTimeoutId !== null) {
              clearTimeout(get().scanTargetTimeoutId!);
              get().scanTargetTimeoutId = null;
            }
          }
        }
      }
      // start scanning target if not already scanning
      get().doScanHudTarget();
    },

    // update div elements for HUD targets each frame
    updateTargetHUD: (camera) => {
      get().htmlHudTargets.forEach((htmlHudTarget) => {
        if (!htmlHudTarget.divElement) return;
        let distanceToTargetLabel = "";
        let screenPosition = { xn: 0, yn: 0, angleDiff: 0 };

        switch (htmlHudTarget.targetType) {
          case HTML_HUD_TARGET_TYPE.PLANET:
          case HTML_HUD_TARGET_TYPE.STATION:
          case HTML_HUD_TARGET_TYPE.ENEMY:
            const targetEntity = htmlHudTarget.entity;
            if (targetEntity) {
              // distance label in Au measurement
              const playerPosition =
                useStore.getState().player.object3d.position;
              distanceToTargetLabel = getSystemScaleDistanceLabel(
                targetEntity.getRealWorldDistanceTo(playerPosition)
              );
              // get screen position of target world position (required due to relative positioning to player)
              screenPosition = getScreenPosition(
                camera,
                targetEntity.getRealWorldPosition()
              );
            }
            break;

          case HTML_HUD_TARGET_TYPE.WARP_TO_STAR:
            if (useGalaxyMapStore.getState().selectedWarpStar === null) {
              htmlHudTarget.viewAngle = 10; // for sorting
              // send off screen if no target
              htmlHudTarget.divElement.style.marginLeft = `5000px`;
              // exit loop
              return;
            }
            distanceToTargetLabel =
              (useGalaxyMapStore.getState().selectedWarpStarDistance * 7) // TODO standardize this number in galaxy creation - eyeballing average distance between stars to set multiplier
                .toFixed(3) + " Ly";
            // get screen position of target
            screenPosition = getScreenPositionFromDirection(
              camera,
              useGalaxyMapStore.getState().selectedWarpStarDirection!
            );
            break;

          default:
            console.error("Unknown htmlHudTarget.targetType");
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
        const targetChildInfoDiv =
          htmlHudTarget.divElement.getElementsByClassName(
            "flight-hud-target-info"
          )[0] as HTMLElement;
        // target text positioning
        targetChildInfoDiv.style.right = marginLeftPx <= 0 ? "100%" : "auto";
        targetChildInfoDiv.style.left = marginLeftPx > 0 ? "100%" : "auto";
        targetChildInfoDiv.style.textAlign =
          marginLeftPx <= 0 ? "right" : "left";
        // display the distance to target
        //targetChildInfoDiv.children[1].textContent = distanceToTargetLabel;
        targetChildInfoDiv.getElementsByClassName(
          "target-info-detail"
        )[0].textContent = distanceToTargetLabel;
      });
      // sort targets by viewAngle, smallest is last
      // this will make the target closest to the center of the screen on top
      // using the index in array to set z-index
      get().htmlHudTargets.sort((a, b) => (a.viewAngle < b.viewAngle ? 1 : -1));
      // update focused hud target z-index and CSS class
      const newFocusedTargetId =
        get().htmlHudTargets[get().htmlHudTargets.length - 1].id;
      if (
        // update focused target if in manual pilot control mode OR if is mobile
        IS_MOBILE ||
        usePlayerControlsStore.getState().playerActionMode ===
          PLAYER.action.manualControl
      ) {
        if (
          // update if focused target has changed
          get().focusedHudTargetId !== newFocusedTargetId
        ) {
          // set focused target id
          get().setFocusedHudTargetId(newFocusedTargetId);
          // z-index and CSS class
          get().htmlHudTargets.forEach((htmlHudTarget, index) => {
            if (htmlHudTarget.divElement) {
              // apply z-index to div elements
              htmlHudTarget.divElement.style.zIndex =
                htmlHudTarget.id === get().selectedHudTargetId
                  ? "1000"
                  : index.toString();
            }
          });
        }
      } else {
        // else player not in manual control mode
        // reset focused target id to selected target id
        get().setFocusedHudTargetId(get().selectedHudTargetId);
      }
      // update warp scan possibility
      get().checkCanWarpToTarget();
      get().checkCanScanTarget();
    },
  })
);

export default useHudTargtingStore;
