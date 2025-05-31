import useStore from "../../stores/store";
import useHudTargtingStore, {
  HTML_HUD_TARGET_TYPE,
} from "../../stores/hudTargetingStore";
import useEnemyStore from "../../stores/enemyStore";
import useGalaxyMapStore from "../../stores/galaxyMapStore";
import {
  getScreenPosition,
  getScreenPositionFromDirection,
} from "../../util/cameraUtil";
import { getSystemScaleDistanceLabel } from "../../util/gameUtil";
import HudTarget from "./HudTarget";
import HudTargetReticule from "./HudTargetReticule";
import EnemyMech from "../mech/EnemyMech";
import SpaceStationMech from "../mech/SpaceStationMech";
import EnemyMechGroup from "../mech/EnemyMechGroup";
import CelestialBody from "../solarSystem/CelestialBody";
import { IS_TOUCH_SCREEN, PLAYER } from "../../constants/constants";
import usePlayerControlsStore from "../../stores/playerControlsStore";

interface HudTargetControllerInt {
  generateTargets: () => void;
  generateEnemyCombatTargets: (enemyGroup?: EnemyMechGroup) => void;

  getHudTargetById: (id: string) => HudTarget | undefined;
  getFocusedHudTarget: () => HudTarget | undefined;
  getSelectedHudTarget: () => HudTarget | undefined;
  getTargetPosition: (
    xn: number,
    yn: number,
    angleDiff: number
  ) => {
    marginLeftPx: number;
    marginTopPx: number;
  }; // method to get target position in HUD circle

  setControlModeActiveTargets: (playerControlMode?: number) => void; // method to set active targets based on control mode
  setTargetDead: (id: string) => void; // method to set target as dead
}

class HudTargetController implements HudTargetControllerInt {
  currentControlMode: number;
  htmlHudTargets: HudTarget[]; // array of targets
  htmlHudTargetsCombat: HudTarget[]; // array of targets
  htmlHudTargetReticule: HudTargetReticule; // targeting reticule

  constructor() {
    this.currentControlMode = -1;
    this.htmlHudTargets = [];
    this.htmlHudTargetsCombat = [];
    // targeting reticule
    this.htmlHudTargetReticule = new HudTargetReticule({
      id: "targeting-reticule",
      isActive: false, // update will set to true if enemy is selected target
      targetType: HTML_HUD_TARGET_TYPE.ENEMY_TARGETING,
      label: "",
      color: "transparent",
      opacity: 1,
    });
  }

  generateTargets() {
    // keep all enemy combat targets
    this.htmlHudTargets = [];
    // stars
    if (useStore.getState().stars.length > 0) {
      useStore.getState().stars.forEach((star, index) => {
        if (!star.isActive) return;
        this.htmlHudTargets.push(
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
    } // planets
    if (useStore.getState().planets.length > 0) {
      useStore.getState().planets.forEach((planet, index) => {
        if (!planet.isActive) return;
        this.htmlHudTargets.push(
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
    }
    // stations
    if (useStore.getState().stations.length > 0) {
      useStore.getState().stations.forEach((station, index) => {
        this.htmlHudTargets.push(
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
    }
    // enemy groups
    if (useEnemyStore.getState().enemyGroup.enemyMechs.length > 0) {
      this.htmlHudTargets.push(
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
    this.htmlHudTargets.push(
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
  }

  generateEnemyCombatTargets(
    enemyGroup: EnemyMechGroup = useEnemyStore.getState().enemyGroup
  ) {
    // keep current non-combat targets
    this.htmlHudTargetsCombat = [];

    enemyGroup.enemyMechs.forEach((enemyMech) => {
      //if is not dead
      if (enemyMech.isMechDead()) return;
      this.htmlHudTargetsCombat.push(
        new HudTarget({
          id: `${enemyMech.id}`,
          isActive: false, // update will set to true for enemies infront of player
          targetType: HTML_HUD_TARGET_TYPE.ENEMY_COMBAT,
          label: "",
          color: "transparent",
          entity: enemyMech,
          opacity: 1,
        })
      );
    });
  }

  getHudTargetById(id: string) {
    return (
      this.htmlHudTargets.find((target) => target.id === id) ||
      this.htmlHudTargetsCombat.find((target) => target.id === id)
    );
  }

  getFocusedHudTarget() {
    return (
      this.htmlHudTargets.find(
        (target) =>
          target.id === useHudTargtingStore.getState().focusedHudTargetId
      ) ||
      this.htmlHudTargetsCombat.find(
        (target) =>
          target.id === useHudTargtingStore.getState().focusedHudTargetId
      )
    );
  }

  getSelectedHudTarget() {
    return (
      this.htmlHudTargets.find(
        (target) =>
          target.id === useHudTargtingStore.getState().selectedHudTargetId
      ) ||
      this.htmlHudTargetsCombat.find(
        (target) =>
          target.id === useHudTargtingStore.getState().selectedHudTargetId
      )
    );
  }

  getTargetPosition(xn: number, yn: number, angleDiff: number) {
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
      Math.sqrt(pxNorm * pxNorm + pyNorm * pyNorm) >
        useHudTargtingStore.getState().hudRadiusPx ||
      isTargetBehindCamera
    ) {
      const atan2Angle = Math.atan2(pyNorm, pxNorm);
      pxNorm =
        Math.cos(atan2Angle) * useHudTargtingStore.getState().hudRadiusPx;
      pyNorm =
        Math.sin(atan2Angle) * useHudTargtingStore.getState().hudRadiusPx;
    }
    // set position of target div
    const marginLeftPx = pxNorm;
    const marginTopPx = pyNorm;
    return { marginLeftPx, marginTopPx };
  }

  setControlModeActiveTargets(
    playerControlMode: number = usePlayerControlsStore.getState()
      .playerControlMode
  ) {
    if (this.currentControlMode !== playerControlMode) {
      // set current control mode
      this.currentControlMode = playerControlMode;
      // set active targets based on control mode
      // non-combat targets
      this.htmlHudTargets.forEach((target) => {
        target.isActive = playerControlMode === PLAYER.controls.scan;
        target.hideTargetSetMarginLeft(); // hide target if not active
      });
      // combat targets
      this.htmlHudTargetsCombat.forEach((target) => {
        target.isActive = playerControlMode === PLAYER.controls.combat;
        target.hideTargetSetMarginLeft(); // hide target if not active
      });
      // targeting reticule
      this.htmlHudTargetReticule.isActive =
        playerControlMode === PLAYER.controls.combat;
      if (playerControlMode === PLAYER.controls.combat) {
        this.htmlHudTargetReticule.resetPosition();
      } else {
        this.htmlHudTargetReticule.hideTargetSetMarginLeft();
      }
    }
    // get system warp target
    const sysWarpTarget = useHudTargtingStore
      .getState()
      .hudTargetController.htmlHudTargets.find(
        (target) => target.targetType === HTML_HUD_TARGET_TYPE.WARP_TO_STAR
      );

    if (sysWarpTarget)
      sysWarpTarget.isActive =
        playerControlMode === PLAYER.controls.scan &&
        useGalaxyMapStore.getState().selectedWarpStar
          ? true
          : false; // hide target
  }

  setTargetDead(id: string) {
    // remove target from htmlHudTargets array
    const htmlHudTarget = this.htmlHudTargetsCombat.find(
      (target) => target.id === id
    );
    if (htmlHudTarget) {
      htmlHudTarget.isDead = true; // set target to dead
      htmlHudTarget.isActive = false; // hide target
    }
    // set selected target null if inactive
    if (
      useHudTargtingStore.getState().selectedHudTargetId === id &&
      !this.htmlHudTargetReticule.isActive
    ) {
      useHudTargtingStore.getState().selectedHudTargetId = null; // reset selected target
    }
  }

  //UPDATE FUNC HERE
}

export default HudTargetController;
