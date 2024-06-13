import useStore from "../../../stores/store";
import { PLAYER } from "../../../util/constants";

const CockpitControlsMiddle = () => {
  console.log("Hud rendered");
  const { contextMenuSelect, switchScreen /*, orbitPlanet*/ } = useStore(
    (state) => state.actions
  );
  const playerControlMode = useStore((state) => state.playerControlMode);
  const speed = 0; //useStore((state) => state.player.speed);

  return (
    <>
      <div className="text-4xl">Speed</div>
      <h1>{speed}</h1>
      {playerControlMode !== PLAYER.controls.combat && (
        <button onClick={() => contextMenuSelect(PLAYER.controls.combat)}>
          COMBAT MODE
        </button>
      )}
      {playerControlMode !== PLAYER.controls.scan && (
        <button onClick={() => contextMenuSelect(PLAYER.controls.scan)}>
          SENSOR MODE
        </button>
      )}
      {playerControlMode !== 9 && (
        <button onClick={() => contextMenuSelect(PLAYER.controls.unattended)}>
          ORBIT
        </button>
      )}
      {playerControlMode !== 9 && (
        <button onClick={() => contextMenuSelect(PLAYER.controls.unattended)}>
          DOCK
        </button>
      )}
      {playerControlMode !== PLAYER.controls.unattended && (
        <button onClick={() => contextMenuSelect(PLAYER.controls.unattended)}>
          VIEW SHIP
        </button>
      )}
      <button onClick={() => switchScreen(PLAYER.screen.galaxyMap)}>
        Galaxy Star Map
      </button>
      <button onClick={() => switchScreen(PLAYER.screen.equipmentBuild)}>
        Equipment
      </button>
    </>
  );
};

export default CockpitControlsMiddle;
