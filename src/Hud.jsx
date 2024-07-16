import { useMemo } from "react";
import useStore from "./stores/store";
import usePlayerControlsStore from "./stores/playerControlsStore";
import { PLAYER } from "./constants/constants";
import { ToggleTestControls } from "./testingControls/ToggleTestControls";
import { TestingEnemyControls } from "./testingControls/TestingEnemyControls";
import { TestingPlayerLocationControls } from "./testingControls/TestingPlayerLocationControls";
import { TestingBoidControls } from "./testingControls/TestingBoidControls";
import "./css/hud.css";
import "./css/hudSpaceFlight.css";
import "./css/toggleControl.css";
//import DashboardReadout from "./components/cockpitView/DashboardReadout";

//basic HTML/CSS heads up display used to show player info
export default function Hud() {
  //console.log("Hud rendered");
  const toggleTestControls = useStore((state) => state.toggleTestControls);
  const speed = useStore((state) => state.player.speed);
  const shield = useStore((state) => state.player.shield);
  const currentMechBPindex = useStore(
    (state) => state.player.currentMechBPindex
  );
  const playerMechBP = useStore((state) => state.playerMechBP);
  const planets = useStore((state) => state.planets);
  const weaponList = playerMechBP[currentMechBPindex].weaponList;
  //const sound = useStore((state) => state.sound);
  //const toggle = useStore((state) => state.actions.toggleSound);

  const playerControlMode = usePlayerControlsStore(
    (state) => state.playerControlMode
  );
  const switchScreen = usePlayerControlsStore(
    (state) => state.actions.switchScreen
  );

  const sunScanData = useMemo(() => {
    Object.entries(planets[0].data);
  }, [planets]);
  //console.log("planets[0].data", planets[0].data);

  const PlanetScanData = () => {
    //console.log("PlanetScanData rendered");
    const focusPlanetIndex = useStore((state) => state.focusPlanetIndex);
    const data =
      focusPlanetIndex !== null
        ? Object.entries(planets[focusPlanetIndex].data)
        : null;
    return (
      <>
        {data ? (
          <>
            <p>Planet Scan</p>
            {
              // causing rereners
              data.map(([key, value]) => {
                return (
                  <span key={key}>
                    <span className="floatLeft">{key}:</span> {value}
                    <br />
                  </span>
                );
              })
            }
          </>
        ) : (
          <></>
        )}
      </>
    );
  };

  return (
    <>
      {/*<DashboardReadout />*/}
      <div id="upperLeft" className="hud">
        {playerControlMode !== PLAYER.controls.unattended && (
          <>
            <h2>Speed</h2>
            <h1>{speed}</h1>
          </>
        )}
        <div className="hudData mt-20">
          <ToggleTestControls />
          {!toggleTestControls && (
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

              {playerControlMode === PLAYER.controls.scan && (
                <>
                  <p>System</p>
                  {sunScanData?.map(([key, value]) => {
                    return (
                      <span key={key}>
                        {key}:{" "}
                        <span className="floatRight">
                          {Math.floor(value * 1000) / 1000 /*rounding off*/}
                        </span>
                        <br />
                      </span>
                    );
                  })}
                </>
              )}
            </>
          )}
          {toggleTestControls && (
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
      <div id="upperRight" className="hud">
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
        <div className="hudData">
          {!toggleTestControls &&
            playerControlMode === PLAYER.controls.scan && <PlanetScanData />}
          {toggleTestControls && <TestingBoidControls />}
        </div>
      </div>
    </>
  );
}
