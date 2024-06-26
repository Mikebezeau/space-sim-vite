import useStore from "./stores/store";
import { PLAYER } from "./constants/constants";
import "./css/contextMenu.css";

export default function ContextMenu() {
  //CONTEXT MENU
  const playerScreen = useStore((state) => state.playerScreen);
  const displayContextMenu = useStore((state) => state.displayContextMenu);
  const { playerControlMode, contextMenuPos } = useStore((state) => state);
  const { contextMenuSelect, switchScreen /*, orbitPlanet*/ } = useStore(
    (state) => state.actions
  );
  //console.log("contextMenu render, displayContextMenu", displayContextMenu);

  const handleMenuSelect = (selectVal) => {
    contextMenuSelect(selectVal);
  };
  return (
    <>
      {playerScreen === PLAYER.screen.flight && displayContextMenu === true && (
        <div
          className="contextMenu"
          style={{ top: contextMenuPos.y, left: contextMenuPos.x - 75 }}
        >
          {playerControlMode !== PLAYER.controls.combat && (
            <button onClick={() => handleMenuSelect(PLAYER.controls.combat)}>
              COMBAT MODE
            </button>
          )}
          {playerControlMode !== PLAYER.controls.scan && (
            <button onClick={() => handleMenuSelect(PLAYER.controls.scan)}>
              SENSOR MODE
            </button>
          )}
          {playerControlMode !== 9 && (
            <button
              onClick={() => handleMenuSelect(PLAYER.controls.unattended)}
            >
              ORBIT
            </button>
          )}
          {playerControlMode !== 9 && (
            <button
              onClick={() => handleMenuSelect(PLAYER.controls.unattended)}
            >
              DOCK
            </button>
          )}
          {playerControlMode !== PLAYER.controls.unattended && (
            <button
              onClick={() => handleMenuSelect(PLAYER.controls.unattended)}
            >
              VIEW SHIP
            </button>
          )}
          <button onClick={() => switchScreen(PLAYER.screen.galaxyMap)}>
            Galaxy Star Map
          </button>
        </div>
      )}
    </>
  );
}
