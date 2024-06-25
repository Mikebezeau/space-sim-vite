import useStore from "../../../../stores/store";
import SpeedReadout from "../../SpeedReadout";
import {
  CockpitControlMode,
  CockpitControlMap,
  CockpitControlView,
  CockpitControlEquip,
} from "../../CockpitControls";
import { IS_MOBLIE, PLAYER } from "../../../../util/constants";
import cockpitImage from "../../images/middle.png"; //import controls from "../../icons/controls.svg";

const CockpitMiddle = () => {
  console.log("CockpitMiddle rendered");
  const playerViewMode = useStore((state) => state.playerViewMode);

  return (
    <div
      className="w-full h-full bg-cover bg-center mt-4"
      style={{ backgroundImage: `url(${cockpitImage})` }}
    >
      {!IS_MOBLIE && (
        <div className="absolute top-[7vh] left-[32vh]">
          <SpeedReadout />
        </div>
      )}
      {playerViewMode === PLAYER.view.firstPerson && !IS_MOBLIE && (
        <>
          <div className="absolute top-[10vh] left-[10vh]">
            <CockpitControlMode />
            <CockpitControlMap />
          </div>
          <div className="absolute top-[10vh] right-[10vh]">
            <CockpitControlView />
            <CockpitControlEquip />
          </div>
        </>
      )}
    </div>
  );
};

export default CockpitMiddle;
