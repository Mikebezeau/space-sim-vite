import { useEffect } from "react";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import useDevStore from "../stores/devStore";

const LilGui = () => {
  const devStoreState = useDevStore((state) => state);

  useEffect(() => {
    const gui = new GUI();
    gui.close();
    gui.add(devStoreState, "devEnemyTest").onChange((value) => {
      // not accepting boolean values (even though type is boolean in store)
      devStoreState.setProp("devEnemyTest", value ? 1 : 0);
    });
    gui.add(devStoreState, "devPlayerPilotMech").onChange((value) => {
      devStoreState.setProp("devPlayerPilotMech", value ? 1 : 0);
    });
    gui.add(devStoreState, "showObbBox").onChange((value) => {
      devStoreState.setProp("showObbBox", value ? 1 : 0);
    });

    return () => {
      gui.destroy();
    };
  }, []);

  return null;
};

export default LilGui;
