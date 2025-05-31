import * as THREE from "three";
import useHudTargtingStore from "../../stores/hudTargetingStore";
import usePlayerControlsStore from "../../stores/playerControlsStore";
import HudTarget, { HudTargetOptionsType } from "./HudTarget";
import { HTML_HUD_TARGET_TYPE } from "../../stores/hudTargetingStore";
import { getScreenPosition } from "../../util/cameraUtil";
import EnemyMechBoid from "../mech/EnemyMechBoid";
import { FPS, PLAYER } from "../../constants/constants";
import { setCustomData } from "r3f-perf";

class HudTargetReticule extends HudTarget {
  constructor(options: HudTargetOptionsType) {
    super(options);
  }

  isUseCombatTarget(): boolean {
    return true;
  }

  isCombat(): boolean {
    return true;
  }

  updateTargetUseFrame(
    camera: THREE.Camera,
    playerPosition: THREE.Vector3
  ): void {
    // if in combat mode update reticule position based on targeted mech
    if (
      usePlayerControlsStore.getState().playerControlMode ===
      PLAYER.controls.combat
    ) {
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
        targetedMechTarget.targetType !== HTML_HUD_TARGET_TYPE.ENEMY_COMBAT ||
        targetedMechEntity.isExploding() //TODO still need this?
      ) {
        useHudTargtingStore.getState().setSelectedHudTargetId(null);
        this.resetPosition(); // place reticule back in middle of screen
      } else {
        if (playerPosition !== undefined && camera !== undefined) {
          const distance = playerPosition.distanceTo(
            targetedMechEntity.object3d.position
          );
          const timeToHit = distance / 500; // in seconds //TODO using beam speed for test
          // TODO solve slowdown issues
          const futurePosition =
            targetedMechEntity.getFuturePosition(timeToHit);
          this.screenPosition = getScreenPosition(camera, futurePosition);
          this.isActive = true;
          //setCustomData(timeToHit);
        }
      }
    }
  }
}

export default HudTargetReticule;
