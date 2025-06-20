import useStore from "../../stores/store";
import useHudTargtingStore, {
  HTML_HUD_TARGET_TYPE,
} from "../../stores/hudTargetingStore";
import useEnemyStore from "../../stores/enemyStore";
import HudTarget from "./HudTarget";
import HudCombatTarget from "./HudCombatTarget";
import HudTargetReticule from "./HudTargetReticule";
import EnemyMechGroup from "../mech/EnemyMechGroup";
import { PLAYER } from "../../constants/constants";

export const MAX_COMBAT_TARGETS = 20; // max number of combat targets to show

interface HudTargetControllerInt {
  generateTargets: () => void;
  generateEnemyCombatTargets: (enemyGroup?: EnemyMechGroup) => void;

  setTargetDead: (id: string) => void; // method to set target as dead

  getHudTargetById: (id: string) => HudTarget | undefined;
  getFocusedHudTarget: () => HudTarget | undefined;
  getSelectedHudTarget: () => HudTarget | undefined;
  getTargetPosition: (
    xn: number,
    yn: number,
    angleDiff: number
  ) => {
    transformX: number;
    transformY: number;
  }; // method to get target position in HUD circle
}

class HudTargetController implements HudTargetControllerInt {
  htmlHudTargets: (HudTarget | HudCombatTarget)[]; // array of targets
  // create MAX_COMBAT_TARGETS number of html elements to use with combat targeting
  htmlTargetsCombatElementRefs: HudCombatTarget[];
  // call this hudTargetsCombatData
  htmlHudTargetsCombat: HudCombatTarget[]; // array of targets
  htmlHudTargetReticule: HudTargetReticule; // targeting reticule

  constructor() {
    this.htmlHudTargets = [];
    // create MAX_COMBAT_TARGETS number of html elements to use with combat targeting
    this.htmlTargetsCombatElementRefs = Array.from(
      { length: MAX_COMBAT_TARGETS },
      (_, index) =>
        new HudCombatTarget({
          id: `combat-target-${index}`,
          playerControlModeActive: PLAYER.controls.combat,
          targetType: HTML_HUD_TARGET_TYPE.ENEMY_COMBAT,
          label: "",
          color: "transparent",
          opacity: 1,
        })
    );
    this.htmlHudTargetsCombat = [];
    // targeting reticule
    this.htmlHudTargetReticule = new HudTargetReticule({
      id: "targeting-reticule",
      playerControlModeActive: PLAYER.controls.combat,
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
            playerControlModeActive: PLAYER.controls.scan,
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
            playerControlModeActive: PLAYER.controls.scan,
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
          new HudCombatTarget({
            id: `${HTML_HUD_TARGET_TYPE.STATION}-${index}`,
            playerControlModeActive: PLAYER.controls.scan,
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
        new HudCombatTarget({
          id: `${HTML_HUD_TARGET_TYPE.ENEMY_GROUP}`, //-${index}`,
          playerControlModeActive: PLAYER.controls.scan,
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
        playerControlModeActive: PLAYER.controls.scan,
        targetType: HTML_HUD_TARGET_TYPE.WARP_TO_STAR,
        label: "SYSTEM WARP",
        textColor: "yellow",
        borderColor: "yellow",
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
        new HudCombatTarget({
          id: `${enemyMech.id}`,
          playerControlModeActive: PLAYER.controls.combat,
          targetType: HTML_HUD_TARGET_TYPE.ENEMY_COMBAT,
          entity: enemyMech,
          opacity: 1,
        })
      );
    });
  }

  setTargetDead(id: string) {
    // remove target from htmlHudTargets array
    const htmlHudTarget = this.getHudTargetById(id);
    if (htmlHudTarget) {
      htmlHudTarget.isDead = true; // set target to dead
      htmlHudTarget.isActive = false; // update active status
    }
    // set focused target null if dead target is focused
    // TODO need this?
    if (useHudTargtingStore.getState().focusedHudTargetId === id) {
      useHudTargtingStore.getState().focusedHudTargetId = null; // reset focused target
    }
    if (useHudTargtingStore.getState().selectedHudTargetId === id) {
      useHudTargtingStore.getState().selectedHudTargetId = null; // reset selected target
      // reset reticule target position to center
      this.htmlHudTargetReticule.resetPosition();
    }
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
    const transformX = pxNorm;
    const transformY = pyNorm;
    return { transformX, transformY };
  }
}

export default HudTargetController;
