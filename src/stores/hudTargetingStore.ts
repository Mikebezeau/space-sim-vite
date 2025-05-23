import { create } from "zustand";
import useStore from "./store";
import usePlayerControlsStore from "./playerControlsStore";
import useEnemyStore from "./enemyStore";
import useGalaxyMapStore from "./galaxyMapStore";
import { getSystemScaleDistanceLabel } from "../util/gameUtil";
import {
  getScreenPosition,
  getScreenPositionFromDirection,
} from "../util/cameraUtil";
import HudTarget from "../classes/hudTargets/HudTarget";
import EnemyMech from "../classes/mech/EnemyMech";
import EnemyMechGroup from "../classes/mech/EnemyMechGroup";
import { IS_TOUCH_SCREEN, PLAYER } from "../constants/constants";

export const HTML_HUD_TARGET_TYPE = {
  WARP_TO_STAR: 0,
  PLANET: 1,
  STATION: 2,
  ENEMY_GROUP: 3,
  ENEMY_COMBAT: 4,
};
/*
export type htmlHudTargetType = {
  id: string;
  isActive: boolean; // hides target if false
  targetType: number;
  viewAngle: number; // used to sort targets and limit combat targets
  distanceNorm: number; // used for combat target, coloring: darker for further away targets
  label: string;
  scanProgressNorm: number;
  textColor?: string;
  color?: string;
  opacity?: number;
  divElement?: HTMLDivElement;
  combatTriangleSvgs: SVGElement[];
  nonCombatCircleDiv?: HTMLDivElement;
  entity?: EnemyMech | SpaceStationMech | EnemyMechGroup | CelestialBody;
};
*/
interface hudTargetingGalaxyMapStoreState {
  // CSS HUD targets
  isMouseOutOfHudCircle: boolean;
  hudRadiusPx: number;
  flightHudTargetDiameterPx: number;
  // HTML HUD player direction control target
  playerHudCrosshairInnerDiv: HTMLDivElement | null;
  updatePlayerHudCrosshairDiv: () => void;
  // HTML HUD Targets
  generateTargets: () => void;
  generateEnemyCombatTargets: (enemyGroup?: EnemyMechGroup) => void;
  setTargetDead: (id: string) => void; // remove targets from htmlHudTargets array
  getEnemyCombatTargets: () => HudTarget[];
  getHudTargetById: (id: string) => HudTarget | undefined;
  //getWarpToHudTarget: () => htmlHudTargetType | undefined;
  getFocusedHudTarget: () => HudTarget | undefined;
  getSelectedHudTarget: () => HudTarget | undefined;
  getTargetPosition: (
    xn: number,
    yn: number,
    angleDiff: number
  ) => { marginLeftPx: number; marginTopPx: number };
  htmlHudTargets: HudTarget[];
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
    flightHudTargetDiameterPx: 0,
    isMouseOutOfHudCircle: false, // used in custom cursor
    playerHudCrosshairInnerDiv: null,
    updatePlayerHudCrosshairDiv: () => {
      const mouseControlNormalVec2 =
        useStore.getState().mutation.mouseControlNormalVec2;

      if (get().playerHudCrosshairInnerDiv !== null) {
        get().playerHudCrosshairInnerDiv!.style.marginLeft = `${
          mouseControlNormalVec2.x * get().hudRadiusPx - 1.5
        }px`;
        get().playerHudCrosshairInnerDiv!.style.marginTop = `${
          mouseControlNormalVec2.y * get().hudRadiusPx - 1
        }px`;
      }
    },
    generateTargets: () => {
      // keep all enemy combat targets
      const htmlHudTargets = get().getEnemyCombatTargets();
      // stars
      if (useStore.getState().stars.length > 0) {
        const targetsStars: HudTarget[] = [];
        useStore.getState().stars.forEach((star, index) => {
          if (!star.isActive) return;
          targetsStars.push(
            new HudTarget({
              id: `${HTML_HUD_TARGET_TYPE.PLANET}-star-${index}`,
              isActive: true,
              targetType: HTML_HUD_TARGET_TYPE.PLANET,
              label: "STAR " + star.rngSeed,
              color: "", //star.textureMapLayerOptions[0].lowAltColor || "",
              entity: star,
            })
          );
        });
        htmlHudTargets.push(...targetsStars);
      } // planets
      if (useStore.getState().planets.length > 0) {
        const targetsPlanets: HudTarget[] = [];
        useStore.getState().planets.forEach((planet, index) => {
          if (!planet.isActive) return;
          targetsPlanets.push(
            new HudTarget({
              id: `${HTML_HUD_TARGET_TYPE.PLANET}-${index}`,
              isActive: true,
              targetType: HTML_HUD_TARGET_TYPE.PLANET,
              label: planet.rngSeed,
              color: planet.textureMapLayerOptions[0].lowAltColor || "",
              entity: planet,
            })
          );
        });
        htmlHudTargets.push(...targetsPlanets);
      }
      // stations
      if (useStore.getState().stations.length > 0) {
        const targetsStations: HudTarget[] = [];
        useStore.getState().stations.forEach((station, index) => {
          targetsStations.push(
            new HudTarget({
              id: `${HTML_HUD_TARGET_TYPE.STATION}-${index}`,
              isActive: true,
              targetType: HTML_HUD_TARGET_TYPE.STATION,
              label: station.name,
              color: "gray",
              entity: station,
            })
          );
        });
        htmlHudTargets.push(...targetsStations);
      }
      // enemy groups
      if (useEnemyStore.getState().enemyGroup.enemyMechs.length > 0) {
        htmlHudTargets.push(
          new HudTarget({
            id: `${HTML_HUD_TARGET_TYPE.ENEMY_GROUP}`, //-${index}`,
            isActive: true,
            targetType: HTML_HUD_TARGET_TYPE.ENEMY_GROUP,
            label: "ENEMY GROUP",
            color: "red",
            entity: useEnemyStore.getState().enemyGroup,
          })
        );
      }

      // warp to star
      htmlHudTargets.push(
        new HudTarget({
          id: `${HTML_HUD_TARGET_TYPE.WARP_TO_STAR}`,
          isActive: false,
          targetType: HTML_HUD_TARGET_TYPE.WARP_TO_STAR,
          label: "SYSTEM WARP",
          textColor: "yellow",
          color: "white", // TODO get star color
          // TODO borderColor implementation
          opacity: 1,
        })
      );
      set({ htmlHudTargets });
    },
    generateEnemyCombatTargets: (
      enemyGroup: EnemyMechGroup = useEnemyStore.getState().enemyGroup
    ) => {
      // keep current non-combat targets
      const htmlHudTargets = get().htmlHudTargets.filter(
        (
          target: HudTarget //TODO combatTarget
        ) => target.targetType !== HTML_HUD_TARGET_TYPE.ENEMY_COMBAT
      );

      enemyGroup.enemyMechs.forEach((enemyMech) => {
        //if is not dead
        if (enemyMech.isMechDead()) return;
        htmlHudTargets.push(
          new HudTarget({
            id: `${enemyMech.id}`,
            isActive: false, // update will set to true for enemies infront of player
            targetType: HTML_HUD_TARGET_TYPE.ENEMY_COMBAT,
            label: "",
            color: "red",
            entity: enemyMech,
          })
        );
      });
      set({ htmlHudTargets });
    },
    setTargetDead: (id: string) => {
      // remove target from htmlHudTargets array
      const htmlHudTarget = get().htmlHudTargets.find(
        (target) => target.id === id
      );
      if (htmlHudTarget) {
        htmlHudTarget.isDead = true; // set target to dead
      }
    },
    //TODO move all target functions to parent class?
    // TODO get targets by type parameter non-specific
    getEnemyCombatTargets: () => {
      return get().htmlHudTargets.filter(
        (target) => target.targetType === HTML_HUD_TARGET_TYPE.ENEMY_COMBAT
      );
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
    htmlHudTargets: [], //TODO fully reset htmlHudTargets array when generating new targets to trigger update
    selectedHudTargetId: null,
    setSelectedHudTargetId(
      selectedHudTargetId: string | null = get().focusedHudTargetId
    ) {
      // update selected target if in manual pilot control mode OR if is touch controls
      if (
        (IS_TOUCH_SCREEN ||
          usePlayerControlsStore.getState().playerActionMode ===
            PLAYER.action.manualControl) &&
        // update if selected target has changed
        get().selectedHudTargetId !== selectedHudTargetId
      ) {
        set({ selectedHudTargetId });
        // update scanning normalized value
        set({
          scanProgressNormHudTarget:
            get().getSelectedHudTarget()?.scanProgressNorm || 0,
        });
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
      if (targetEntity && !(targetEntity instanceof EnemyMech)) {
        const playerPosition = useStore.getState().player.object3d.position;
        // TODO setting the distance above already
        const distanceToWarpTarget =
          targetEntity.getRealWorldDistanceTo(playerPosition);
        const distanceAllowWarp = targetEntity.getMinDistanceAllowWarp();
        isShowWarpButton = distanceToWarpTarget > distanceAllowWarp;
      }

      if (selectedTarget) {
        // only allow warp if target near middle of hud circle
        if (selectedTarget.viewAngle > 0.26) {
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
      if (!targetEntity || targetEntity instanceof EnemyMech) {
        // TODO scanning not implemented for mechs yet
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
      if (selectedTarget.viewAngle > 0.26) {
        isShowScanButton = false;
      }
      // if
      if (isShowScanButton !== get().isShowScanButton) {
        set({ isShowScanButton });
        if (isShowScanButton) {
          if (get().scanningTargetId !== selectedTarget.id) {
            set({ scanningTargetId: selectedTarget.id });
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
      const playerPosition = useStore.getState().player.object3d.position;
      const playerControlMode =
        usePlayerControlsStore.getState().playerControlMode;
      get().htmlHudTargets.forEach((htmlHudTarget) => {
        if (!htmlHudTarget.divElement) return;
        if (htmlHudTarget.isDead) {
          htmlHudTarget.isActive = false; // hide target
          return;
        }
        // display target types based on control mode
        if (
          playerControlMode === PLAYER.controls.combat
            ? !htmlHudTarget.isCombat()
            : htmlHudTarget.isCombat() ||
              (htmlHudTarget.targetType === HTML_HUD_TARGET_TYPE.WARP_TO_STAR &&
                !useGalaxyMapStore.getState().selectedWarpStar)
        ) {
          htmlHudTarget.viewAngle = 10; // for sorting TODO add isActive to sort
          htmlHudTarget.isActive = false; // hide target
          return;
        }

        let distanceToTargetLabel = "";
        let screenPosition = { xn: 0, yn: 0, angleDiff: 0 };

        let targetEntity: any;
        switch (htmlHudTarget.targetType) {
          case HTML_HUD_TARGET_TYPE.PLANET:
          case HTML_HUD_TARGET_TYPE.STATION:
          case HTML_HUD_TARGET_TYPE.ENEMY_GROUP:
            targetEntity = htmlHudTarget.entity;
            if (targetEntity) {
              // distance label in Au measurement
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
            /*
            if (useGalaxyMapStore.getState().selectedWarpStar === null) {
              htmlHudTarget.viewAngle = 10; // for sorting
              // send off screen if no target
              htmlHudTarget.isActive = false;
              // exit loop
              return;
            }
            */
            // display warp star target
            htmlHudTarget.isActive = true;
            // set label in Ly measurment
            distanceToTargetLabel =
              (useGalaxyMapStore.getState().selectedWarpStarDistance * 7) // TODO standardize this number in galaxy creation - eyeballing average distance between stars to set multiplier
                .toFixed(3) + " Ly";
            // get screen position of target
            screenPosition = getScreenPositionFromDirection(
              camera,
              useGalaxyMapStore.getState().selectedWarpStarDirection!
            );
            break;

          case HTML_HUD_TARGET_TYPE.ENEMY_COMBAT:
            targetEntity = htmlHudTarget.entity;
            if (targetEntity) {
              htmlHudTarget.distanceNorm = 1; /* Math.max(
                0.1,
                Math.min(
                  1,
                  targetEntity.getRealWorldDistanceTo(playerPosition) / 1000
                )
              );*/
              screenPosition = getScreenPosition(
                camera,
                targetEntity.getRealWorldPosition()
              );
            }
            break;

          default:
            console.error("Unknown htmlHudTarget.targetType");
            break;
        }

        // store angleDiff as viewAngle property
        htmlHudTarget.viewAngle = screenPosition.angleDiff;

        htmlHudTarget.isActive =
          htmlHudTarget.targetType === HTML_HUD_TARGET_TYPE.ENEMY_COMBAT
            ? htmlHudTarget.viewAngle < 0.5 //2 * htmlHudTarget.distanceNorm // set combat target active if within x radian of camera
            : true; // default isActive = true

        if (!htmlHudTarget.isActive) {
          // exit loop
          return;
        } else {
          const { marginLeftPx, marginTopPx } = get().getTargetPosition(
            screenPosition.xn,
            screenPosition.yn,
            screenPosition.angleDiff
          );
          // set position of target div
          htmlHudTarget.divElement.style.marginLeft = `${marginLeftPx}px`;
          htmlHudTarget.divElement.style.marginTop = `${marginTopPx}px`;
          // set text labels
          if (htmlHudTarget.targetType !== HTML_HUD_TARGET_TYPE.ENEMY_COMBAT) {
            // target text positioning
            if (htmlHudTarget.divInfo) {
              htmlHudTarget.divInfo.style.right =
                marginLeftPx <= 0 ? "100%" : "auto";
              htmlHudTarget.divInfo.style.left =
                marginLeftPx > 0 ? "100%" : "auto";
              htmlHudTarget.divInfo.style.textAlign =
                marginLeftPx <= 0 ? "right" : "left";

              // display the distance to target
              if (htmlHudTarget.divInfoDetail) {
                htmlHudTarget.divInfoDetail.textContent = distanceToTargetLabel;
              }
            }
          }
        }
      });
      // sort targets by viewAngle, smallest is last
      // using the index in array to set z-index
      // this will make the target closest to the center of the screen on top
      get().htmlHudTargets.sort((a, b) => (a.viewAngle < b.viewAngle ? 1 : -1));
      // update focused hud target z-index and CSS class
      // focused target is the one closest to the center of the screen
      const newFocusedTargetId =
        get().htmlHudTargets[get().htmlHudTargets.length - 1].id;
      if (
        // update focused target if in manual pilot control mode OR if is touch controls
        IS_TOUCH_SCREEN ||
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
                  ? "1000" // selected target is always on top
                  : index.toString(); // closest to center of screen is on top, targets are reverse ordered above so this works easily here
            }
          });
        }
      } else {
        // else player not in manual control mode
        // reset focused target id to selected target id
        if (
          // update if focused target has changed
          get().focusedHudTargetId !== get().selectedHudTargetId
        ) {
          get().setFocusedHudTargetId(get().selectedHudTargetId);
        }
      }
      // update warp / scan possibility
      if (
        // if action mode is scan
        // TODO create setter in store
        usePlayerControlsStore.getState().playerControlMode ===
        PLAYER.controls.scan
      ) {
        get().checkCanWarpToTarget();
        get().checkCanScanTarget();
      }
      // else check can interface target ? types: social, matrix, ...
      //update all targets
      get().htmlHudTargets.forEach((htmlHudTarget) => {
        htmlHudTarget.updateTargetUseFrame(
          get().selectedHudTargetId,
          get().focusedHudTargetId
        );
      });
    },
  })
);

export default useHudTargtingStore;
