import * as THREE from "three";
import HudTarget, { HudTargetOptionsType } from "./HudTarget";
import { HTML_HUD_TARGET_TYPE } from "../../stores/hudTargetingStore";
import { getScreenPosition } from "../../util/cameraUtil";
import EnemyMechBoid from "../mech/EnemyMechBoid";

class HudCombatTarget extends HudTarget {
  constructor(options: HudTargetOptionsType) {
    super(options);
    if (this.targetType === HTML_HUD_TARGET_TYPE.ENEMY_COMBAT) {
      this.isShowTargetInfo = false; // combat targets do not show target info
    }
  }

  updateTargetUseFrame(
    camera: THREE.Camera,
    playerPosition: THREE.Vector3,
    selectedHudTargetId: string | null = null
  ): void {
    if (this.targetType !== HTML_HUD_TARGET_TYPE.ENEMY_COMBAT) {
      super.updateTargetUseFrame(camera, playerPosition, selectedHudTargetId);
    } else {
      if (this.isDead) {
        this.isActive = false; // hide target if dead
      } else {
        let targetEntity = this.entity as EnemyMechBoid | undefined;
        let distance = 0;
        if (targetEntity) {
          distance = targetEntity.object3d.position.distanceTo(playerPosition);
          if (distance > 800) {
            this.isActive = false;
          } else {
            this.distanceFromPlayer = distance;
            this.screenPosition = getScreenPosition(
              camera,
              targetEntity.object3d.position
            );
            this.isActive =
              selectedHudTargetId === this.id ||
              // set combat target active if within x radian of camera
              this.screenPosition.angleDiff < 0.15; //2 * this.distanceFromPlayer
          }
        }
      }
    }
  }

  updateTargetStylesUseFrame(
    selectedHudTargetId: string | null,
    focusedHudTargetId: string | null
  ): void {
    super.updateTargetStylesUseFrame(selectedHudTargetId, focusedHudTargetId);

    // thick border lines for when selected
    if (this.divTargetSquare) {
      const targetIsSelected: boolean = selectedHudTargetId === this.id;

      const targetIsFocused: boolean = focusedHudTargetId === this.id;

      let targetSize: number;

      if (targetIsSelected || targetIsFocused) {
        targetSize = 24; // selected combat target
      } else {
        targetSize = 12; // non-focused / selected combat target
      }

      targetSize = targetSize * 1; //this.distanceFromPlayer > 0 ? 1 - this.distanceFromPlayer : 1; // scale target size based on distance to target

      this.divTargetSquare.style.width = `${targetSize}px`;
      this.divTargetSquare.style.height = `${targetSize}px`;
      this.divTargetSquare.style.left = `${-targetSize / 2}px`;
      this.divTargetSquare.style.top = `${-targetSize / 2}px`;
      // for each child set the borderWidth style
      this.divTargetSquare.childNodes.forEach((child) => {
        const box = child as HTMLElement;
        const borderWidth =
          targetIsSelected ||
          this.targetType === HTML_HUD_TARGET_TYPE.ENEMY_TARGETING
            ? "3px"
            : "1px";
        if (box.style) {
          // detect side of border and update
          if (box.style.borderTopWidth) box.style.borderTopWidth = borderWidth;
          if (box.style.borderLeftWidth)
            box.style.borderLeftWidth = borderWidth;
          if (box.style.borderRightWidth)
            box.style.borderRightWidth = borderWidth;
          if (box.style.borderBottomWidth)
            box.style.borderBottomWidth = borderWidth;
        }
      });
    }
  }
}

export default HudCombatTarget;
