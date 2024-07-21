//import useStore from "./stores/store";
import usePlayerControlsStore from "./stores/playerControlsStore";
import { PLAYER } from "./constants/constants";
import "./css/hudSpaceFlight.css";
import StarInfoCard from "./galaxy/StarInfoCard";

//basic HTML/CSS heads up display used to show player info
export default function GalaxyMapHud() {
  //const { planets } = useStore((state) => state);
  const { switchScreen } = usePlayerControlsStore((state) => state.actions);

  return (
    <>
      <div id="upperLeft" className="hud">
        <h1 style={{ fontSize: "50px" }}>Galaxy Map</h1>
        <div className="hudData">
          <button
            onClick={() => {
              switchScreen(PLAYER.screen.flight);
            }}
          >
            Exit
          </button>
          {/*<p>System</p>*/}
          {/*Object.entries(planets[0].data).map(([key, value]) => {
            return (
              <span key={key}>
                {key}:{" "}
                <span className="floatRight">
                  {typeof value === "number"
                    ? Math.floor(value * 1000) / 1000 // rounding off
                    : value}
                </span>
                <br />
              </span>
            );
          })*/}
        </div>
      </div>
      <div id="upperRight" className="hud">
        <div className="hudData"></div>
      </div>
      <StarInfoCard />
    </>
  );
}
