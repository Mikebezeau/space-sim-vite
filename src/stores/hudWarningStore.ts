import { create } from "zustand";
//import { ifChangedUpdateStyle } from "../util/gameUtil";

export interface WarningMessageOptions {
  id: string;
  mainText: string;
  descriptionText: string;
  mainColor: string;
  descriptionColor: string; // EVENT_TYPE that must be met for this message to complete
  eventCompletionCondition?: number; // EVENT_TYPE that must be met for this message to complete
  eventConditionCount: number; // number of times completion condition must be met before the message disappears
  eventConditionCountCurrent: number; // Current count of how many times the condition has been met
  // if no event condition, completionCondition may be set to a function that returns a boolean
  // Condition that must be met for this message to disappear and the next to show
  completionCondition?: () => boolean;
}

interface ActiveWarningState extends WarningMessageOptions {
  currentPhase:
    | "showMessage"
    | "showDescription"
    | "finishBlink"
    | "waitingForCompletion"
    | "endMessage";
  accumulatedTime: number; // Total time (seconds) elapsed for current warning
}

interface hudWarningStoreInt {
  // Refs to DOM elements (set by the React component)
  warningContainerRef: HTMLElement | null;
  warningMainTextRef: HTMLElement | null;
  warningDescriptionRef: HTMLElement | null;

  currentActiveWarning: ActiveWarningState | null; // The warning currently being processed
  warningQueue: WarningMessageOptions[]; // Queue of warnings waiting

  setWarningRefs: (
    container: HTMLElement,
    mainText: HTMLElement,
    description: HTMLElement
  ) => void;

  // Action to add a warning to the queue
  queueWarning: (options?: Partial<Omit<WarningMessageOptions, "id">>) => void;

  // Function to be called every frame
  updateWarningMessage: (deltaTime: number) => Promise<void>;
}

const defaultWarningOptions: Omit<WarningMessageOptions, "id"> = {
  mainText: "DEFAULT OPTIONS",
  descriptionText: "Set warning options",
  mainColor: "rgba(255, 255, 0, 0.7)",
  descriptionColor: "rgba(255, 255, 255, 0.9)",
  eventConditionCount: 1,
  eventConditionCountCurrent: 0,
};

const useHudWarningStore = create<hudWarningStoreInt>((set, get) => ({
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
    get().updateWarningMessage(0);
  },

  queueWarning: (options) => {
    const newWarning: WarningMessageOptions = {
      id: crypto.randomUUID(),
      ...defaultWarningOptions,
      ...options,
    };
    // if event, set completionCondition to check if the event condition count has been met
    if (newWarning.eventCompletionCondition !== undefined) {
      newWarning.completionCondition = () =>
        // completionCondition checks if the event condition count has been met
        get().currentActiveWarning!.eventConditionCountCurrent >=
        get().currentActiveWarning!.eventConditionCount;
    }

    set((state) => ({ warningQueue: [...state.warningQueue, newWarning] }));
  },

  updateWarningMessage: async (deltaTime: number) => {
    const {
      warningContainerRef,
      warningMainTextRef,
      warningDescriptionRef,
      warningQueue,
    } = get();

    if (!warningContainerRef || !warningMainTextRef || !warningDescriptionRef) {
      return; // Cannot proceed without refs
    }

    // pick the next warning from the queue
    if (!get().currentActiveWarning && warningQueue.length > 0) {
      // If no active warning, take the first one from the queue
      // Note: This assumes the queue is ordered by priority or time added
      // If you want to prioritize differently, you can modify this logic
      const newWarningOptions = warningQueue[0]; // Peek at the next warning
      // Create the new active warning object and immediately initialize accumulatedTime to 0
      set({
        currentActiveWarning: {
          ...newWarningOptions,
          accumulatedTime: 0,
          currentPhase: "showMessage",
        },
        warningQueue: warningQueue.slice(1), // Remove the first item from the queue
      });
    }

    // If no active warning, nothing to do
    if (!get().currentActiveWarning) {
      return;
    }
    // Proceed with the current active warning
    get().currentActiveWarning!.accumulatedTime += deltaTime;

    switch (get().currentActiveWarning!.currentPhase) {
      case "showMessage":
        warningMainTextRef.textContent =
          get().currentActiveWarning!.mainText.toUpperCase();
        warningDescriptionRef.textContent =
          get().currentActiveWarning!.descriptionText;
        warningMainTextRef.style.color = get().currentActiveWarning!.mainColor;
        warningDescriptionRef.style.color =
          get().currentActiveWarning!.descriptionColor;
        warningMainTextRef.classList.remove("opacity-0");
        warningMainTextRef.classList.add("animate-blink3");
        warningDescriptionRef.classList.remove("-translate-y-[50vh]"); // TODO no working - use style if change
        get().currentActiveWarning!.currentPhase = "showDescription"; // DIRECT MUTATION
        break;

      case "showDescription":
        if (get().currentActiveWarning!.accumulatedTime >= 0.5) {
          warningDescriptionRef.classList.remove("opacity-0");
          get().currentActiveWarning!.currentPhase = "finishBlink"; // DIRECT MUTATION
        }
        break;

      case "finishBlink":
        if (get().currentActiveWarning!.accumulatedTime >= 1.5) {
          warningMainTextRef.classList.remove("animate-blink3");
          warningMainTextRef.classList.add("opacity-0");
          get().currentActiveWarning!.currentPhase = "waitingForCompletion"; // DIRECT MUTATION
        }
        break;

      case "waitingForCompletion":
        if (get().currentActiveWarning!.accumulatedTime < 2) {
          break;
        }

        let conditionMet = false;
        if (get().currentActiveWarning!.completionCondition !== undefined) {
          warningDescriptionRef.classList.add("-translate-y-[50vh]");
          conditionMet = get().currentActiveWarning!.completionCondition!();
        }

        if (
          conditionMet || // if completion condition is met
          (!get().currentActiveWarning!.completionCondition && // or if no completion condition
            get().currentActiveWarning!.accumulatedTime >= 6) // and enough time has passed
        ) {
          warningDescriptionRef.classList.add("opacity-0");
          get().currentActiveWarning!.currentPhase = "endMessage"; // DIRECT MUTATION
        }
        break;

      case "endMessage":
        if (
          get().currentActiveWarning!.completionCondition ||
          get().currentActiveWarning!.accumulatedTime >= 7
        ) {
          warningDescriptionRef.style.top = "0";
          set({ currentActiveWarning: null });
        }
        break;
    }
  },
}));

export default useHudWarningStore;
