import { create } from "zustand";
import * as THREE from "three";
import useStore from "./store";
import usePlayerControlsStore from "./playerControlsStore";
//import useEnemyStore from "./enemyStore";

interface hudTargetingGalaxyMapStoreState {
  // declare type for dictionary object
  //testDictionary: { [id: string]: boolean };
  showInfoHoveredStarIndex: number | null;
  showInfoTargetStarIndex: number | null;
  selectedWarpStar: number | null;

  selectedWarpStarDirection: THREE.Vector3 | null;
  setSelectedWarpStarDirection: () => void;
  focusTargetIndex: number | null;
  selectedTargetIndex: number | null;
  focusPlanetIndex: number | null;
  selectedPanetIndex: number | null;
  getTargets: () => {
    focusPlanetIndex: number | null;
    selectedPanetIndex: number | null;
    focusTargetIndex: number | null;
    selectedTargetIndex: number | null;
  };
  clearTargets: () => void;

  checkScanDistanceToPlanet: (planetIndex: number) => void;
  scanningPlanetId: number;
  isScanDistanceToPlanet: boolean;
  scanPlanet: () => void;
  scanPlanetProgress: number;
  // TODO clean up actions - what are actions?
  actions: {
    setFocusPlanetIndex: (focusPlanetIndex: number | null) => void;
    setFocusTargetIndex: (focusTargetIndex: number | null) => void;
    setSelectedTargetIndex: () => void;

    setShowInfoHoveredStarIndex: (
      showInfoHoveredStarIndex: number | null
    ) => void;
    getShowInfoTargetStarIndex: () => number | null;
    setShowInfoTargetStarIndex: (showInfoTargetStarIndex: number) => void;
    setSelectedWarpStar: (selectedWarpStar: number | null) => void;
    setSelectedPanetIndex: (planetIndex: number | null) => void;
  };
}

// reusable objects
// for targeting weapons fireWeapon()
const flightCameraLookQuaternoin = new THREE.Quaternion();

const useHudTargtingGalaxyMapStore = create<hudTargetingGalaxyMapStoreState>()(
  (set, get) => ({
    // for galaxy map
    showInfoHoveredStarIndex: null, // used in galaxy map ui
    showInfoTargetStarIndex: null,
    selectedWarpStar: null,

    // targeting
    selectedWarpStarDirection: null,
    setSelectedWarpStarDirection: () => {
      if (get().selectedWarpStar !== null) {
        const warpStarDirection = useStore
          .getState()
          .getStarPositionIsBackground(get().selectedWarpStar!);
        // background star scene is rotated 90 degrees, so adjust direction
        const directionVec3 = new THREE.Vector3(
          warpStarDirection.x,
          warpStarDirection.y,
          warpStarDirection.z
        );
        const rotateVec3 = new THREE.Vector3(1, 0, 0);
        directionVec3.applyAxisAngle(rotateVec3, Math.PI / 2);
        set({
          selectedWarpStarDirection: directionVec3.normalize(),
        });
      } else {
        set({
          selectedWarpStarDirection: null,
        });
      }
    },
    focusTargetIndex: null,
    selectedTargetIndex: null,
    focusPlanetIndex: null,
    selectedPanetIndex: null,
    getTargets: () => {
      return {
        focusPlanetIndex: get().focusPlanetIndex,
        selectedPanetIndex: get().selectedPanetIndex,
        focusTargetIndex: get().focusTargetIndex,
        selectedTargetIndex: get().selectedTargetIndex,
      };
    },
    clearTargets: () => {
      set(() => ({
        focusPlanetIndex: null,
        selectedPanetIndex: null,
        focusTargetIndex: null,
        selectedTargetIndex: null,
        showInfoTargetStarIndex: null,
      }));
    },

    checkScanDistanceToPlanet: (planetIndex) => {
      if (get().scanningPlanetId !== planetIndex) {
        set({ scanningPlanetId: planetIndex });
        set({ scanPlanetProgress: 0 });
      }
      const playerWorldPosition = useStore.getState().playerWorldPosition;
      const planet = useStore.getState().planets[planetIndex];
      if (planet) {
        // warp to planet distance is planet.radius * 2
        const isScanDistanceToPlanet =
          planet.object3d.position.distanceTo(playerWorldPosition) <
          planet.radius * 3;
        if (isScanDistanceToPlanet !== get().isScanDistanceToPlanet) {
          set({ isScanDistanceToPlanet });
        }
      }
    },

    scanningPlanetId: -1,
    isScanDistanceToPlanet: false,
    scanPlanet: () => {
      if (get().scanPlanetProgress < 10) {
        const incrementScanProgress = () => {
          set((state) => ({
            scanPlanetProgress: state.scanPlanetProgress + 0.5,
          }));
          if (get().scanPlanetProgress < 10) {
            setTimeout(incrementScanProgress, 100);
          }
        };
        incrementScanProgress();
      }
    },
    scanPlanetProgress: 0,
    actions: {
      setFocusPlanetIndex(focusPlanetIndex) {
        if (get().focusPlanetIndex !== focusPlanetIndex) {
          set(() => ({ focusPlanetIndex }));
        }
      },
      setFocusTargetIndex(focusTargetIndex) {
        if (get().focusTargetIndex !== focusTargetIndex) {
          set(() => ({ focusTargetIndex }));
        }
      },
      setSelectedTargetIndex() {
        flightCameraLookQuaternoin.setFromAxisAngle(
          {
            x:
              usePlayerControlsStore.getState().flightCameraLookRotation
                .rotateY * 0.4,
            y:
              usePlayerControlsStore.getState().flightCameraLookRotation
                .rotateX * 0.4,
            z: 0,
          },
          Math.PI / 2
        ); //.normalize();//angle isn't big enough to need normalization
        useStore.getState().player.fireWeapon(flightCameraLookQuaternoin);
        //make work for enemies as well
        //set new target for current shooter
        let targetIndex: number | null = null;
        if (get().selectedTargetIndex !== get().focusTargetIndex) {
          targetIndex = get().focusTargetIndex;
        } /* else {
        useWeaponFireStore
          .getState()
          .actions.cancelWeaponFire(get().player.mechBP);
      }*/
        if (targetIndex !== null) {
          set(() => ({
            selectedTargetIndex: targetIndex,
          }));
        } /*
      useWeaponFireStore.getState().actions.shoot(
        get().player.mechBP,
        get().player,
        targetIndex === null
          ? null
          : useEnemyStore.getState().enemies[targetIndex],
        false, // auto fire
        false, // auto aim
        true // isPlayer
      );*/
      },
      setShowInfoHoveredStarIndex(showInfoHoveredStarIndex) {
        set(() => ({ showInfoHoveredStarIndex }));
      },
      getShowInfoTargetStarIndex: () => get().showInfoTargetStarIndex,
      setShowInfoTargetStarIndex(showInfoTargetStarIndex) {
        set(() => ({ showInfoTargetStarIndex }));
      },
      setSelectedWarpStar(selectedWarpStar) {
        set(() => ({ selectedWarpStar }));
        get().setSelectedWarpStarDirection();
      },
      // TODO setSelectedPanetIndex not used - using setFocusPlanetIndex instead
      setSelectedPanetIndex(planetIndex) {
        set(() => ({ selectedPanetIndex: planetIndex }));
      },
    },
  })
);

export default useHudTargtingGalaxyMapStore;
