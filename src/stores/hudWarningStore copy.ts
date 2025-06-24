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

interface hudWarningStoreInt {
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
  updateWarningMessage: (deltaTime: number) => Promise<void>;
}

const defaultWarningOptions: Omit<WarningMessageOptions, "id"> = {
  mainText: "DEFAULT OPTIONS",
  descriptionText: "Set warning options",
  mainColor: "rgba(255, 255, 0, 0.7)", // Yellow for tutorial messages
  descriptionColor: "rgba(255, 255, 255, 0.9)",
  blinkCount: 4, // Shorter blink for tutorials
  blinkDuration: 1000,
  holdDuration: 2000,
  descriptionDelay: 500, // Description stays longer
  permanentFadeDuration: 1000, // Quicker fade out
  displayDurationAfterAnimation: 500, // Default 2 seconds if no condition
};

const useHudWarningStore = create<hudWarningStoreInt>((set, get) => ({
  warningContainerRef: null,
  warningMainTextRef: null,
  warningDescriptionRef: null,
  currentActiveWarning: null,
  warningQueue: [],

  setWarningRefs: (container, mainText, description) => {
    // Direct mutation is okay for refs as they're not part of the observable state for components
    get().warningContainerRef = container;
    get().warningMainTextRef = mainText;
    get().warningDescriptionRef = description;
    void get().updateWarningMessage(0);
  },

  queueWarning: (options) => {
    const newWarning: WarningMessageOptions = {
      id: crypto.randomUUID(),
      ...defaultWarningOptions,
      ...options,
    };

    // For arrays, it's generally best to use 'set' to replace the array immutably
    set((state) => ({ warningQueue: [...state.warningQueue, newWarning] }));
    void get().updateWarningMessage(0);
  },

  updateWarningMessage: async (deltaTime: number) => {
    deltaTime *= 1000;
    const store = get(); // Get the current store instance for direct mutations
    const {
      warningContainerRef,
      warningMainTextRef,
      warningDescriptionRef,
      warningQueue,
    } = store;

    if (!warningContainerRef || !warningMainTextRef || !warningDescriptionRef) {
      return; // Cannot proceed without refs
    }

    let currentActiveWarning = store.currentActiveWarning; // Get the current active warning from state directly

    // --- Logic to pick the next warning from the queue ---
    if (!currentActiveWarning && warningQueue.length > 0) {
      const newWarningOptions = warningQueue[0]; // Peek at the next warning
      // Create the new active warning object and immediately initialize accumulatedTime to 0
      currentActiveWarning = {
        ...newWarningOptions,
        accumulatedTime: 0, // <--- CRITICAL RESET HERE!
        currentPhase: "initialFadeIn",
        blinkCycleCount: 0,
        hasAnimationCompleted: false,
      };
      // Use 'set' to replace the top-level currentActiveWarning and modify the queue immutably
      set((state) => ({
        currentActiveWarning: currentActiveWarning,
        warningQueue: state.warningQueue.slice(1),
      }));
    }

    // If after the above logic, there's still no active warning (queue empty or not picked yet)
    if (!currentActiveWarning) {
      // No warning active and queue is empty, ensure elements are completely hidden and reset
      if (
        warningContainerRef.style.opacity !== "0" ||
        warningContainerRef.style.visibility !== "hidden"
      ) {
        warningContainerRef.style.transition = "";
        warningContainerRef.style.opacity = "0";
        warningContainerRef.style.visibility = "hidden";
        warningMainTextRef.style.animation = "";
        warningMainTextRef.style.opacity = "";
        warningMainTextRef.style.transition = "";
        warningDescriptionRef.style.opacity = "0";
      }
      return;
    }

    // --- From here on, we know `currentActiveWarning` is active and valid ---

    // Directly mutate properties of the active warning object within the store
    // This is where 'get().variable = value' comes into play for internal object properties.
    currentActiveWarning.accumulatedTime += deltaTime; // DIRECT MUTATION
    const opts = currentActiveWarning; // Alias for brevity

    const container = warningContainerRef;
    const mainText = warningMainTextRef;
    const description = warningDescriptionRef;

    const totalBlinkAnimationDuration = opts.blinkCount * opts.blinkDuration;
    const totalMainMessageDisplayDuration =
      totalBlinkAnimationDuration + opts.holdDuration;
    const totalDescriptionDisplayDuration =
      totalMainMessageDisplayDuration + opts.descriptionDelay;

    // Helper to perform cleanup and advance to next message
    const completeCurrentWarning = () => {
      container.style.transition = "";
      container.style.opacity = "0";
      container.style.visibility = "hidden";
      mainText.style.animation = "";
      mainText.style.opacity = "";
      mainText.style.transition = "";
      description.style.opacity = "0";

      // Use 'set' to nullify the top-level currentActiveWarning
      set({ currentActiveWarning: null });
      // Immediately attempt to pick and start the next warning in the queue
      void store.updateWarningMessage(0); // Call through `store` alias for clarity
    };

    // --- State Machine Logic ---
    switch (currentActiveWarning.currentPhase) {
      case "initialFadeIn":
        mainText.textContent = opts.mainText.toUpperCase();
        description.textContent = opts.descriptionText;
        mainText.style.color = opts.mainColor;
        description.style.color = opts.descriptionColor;

        container.style.setProperty(
          "--blink-duration",
          `${opts.blinkDuration / 1000}s`
        );
        container.style.setProperty("--blink-count", String(opts.blinkCount));

        container.style.transition =
          "opacity 0.2s ease-in, visibility 0.2s ease-in";
        container.style.opacity = "1";
        container.style.visibility = "visible";

        if (currentActiveWarning.accumulatedTime >= 200) {
          currentActiveWarning.currentPhase = "blinking"; // DIRECT MUTATION
          mainText.style.animation = `warnBlink var(--blink-duration) ease-in-out infinite`;
          description.style.opacity = "1";
        }
        break;

      case "blinking":
        if (
          currentActiveWarning.accumulatedTime >= totalBlinkAnimationDuration
        ) {
          mainText.style.animation = "none";
          mainText.style.opacity = "0";
          mainText.style.transition = "opacity 0.2s ease-out";
          currentActiveWarning.currentPhase = "holding"; // DIRECT MUTATION
        }
        break;

      case "holding":
        if (
          currentActiveWarning.accumulatedTime >=
          totalMainMessageDisplayDuration
        ) {
          currentActiveWarning.currentPhase = "descriptionDelay"; // DIRECT MUTATION
        }
        break;

      case "descriptionDelay":
        if (
          currentActiveWarning.accumulatedTime >=
          totalDescriptionDisplayDuration
        ) {
          currentActiveWarning.hasAnimationCompleted = true; // DIRECT MUTATION
          container.style.transition =
            "opacity 0.3s ease-out, visibility 0.3s ease-out";
          currentActiveWarning.currentPhase = "waitingForCompletion"; // DIRECT MUTATION
        }
        break;

      case "waitingForCompletion":
        if (!currentActiveWarning.hasAnimationCompleted) {
          console.warn(
            "WarningMessage: In waitingForCompletion but animation not marked complete!"
          );
          break;
        }

        const minDisplayTimeBeforeConditionCheck = 100;
        if (
          currentActiveWarning.accumulatedTime <
          totalDescriptionDisplayDuration + minDisplayTimeBeforeConditionCheck
        ) {
          break;
        }

        let conditionMet = false;
        if (opts.completionCondition) {
          const result = opts.completionCondition();
          if (result instanceof Promise) {
            conditionMet = await result;
          } else {
            conditionMet = result;
          }
        }

        const shouldFadeOutByCondition = conditionMet;
        const shouldFadeOutByTimer =
          opts.displayDurationAfterAnimation &&
          currentActiveWarning.accumulatedTime >=
            totalDescriptionDisplayDuration +
              opts.displayDurationAfterAnimation;

        if (shouldFadeOutByCondition || shouldFadeOutByTimer) {
          container.style.transition = `opacity ${
            opts.permanentFadeDuration / 1000
          }s ease-out, visibility ${
            opts.permanentFadeDuration / 1000
          }s ease-out`;
          container.style.opacity = "0";
          container.style.visibility = "hidden";
          currentActiveWarning.currentPhase = "permanentFadeOut"; // DIRECT MUTATION
        }
        break;

      case "permanentFadeOut":
        const totalPermanentDuration =
          totalDescriptionDisplayDuration + opts.permanentFadeDuration;
        if (currentActiveWarning.accumulatedTime >= totalPermanentDuration) {
          currentActiveWarning.currentPhase = "finished"; // DIRECT MUTATION
          completeCurrentWarning();
        }
        break;

      case "finished":
        break;
    }
    // No top-level 'set' call needed here for `currentActiveWarning` itself
    // because its *properties* are being mutated directly within this function scope.
    // However, if the store itself were being observed (e.g., in a React component
    // doing `usePlayerHudStore(state => state.currentActiveWarning.someProperty)`),
    // those observers might not re-render unless `set` is called on the top-level object
    // or a shallow copy is made and `set` is called.
    // Given your goal of NO RE-RENDERS for the component, this direct mutation
    // on internal properties is what you're asking for.
  },
}));

export default useHudWarningStore;
