import usePlayerControlsStore from "../stores/playerControlsStore";
import { PLAYER } from "../constants/constants";
import CyberButton from "../uiMenuComponents/common/CyberButton";
import StarInfoCard from "../galaxy/StarInfoCard";

const GalaxyMapMenu = () => {
  const { switchScreen } = usePlayerControlsStore((state) => state.actions);

  return (
    <>
      <div className="absolute top-0 left-0 bottom-0 right-0 text-white uppercase">
        <h1>Galaxy Map</h1>
        <CyberButton
          title={"Exit"}
          mainClassName="w-40 ml-4"
          onClick={() => {
            switchScreen(PLAYER.screen.flight);
          }}
        />
      </div>
      <div id="upperRight" className="hud">
        <div className="hudData"></div>
      </div>
      <StarInfoCard />
    </>
  );
};

export default GalaxyMapMenu;
