import { useEffect } from "react";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import useDevStore from "../stores/devStore";

const LilGui = () => {
  const devStoreState = useDevStore((state) => state);

  useEffect(() => {
    const gui = new GUI();
    gui.add(devStoreState, "devPlayerPilotMech").onChange((value) => {
      devStoreState.setProp("devPlayerPilotMech", value);
    });
    gui.add(devStoreState, "showObbBox").onChange((value) => {
      devStoreState.setProp("showObbBox", value);
    });
    /*
    gui.add(devStoreState, "showBoidVectors").onChange((value) => {
      devStoreState.setProp("showBoidVectors", value);
    });
*/
    return () => {
      gui.destroy();
    };
  }, []);

  return null;
};

export default LilGui;
