//import useStore from "./stores/store";
import usePlayerControlsStore from "./stores/playerControlsStore";
import UiMain from "./uiMain/UiMain";
import { PLAYER } from "./constants/constants";
import "./css/hudSpaceFlight.css";

//basic HTML/CSS heads up display used to show player info
const StationDockHud = () => {
  //const { planets } = useStore((state) => state);
  const { switchScreen } = usePlayerControlsStore((state) => state.actions);

  return (
    <>
      <div id="upperLeft" className="hud">
        <h1 style={{ fontSize: "50px" }}>Docked</h1>
        <div className="hudData">
          <button
            style={{ width: "200px" }}
            onClick={(e) => {
              e.preventDefault();
              switchScreen(PLAYER.screen.flight);
            }}
          >
            Leave Station
          </button>
          <p>Staion Utilities</p>
          {/*Object.entries(planets[0].data).map(([key, value]) => {
            return (
              <span key={key}>
                {key}:{" "}
                <span className="floatRight">
                  {Math.floor(value * 1000) / 1000}
                </span>
                <br />
              </span>
            );
          })*/}
        </div>
      </div>
      <UiMain />
    </>
  );
};

export default StationDockHud;
