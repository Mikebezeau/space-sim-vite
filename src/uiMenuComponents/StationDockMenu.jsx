import usePlayerControlsStore from "../stores/playerControlsStore";
import UiMain from "../uiMain/UiMain";
import { PLAYER } from "../constants/constants";

const StationDockMenu = () => {
  const { switchScreen } = usePlayerControlsStore((state) => state.actions);

  return (
    <>
      <div className="absolute top-0 left-0 bottom-0 right-0 text-white uppercase">
        <h1>Docked</h1>
        <div className="hudData">
          <button
            className="border-2 border-white w-40 h-10 pt-2"
            onClick={(e) => {
              e.preventDefault();
              switchScreen(PLAYER.screen.flight);
            }}
          >
            Leave Station
          </button>
        </div>
      </div>
      <UiMain />
    </>
  );
};

export default StationDockMenu;
