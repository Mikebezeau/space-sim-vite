import React, { memo, useRef, useEffect } from "react";
import useHudWarningStoreStore from "../stores/hudWarningStore";
import usePlayerControlsStore from "../stores/playerControlsStore";
import { PLAYER } from "../constants/constants";

/* NOTE the following required in tailwind.config.js
theme: {
  extend: {
    keyframes: {
      blink3: {
        "0%, 100%": { opacity: "0" },
        "10%, 30%, 50%": { opacity: "1" },
        "20%, 40%, 60%": { opacity: "0" },
        "70%, 100%": { opacity: "0" }, // stays off at end
      },
    },
    animation: {
      blink3: "blink3 2s ease-in-out forwards",
    },
  },
},
*/

const WarningMessage: React.FC = () => {
  const queueWarning = useHudWarningStoreStore((state) => state.queueWarning);

  const containerRef = useRef<HTMLDivElement>(null);
  const mainTextRef = useRef<HTMLParagraphElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  // Get the action to set refs in the store
  const setWarningRefs = useHudWarningStoreStore(
    (state) => state.setWarningRefs
  );

  // Effect to register the refs with the Zustand store once the component mounts
  useEffect(() => {
    if (
      !(containerRef.current && mainTextRef.current && descriptionRef.current)
    ) {
      return; // Ensure refs are available before setting them
    }

    setWarningRefs(
      containerRef.current,
      mainTextRef.current,
      descriptionRef.current
    );

    // test code to queue a warning message
    if (
      useHudWarningStoreStore.getState().currentActiveWarning === null &&
      useHudWarningStoreStore.getState().warningQueue.length === 0
    ) {
      // Step 1: Welcome message, disappears when player moves
      queueWarning({
        mainText: "ENEMY DETECTED",
        descriptionText: "ENTER COMBAT MODE",
        mainColor: "rgba(255, 13, 13, 0.7)",
        completionCondition: () => {
          return (
            usePlayerControlsStore.getState().playerControlMode ===
            PLAYER.controls.combat
          );
        }, // Condition checks state
      });

      // Step 2: Combat message, disappears after 3 enemies defeated
      queueWarning({
        mainText: "ENEMY CONTACT!",
        descriptionText: `Defeat 3 enemies.`,
        mainColor: "rgba(255, 165, 0, 0.8)", // Orange
        completionCondition: () => true, // Condition checks state
      });

      // Step 3: Item pickup message, disappears when item is picked up
      queueWarning({
        mainText: "SUPPLY DROP!",
        descriptionText: "Walk over the glowing item to pick it up.",
        mainColor: "rgba(0, 255, 0, 0.8)", // Green
        completionCondition: () => true, // Condition checks state
      });

      // Step 4: Final congratulations, disappears after a set time
      queueWarning({
        mainText: "TUTORIAL COMPLETE!",
        descriptionText: "You are ready for battle. Good luck!",
        mainColor: "rgba(200, 100, 255, 0.9)", // Purple
      });
    }

    // TODO this is a good idea
    // Cleanup function: remove refs from store when component unmounts
    return () => {
      setWarningRefs(null!, null!, null!); // Use non-null assertion as types expect HTMLElement
    };
  }, []); // Dependency array: only runs once on mount/unmount

  // The component simply renders the static HTML elements
  /*
  return (
    <div
      ref={containerRef}
      className="font-['CyberAlert']"
    >
      <p
        ref={mainTextRef}
        className=""
      ></p>
      <p
        ref={descriptionRef}
        className=""
      ></p>
    </div>
  );
  */
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex flex-col top-40vh justify-center 
      pointer-events-none z-[5000] font-['CyberAlert']"
    >
      <p
        ref={mainTextRef}
        className="text-8xl text-red-600 opacity-1 animate-blink3"
      >
        MAIN MESSAGE
      </p>
      <p
        ref={descriptionRef}
        className="text-xl mt-2 text-base text-white opacity-1 
        transition-opacity transform -translate-y-[60vh] translate-y-0 transition-transform duration-1000"
      >
        Description text
      </p>
    </div>
  );
};

export default memo(WarningMessage);
