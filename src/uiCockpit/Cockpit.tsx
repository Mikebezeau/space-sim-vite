import React, { useEffect, useRef } from "react";
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
import { lerp } from "../util/gameUtil";
import { PLAYER } from "../constants/constants";
import "./css/uiCockpit.css";

import { setCustomData } from "r3f-perf";

const Cockpit = () => {
  useStore.getState().updateRenderInfo("Cockpit");

  const playerActionMode = usePlayerControlsStore(
    (state) => state.playerActionMode
  );

  useEffect(() => {
    const cockpitDivElement =
      usePlayerControlsStore.getState().cockpitDivElement;
    if (cockpitDivElement !== null) {
      const isManualControl =
        usePlayerControlsStore.getState().getPlayerState().playerActionMode ===
        PLAYER.action.manualControl;
      // changing perspective value instead of translateZ (was not working)
      const perspective = isManualControl ? "200px" : "400px";
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
export default Cockpit;
