import * as THREE from "three";
import useHudTargtingStore from "../../stores/hudTargetingStore";
import useGalaxyMapStore from "../../stores/galaxyMapStore";
import EnemyMech from "../mech/EnemyMech";
import SpaceStationMech from "../mech/SpaceStationMech";
import EnemyMechGroup from "../mech/EnemyMechGroup";
import CelestialBody from "../solarSystem/CelestialBody";
import { getSystemScaleDistanceLabel } from "../../util/gameUtil";
import {
  getScreenPosition,
  getScreenPositionFromDirection,
} from "../../util/cameraUtil";
import { HTML_HUD_TARGET_TYPE } from "../../stores/hudTargetingStore";

export type HudTargetOptionsType = {
  id: string;
  isActive: boolean;
  targetType: number;
  label: string;
  textColor?: string;
  color?: string;
  borderColor?: string;
  opacity?: number;
  entity?: EnemyMech | SpaceStationMech | EnemyMechGroup | CelestialBody;
};

interface HudTargetInt {
  isUseCombatTarget: () => boolean;
  isCombat: () => boolean;
  //setDivInfoLabelTextContent: (label: string) => void; // TODO to use the label as an action button
  setDivInfoDetailTextContent: (label: string) => void; // method to set target detail label
  hideTargetSetMarginLeft: () => void; // method to hide target by setting margin left
  resetPosition: () => void; // method to reset target position
  updateTargetUseFrame: (
    camera: THREE.Camera,
    playerPosition: THREE.Vector3,
    selectedHudTargetId: string
  ) => void; // method to update target styles in useFrame
  updateTargetStylesUseFrame: (
    selectedHudTargetId: string,
    focusedHudTargetId: string
  ) => void; // method to update target styles in useFrame
}

class HudTarget implements HudTargetInt {
  id: string; // unique id of target (mech.id for mech combat targets)
  isDead: boolean; // true if target is dead - used for enemy mechs
  isActive: boolean; // hides target if false
  needsUpdate: boolean; // true if target needs to be updated
  targetType: number;
  screenPosition: {
    xn: number;
    yn: number;
    angleDiff: number;
  }; // used to sort targets and limit combat targets
  distanceNorm: number; // used for combat target, coloring: darker for further away targets
  label: string;
  scanProgressNorm: number;
  textColor?: string;
  color?: string;
  borderColor?: string;
  opacity?: number;
  divElement?: HTMLDivElement;
  divInfo?: HTMLDivElement; // div element for target info
  divInfoLabel?: HTMLDivElement; // div element for target info label
  divInfoDetail?: HTMLDivElement; // div element for target info detail
  combatTriangleSvgs: SVGElement[]; // not using this, slows rendering
  crosshairDivElement?: HTMLDivElement; // div element for crosshair, used for combat targets
  nonCombatCircleDiv?: HTMLDivElement;
  entity?: EnemyMech | SpaceStationMech | EnemyMechGroup | CelestialBody;

  constructor(options: HudTargetOptionsType) {
    const {
      id,
      isActive,
      targetType,
      label,
      textColor,
      color,
      borderColor,
      opacity,
      entity,
    } = options;
    this.id = id;
    this.isDead = false; // true if target is dead - used for enemy mechs
    this.isActive = isActive;
    this.needsUpdate = true; // true if target needs to be updated
    this.targetType = targetType;
    this.screenPosition = {
      xn: 0,
      yn: 0,
      angleDiff: 0,
    };
    this.distanceNorm = 0;
    this.label = label;
    this.scanProgressNorm = 0;
    this.textColor = textColor;
    this.color = color;
    this.borderColor = borderColor;
    this.opacity = opacity;
    //this.divElement = div element refs provided on render of target
    this.combatTriangleSvgs = [];
    //this.nonCombatCircleDiv = nonCombatCircleDiv;
    this.entity = entity;
  }

  isUseCombatTarget(): boolean {
    return (
      this.targetType === HTML_HUD_TARGET_TYPE.ENEMY_COMBAT ||
      this.targetType === HTML_HUD_TARGET_TYPE.ENEMY_TARGETING ||
      this.targetType === HTML_HUD_TARGET_TYPE.ENEMY_GROUP ||
      this.targetType === HTML_HUD_TARGET_TYPE.STATION
    );
  }

  isCombat(): boolean {
    return (
      this.targetType === HTML_HUD_TARGET_TYPE.ENEMY_COMBAT ||
      this.targetType === HTML_HUD_TARGET_TYPE.ENEMY_TARGETING
    );
  }
  /*
  setDivInfoLabelTextContent(label: string): void {
    this.label = label;
    if (this.divInfoLabel) {
      this.divInfoLabel.textContent = label;
    }
  }
*/
  setDivInfoDetailTextContent(info: string): void {
    if (this.divInfoDetail) {
      this.divInfoDetail.textContent = info;
    }
  }

  resetPosition(): void {
    if (!this.divElement) return;
    this.divElement.style.marginLeft = `0px`;
    this.divElement.style.marginTop = `0px`;
  }

  hideTargetSetMarginLeft(): void {
    if (this.divElement) this.divElement.style.marginLeft = `5000px`;
  }

  updateTargetUseFrame(
    camera: THREE.Camera,
    playerPosition: THREE.Vector3,
    selectedHudTargetId: string | null = null
  ): void {
    if (!this.divElement) return;

    let screenPosition = { xn: 0, yn: 0, angleDiff: 0 };
    let targetEntity: any;

    switch (this.targetType) {
      case HTML_HUD_TARGET_TYPE.PLANET:
      case HTML_HUD_TARGET_TYPE.STATION:
      case HTML_HUD_TARGET_TYPE.ENEMY_GROUP:
        targetEntity = this.entity;
        if (targetEntity) {
          // distance label in Au measurement
          this.setDivInfoDetailTextContent(
            getSystemScaleDistanceLabel(
              targetEntity.getRealWorldDistanceTo(playerPosition)
            )
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
          this.isActive = false;
          // exit
          return;
        }
        // display warp star target
        this.isActive = true;
        // set label in Ly measurment
        this.setDivInfoDetailTextContent(
          (useGalaxyMapStore.getState().selectedWarpStarDistance * 7) // TODO standardize this number in galaxy creation - eyeballing average distance between stars to set multiplier
            .toFixed(3) + " Ly"
        );
        // get screen position of target
        screenPosition = getScreenPositionFromDirection(
          camera,
          useGalaxyMapStore.getState().selectedWarpStarDirection!
        );
        // exit loop if not active
        break;

      case HTML_HUD_TARGET_TYPE.ENEMY_COMBAT:
        targetEntity = this.entity;
        let distance = 0;
        if (targetEntity) {
          distance = targetEntity.object3d.position.distanceTo(playerPosition);
          if (distance > 800) {
            this.isActive = false;
            break; // exit loop
          }
          this.distanceNorm = 1; /* Math.max(
                0.1,
                Math.min(
                  1,
                  distance / 1000
                )
              );*/
          screenPosition = getScreenPosition(
            camera,
            targetEntity.object3d.position
          );
        }
        this.isActive =
          selectedHudTargetId === this.id ||
          // set combat target active if within x radian of camera
          screenPosition.angleDiff < 0.15; //2 * this.distanceNorm

        break;

      default:
        console.error("Unknown htmlHudTarget.targetType");
        break;
    }

    this.screenPosition = screenPosition;
  }

  updateTargetStylesUseFrame(
    selectedHudTargetId: string | null,
    focusedHudTargetId: string | null
  ): void {
    const { marginLeftPx, marginTopPx } = useHudTargtingStore
      .getState()
      .hudTargetController.getTargetPosition(
        this.screenPosition.xn,
        this.screenPosition.yn,
        this.screenPosition.angleDiff
      );
    // set position of target div
    if (!this.divElement) return;
    this.divElement.style.marginLeft = `${marginLeftPx}px`;
    this.divElement.style.marginTop = `${marginTopPx}px`;
    // set text labels
    // target text positioning
    if (this.divInfo) {
      this.divInfo.style.right = marginLeftPx <= 0 ? "100%" : "auto";
      this.divInfo.style.left = marginLeftPx > 0 ? "100%" : "auto";
      this.divInfo.style.textAlign = marginLeftPx <= 0 ? "right" : "left";
    }

    if (this.isDead || !this.isActive || !this.divElement) {
      // if not active move off screen
      this.hideTargetSetMarginLeft();
      return;
    } else {
      //this.needsUpdate) {
      const flightHudTargetDiameterPx =
        useHudTargtingStore.getState().flightHudTargetDiameterPx;

      // TODO use undefined for these values instead of null
      const targetIsSelected: boolean =
        selectedHudTargetId !== null && selectedHudTargetId === this.id;

      const targetIsFocused: boolean =
        focusedHudTargetId !== null && focusedHudTargetId === this.id;

      // @ts-ignore - number works fine here
      this.divElement.style.opacity = this.opacity
        ? this.opacity
        : targetIsFocused
        ? 0.9
        : 0.5;

      // triangles or circle
      let targetSize: number;
      if (this.targetType === HTML_HUD_TARGET_TYPE.ENEMY_TARGETING) {
        targetSize = 32; // targeting reticle size
      } else if (this.crosshairDivElement) {
        // combat targets
        if (targetIsSelected || targetIsFocused) {
          targetSize = 24; // selected combat target
        } else {
          targetSize = 12; // non-focused / selected combat target
        }
      } else {
        // non-combat targets
        if (targetIsSelected || targetIsFocused) {
          targetSize = flightHudTargetDiameterPx; // focused / selected non-combat target
        } else {
          targetSize = flightHudTargetDiameterPx * 0.75; // non-focused / selected non-combat target
        }
      }

      targetSize = targetSize * 1; //this.distanceNorm > 0 ? 1 - this.distanceNorm : 1; // scale target size based on distance to target

      // update triangle positions for combat target
      if (this.combatTriangleSvgs.length > 0) {
        const points = [
          [0, -targetSize / 2, "180deg"],
          [-targetSize / 2, targetSize / 2, "45deg"],
          [targetSize / 2, targetSize / 2, "-45deg"],
        ];
        this.combatTriangleSvgs.forEach((triangle, index) => {
          if (triangle) {
            triangle.style.left = `${points[index][0]}px`;
            triangle.style.top = `${points[index][1]}px`;
            triangle.style.marginLeft = `-${6}px`;
            triangle.style.marginTop = `-${9}px`;
            triangle.style.rotate = targetIsSelected
              ? `${points[index][2]}`
              : "0deg";
          }
        });
      }

      // thick border lines for when selected
      if (this.crosshairDivElement) {
        // for each child set the borderWidth style
        this.crosshairDivElement.childNodes.forEach((child) => {
          const box = child as HTMLElement;
          const borderWidth =
            targetIsSelected ||
            this.targetType === HTML_HUD_TARGET_TYPE.ENEMY_TARGETING
              ? "3px"
              : "1px";
          if (box.style) {
            // detect side of border and update
            if (box.style.borderTopWidth)
              box.style.borderTopWidth = borderWidth;
            if (box.style.borderLeftWidth)
              box.style.borderLeftWidth = borderWidth;
            if (box.style.borderRightWidth)
              box.style.borderRightWidth = borderWidth;
            if (box.style.borderBottomWidth)
              box.style.borderBottomWidth = borderWidth;
          }
        });
      }

      // update circle for non-combat target
      if (this.nonCombatCircleDiv || this.crosshairDivElement) {
        const test = this.nonCombatCircleDiv || this.crosshairDivElement;
        if (test) {
          test.style.width = `${targetSize}px`;
          test.style.height = `${targetSize}px`;
          test.style.left = `${-targetSize / 2}px`;
          test.style.top = `${-targetSize / 2}px`;
          if (this.nonCombatCircleDiv)
            test.style.borderWidth = targetIsSelected ? "4px" : "2px";
        }
        if (this.divInfo) {
          this.divInfo.style.backgroundColor = targetIsFocused
            ? "black"
            : "transparent";
          // border?
        }
        if (this.divInfoLabel) {
          this.divInfoLabel.style.opacity = targetIsFocused ? "1" : "0.5";
        }
        if (this.divInfoDetail) {
          this.divInfoDetail.style.display = targetIsFocused ? "block" : "none";
        }
      }
    }
  }
}

export default HudTarget;
