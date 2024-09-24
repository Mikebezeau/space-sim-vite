import { useRef } from "react";
import useStore from "../stores/store";
//import { BrightnessContrast, EffectComposer, SSAO } from 'react-postprocessing'
import ExternalGrid from "./ExternalGrid";
import Floor from "./Floor";
import GridsContainer from "./GridsContainer";
import useMainUIStore from "./useMainUIStore";
import ZoomController from "./zoomEffects/ZoomController";
import BuildMech from "../3d/BuildMech";
import { SCALE } from "../constants/constants";

export default function UiMainScene() {
  console.log("MainUIScene rendered");
  const { itemsPrivateLocker, itemsShareLocker, itemsSam } = useMainUIStore(
    (state) => state
  );
  const stations = useStore((state) => state.stations);

  const buildMechRef = useRef();

  return (
    <>
      <hemisphereLight intensity={2} />
      <ambientLight intensity={2} />
      <pointLight position={[40, 40, 40]} intensity={2} />
      <color attach="background" args={["#2A3C47"]} />
      <GridsContainer briefcases={itemsPrivateLocker()} />
      <ExternalGrid
        items={itemsShareLocker()}
        position={[-10, -1, 10]}
        baseIndex={itemsPrivateLocker.length}
      />
      <ExternalGrid
        items={itemsSam()}
        position={[6, -1, 10]}
        baseIndex={itemsPrivateLocker.length + itemsShareLocker.length}
      />
      <ZoomController />
      <Floor />
      {/*<fog attach="fog" args={["#2A3C47", 1, 25]} />*/}

      <group
        ref={buildMechRef}
        position={[0, 0, -5]}
        rotation={[-Math.PI / 7, 0, Math.PI / 4]}
        scale={SCALE}
      >
        {/*<BuildMech mechBP={stations[0]?.stationBP} isWireFrame={true} />*/}
      </group>
    </>
  );
}
