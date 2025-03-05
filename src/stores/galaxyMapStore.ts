import { create } from "zustand";
import * as THREE from "three";
import useStore from "./store";

interface galaxyMapStoreState {
  // note: reminder how to declare type for dictionary object
  //testDictionary: { [id: string]: boolean };
  showInfoHoveredStarIndex: number | null;
  showInfoTargetStarIndex: number | null;
  showInfoPlanetIndex: number | null;
  selectedWarpStar: number | null;
  galaxyMapActions: {
    setShowInfoHoveredStarIndex: (
      showInfoHoveredStarIndex: number | null
    ) => void;
    getShowInfoTargetStarIndex: () => number | null;
    setShowInfoTargetStarIndex: (showInfoTargetStarIndex: number) => void;
    setShowInfoPanetIndex: (planetIndex: number | null) => void;
    setSelectedWarpStar: (selectedWarpStar: number | null) => void;
  };

  selectedWarpStarDistance: number;
  selectedWarpStarDirection: THREE.Vector3 | null;
  setSelectedWarpStarDirection: () => void;
}

const useGalaxyMapStore = create<galaxyMapStoreState>()((set, get) => ({
  // for galaxy map
  showInfoHoveredStarIndex: null, // used in galaxy map ui
  showInfoTargetStarIndex: null,
  showInfoPlanetIndex: null,
  selectedWarpStar: null,
  galaxyMapActions: {
    setShowInfoHoveredStarIndex(showInfoHoveredStarIndex) {
      set(() => ({ showInfoHoveredStarIndex }));
    },
    getShowInfoTargetStarIndex: () => get().showInfoTargetStarIndex,
    setShowInfoTargetStarIndex(showInfoTargetStarIndex) {
      set(() => ({ showInfoTargetStarIndex }));
    },
    // TODO setSelectedPanetIndex not used, plan to use for detailed planet data in Galaxy Map
    setShowInfoPanetIndex(planetIndex) {
      set(() => ({ showInfoPlanetIndex: planetIndex }));
    },
    setSelectedWarpStar(selectedWarpStar) {
      set(() => ({ selectedWarpStar }));
      get().setSelectedWarpStarDirection();
    },
  },

  selectedWarpStarDistance: 0,
  selectedWarpStarDirection: null,
  setSelectedWarpStarDirection: () => {
    if (
      useStore.getState().playerCurrentStarIndex !== null &&
      get().selectedWarpStar !== null
    ) {
      const warpStarDirection = useStore
        .getState()
        .galaxy.getDistanceCoordFromStarToStar(
          useStore.getState().playerCurrentStarIndex!,
          get().selectedWarpStar!
        );
      // background star scene is rotated 90 degrees, so adjust direction
      const directionVec3 = new THREE.Vector3(
        warpStarDirection.x,
        warpStarDirection.y,
        warpStarDirection.z
      );
      set({
        selectedWarpStarDistance: directionVec3.length(),
      });
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
}));

export default useGalaxyMapStore;
