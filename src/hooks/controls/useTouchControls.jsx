import { useEffect } from "react";
import { IS_MOBLIE } from "../../constants/constants";

export function useTouchStartControls(elementID, callback) {
  //console.log("useTouchStartControls", elementID);
  useEffect(() => {
    if (IS_MOBLIE)
      document
        .getElementById(elementID)
        .addEventListener("touchstart", callback, { passive: true });

    return (elementID) => {
      if (document.getElementById(elementID))
        document
          .getElementById(elementID)
          .removeEventListener("touchstart", callback, { passive: true });
    };
  }, []);
}

export function useTouchMoveControls(elementID, callback) {
  //console.log("useTouchMoveControls", elementID);
  useEffect(() => {
    if (IS_MOBLIE)
      document
        .getElementById(elementID)
        .addEventListener("touchmove", callback, { passive: true });

    return (elementID) => {
      if (document.getElementById(elementID))
        document
          .getElementById(elementID)
          .removeEventListener("touchmove", callback, { passive: true });
    };
  }, [callback, elementID]);
}

export function useTouchEndControls(elementID, callback) {
  //console.log("useTouchEndControls", elementID);
  useEffect(() => {
    if (IS_MOBLIE)
      document
        .getElementById(elementID)
        .addEventListener("touchend", callback, { passive: true });

    return (elementID) => {
      if (document.getElementById(elementID))
        document
          .getElementById(elementID)
          .removeEventListener("touchend", callback, { passive: true });
    };
  }, [callback, elementID]);
}
