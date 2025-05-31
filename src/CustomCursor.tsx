import useStore from "./stores/store";
/*
import usePlayerControlsStore from "./stores/playerControlsStore";
import useHudTargtingStore from "./stores/hudTargetingStore";
import { useMouseMove } from "./hooks/controls/useMouseKBControls";
import { PLAYER } from "./constants/constants";
*/
import "./css/customCursor.css";
/*
to hide the default cursor while using the custom cursor
wrap the AppUI component in a div with the following id and tailwind classes
<div
  id="custom-cursor-hide-cursor"
  className="absolute w-full h-full touch-none"
>
*/

const CustomCursor = () => {
  /*
  const customCursorRef = React.useRef<HTMLDivElement | null>(null);
  //removed requestAnimationFrame - update done in store function
  const move = (e: MouseEvent) => {
    requestAnimationFrame(() => {
      if (customCursorRef.current) {
        if (
          // conditions to hide cursor
          !useHudTargtingStore.getState().isMouseOutOfHudCircle &&
          usePlayerControlsStore.getState().playerScreen ===
            PLAYER.screen.flight &&
          usePlayerControlsStore.getState().playerActionMode ===
            PLAYER.action.manualControl
        ) {
          customCursorRef.current.style.left = "-3000px";
        } else {
          // show cursor
          customCursorRef.current.style.left = `${e.clientX}px`;
          customCursorRef.current.style.top = `${e.clientY}px`;
        }
      }
    });
  };

  useMouseMove(move);
*/
  return (
    <div
      ref={(divElement) =>
        (useStore.getState().customCursorDivElement = divElement)
      }
      className="custom-cursor"
    >
      <div className="custom-cursor-dot" />
    </div>
  );
};

export default CustomCursor;
