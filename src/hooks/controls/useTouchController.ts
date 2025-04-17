import { useEffect } from "react";
import usePlayerControlsStore from "../../stores/playerControlsStore";
import { optionsType } from "./TouchController";

type eventCallbackType = {
  touchStart?: (evt: TouchEvent, touch: Touch) => void;
  touchMove?: (evt: TouchEvent, touch: Touch) => void;
  touchEnd?: (evt: TouchEvent, touch: Touch) => void;
};

const useTouchController = (
  elementID: string,
  eventCallbacks: eventCallbackType,
  options?: optionsType
) => {
  useEffect(() => {
    const element = document.getElementById(elementID);
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;

    usePlayerControlsStore
      .getState()
      .touchController.registerElement(element, eventCallbacks, options);

    return () => {
      usePlayerControlsStore
        .getState()
        .touchController.unregisterElement(element);
    };
  }, []);
};

export default useTouchController;
