import usePlayerControlsStore from "../stores/playerControlsStore";
import { PLAYER } from "../constants/constants";
import StarInfoCard from "../galaxy/StarInfoCard";

const GalaxyMapMenu = () => {
  const { switchScreen } = usePlayerControlsStore((state) => state.actions);

  return (
    <>
      <div className="absolute top-0 left-0 bottom-0 right-0 text-white uppercase">
        <h1 style={{ fontSize: "50px" }}>Galaxy Map</h1>
        <div className="hudData">
          <button
            className="border-2 border-white w-40 h-10 align-center pt-2"
            onClick={() => {
              switchScreen(PLAYER.screen.flight);
            }}
          >
            Exit
          </button>
        </div>
      </div>
      <div id="upperRight" className="hud">
        <div className="hudData"></div>
      </div>
      <StarInfoCard />
    </>
  );
};

export default GalaxyMapMenu;
