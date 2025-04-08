import { Vector3 } from "three";
import Mech from "./Mech";
import mechDesigns from "../../equipment/data/mechDesigns";

export interface spaceStationMechInt {
  getRealWorldPosition(): void;
  getRealWorldDistanceTo(fromPosition: Vector3): void;
  getWarpToDistanceAway(): number;
  getMinDistanceAllowWarp(): number;
}

class SpaceStationMech extends Mech implements spaceStationMechInt {
  realWorldPosition: Vector3;
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
    this.realWorldPosition = new Vector3();
    this.type = type;
    this.name = name;
    this.ports = ports;
  }

  getRealWorldPosition() {
    this.object3d.getWorldPosition(this.realWorldPosition);
    return this.realWorldPosition;
  }

  getRealWorldDistanceTo(fromPosition: Vector3) {
    return this.getRealWorldPosition().distanceTo(fromPosition);
  }

  getWarpToDistanceAway() {
    return this.maxHalfWidth * 3;
  }

  getMinDistanceAllowWarp() {
    return this.maxHalfWidth * 9;
  }
}

export default SpaceStationMech;
