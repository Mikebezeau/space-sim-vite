import * as THREE from "three";
import useHudTargtingStore from "../../stores/hudTargetingStore";
import HudTarget, { HudTargetOptionsType } from "./HudTarget";
import { HTML_HUD_TARGET_TYPE } from "../../stores/hudTargetingStore";
import { getScreenPosition } from "../../util/cameraUtil";
import EnemyMechBoid from "../mech/EnemyMechBoid";

class HudTargetReticule extends HudTarget {
  constructor(options: HudTargetOptionsType) {
    super(options);
    this.isShowTargetInfo = false; // reticule does not show target info
  }

  updateTargetUseFrame(
    camera: THREE.Camera,
    playerPosition: THREE.Vector3
  ): void {
    // if in combat mode update reticule position based on targeted mech
    super.setActiveStatus(); // if in combat mode, reticule is set to active
    if (this.isActive) {
      const targetedMechTarget = useHudTargtingStore
        .getState()
        .hudTargetController.getSelectedHudTarget();
      if (targetedMechTarget === undefined) {
        return;
      }
      // get future position of targeted mech
      const targetedMechEntity = targetedMechTarget.entity as
        | EnemyMechBoid
        | undefined;
      if (
        // ensure valid targetedMechEntity
        targetedMechEntity === undefined ||
        targetedMechTarget.targetType !== HTML_HUD_TARGET_TYPE.ENEMY_COMBAT
      ) {
        useHudTargtingStore.getState().setSelectedHudTargetId(null);
        this.resetPosition(); // place reticule back in middle of screen
      } else {
        if (playerPosition !== undefined && camera !== undefined) {
          const distance = playerPosition.distanceTo(
            targetedMechEntity.object3d.position
          );
          const timeToHit = distance / 500; // in seconds //TODO using beam speed for test
          this.screenPosition = getScreenPosition(
            camera,
            targetedMechEntity.getFuturePosition(timeToHit)
          );
        }
      }
    }
  }

  updateTargetStylesUseFrame(
    selectedHudTargetId: string | null,
    focusedHudTargetId: string | null
  ): void {
    super.updateTargetStylesUseFrame(selectedHudTargetId, focusedHudTargetId);

    // update triangle positions for triangles
    if (this.divTargetTriangles.length > 0) {
      const targetIsLocked: boolean = selectedHudTargetId !== null;

      let targetSize: number = 32;
      targetSize = targetSize * 1; //this.distanceFromPlayer > 0 ? 1 - this.distanceFromPlayer : 1; // scale target size based on distance to target

      const points: [number, number, string][] = [
        [0, -targetSize / 2, "180deg"],
        [-targetSize / 2, targetSize / 2, "45deg"],
        [targetSize / 2, targetSize / 2, "-45deg"],
      ];
      this.divTargetTriangles.forEach((triangle, index) => {
        if (triangle) {
          const left = `${points[index][0] - 6}px`;
          const top = `${points[index][1] - 9}px`;
          if (triangle.style.left !== left) triangle.style.left = left;
          if (triangle.style.top !== top) triangle.style.top = top;
          //triangle.style.marginLeft = `-${6}px`;
          //triangle.style.marginTop = `-${9}px`;
          // transform is animated transition
          triangle.style.transform = targetIsLocked
            ? `rotate(${points[index][2]})`
            : "rotate(0deg)";
        }
      });
    }
  }
}

export default HudTargetReticule;
