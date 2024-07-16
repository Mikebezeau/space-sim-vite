import { useLayoutEffect } from "react";
import UiMainScene from "../uiMain/UiMainScene";
import { useThree } from "@react-three/fiber";

const StationDockScene = () => {
  const { camera } = useThree();

  useLayoutEffect(() => {
    console.log("StationDockScene rendered", camera);
    // set camera
    //camera.position.set([0, 0, 0]);
    //camera.rotation.set([0, 0, 0]);
  }, []);

  return <UiMainScene />;
};

export default StationDockScene;
