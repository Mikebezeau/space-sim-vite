import useHudTargtingStore from "../../stores/hudTargetingStore";
import EnemyMech from "../mech/EnemyMech";
import SpaceStationMech from "../mech/SpaceStationMech";
import EnemyMechGroup from "../mech/EnemyMechGroup";
import CelestialBody from "../solarSystem/CelestialBody";
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
  updateTargetUseFrame: (
    selectedHudTargetId: string,
    focusedHudTargetId: string
  ) => void; // method to update target styles in useFrame
}

class HudTarget implements HudTargetInt {
  id: string;
  isDead: boolean; // true if target is dead - used for enemy mechs
  isActive: boolean; // hides target if false
  needsUpdate: boolean; // true if target needs to be updated
  targetType: number;
  viewAngle: number; // used to sort targets and limit combat targets
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
  combatTriangleSvgs: SVGElement[];
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
    this.viewAngle = 0;
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
      this.targetType === HTML_HUD_TARGET_TYPE.ENEMY_GROUP ||
      this.targetType === HTML_HUD_TARGET_TYPE.STATION
    );
  }

  isCombat(): boolean {
    return this.targetType === HTML_HUD_TARGET_TYPE.ENEMY_COMBAT;
  }

  updateTargetUseFrame(
    selectedHudTargetId: string | null,
    focusedHudTargetId: string | null
  ): void {
    if (this.isDead || !this.isActive || !this.divElement) {
      // if not active move off screen
      if (this.divElement) this.divElement.style.marginLeft = `5000px`;
      return;
    } else {
      //this.needsUpdate) {
      const flightHudTargetDiameterPx =
        useHudTargtingStore.getState().flightHudTargetDiameterPx;

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
      let targetSize: number =
        this.combatTriangleSvgs.length > 0
          ? // combat targets
            targetIsSelected || targetIsFocused
            ? 24 // selected combat target
            : 12 // non-focused / seleced combat target
          : // non-combat targets
          targetIsSelected || targetIsFocused
          ? flightHudTargetDiameterPx // focused / seleced non-combat target
          : flightHudTargetDiameterPx * 0.75; // non-focused / seleced non-combat target

      targetSize = targetSize * 1; //this.distanceNorm > 0 ? 1 - this.distanceNorm : 1; // scale target size based on distance to target

      // update triangle positions for combat target
      const points = [
        [0, -targetSize / 2, "180deg"],
        [-targetSize / 2, targetSize / 2, "45deg"],
        [targetSize / 2, targetSize / 2, "-45deg"],
      ];

      if (this.combatTriangleSvgs.length > 0) {
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

      // update circle for non-combat target
      if (this.nonCombatCircleDiv) {
        this.nonCombatCircleDiv.style.width = `${targetSize}px`;
        this.nonCombatCircleDiv.style.height = `${targetSize}px`;
        this.nonCombatCircleDiv.style.left = `${-targetSize / 2}px`;
        this.nonCombatCircleDiv.style.top = `${-targetSize / 2}px`;
        this.nonCombatCircleDiv.style.borderWidth = targetIsSelected
          ? "4px"
          : "2px";
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
