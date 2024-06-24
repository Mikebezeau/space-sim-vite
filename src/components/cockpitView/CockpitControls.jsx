import useStore from "../../stores/store";
import { PLAYER } from "../../util/constants";
import gear from "../../icons/gear.svg";
import radarDish from "../../icons/radarDish.svg";
import sword from "../../icons/sword.svg";
import stars from "../../icons/stars.svg";
import camera from "../../icons/camera-change.svg";
//import destinationTargetIcon from "../../../icons/destinationTarget.svg";

export const CockpitControlMode = () => {
  const contextMenuSelect = useStore(
    (state) => state.actions.contextMenuSelect
  );
  const playerControlMode = useStore((state) => state.playerControlMode);

  return (
    <>
      {playerControlMode !== PLAYER.controls.combat && (
        <div
          className="button-cyber w-[10vh] h-[10vh] mt-1"
          onClick={() => contextMenuSelect(PLAYER.controls.combat)}
        >
          <span className="button-cyber-content">
            <img
              src={sword}
              alt="comabt mode icon"
              className="w-[10vh] h-[10vh]"
            />
          </span>
        </div>
      )}
      {playerControlMode !== PLAYER.controls.scan && (
        <div
          className="button-cyber w-[10vh] h-[10vh] mt-1"
          onClick={() => contextMenuSelect(PLAYER.controls.scan)}
        >
          <span className="button-cyber-content">
            <img
              src={radarDish}
              alt="radar icon"
              className="w-[10vh] h-[10vh]"
            />
          </span>
        </div>
      )}
    </>
  );
};

export const CockpitControlMap = () => {
  const switchScreen = useStore((state) => state.actions.switchScreen);

  return (
    <div
      className="button-cyber w-[10vh] h-[10vh] mt-1"
      onClick={() => switchScreen(PLAYER.screen.galaxyMap)}
    >
      <span className="button-cyber-content">
        <img src={stars} alt="stars icon" className="w-[10vh] h-[10vh]" />
      </span>
    </div>
  );
};

export const CockpitControlView = () => {
  const viewModeSelect = useStore((state) => state.actions.viewModeSelect);

  const playerViewMode = useStore((state) => state.playerViewMode);

  return (
    <div
      className="button-cyber w-[10vh] h-[10vh] mt-1"
      onClick={() =>
        viewModeSelect(
          playerViewMode === PLAYER.view.firstPerson
            ? PLAYER.view.thirdPerson
            : PLAYER.view.firstPerson
        )
      }
    >
      <span className="button-cyber-content">
        <img src={camera} alt="camera icon" className="w-[10vh] h-[10vh]" />
      </span>
    </div>
  );
};

export const CockpitControlEquip = () => {
  const switchScreen = useStore((state) => state.actions.switchScreen);

  return (
    <div
      className="button-cyber w-[10vh] h-[10vh] mt-1"
      onClick={() => switchScreen(PLAYER.screen.equipmentBuild)}
    >
      <span className="button-cyber-content">
        <img src={gear} alt="gear icon" className="w-[10vh] h-[10vh]" />
      </span>
    </div>
  );
};

const CockpitControls = () => {
  return (
    <>
      <CockpitControlMode />
      <CockpitControlMap />
      <CockpitControlView />
      <CockpitControlEquip />
    </>
  );
};

export default CockpitControls;
