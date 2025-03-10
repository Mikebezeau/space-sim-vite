import Mech from "./Mech";
import mechDesigns from "../../equipment/data/mechDesigns";

export interface spaceStationMechInt {}

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
}

export default SpaceStationMech;
