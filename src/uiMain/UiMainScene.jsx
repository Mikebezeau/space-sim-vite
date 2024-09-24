import ExternalGrid from "./ExternalGrid";
import Floor from "./Floor";
import GridsContainer from "./GridsContainer";
import useMainUIStore from "./useMainUIStore";
import ZoomController from "./zoomEffects/ZoomController";

export default function UiMainScene() {
  console.log("MainUIScene rendered");
  const { itemsPrivateLocker, itemsShareLocker, itemsSam } = useMainUIStore(
    (state) => state
  );

  return (
    <>
      <hemisphereLight intensity={2} />
      <ambientLight intensity={2} />
      <pointLight position={[40, 40, 40]} intensity={2} />
      <color attach="background" args={["#2A3C47"]} />
      <GridsContainer briefcases={itemsPrivateLocker()} />
      <ZoomController />
      <Floor />
    </>
  );
}
