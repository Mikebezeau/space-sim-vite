import SpeedReadout from "../SpeedReadout";
import { IS_MOBLIE } from "../../constants/constants";
import cockpitImage from "../images/middle.png"; //import controls from "../../icons/controls.svg";

const CockpitMiddle = () => {
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
    </div>
  );
};

export default CockpitMiddle;
