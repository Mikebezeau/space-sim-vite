import { create } from "zustand";
//import { ifChangedUpdateStyle } from "../util/gameUtil";

export interface WarningMessageOptions {
  id: string;
  mainText: string;
  descriptionText: string;
  mainColor: string;
  descriptionColor: string;
  // Condition that must be met for this message to disappear and the next to show
  completionCondition?: () => boolean | Promise<boolean>;
}

interface ActiveWarningState extends WarningMessageOptions {
  currentPhase:
    | "showMessage"
    | "showDescription"
    | "blinkFinished"
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
      console.log("WarningMessage: Picking next warning from queue");
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

    const mainText = warningMainTextRef;
    const description = warningDescriptionRef;

    switch (get().currentActiveWarning!.currentPhase) {
      case "showMessage":
        mainText.textContent =
          get().currentActiveWarning!.mainText.toUpperCase();
        description.textContent = get().currentActiveWarning!.descriptionText;
        mainText.style.color = get().currentActiveWarning!.mainColor;
        description.style.color = get().currentActiveWarning!.descriptionColor;
        mainText.classList.remove("opacity-0");
        mainText.classList.add("animate-blink3");
        description.classList.remove("-translate-y-[50vh]");
        get().currentActiveWarning!.currentPhase = "showDescription"; // DIRECT MUTATION
        break;

      case "showDescription":
        if (get().currentActiveWarning!.accumulatedTime >= 1) {
          description.classList.remove("opacity-0");
          get().currentActiveWarning!.currentPhase = "blinkFinished"; // DIRECT MUTATION
        }
        break;

      case "blinkFinished":
        if (get().currentActiveWarning!.accumulatedTime >= 2) {
          mainText.classList.remove("animate-blink3");
          mainText.classList.add("opacity-0");
          get().currentActiveWarning!.currentPhase = "waitingForCompletion"; // DIRECT MUTATION
        }
        break;

      case "waitingForCompletion":
        if (get().currentActiveWarning!.accumulatedTime < 5) {
          break;
        }

        let conditionMet = false;
        if (get().currentActiveWarning!.completionCondition !== undefined) {
          description.classList.add("-translate-y-[50vh]");
          const result = get().currentActiveWarning!.completionCondition!();
          if (result instanceof Promise) {
            conditionMet = await result;
          } else {
            conditionMet = result;
          }
        }

        if (
          conditionMet ||
          (!get().currentActiveWarning!.completionCondition &&
            get().currentActiveWarning!.accumulatedTime >= 6)
        ) {
          description.classList.add("opacity-0");
          get().currentActiveWarning!.currentPhase = "endMessage"; // DIRECT MUTATION
        }
        break;

      case "endMessage":
        if (get().currentActiveWarning!.accumulatedTime >= 7) {
          description.style.top = "0";
          set({ currentActiveWarning: null });
        }
        break;
    }
  },
}));

export default useHudWarningStore;
