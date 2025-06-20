import React, { useRef, useEffect, useState } from "react";
import useHudWarningStoreStore from "../stores/hudWarningStore";
import "../css/hudWarningMessage.css"; // Import the CSS file

const WarningMessage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainTextRef = useRef<HTMLParagraphElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  // Get the action to set refs in the store
  const setWarningRefs = useHudWarningStoreStore(
    (state) => state.setWarningRefs
  );

  // Effect to register the refs with the Zustand store once the component mounts
  useEffect(() => {
    if (containerRef.current && mainTextRef.current && descriptionRef.current) {
      setWarningRefs(
        containerRef.current,
        mainTextRef.current,
        descriptionRef.current
      );
    }

    // TODO this is a good idea
    // Cleanup function: remove refs from store when component unmounts
    return () => {
      setWarningRefs(null!, null!, null!); // Use non-null assertion as types expect HTMLElement
    };
  }, [setWarningRefs]); // Dependency array: only runs once on mount/unmount

  // TESTING

  // Simulate some game state for conditions
  const [playerHasMoved, setPlayerHasMoved] = useState(true);
  const [enemiesDefeated, setEnemiesDefeated] = useState(10);
  const [hasPickedUpItem, setHasPickedUpItem] = useState(true);

  // Simulate player actions
  const simulatePlayerMove = () => setPlayerHasMoved(true);
  const simulateEnemyDefeat = () => setEnemiesDefeated((prev) => prev + 1);
  const simulateItemPickup = () => setHasPickedUpItem(true);

  const queueWarning = useHudWarningStoreStore((state) => state.queueWarning);
  // Example
  useEffect(() => {
    // Step 1: Welcome message, disappears when player moves
    queueWarning({
      mainText: "WELCOME, PILOT!",
      descriptionText: "Use WASD to move your mech.",
      mainColor: "rgba(100, 255, 255, 0.7)", // Light blue
      completionCondition: () => playerHasMoved, // Condition checks state
      displayDurationAfterAnimation: 5000, // Fallback if player doesn't move quickly
    });
    // Step 1: Welcome message, disappears when player moves
    queueWarning({
      mainText: "WELCOME, PILOT!",
      descriptionText: "Use WASD to move your mech.",
      mainColor: "rgba(17, 255, 13, 0.7)", // Light blue
      completionCondition: () => playerHasMoved, // Condition checks state
      displayDurationAfterAnimation: 5000, // Fallback if player doesn't move quickly
    });
    /*
    // Step 2: Combat message, disappears after 3 enemies defeated
    queueWarning({
      mainText: "ENEMY CONTACT!",
      descriptionText: `Defeat 3 enemies. (Defeated: ${enemiesDefeated})`,
      mainColor: "rgba(255, 165, 0, 0.8)", // Orange
      blinkCount: 2,
      completionCondition: () => enemiesDefeated >= 3, // Condition checks state
    });
*/
    // Step 3: Item pickup message, disappears when item is picked up
    queueWarning({
      mainText: "SUPPLY DROP!",
      descriptionText: "Walk over the glowing item to pick it up.",
      mainColor: "rgba(0, 255, 0, 0.8)", // Green
      completionCondition: () => hasPickedUpItem, // Condition checks state
      displayDurationAfterAnimation: 2000,
    });

    // Step 4: Final congratulations, disappears after a set time
    queueWarning({
      mainText: "TUTORIAL COMPLETE!",
      descriptionText: "You are ready for battle. Good luck!",
      mainColor: "rgba(200, 100, 255, 0.9)", // Purple
      blinkCount: 1,
      holdDuration: 2000,
      displayDurationAfterAnimation: 3000, // No condition, just a time limit
    });
  }, [queueWarning, playerHasMoved, enemiesDefeated, hasPickedUpItem]); // Re-queue if these change

  // The component simply renders the static HTML elements
  return (
    <div
      id="warning-hud"
      ref={containerRef}
      className="warning-container font-['CyberAlert']"
      aria-live="polite"
      aria-atomic="true"
    >
      <p
        id="warning-main-text"
        ref={mainTextRef}
        className="warning-main-text"
      ></p>
      <p
        id="warning-description"
        ref={descriptionRef}
        className="warning-description"
      ></p>
    </div>
  );
};

export default WarningMessage;
