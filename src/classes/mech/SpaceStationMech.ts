import { Vector3 } from "three";
import Mech from "./Mech";
import mechDesigns from "../../equipment/data/mechDesigns";

export interface spaceStationMechInt {
  getWarpToDistanceAway(): number;
  getMinDistanceAllowWarp(): number;
}

class SpaceStationMech extends Mech implements spaceStationMechInt {
  type: string;
  name: string;
  ports: { x: number; y: number; z: number }[];

  constructor(
    stationMechBPindex: number = 0,
    type: string,
    name: string,
    ports: { x: number; y: number; z: number }[]
  ) {
    super(
      mechDesigns.station[stationMechBPindex],
      false,
      false,
      true // isStation
    );
    this.type = type;
    this.name = name;
    this.ports = ports;
  }

  getWarpToDistanceAway() {
    return this.maxHalfWidth * 3;
  }

  getMinDistanceAllowWarp() {
    return this.maxHalfWidth * 9;
  }
}

export default SpaceStationMech;
