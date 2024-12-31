import { LoadingManager } from "three";

const AppLoadingManager = () => {
  const manager = new LoadingManager();

  manager.onStart = function (url, itemsLoaded, itemsTotal) {
    console.warn(
      "Started loading file: " +
        url +
        ".\nLoaded " +
        itemsLoaded +
        " of " +
        itemsTotal +
        " files."
    );
  };

  manager.onLoad = function () {
    console.warn("Loading complete!");
  };

  manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    console.warn(
      "Loading file: " +
        url +
        ".\nLoaded " +
        itemsLoaded +
        " of " +
        itemsTotal +
        " files."
    );
  };

  manager.onError = function (url) {
    console.warn("There was an error loading " + url);
  };

  return null;
};

export default AppLoadingManager;
