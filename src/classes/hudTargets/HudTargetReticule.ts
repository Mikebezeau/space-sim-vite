import * as THREE from "three";
import useHudTargtingStore, {
  HTML_HUD_TARGET_TYPE,
} from "../../stores/hudTargetingStore";
import HudTarget, { typeHudTargetOptions } from "./HudTarget";
import EnemyMechBoid from "../mech/EnemyMechBoid";
import { ifChangedUpdateStyle } from "../../util/gameUtil";
import { getScreenPosition } from "../../util/cameraUtil";

class HudTargetReticule extends HudTarget {
  constructor(options: typeHudTargetOptions) {
    super(options);
    this.isShowTargetInfo = false; // reticule does not show target info
    this.htmlElementRefs = { divTargetTriangles: [] }; // initialize with empty array for triangles
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
    if (
      this.htmlElementRefs.divTargetTriangles &&
      this.htmlElementRefs.divTargetTriangles.length > 0
    ) {
      const targetIsLocked: boolean = selectedHudTargetId !== null;

      let targetSize: number = 32;
      targetSize = targetSize * 1; //this.distanceFromPlayer > 0 ? 1 - this.distanceFromPlayer : 1; // scale target size based on distance to target

      const points: [number, number, string][] = [
        [0, -targetSize / 2, "180deg"],
        [-targetSize / 2, targetSize / 2, "45deg"],
        [targetSize / 2, targetSize / 2, "-45deg"],
      ];
      this.htmlElementRefs.divTargetTriangles.forEach((triangle, index) => {
        if (triangle) {
          //x = `${points[index][0] - 6}px`;
          //y = `${points[index][1] - 9}px`;
          const transform =
            `translate3d(${points[index][0] - 6}px, ${
              points[index][1] - 9
            }px, 0)` +
            (targetIsLocked ? ` rotate(${points[index][2]})` : " rotate(0deg)");
          ifChangedUpdateStyle(triangle, "transform", transform);
        }
      });
    }
  }
}

export default HudTargetReticule;
