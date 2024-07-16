import { useEffect } from "react";

export function useTouchStartControls(elementID, callback) {
  useEffect(() => {
    const element = document.getElementById(elementID);
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;

    element.addEventListener("touchstart", callback, { passive: true });

    return () => {
      element.removeEventListener("touchstart", callback, { passive: true });
    };
  }, []);
}

export function useTouchMoveControls(elementID, callback) {
  useEffect(() => {
    const element = document.getElementById(elementID);
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;

    element.addEventListener("touchmove", callback, { passive: true });

    return () => {
      element.removeEventListener("touchmove", callback, { passive: true });
    };
  }, [callback, elementID]);
}

export function useTouchEndControls(elementID, callback) {
  useEffect(() => {
    const element = document.getElementById(elementID);
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;

    element.addEventListener("touchend", callback, { passive: true });

    return () => {
      element.removeEventListener("touchend", callback, { passive: true });
    };
  }, [callback, elementID]);
}
