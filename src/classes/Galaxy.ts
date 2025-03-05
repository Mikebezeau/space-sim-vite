import * as THREE from "three";
import useStore from "../stores/store";
// TODO move galaxyGen function inside Galaxy class
import galaxyGen from "../galaxy/galaxyGen";
import { STARS_IN_GALAXY, GALAXY_SIZE } from "../constants/constants";

interface galaxyInt {
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
    galaxySize: number = GALAXY_SIZE
    //galaxyScale?: number, onlyCore?: boolean, onlyArms?: boolean
    // TODO if galaxyScale used, need to adjust
    // distance dimming in starPointsShader (mvPosition.z * 0.06)
    // and also distance checking in setBackgroundStarsPosition if implimented
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

  async initStars() {
    // note: only run this once
    const componentName = "initStars";
    useStore.getState().updateRenderInfo(componentName); // timing initStars
    galaxyGen(this.numStars, this.galaxySize).then((galaxyData) => {
      // note:memory leaks occur when buffer attributes are replaced, always update them
      this.starCoordsBuffer = galaxyData.starCoordsBuffer;
      this.starColorBuffer = galaxyData.starColorBuffer;
      this.starSizeBuffer = galaxyData.starSizeBuffer;
      useStore.getState().updateRenderDoneInfo(componentName);
    });
  }

  // call this function when player moves to new star
  setBackgroundStarsPosition(playerStarIndex: number) {
    // compute positions for background stars based on current player star position
    if (this.starCoordsBuffer === null) return;

    // TODO move getDistanceCoordToBackgroundStar to this class
    const getDistanceCoordToBackgroundStar =
      useStore.getState().getDistanceCoordToBackgroundStar;

    for (
      let i = 0;
      i < this.starBackgroundCoordsBuffer.array.length / 3;
      i = i + 1
    ) {
      // get relative distance to star from player star position
      const { x, y, z } = getDistanceCoordToBackgroundStar(i, playerStarIndex);
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
