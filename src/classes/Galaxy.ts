import * as THREE from "three";
import useStore from "../stores/store";
import galaxyGen from "../galaxy/galaxyGen";
import { STARS_IN_GALAXY, GALAXY_SIZE } from "../constants/constants";

interface galaxyInt {
  getStarBufferPosition: (starIndex: number) => {
    x: number;
    y: number;
    z: number;
  };
  getDistanceCoordFromStarToStar: (
    fromStar: number,
    toStar: number
  ) => {
    x: number;
    y: number;
    z: number;
  };
  setBackgroundStarsPosition(playerStarIndex: number): void;
}

class Galaxy implements galaxyInt {
  rngSeed: string;
  numStars: number;
  galaxySize: number;
  // for star points of galaxy map
  starCoordsBuffer: THREE.BufferAttribute | null;
  starColorBuffer: THREE.BufferAttribute | null;
  starSizeBuffer: THREE.BufferAttribute | null;
  starSelectedBuffer: THREE.BufferAttribute;
  // for star points background of space flight scene
  starBackgroundCoordsBuffer: THREE.BufferAttribute;
  starBackgroundDistanceSelectedBuffer: THREE.BufferAttribute;

  constructor(
    rngSeed: string = "123456",
    numStars: number = STARS_IN_GALAXY,
    galaxySize: number = GALAXY_SIZE // might not be effecting anything
  ) {
    this.rngSeed = rngSeed;
    this.numStars = numStars;
    this.galaxySize = galaxySize;
    // the following buffer attributes are set in initStars (async)
    this.starCoordsBuffer = null;
    this.starColorBuffer = null;
    this.starSizeBuffer = null;
    // set empty buffer attributes
    this.starSelectedBuffer = new THREE.BufferAttribute(
      new Int8Array(new Array(this.numStars).fill(0)),
      1
    );
    // set background star buffer attributes so that they can be updated
    this.starBackgroundCoordsBuffer = new THREE.BufferAttribute(
      new Float32Array(this.numStars * 3),
      3 // x, y, z values
    );
    this.starBackgroundDistanceSelectedBuffer = new THREE.BufferAttribute(
      new Int8Array(new Array(this.numStars).fill(0)),
      1
    );
  }

  // keeping this as an asynchronous function not called in constructor
  // called in store.initGameStore()
  async initStars() {
    const componentName = "initStars";
    useStore.getState().updateRenderInfo(componentName);
    if (useStore.getState().renderCount[componentName] > 1) {
      console.warn("initStars called more than once");
    }

    galaxyGen(this.numStars, this.galaxySize).then((galaxyData) => {
      // note:memory leaks occur when buffer attributes are replaced, always update them
      this.starCoordsBuffer = galaxyData.starCoordsBuffer;
      this.starColorBuffer = galaxyData.starColorBuffer;
      this.starSizeBuffer = galaxyData.starSizeBuffer;
      useStore.getState().updateRenderDoneInfo(componentName);
    });
  }

  getStarBufferPosition(starIndex: number) {
    if (this.starCoordsBuffer) {
      return {
        x: this.starCoordsBuffer!.array[starIndex * 3],
        y: this.starCoordsBuffer!.array[starIndex * 3 + 1],
        z: this.starCoordsBuffer!.array[starIndex * 3 + 2],
      };
    } else {
      console.warn("starCoordsBuffer not set");
      return { x: 0, y: 0, z: 0 };
    }
  }

  getDistanceCoordFromStarToStar(
    playerStarIndex: number,
    targetStarIndex: number
  ) {
    const playerStarPosition = this.getStarBufferPosition(playerStarIndex);
    const targetStarPosition = this.getStarBufferPosition(targetStarIndex);
    return {
      x: targetStarPosition.x - playerStarPosition.x,
      y: targetStarPosition.y - playerStarPosition.y,
      z: targetStarPosition.z - playerStarPosition.z,
    };
  }

  // call this function when player moves to new star
  setBackgroundStarsPosition(playerStarIndex: number) {
    // compute positions for background stars based on current player star position
    if (this.starCoordsBuffer === null) return;

    for (
      let i = 0;
      i < this.starBackgroundCoordsBuffer.array.length / 3;
      i = i + 1
    ) {
      // get relative distance to star from player star position
      const { x, y, z } = this.getDistanceCoordFromStarToStar(
        playerStarIndex,
        i
      );
      //const distance = Math.sqrt(x * x + y * y + z * z);
      // to show the nebula sprite particles instead of star for far away stars
      this.starBackgroundDistanceSelectedBuffer.array[i] = 0;
      //distance > 40 ? 1 : 0;// not using this for now - TODO fix up stars shader
      this.starBackgroundCoordsBuffer.array[i * 3 + 0] = x;
      this.starBackgroundCoordsBuffer.array[i * 3 + 1] = y;
      this.starBackgroundCoordsBuffer.array[i * 3 + 2] = z;
    }
  }
}

export default Galaxy;
