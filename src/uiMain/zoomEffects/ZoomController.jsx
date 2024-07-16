import useMainUIStore from "../useMainUIStore";
import ZoomPrivateLocker from "./ZoomPrivateLocker";
import ZoomSamCargo from "./ZoomSamCargo";
import ZoomShareLocker from "./ZoomShareLocker";

function ZoomController() {
  const { isPrivateLocker, isShareLocker, isSamCargo } = useMainUIStore(
    (state) => state
  );

  return (
    <>
      {isPrivateLocker ? <ZoomPrivateLocker /> : <></>}
      {isShareLocker ? <ZoomShareLocker /> : <></>}
      {isSamCargo ? <ZoomSamCargo /> : <></>}
    </>
  );
}

export default ZoomController;
