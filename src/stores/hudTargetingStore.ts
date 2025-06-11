import { create } from "zustand";
import useStore from "./store";
import usePlayerControlsStore from "./playerControlsStore";
import HudTargetController from "../classes/hudTargets/HudTargetController";
import EnemyMech from "../classes/mech/EnemyMech";
import { ifChangedUpdateStyle } from "../util/gameUtil";
import { IS_TOUCH_SCREEN, PLAYER } from "../constants/constants";

export const HTML_HUD_TARGET_TYPE = {
  WARP_TO_STAR: 0,
  PLANET: 1,
  STATION: 2,
  ENEMY_GROUP: 3,
  ENEMY_COMBAT: 4,
  ENEMY_TARGETING: 5,
};

export type typeWeaponsHudReadout = {
  id: string;
  weaponType: number;
  label: string;
  labelDiv: HTMLElement | null;
  ammoCount: number | null; // current ammo count
  ammoCountDiv: HTMLElement | null;
  weaponReadyCircleDiv: HTMLElement | null;
  weaponFiringCircleDiv: HTMLElement | null; // used to show firing state
  weaponNoAmmoCircleDiv: HTMLElement | null; // used to show no ammo state
};

interface hudTargetingGalaxyMapStoreState {
  // CSS HUD targets
  isMouseOutOfHudCircle: boolean;
  hudRadiusPx: number;
  flightHudTargetDiameterPx: number;
  // HTML HUD player direction control target
  playerHudCrosshairInnerDiv: HTMLDivElement | null;
  updatePlayerHudCrosshairDiv: () => void;
  // weapons readout
  weaponsReadoutDivElement: HTMLDivElement | null; // used to set weapons readout div element opacity
  weaponsHudReadout: typeWeaponsHudReadout[];
  initWeaponsHudReadout: () => void;
  // call updatePlayerWeaponsHudReadout each frame to update weapon readout div elements
  updatePlayerWeaponsHudReadout: () => void;
  // HTML HUD Targets
  hudTargetController: HudTargetController;
  currentPlayerControlMode: number; // used to determine which targets to show
  selectedHudTargetId: string | null;
  setSelectedHudTargetId: (selectedHudTargetId?: string | null) => void;
  focusedHudTargetId: string | null;
  setFocusedHudTargetId: (focusedHudTargetId: string | null) => void;
  scanTargetTimeoutId: number | null;
  scanningTargetId: string | null;
  scanProgressNormHudTarget: number; // used to trigger updates in ui with current value
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
        get().playerHudCrosshairInnerDiv!.style.transform = `translate3d(${
          mouseControlNormalVec2.x * get().hudRadiusPx - 1.5
        }px, ${mouseControlNormalVec2.y * get().hudRadiusPx - 1}px, 0)`;
      }
    },

    weaponsReadoutDivElement: null, // used to set weapons readout div element opacity
    weaponsHudReadout: [],
    initWeaponsHudReadout: () => {
      const weaponList = useStore
        .getState()
        .player.mechBP.weaponList.sort((a, b) => a.weaponType - b.weaponType); // sort by weapon type
      get().weaponsHudReadout = weaponList.map((weapon) => ({
        id: weapon.id,
        weaponType: weapon.weaponType,
        label: weapon.name,
        labelDiv: null,
        ammoCount: 0,
        ammoCountDiv: null,
        weaponReadyCircleDiv: null,
        weaponFiringCircleDiv: null,
        weaponNoAmmoCircleDiv: null,
      }));
    },
    updatePlayerWeaponsHudReadout: () => {
      if (!get().weaponsReadoutDivElement) return; // no weapons readout div element set yet
      if (
        usePlayerControlsStore.getState().playerControlMode !==
        PLAYER.controls.combat
      ) {
        ifChangedUpdateStyle(get().weaponsReadoutDivElement, "opacity", "0");
      } else {
        ifChangedUpdateStyle(get().weaponsReadoutDivElement, "opacity", "1");
        useStore.getState().player.mechBP.weaponList.forEach((weapon) => {
          // get waepon from weaponsHudReadout
          const weaponHud = get().weaponsHudReadout.find(
            (wHud) => wHud.id === weapon.id
          );
          if (weaponHud) {
            weaponHud.ammoCount = weapon.getAmmoCount();
            // update label if out of ammo
            if (weaponHud.ammoCount !== null && weaponHud.ammoCount >= 0) {
              ifChangedUpdateStyle(
                weaponHud.labelDiv,
                "color",
                weaponHud.ammoCount === 0 ? "red" : "white"
              ); // update ammo count div
              if (
                weaponHud.ammoCountDiv &&
                weaponHud.ammoCountDiv.textContent !==
                  weaponHud.ammoCount.toString()
              ) {
                weaponHud.ammoCountDiv.textContent =
                  weaponHud.ammoCount.toString();
              }
            }

            // update weapon ready circle divs (default blue is visible)
            ifChangedUpdateStyle(
              weaponHud.weaponFiringCircleDiv,
              "opacity",
              !weapon.weaponFireData.isReady ? "1" : "0" // show green when firing (when not ready)
            );
            // red when no ammo
            ifChangedUpdateStyle(
              weaponHud.weaponNoAmmoCircleDiv,
              "opacity",
              weaponHud.ammoCount === 0 ? "1" : "0"
            );
          }
        });
      }
    },

    hudTargetController: new HudTargetController(), //TODO fully reset htmlHudTargets array when generating new targets to trigger update
    currentPlayerControlMode: -1, // used as trigger to hide targets for other control mode, reset on rerender of FlightHud.tsx
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
            get().hudTargetController.getSelectedHudTarget()
              ?.scanProgressNorm || 0,
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
    scanTargetTimeoutId: null,
    scanningTargetId: null,
    scanProgressNormHudTarget: 0, // used to trigger updates in ui with current value
    isShowScanButton: false,
    isShowWarpButton: false,

    doScanHudTarget: () => {
      // get current target
      const selectedTarget = get().hudTargetController.getSelectedHudTarget();
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
      const selectedTarget = get().hudTargetController.getSelectedHudTarget();
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
        if (selectedTarget.screenPosition.angleDiff > 0.26) {
          isShowWarpButton = false;
        }
      }
      if (isShowWarpButton !== get().isShowWarpButton) {
        set({ isShowWarpButton });
      }
    },

    checkCanScanTarget: () => {
      let isShowScanButton = false;
      const selectedTarget = get().hudTargetController.getSelectedHudTarget();
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
      if (selectedTarget.screenPosition.angleDiff > 0.26) {
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

    updateTargetHUD: (camera) => {
      const playerControlMode =
        usePlayerControlsStore.getState().playerControlMode;

      if (get().currentPlayerControlMode !== playerControlMode) {
        get().currentPlayerControlMode = playerControlMode;
        const hideTargets = // hide targets of previous control mode
          playerControlMode !== PLAYER.controls.scan
            ? get().hudTargetController.htmlHudTargets
            : get().hudTargetController.htmlHudTargetsCombat;
        // hide targets
        hideTargets.forEach((htmlHudTarget) => {
          htmlHudTarget.hideTargetSetOpacity();
        });
      }

      const playerControlModeTargets =
        playerControlMode === PLAYER.controls.scan
          ? get().hudTargetController.htmlHudTargets
          : get().hudTargetController.htmlHudTargetsCombat;

      const playerPosition = useStore.getState().player.object3d.position;

      // update targeting reticule
      get().hudTargetController.htmlHudTargetReticule.updateTargetUseFrame(
        camera,
        playerPosition
      );

      // update all action mode target data
      playerControlModeTargets.forEach((htmlHudTarget) => {
        htmlHudTarget.updateTargetUseFrame(camera, playerPosition);
      });

      // sort targets by screenPosition.angleDiff, smallest is last
      // using the index in array to set z-index
      // this will make the target closest to the center of the screen on top
      playerControlModeTargets.sort((a, b) => {
        if (a.screenPosition.angleDiff + 0.01 < b.screenPosition.angleDiff)
          // 0.01 small buffer to avoid flicker issues
          return -1; // a is closer to center, so it should come first

        return 0;
      });

      // update focused hud target z-index and CSS class
      // focused target is the one closest to the center of the screen
      // only set if there is an active target
      const newFocusedTargetId = playerControlModeTargets[0].isActive
        ? playerControlModeTargets[0].id
        : null;
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
          playerControlModeTargets.forEach((htmlHudTarget, index) => {
            ifChangedUpdateStyle(
              htmlHudTarget.divElement,
              "zIndex",
              htmlHudTarget.id === get().selectedHudTargetId
                ? "1000" // selected target is always on top
                : htmlHudTarget.targetType ===
                  HTML_HUD_TARGET_TYPE.ENEMY_TARGETING
                ? "999" // targeting reticule is right behind current selected target
                : index.toString() // closest to center of screen is on top, targets are reverse ordered above so this works easily here); // reset z-index
            );
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
        usePlayerControlsStore.getState().playerControlMode ===
        PLAYER.controls.scan
      ) {
        get().checkCanWarpToTarget();
        get().checkCanScanTarget();
      }
      // else check can interface target ? types: social, matrix, ...

      // update all target HTML HUD target div element styles
      // update targeting reticule
      get().hudTargetController.htmlHudTargetReticule.updateTargetStylesUseFrame(
        get().selectedHudTargetId,
        get().focusedHudTargetId
      );
      // update all action mode target data
      playerControlModeTargets.forEach((htmlHudTarget) => {
        htmlHudTarget.updateTargetStylesUseFrame(
          get().selectedHudTargetId,
          get().focusedHudTargetId
        );
      });
    },
  })
);

export default useHudTargtingStore;
