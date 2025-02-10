import Mech from "./Mech";
import mechDesigns from "../equipment/data/mechDesigns";

export interface SpaceStationInt {}

class SpaceStation extends Mech implements SpaceStationInt {
  type: string;
  name: string;
  ports: { x: number; y: number; z: number }[];

  constructor(
    stationMechBPindex: number = 0,
    type: string,
    name: string,
    ports: { x: number; y: number; z: number }[]
  ) {
    super(mechDesigns.station[stationMechBPindex]);
    this.type = type;
    this.name = name;
    this.ports = ports;
  }
}

export default SpaceStation;
