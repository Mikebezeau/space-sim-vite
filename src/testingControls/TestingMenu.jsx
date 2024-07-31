import useStore from "../stores/store";
import usePlayerControlsStore from "../stores/playerControlsStore";
import { PLAYER } from "../constants/constants";
import { ToggleTestControls } from "./ToggleTestControls";
import { TestingEnemyControls } from "./TestingEnemyControls";
import { TestingPlayerLocationControls } from "./TestingPlayerLocationControls";
import { TestingBoidControls } from "./TestingBoidControls";
import "../css/toggleControl.css";

const TestingMenu = () => {
  const showTestControls = useStore((state) => state.showTestControls);
  const switchScreen = usePlayerControlsStore(
    (state) => state.actions.switchScreen
  );

  return (
    <div className="absolute text-white top-4 right-3/4 bottom-0 left-8">
      <ToggleTestControls />
      {showTestControls && (
        <>
          <button onClick={() => switchScreen(PLAYER.screen.equipmentBuild)}>
            Equipment
          </button>
          <TestingEnemyControls />
          <TestingPlayerLocationControls />
          <TestingBoidControls />
        </>
      )}
    </div>
  );
};

export default TestingMenu;
