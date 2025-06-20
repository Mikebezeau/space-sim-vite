import * as THREE from "three";
import useHudTargtingStore from "../../stores/hudTargetingStore";
import usePlayerControlsStore from "../../stores/playerControlsStore";
import useGalaxyMapStore from "../../stores/galaxyMapStore";
import EnemyMechBoid from "../mech/EnemyMech";
import SpaceStationMech from "../mech/SpaceStationMech";
import EnemyMechGroup from "../mech/EnemyMechGroup";
import CelestialBody from "../solarSystem/CelestialBody";
import {
  getSystemScaleDistanceLabel,
  ifChangedUpdateStyle,
} from "../../util/gameUtil";
import {
  getScreenPosition,
  getScreenPositionFromDirection,
} from "../../util/cameraUtil";
import { GALAXY_AU_DISTANCE_SCALE } from "../../constants/constants";
import { HTML_HUD_TARGET_TYPE } from "../../stores/hudTargetingStore";

export type typeHudTargetOptions = {
  id: string;
  playerControlModeActive: number; // player control mode target is active in
  targetType: number;
  label?: string;
  isShowTargetInfo?: boolean; // true if target info should be shown, no info display for combat targets
  textColor?: string;
  color?: string;
  borderColor?: string;
  opacity?: number;
  entity?: EnemyMechBoid | SpaceStationMech | EnemyMechGroup | CelestialBody;
};

export type typeHtmlElementRefs = {
  // these are set when component is rendered
  divElement?: HTMLDivElement; // main div element for target, used for positioning (transform: translate3d)
  // used for planets, stars, and warp to star targets
  divTargetCircle?: HTMLDivElement; // used for planets, stars, and warp to star targets
  // div element for box crosshair, used for combat targets
  divTargetSquare?: HTMLDivElement; // div element for box crosshair, used for combat targets
  // combat aiming reticule triangles, positioned based on future position of EnemyMechBoid
  divTargetTriangles?: SVGElement[]; // combat aiming reticule triangles, positioned based on future position of EnemyMechBoid
  // text info elements
  divInfo?: HTMLDivElement; // div element for target info
  divInfoLabel?: HTMLDivElement; // div element for target info label
  divInfoDetail?: HTMLDivElement; // div element for target info detail
};

interface HudTargetInt {
  setActiveStatus: () => void; // sets isActive true if target is active
  //setDivInfoLabelTextContent: (label: string) => void;
  setDivInfoDetailTextContent: (label: string) => void; // method to set target detail label
  hideTargetSetOpacity: () => void; // method to hide target by setting opacity 0
  resetPosition: () => void; // method to reset target position
  updateTargetUseFrame: (
    camera: THREE.Camera,
    playerPosition: THREE.Vector3
  ) => void; // method to update target styles in useFrame
  updateTargetStylesUseFrame: (
    selectedHudTargetId: string,
    focusedHudTargetId: string
  ) => void; // method to update target styles in useFrame
}

class HudTarget implements HudTargetInt {
  // options
  id: string; // unique id of target (mech.id for mech combat targets)
  playerControlModeActive: number; // player control mode target is active in
  targetType: number;
  label: string;
  isShowTargetInfo: boolean; // true if target info should be shown, no info display for combat targets
  textColor: string;
  color: string;
  borderColor: string;
  opacity?: number; // overrides opacity of target, if set will be used instead of focused / selected target opacity
  entity?: EnemyMechBoid | SpaceStationMech | EnemyMechGroup | CelestialBody;
  // set in constructor
  isActive: boolean; // true if target is active
  isDead: boolean; // true if target is dead - used for enemy mechs
  screenPosition: {
    xn: number;
    yn: number;
    angleDiff: number;
  }; // used to sort targets and limit combat targets
  distanceFromPlayer: number; // used for combat target, coloring: darker for further away targets
  scanProgressNorm: number;
  //
  htmlElementRefs: typeHtmlElementRefs;
  /*
  divElement?: HTMLDivElement; // main div element for target, used for positioning (transform: translate3d)
  divTargetCircle?: HTMLDivElement; // used for planets, stars, and warp to star targets
  divTargetSquare?: HTMLDivElement; // div element for box crosshair, used for combat targets
  divTargetTriangles: SVGElement[]; // combat aiming reticule triangles, positioned based on future position of EnemyMechBoid
  // set in render
  divInfo?: HTMLDivElement; // div element for target info
  divInfoLabel?: HTMLDivElement; // div element for target info label
  divInfoDetail?: HTMLDivElement; // div element for target info detail
*/
  constructor(options: typeHudTargetOptions) {
    const {
      id,
      playerControlModeActive,
      targetType,
      label,
      isShowTargetInfo,
      textColor,
      color,
      borderColor,
      opacity,
      entity,
    } = options;
    this.id = id;
    this.playerControlModeActive = playerControlModeActive; // player action mode target is active in
    this.isDead = false; // true if target is dead - used for enemy mechs
    this.targetType = targetType;
    this.label = label || "";
    this.isShowTargetInfo = isShowTargetInfo || true;
    this.textColor = textColor || "white";
    this.color = color || "transparent";
    this.borderColor = borderColor || "white";
    this.opacity = opacity;
    this.entity = entity;

    this.screenPosition = {
      xn: 0,
      yn: 0,
      angleDiff: 0,
    };
    this.distanceFromPlayer = 0;
    this.scanProgressNorm = 0;
    // div element refs provided on render of target
    this.htmlElementRefs = {};
  }

  setActiveStatus() {
    let isActive = false; // default to not active
    // active if player is in scan mode
    if (
      !this.isDead &&
      this.playerControlModeActive ===
        usePlayerControlsStore.getState().playerControlMode
    ) {
      if (this.targetType === HTML_HUD_TARGET_TYPE.WARP_TO_STAR) {
        isActive = useGalaxyMapStore.getState().selectedWarpStar !== null;
      } else {
        isActive = true;
      }
    }
    this.isActive = isActive;
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
    if (this.htmlElementRefs.divInfoDetail) {
      this.htmlElementRefs.divInfoDetail.textContent = info;
    }
  }

  resetPosition(): void {
    this.screenPosition = { xn: 0, yn: 0, angleDiff: 0 };
    ifChangedUpdateStyle(
      this.htmlElementRefs.divElement,
      "transform",
      "translate3d(0px, 0px, 0)"
    );
    if (!this.htmlElementRefs.divElement) return;
  }

  hideTargetSetOpacity(): void {
    ifChangedUpdateStyle(this.htmlElementRefs.divElement, "opacity", "0");
  }

  updateTargetUseFrame(
    camera: THREE.Camera,
    playerPosition: THREE.Vector3
  ): void {
    this.screenPosition = { xn: 0, yn: 0, angleDiff: 10 }; // angleDiff for sorting to find focused target

    if (!this.htmlElementRefs.divElement) return;

    this.setActiveStatus();

    if (!this.isActive) {
      return;
    }

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
          this.screenPosition = getScreenPosition(
            camera,
            targetEntity.getRealWorldPosition()
          );
        }
        break;

      case HTML_HUD_TARGET_TYPE.WARP_TO_STAR:
        if (useGalaxyMapStore.getState().selectedWarpStar !== null) {
          // set label in Ly measurment
          this.setDivInfoDetailTextContent(
            (
              useGalaxyMapStore.getState().selectedWarpStarDistance *
              GALAXY_AU_DISTANCE_SCALE
            ).toFixed(3) + " Ly"
          );
          // get screen position of target
          this.screenPosition = getScreenPositionFromDirection(
            camera,
            useGalaxyMapStore.getState().selectedWarpStarDirection!
          );
        }
        // exit loop if not active
        break;

      default:
        console.error("Unknown htmlHudTarget.targetType");
        break;
    }
  }

  updateTargetStylesUseFrame(
    selectedHudTargetId: string | null,
    focusedHudTargetId: string | null
  ): void {
    if (!this.htmlElementRefs.divElement) return;
    if (!this.isActive) {
      // if not active move off screen
      this.hideTargetSetOpacity();
      return;
    }

    // set position of target div
    const { transformX, transformY } = useHudTargtingStore
      .getState()
      .hudTargetController.getTargetPosition(
        this.screenPosition.xn,
        this.screenPosition.yn,
        this.screenPosition.angleDiff
      );
    this.htmlElementRefs.divElement.style.transform = `translate3d(${transformX}px, ${transformY}px, 0)`;

    const targetIsFocused: boolean = focusedHudTargetId === this.id;

    ifChangedUpdateStyle(
      this.htmlElementRefs.divElement,
      "opacity",
      // @ts-ignore - number assignment to opacity works fine
      this.opacity ? this.opacity : targetIsFocused ? 0.9 : 0.5
    );

    if (this.isShowTargetInfo && this.htmlElementRefs.divInfo) {
      ifChangedUpdateStyle(
        this.htmlElementRefs.divInfo,
        "backgroundColor",
        targetIsFocused ? "black" : "transparent"
      );

      ifChangedUpdateStyle(
        this.htmlElementRefs.divInfo,
        "right",
        transformX <= 0 ? "100%" : "auto"
      );

      ifChangedUpdateStyle(
        this.htmlElementRefs.divInfo,
        "left",
        transformX > 0 ? "100%" : "auto"
      );

      ifChangedUpdateStyle(
        this.htmlElementRefs.divInfo,
        "textAlign",
        transformX <= 0 ? "right" : "left"
      );

      if (this.htmlElementRefs.divInfoLabel) {
        ifChangedUpdateStyle(
          this.htmlElementRefs.divInfoLabel,
          "opacity",
          targetIsFocused ? "1" : "0.5"
        );
      }
      if (this.htmlElementRefs.divInfoDetail) {
        ifChangedUpdateStyle(
          this.htmlElementRefs.divInfoDetail,
          "opacity",
          targetIsFocused ? "1" : "0"
        );
      }
    }

    // update, circle target only used with basic non-combat target
    if (this.htmlElementRefs.divTargetCircle) {
      const flightHudTargetDiameterPx =
        useHudTargtingStore.getState().flightHudTargetDiameterPx;

      const targetIsSelected: boolean =
        selectedHudTargetId !== null && selectedHudTargetId === this.id;

      let targetSize: number;
      // non-combat targets
      if (targetIsSelected || targetIsFocused) {
        targetSize = flightHudTargetDiameterPx; // focused / selected non-combat target
      } else {
        targetSize = flightHudTargetDiameterPx * 0.75; // non-focused / selected non-combat target
      }
      targetSize = targetSize * 1; //this.distanceFromPlayer > 0 ? 1 - this.distanceFromPlayer : 1; // scale target size based on distance to target

      ifChangedUpdateStyle(
        this.htmlElementRefs.divTargetCircle,
        "width",
        `${targetSize}px`
      );
      ifChangedUpdateStyle(
        this.htmlElementRefs.divTargetCircle,
        "height",
        `${targetSize}px`
      );
      ifChangedUpdateStyle(
        this.htmlElementRefs.divTargetCircle,
        "left",
        `${-targetSize / 2}px`
      );
      ifChangedUpdateStyle(
        this.htmlElementRefs.divTargetCircle,
        "top",
        `${-targetSize / 2}px`
      );

      ifChangedUpdateStyle(
        this.htmlElementRefs.divTargetCircle,
        "borderWidth",
        targetIsSelected ? "4px" : "2px"
      );
    }
  }
}

export default HudTarget;
