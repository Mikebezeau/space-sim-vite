import { useEffect } from "react";

export function useMouseMove(callback) {
  useEffect(() => {
    document.addEventListener("mousemove", callback);

    return () => {
      document.removeEventListener("mousemove", callback);
    };
  }, [callback]);
}

export function useMouseClick(callback) {
  useEffect(() => {
    document.addEventListener("click", callback);

    return () => {
      document.removeEventListener("click", callback);
    };
  }, []);
}

export function useMouseRightClick(callback) {
  useEffect(() => {
    const handleMouseRightClick = (e) => {
      // prevent right click browser menu
      if (import.meta.env.PROD) e.preventDefault();
      callback(e);
    };
    document.addEventListener("contextmenu", handleMouseRightClick);

    return () => {
      document.removeEventListener("contextmenu", handleMouseRightClick);
    };
  }, [callback]);
}

export function useMouseWheelClick(callback) {
  useEffect(() => {
    const handleMouseWheelClick = (e) => {
      if (e.button === 1) callback(e);
    };
    document.addEventListener("auxclick", handleMouseWheelClick);

    return () => {
      document.removeEventListener("auxclick", handleMouseWheelClick);
    };
  }, [callback]);
}

export function useMouseWheelRoll(callback) {
  useEffect(() => {
    const handleMouseWheelRoll = (e) => {
      callback(e);
    };
    document.addEventListener("wheel", handleMouseWheelRoll);

    return () => {
      document.removeEventListener("wheel", handleMouseWheelRoll);
    };
  }, [callback]);
}

export function useMouseDown(callback) {
  useEffect(() => {
    document.addEventListener("mousedown", callback);

    return () => {
      document.removeEventListener("mousedown", callback);
    };
  }, [callback]);
}

export function useMouseUp(callback) {
  useEffect(() => {
    document.addEventListener("mouseup", callback);

    return () => {
      document.removeEventListener("mouseup", callback);
    };
  }, [callback]);
}

export function useKBControls(keyCode, callback) {
  useEffect(() => {
    function handleKeyDown({ code }) {
      //console.log("code:", code);
      if (keyCode === code) {
        callback(code);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [keyCode, callback]);
}
