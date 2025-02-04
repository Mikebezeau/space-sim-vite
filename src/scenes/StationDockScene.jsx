import useStore from "../stores/store";
import UiMainScene from "../uiMain/UiMainScene";

const StationDockScene = () => {
  useStore.getState().updateRenderInfo("StationDockScene");
  return <UiMainScene />;
};

export default StationDockScene;
