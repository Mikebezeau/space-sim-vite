import useStore from "../stores/store";
import usePlayerControlsStore from "../stores/playerControlsStore";
import { IS_MOBILE, PLAYER } from "../constants/constants";
import { ToggleTestControls } from "./ToggleTestControls";
import { TestingEnemyControls } from "./TestingEnemyControls";
import { TestingPlayerLocationControls } from "./TestingPlayerLocationControls";
import { TestingBoidControls } from "./TestingBoidControls";
import "../css/hud.css";
import "../css/hudSpaceFlight.css";
import "../css/toggleControl.css";
//import DashboardReadout from "./components/cockpitView/DashboardReadout";

//basic HTML/CSS heads up display used to show player info
export default function TestingHud() {
  const showTestControls = useStore((state) => state.showTestControls);
  const speed = useStore((state) => state.player.speed);
  const shield = useStore((state) => state.player.shield);
  const currentMechBPindex = useStore(
    (state) => state.player.currentMechBPindex
  );
  const playerMechBP = useStore((state) => state.playerMechBP);
  const weaponList = playerMechBP[currentMechBPindex].weaponList;
  //const sound = useStore((state) => state.sound);
  //const toggle = useStore((state) => state.actions.toggleSound);

  const playerViewMode = usePlayerControlsStore(
    (state) => state.playerViewMode
  );
  const playerControlMode = usePlayerControlsStore(
    (state) => state.playerControlMode
  );
  const switchScreen = usePlayerControlsStore(
    (state) => state.actions.switchScreen
  );

  return (
    <>
      {/*<DashboardReadout />*/}
      <div id="upperLeft" className="hud">
        {(IS_MOBILE || playerViewMode === PLAYER.view.thirdPerson) && (
          <>
            <h2>Speed</h2>
            <h1>{speed}</h1>
          </>
        )}
        <div className="hudData mt-20">
          <ToggleTestControls />
          {!showTestControls && (
            <>
              {playerControlMode === PLAYER.controls.combat && (
                <>
                  {weaponList.beam.map((weapon, i) => (
                    <p key={i}>{weapon.data.name}</p>
                  ))}
                  {weaponList.proj.map((weapon, i) => (
                    <p key={i}>{weapon.data.name} / AMMO</p>
                  ))}
                  {weaponList.missile.map((weapon, i) => (
                    <p key={i}>{weapon.data.name} / #</p>
                  ))}
                </>
              )}
            </>
          )}
          {showTestControls && (
            <>
              <button
                onClick={() => switchScreen(PLAYER.screen.equipmentBuild)}
              >
                Equipment
              </button>
              <TestingEnemyControls />
              <TestingPlayerLocationControls />
            </>
          )}
        </div>
      </div>
      <div id="upperRight" className="hud mt-12">
        {playerControlMode === PLAYER.controls.combat && shield.max > 0 && (
          <div className="shieldsBarContainer">
            <div
              className="shieldsBar"
              style={{
                width: ((shield.max - shield.damage) / shield.max) * 100 + "%",
              }}
            >
              <span>SHIELDS</span>
            </div>
          </div>
        )}

        <br />
        <div className="hudData -top-12">
          {showTestControls && <TestingBoidControls />}
        </div>
      </div>
    </>
  );
}
