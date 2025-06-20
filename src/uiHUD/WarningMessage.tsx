import React, { useRef, useEffect } from "react";
import {
  usePlayerHudStore,
  //typeWarningMessageOptions,
} from "../stores/hudWaringStore";
import "../css/hudWarningMessage.css";

const WarningMessage: React.FC = () => {
  const currentWarning = usePlayerHudStore((state) => state.currentWarning);
  const warningFinished = usePlayerHudStore((state) => state.warningFinished);
  const triggerNextWarning = usePlayerHudStore(
    (state) => state.triggerNextWarning
  );

  //
  const queueWarning = usePlayerHudStore((state) => state.queueWarning);
  //

  const containerRef = useRef<HTMLDivElement>(null);
  const mainTextRef = useRef<HTMLParagraphElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  // Effect to trigger animation when `currentWarning` changes
  useEffect(() => {
    if (!currentWarning) {
      // No current warning, ensure everything is hidden and reset
      if (containerRef.current) {
        containerRef.current.classList.remove(
          "is-active",
          "fade-out-permanent"
        );
        containerRef.current.style.transition = ""; // Reset transition
        //TESTING removed: containerRef.current.style.opacity = "0";
      }
      if (mainTextRef.current) {
        mainTextRef.current.classList.remove("is-blinking");
        mainTextRef.current.style.animation = ""; // Clear animation property
        mainTextRef.current.style.transition = ""; // Reset transition
      }
      if (descriptionRef.current) {
        descriptionRef.current.classList.remove("is-visible");
        //TESTING removed: descriptionRef.current.style.opacity = "0"; // Ensure hidden
      }
      return;
    }

    // --- A new warning is available, start its animation sequence ---

    const container = containerRef.current;
    const mainTextElement = mainTextRef.current;
    const descriptionElement = descriptionRef.current;

    if (!container || !mainTextElement || !descriptionElement) {
      console.error("WarningMessage: HUD elements not found in refs.");
      return;
    }

    const opts = currentWarning; // Use the options from the current warning

    // 1. Reset any previous state for immediate re-show
    container.classList.remove("fade-out-permanent");
    container.style.transition = "opacity 0.2s ease-in"; // Quick initial fade-in
    //TESTING removed: container.style.opacity = "0"; // Start hidden for transition

    mainTextElement.classList.remove("is-blinking");
    mainTextElement.style.animation = ""; // Clear existing animation
    mainTextElement.style.transition = ""; // Reset transition

    //TESTING removed: descriptionElement.classList.remove("is-visible");
    //TESTING removed: descriptionElement.style.opacity = "0"; // Ensure hidden

    // 2. Set content and colors
    mainTextElement.textContent = opts.mainText.toUpperCase();
    descriptionElement.textContent = opts.descriptionText;
    mainTextElement.style.color = opts.mainColor;
    descriptionElement.style.color = opts.descriptionColor;

    // Set CSS variables for animation durations/counts
    container.style.setProperty(
      "--blink-duration",
      `${opts.blinkDuration / 1000}s`
    );
    container.style.setProperty("--blink-count", String(opts.blinkCount));
    container.style.setProperty(
      "--permanent-fade-duration",
      `${opts.permanentFadeDuration / 1000}s`
    );

    // Calculate total animation times
    const totalBlinkAnimationDuration = opts.blinkCount * opts.blinkDuration;
    const totalMainMessageDisplayDuration =
      totalBlinkAnimationDuration + opts.holdDuration;
    const totalDescriptionDisplayDuration =
      totalMainMessageDisplayDuration + opts.descriptionDelay;

    // --- Start Animation Sequence with `setTimeout` ---
    let initialShowTimeout: number;
    let descriptionFadeInTimeout: number;
    let mainTextFadeOutTimeout: number;
    let permanentFadeOutTimeout: number;
    let resetTimeout: number;

    // Small initial delay to ensure DOM updates apply before transition
    initialShowTimeout = setTimeout(() => {
      // Immediately activate the container to trigger its initial fade-in
      container.classList.add("is-active");

      // Apply blinking animation to main text
      mainTextElement.classList.add("is-blinking");

      // Fade in description text after a short delay
      descriptionFadeInTimeout = setTimeout(() => {
        descriptionElement.classList.add("is-visible");
      }, opts.blinkDuration / 2);

      // Fade out main message after its blinking and hold sequence
      mainTextFadeOutTimeout = setTimeout(() => {
        mainTextElement.classList.remove("is-blinking"); // Stop blinking animation
        mainTextElement.style.animation = "none"; // Ensure animation is fully off
        //TESTING removed: mainTextElement.style.opacity = "0"; // Directly hide it
        mainTextElement.style.transition = "opacity 0.2s ease-out"; // For the quick hide
      }, totalMainMessageDisplayDuration);

      // Permanent fade out of the entire container (description included)
      permanentFadeOutTimeout = setTimeout(() => {
        container.classList.add("fade-out-permanent");
      }, totalDescriptionDisplayDuration);

      // Reset elements and trigger next warning after permanent fade-out
      resetTimeout = setTimeout(() => {
        // Clear all dynamic styles and classes
        container.classList.remove("is-active", "fade-out-permanent");
        //TESTING removed: container.style.opacity = "0";

        mainTextElement.classList.remove("is-blinking");

        //descriptionElement.classList.remove("is-visible");
        //TESTING removed: descriptionElement.style.opacity = "0";

        warningFinished(); // Notify store that this warning is done
        triggerNextWarning(); // Tell store to try and display the next warning in queue
      }, totalDescriptionDisplayDuration + opts.permanentFadeDuration + 100); // Add a small buffer
    }, 50); // Initial small delay to ensure DOM updates applied before transitions

    // Cleanup function for useEffect: clear all pending timeouts if component unmounts
    // or if `currentWarning` changes before a sequence completes
    return () => {
      clearTimeout(initialShowTimeout);
      clearTimeout(descriptionFadeInTimeout);
      clearTimeout(mainTextFadeOutTimeout);
      clearTimeout(permanentFadeOutTimeout);
      clearTimeout(resetTimeout);
    };
  }, [currentWarning]); // Dependency array: Effect runs when `currentWarning` changes

  useEffect(() => {
    // Trigger a default warning after 2 seconds
    const timeout1 = setTimeout(() => {
      queueWarning();
    }, 2000);

    // Trigger a custom warning after 5 seconds
    const timeout2 = setTimeout(() => {
      queueWarning({
        mainText: "CRITICAL HEALTH",
        descriptionText: "SEEK COVER IMMEDIATELY",
        mainColor: "rgba(255, 20, 20, 0.9)", // Darker red
        descriptionColor: "rgba(255, 200, 0, 0.9)", // Orange-yellow
        blinkCount: 4,
        blinkDuration: 200, // Faster blink
        descriptionDelay: 800,
        permanentFadeDuration: 800,
      });
    }, 5000);

    // Queue another default warning to demonstrate queuing
    const timeout3 = setTimeout(() => {
      queueWarning({
        mainText: "REINFORCEMENTS ARRIVING",
        descriptionText: "HOLD THE LINE!",
        mainColor: "rgba(0, 255, 0, 0.8)", // Green
        descriptionColor: "rgba(200, 200, 255, 0.9)", // Light blue
      });
    }, 8000);
  }, []); // Empty dependency array to run once on mount

  return (
    <div
      id="warning-hud"
      ref={containerRef}
      className="warning-container font-['CyberAlert']"
      aria-live="polite"
      aria-atomic="true"
    >
      <p id="warning-main-text" ref={mainTextRef} className="warning-main-text">
        WARNING
      </p>
      <p
        id="warning-description"
        ref={descriptionRef}
        className="warning-description"
      ></p>
    </div>
  );
};

export default WarningMessage;
