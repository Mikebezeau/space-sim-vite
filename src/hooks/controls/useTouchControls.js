import { useEffect } from "react";

export function useTouchStartControls(elementID, callback) {
  useEffect(() => {
    const element = document.getElementById(elementID);
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;

    element.addEventListener("touchstart", callback);

    return () => {
      element.removeEventListener("touchstart", callback);
    };
  }, []);
}

export function useTouchMoveControls(elementID, callback) {
  useEffect(() => {
    const element = document.getElementById(elementID);
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;

    element.addEventListener("touchmove", callback);

    return () => {
      element.removeEventListener("touchmove", callback);
    };
  }, [callback, elementID]);
}

export function useTouchEndControls(elementID, callback) {
  useEffect(() => {
    const element = document.getElementById(elementID);
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;

    element.addEventListener("touchend", callback);

    return () => {
      element.removeEventListener("touchend", callback);
    };
  }, [callback, elementID]);
}
