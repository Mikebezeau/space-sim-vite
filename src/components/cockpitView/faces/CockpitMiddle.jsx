import useStore from "../../../stores/store";
import { PLAYER } from "../../../util/constants";
import cockpitImage from "../images/middle.png"; //import controls from "../../icons/controls.svg";
import gear from "../../../icons/gear.svg";
import radarDish from "../../../icons/radarDish.svg";
import sword from "../../../icons/sword.svg";
import stars from "../../../icons/stars.svg";
//import destinationTargetIcon from "../../../icons/destinationTarget.svg";

const CockpitMiddle = () => {
  console.log("CockpitMiddle rendered");
  const { contextMenuSelect, switchScreen } = useStore(
    (state) => state.actions
  );
  const playerControlMode = useStore((state) => state.playerControlMode);
  const speed = 0; //useStore((state) => state.player.speed);

  return (
    <div
      className="w-full h-full bg-cover bg-center"
      style={{ backgroundImage: `url(${cockpitImage})` }}
    >
      <div className="absolute top-12 left-60">
        <div className="text-2xl">SPEED</div>
        <div className="text-6xl">{speed}</div>
      </div>
      <div className="absolute top-12 left-24">
        {playerControlMode !== PLAYER.controls.combat && (
          <div
            className="button-cyber w-20 h-20"
            onClick={() => contextMenuSelect(PLAYER.controls.combat)}
          >
            <span className="button-cyber-content">
              <img
                src={sword}
                alt="destination target icon"
                className="w-20 h-20"
              />
            </span>
          </div>
        )}
        {playerControlMode !== PLAYER.controls.scan && (
          <div
            className="button-cyber w-20 h-20 mt-1"
            onClick={() => contextMenuSelect(PLAYER.controls.scan)}
          >
            <span className="button-cyber-content">
              <img
                src={radarDish}
                alt="destination target icon"
                className="w-20 h-20"
              />
            </span>
          </div>
        )}
        <div
          className="button-cyber w-20 h-20 mt-1"
          onClick={() => switchScreen(PLAYER.screen.galaxyMap)}
        >
          <span className="button-cyber-content">
            <img
              src={stars}
              alt="destination target icon"
              className="w-20 h-20"
            />
          </span>
        </div>
        <div
          className="button-cyber w-20 h-20 mt-1"
          onClick={() => switchScreen(PLAYER.screen.equipmentBuild)}
        >
          <span className="button-cyber-content">
            <img
              src={gear}
              alt="destination target icon"
              className="w-20 h-20"
            />
          </span>
        </div>
      </div>
    </div>
  );
};

export default CockpitMiddle;
