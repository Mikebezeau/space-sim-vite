import { memo, useEffect, useRef } from "react";
import useStore from "../stores/store";
import usePlayerControlsStore from "../stores/playerControlsStore";
import CockpitPanelsRed from "./panels/CockpitPanelsRed";
import {
  ActionModeControlGroup,
  SelectedTargetActionButton,
  CockpitControlMode,
  CockpitControlMap,
  CockpitControlView,
} from "./CockpitControls";
import { PLAYER } from "../constants/constants";
import "./css/uiCockpit.css";

const Cockpit = () => {
  useStore.getState().updateRenderInfo("Cockpit");

  const playerActionMode = usePlayerControlsStore(
    (state) => state.playerActionMode
  );

  const aspectRatio = useRef(window.innerWidth / window.innerHeight);

  useEffect(() => {
    const cockpitDivElement =
      usePlayerControlsStore.getState().cockpitDivElement;

    if (cockpitDivElement !== null) {
      return;
      const isManualControl =
        usePlayerControlsStore.getState().getPlayerState().playerActionMode ===
        PLAYER.action.manualControl;
      // changing perspective value to zoom in (translateZ was not working)
      // use aspect ratio to modify perspective
      //const aspectRatio = window.innerWidth / window.innerHeight;
      const perspective = (isManualControl ? 300 : 200) + "px"; // * aspectRatio + "px";
      const cockpitPanelDivList = [...cockpitDivElement.children];
      cockpitPanelDivList.forEach((group: any) => {
        group.style.perspective = perspective;
      });
    }
  }, [playerActionMode]);

  return (
    <div
      ref={(ref) => {
        usePlayerControlsStore.getState().cockpitDivElement = ref;
      }}
      className="container-full-screen cockpit-view top-0"
    >
      <div
        className="perspective-400 preserve-3d container-full-screen top-[70vh]"
        style={{
          transition: "perspective 0.5s",
        }}
      >
        <CockpitPanelsRed />
      </div>
      <div className="perspective-400 preserve-3d container-full-screen top-[78vh]">
        {/*playerActionMode === PLAYER.action.inspect && (*/}
        <div className="absolute face middle-red flex flex-row gap-2 top-[4vh] left-1/2">
          <div className="absolute top-[0]">
            <SelectedTargetActionButton />
          </div>
          <div
            className="absolute w-[40vh] ml-[-17.5vh] top-[12vh] lg:top-[8vh] flex flex-row gap-2
            lg:scale-x-[0.7] lg:scale-y-[0.7]"
          >
            <CockpitControlMode />
            <CockpitControlMap />
            <CockpitControlView />
          </div>
        </div>
        {/* ) */}
      </div>

      <ActionModeControlGroup />
    </div>
  );
};

//export default React.memo(Cockpit);
export default memo(Cockpit);
