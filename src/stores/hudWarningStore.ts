import { create } from "zustand";

// Interface for a single tutorial step/warning message's options
export interface WarningMessageOptions {
  id: string; // Unique ID for each message instance in the queue
  mainText: string;
  descriptionText: string;
  mainColor: string;
  descriptionColor: string;
  blinkCount: number; // How many times it blinks (fade in/out)
  blinkDuration: number; // Duration of one blink cycle (in ms)
  holdDuration: number; // How long the main message holds after blinks (before final fade) (in ms)
  descriptionDelay: number; // How long description stays after main message (in ms)
  permanentFadeDuration: number; // Duration of the final fade out (in ms)
  // New: Condition that must be met for this message to disappear and the next to show
  completionCondition?: () => boolean | Promise<boolean>;
  // Optional: How long the message should stay on screen after the animation, if no condition is met, or as a fallback
  displayDurationAfterAnimation?: number;
}

// Internal state for an active warning to manage its animation lifecycle
interface ActiveWarningState extends WarningMessageOptions {
  startTime: number; // timestamp when this message became active
  currentPhase:
    | "initialFadeIn"
    | "blinking"
    | "holding"
    | "descriptionDelay"
    | "waitingForCompletion"
    | "permanentFadeOut"
    | "finished";
  blinkCycleCount: number; // how many blinks completed (not directly used for current CSS class method but useful for debugging)
  accumulatedTime: number; // Total time elapsed for current warning
  hasAnimationCompleted: boolean; // Flag if the initial fade/blink/hold animation is done
}

interface PlayerHudStore {
  // Refs to the actual DOM elements (set by the React component)
  warningContainerRef: HTMLElement | null;
  warningMainTextRef: HTMLElement | null;
  warningDescriptionRef: HTMLElement | null;

  currentActiveWarning: ActiveWarningState | null; // The warning currently being processed
  warningQueue: WarningMessageOptions[]; // Queue of warnings waiting

  // Actions to register DOM refs
  setWarningRefs: (
    container: HTMLElement,
    mainText: HTMLElement,
    description: HTMLElement
  ) => void;

  // Action to add a warning to the queue
  queueWarning: (options?: Partial<Omit<WarningMessageOptions, "id">>) => void;

  // Function to be called every frame (e.g., from your game loop)
  updateWarningMessage: (deltaTime: number) => Promise<void>; // Added Promise<void> for async
}

const defaultWarningOptions: Omit<WarningMessageOptions, "id"> = {
  mainText: "TUTORIAL",
  descriptionText: "Complete the objective.",
  mainColor: "rgba(255, 255, 0, 0.7)", // Yellow for tutorial messages
  descriptionColor: "rgba(255, 255, 255, 0.9)",
  blinkCount: 1, // Shorter blink for tutorials
  blinkDuration: 400,
  holdDuration: 1000,
  descriptionDelay: 1000, // Description stays longer
  permanentFadeDuration: 500, // Quicker fade out
  displayDurationAfterAnimation: 2000, // Default 2 seconds if no condition
};

const useHudWarningStoreStore = create<PlayerHudStore>((set, get) => ({
  warningContainerRef: null,
  warningMainTextRef: null,
  warningDescriptionRef: null,
  currentActiveWarning: null,
  warningQueue: [],

  setWarningRefs: (container, mainText, description) => {
    set({
      warningContainerRef: container,
      warningMainTextRef: mainText,
      warningDescriptionRef: description,
    });
    // Important: Immediately try to process a queued warning if one exists
    // and refs are now available. Call async to ensure it runs correctly.
    void get().updateWarningMessage(0);
  },

  queueWarning: (options) => {
    const newWarning: WarningMessageOptions = {
      id: crypto.randomUUID(),
      ...defaultWarningOptions,
      ...options,
    };

    set((state) => {
      const newQueue = [...state.warningQueue, newWarning];
      return { warningQueue: newQueue };
    });
    // Check if a new message can be started (async call)
    void get().updateWarningMessage(0);
  },

  updateWarningMessage: async (deltaTime: number) => {
    deltaTime *= 1000;
    // Made async to handle Promises
    const state = get();
    const {
      warningContainerRef,
      warningMainTextRef,
      warningDescriptionRef,
      currentActiveWarning,
      warningQueue,
    } = state;

    if (!warningContainerRef || !warningMainTextRef || !warningDescriptionRef) {
      return; // Cannot proceed without refs
    }

    let nextWarningToProcess: ActiveWarningState | null = currentActiveWarning;

    // If no warning is active, check the queue
    if (!nextWarningToProcess && warningQueue.length > 0) {
      const newWarningOptions = warningQueue[0]; // Peek at the next warning
      nextWarningToProcess = {
        ...newWarningOptions,
        startTime: performance.now(), // Capture start time for this message
        accumulatedTime: 0,
        currentPhase: "initialFadeIn",
        blinkCycleCount: 0,
        hasAnimationCompleted: false, // Reset flag
      };
      // Atomically update state, removing from queue and setting active warning
      set((prevState) => ({
        currentActiveWarning: nextWarningToProcess,
        warningQueue: prevState.warningQueue.slice(1),
      }));
      // Update the local reference after state set (important for this frame's processing)
      nextWarningToProcess = get().currentActiveWarning;
    }

    if (!nextWarningToProcess) {
      // No warning active and queue is empty, ensure hidden
      if (
        warningContainerRef.style.opacity !== "0" ||
        warningContainerRef.style.visibility !== "hidden"
      ) {
        warningContainerRef.style.transition = ""; // Clear any active transitions
        warningContainerRef.style.opacity = "0";
        warningContainerRef.style.visibility = "hidden";
        warningMainTextRef.style.animation = ""; // Clear blinking animation
        warningMainTextRef.style.opacity = ""; // Reset opacity from any previous blinking state
        warningMainTextRef.style.transition = ""; // Reset transition
        warningDescriptionRef.style.opacity = "0"; // Ensure description is hidden
      }
      return; // Nothing to animate
    }

    // Update accumulated time for the active warning
    nextWarningToProcess.accumulatedTime += deltaTime;

    const container = warningContainerRef;
    const mainText = warningMainTextRef;
    const description = warningDescriptionRef;
    const opts = nextWarningToProcess; // The active warning's options

    const totalBlinkAnimationDuration = opts.blinkCount * opts.blinkDuration;
    const totalMainMessageDisplayDuration =
      totalBlinkAnimationDuration + opts.holdDuration;
    const totalDescriptionDisplayDuration =
      totalMainMessageDisplayDuration + opts.descriptionDelay;

    // Helper to perform cleanup and advance to next message
    const completeCurrentWarning = () => {
      // Reset elements for next usage, clear active warning, and trigger next
      container.style.transition = ""; // Clear transition for immediate snap
      container.style.opacity = "0";
      container.style.visibility = "hidden";

      mainText.style.animation = ""; // Clear blinking
      mainText.style.opacity = ""; // Reset if it was set during blinking
      mainText.style.transition = ""; // Reset transition

      description.style.opacity = "0"; // Ensure hidden

      set({ currentActiveWarning: null }); // Mark as finished
      void get().updateWarningMessage(0); // Immediately try to process next in queue
    };

    switch (nextWarningToProcess.currentPhase) {
      case "initialFadeIn":
        // Initial setup and appearance
        mainText.textContent = opts.mainText.toUpperCase();
        description.textContent = opts.descriptionText;
        mainText.style.color = opts.mainColor;
        description.style.color = opts.descriptionColor;

        // Set CSS variables for animation durations/counts
        container.style.setProperty(
          "--blink-duration",
          `${opts.blinkDuration / 1000}s`
        );
        container.style.setProperty("--blink-count", String(opts.blinkCount));

        // Apply initial fade-in transition
        container.style.transition =
          "opacity 0.2s ease-in, visibility 0.2s ease-in";
        container.style.opacity = "1";
        container.style.visibility = "visible";

        if (nextWarningToProcess.accumulatedTime >= 200) {
          // Small initial fade-in duration
          nextWarningToProcess.currentPhase = "blinking";
          mainText.style.animation = `warnBlink var(--blink-duration) ease-in-out infinite`;
          description.style.opacity = "1"; // Fade in description
        }
        break;

      case "blinking":
        // Manage blinking, then transition to holding
        if (
          nextWarningToProcess.accumulatedTime >= totalBlinkAnimationDuration
        ) {
          mainText.style.animation = "none"; // Stop blinking animation
          mainText.style.opacity = "0"; // Immediately hide main text
          mainText.style.transition = "opacity 0.2s ease-out"; // For the quick hide
          nextWarningToProcess.currentPhase = "holding";
        }
        break;

      case "holding":
        // Main text is hidden, description is visible. Wait for hold duration.
        if (
          nextWarningToProcess.accumulatedTime >=
          totalMainMessageDisplayDuration
        ) {
          nextWarningToProcess.currentPhase = "descriptionDelay";
        }
        break;

      case "descriptionDelay":
        // Description is visible. Wait for its additional display time.
        if (
          nextWarningToProcess.accumulatedTime >=
          totalDescriptionDisplayDuration
        ) {
          // Animation is complete for all visual elements.
          // Now we officially enter the 'waitingForCompletion' phase.
          nextWarningToProcess.hasAnimationCompleted = true; // Mark animation as done
          // Reset container transition to default for smoother general fade-out (if it happens via timer)
          container.style.transition =
            "opacity 0.3s ease-out, visibility 0.3s ease-out";
          nextWarningToProcess.currentPhase = "waitingForCompletion";
        }
        break;

      case "waitingForCompletion":
        if (!nextWarningToProcess.hasAnimationCompleted) {
          console.warn(
            "WarningMessage: In waitingForCompletion but animation not marked complete!"
          );
          break;
        }

        // NEW ADDITION HERE: Minimum display time before checking the condition
        const minDisplayTimeBeforeConditionCheck = 100; // 100ms buffer
        if (
          nextWarningToProcess.accumulatedTime <
          totalDescriptionDisplayDuration + minDisplayTimeBeforeConditionCheck
        ) {
          // console.log(`Waiting for minimum display time: ${nextWarningToProcess.accumulatedTime} / ${totalDescriptionDisplayDuration + minDisplayTimeBeforeConditionCheck}`);
          break; // Wait for minimum display time to pass in this phase
        }

        let conditionMet = false;
        if (opts.completionCondition) {
          const result = opts.completionCondition();
          if (result instanceof Promise) {
            conditionMet = await result; // Await the promise
          } else {
            conditionMet = result;
          }
        }

        const shouldFadeOutByCondition = conditionMet;

        const shouldFadeOutByTimer =
          opts.displayDurationAfterAnimation &&
          nextWarningToProcess.accumulatedTime >=
            totalDescriptionDisplayDuration +
              opts.displayDurationAfterAnimation;
        if (shouldFadeOutByCondition || shouldFadeOutByTimer) {
          // CRITICAL FIX: Ensure the correct permanent fade-out transition is applied
          // BEFORE setting opacity to 0 to trigger that transition.
          container.style.transition = `opacity ${
            opts.permanentFadeDuration / 1000
          }s ease-out, visibility ${
            opts.permanentFadeDuration / 1000
          }s ease-out`;
          container.style.opacity = "0";
          container.style.visibility = "hidden";
          nextWarningToProcess.currentPhase = "permanentFadeOut";
        }
        break;

      case "permanentFadeOut":
        // Wait for the final fade-out to complete
        // The `permanentFadeDuration` has already been applied via transition,
        // so we just wait for the `accumulatedTime` to surpass total expected duration.
        const totalPermanentDuration =
          totalDescriptionDisplayDuration + opts.permanentFadeDuration;
        if (nextWarningToProcess.accumulatedTime >= totalPermanentDuration) {
          nextWarningToProcess.currentPhase = "finished";
          completeCurrentWarning(); // Clean up and advance queue
        }
        break;

      case "finished":
        // This state should quickly lead to `currentActiveWarning` becoming null
        // as `completeCurrentWarning()` handles clearing it.
        break;
    }

    // Always ensure the current active warning's state is committed to Zustand
    // This is important for devtools and for the next frame's `get().currentActiveWarning`
    if (get().currentActiveWarning !== nextWarningToProcess) {
      set({ currentActiveWarning: nextWarningToProcess });
    }
  },
}));

export default useHudWarningStoreStore;
