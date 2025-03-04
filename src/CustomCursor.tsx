import React from "react";
import usePlayerControlsStore from "./stores/playerControlsStore";
import { useMouseMove } from "./hooks/controls/useMouseKBControls";
import { PLAYER } from "./constants/constants";
import "./css/customCursor.css";

const CustomCursor = () => {
  const playerActionMode = usePlayerControlsStore(
    (state) => state.playerActionMode
  );
  const customCursorRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (playerActionMode === PLAYER.action.manualControl) {
      if (customCursorRef.current) {
        customCursorRef.current.style.left = "-3000px";
      }
    }
  }, [playerActionMode]);

  const move = (e: MouseEvent) => {
    requestAnimationFrame(() => {
      if (playerActionMode !== PLAYER.action.manualControl) {
        if (customCursorRef.current) {
          customCursorRef.current.style.left = `${e.clientX}px`;
          customCursorRef.current.style.top = `${e.clientY}px`;
        }
      }
    });
  };

  useMouseMove(move);

  return (
    <div ref={customCursorRef} className="custom-cursor">
      <div className="custom-cursor-dot" />
    </div>
  );
};

export default CustomCursor;
