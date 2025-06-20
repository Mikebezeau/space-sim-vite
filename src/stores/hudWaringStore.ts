import { create } from "zustand";

// Interface for a single warning message's options
export type typeWarningMessageOptions = {
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
};

interface PlayerHudStore {
  // Current warning being displayed (null if none)
  currentWarning: typeWarningMessageOptions | null;
  // Queue of warnings waiting to be displayed
  warningQueue: typeWarningMessageOptions[];
  // Flag to indicate if the WarningMessage component is currently processing an animation
  isWarningActive: boolean;

  // Action to add a warning to the queue
  queueWarning: (
    options?: Partial<Omit<typeWarningMessageOptions, "id">>
  ) => void;
  // Action to mark a warning as finished (called by the WarningMessage component)
  warningFinished: () => void;
  // Action to trigger the next warning in the queue (called by the WarningMessage component)
  triggerNextWarning: () => void;
}

const defaultWarningOptions: Omit<typeWarningMessageOptions, "id"> = {
  mainText: "WARNING",
  descriptionText: "ENTERING BATTLE ZONE",
  mainColor: "rgba(255, 0, 0, 0.7)",
  descriptionColor: "rgba(255, 255, 255, 0.9)",
  blinkCount: 3,
  blinkDuration: 300,
  holdDuration: 500,
  descriptionDelay: 1000,
  permanentFadeDuration: 1000,
};

export const usePlayerHudStore = create<PlayerHudStore>((set, get) => ({
  currentWarning: null,
  warningQueue: [],
  isWarningActive: false,

  queueWarning: (options) => {
    const newWarning: typeWarningMessageOptions = {
      id: crypto.randomUUID(), // Generate a unique ID for each warning instance
      ...defaultWarningOptions,
      ...options,
    };

    set((state) => {
      const newQueue = [...state.warningQueue, newWarning];
      // If no warning is currently active, immediately trigger the new one
      if (!state.isWarningActive && !state.currentWarning) {
        const nextWarning = newQueue.shift(); // Take it off the queue immediately
        return {
          warningQueue: newQueue,
          currentWarning: nextWarning,
          isWarningActive: nextWarning !== null,
        };
      }
      return { warningQueue: newQueue };
    });
  },

  warningFinished: () => {
    set({ isWarningActive: false, currentWarning: null });
    // The component will call triggerNextWarning itself after this
  },

  triggerNextWarning: () => {
    set((state) => {
      if (state.warningQueue.length > 0 && !state.isWarningActive) {
        const nextWarning = state.warningQueue.shift();
        return {
          warningQueue: state.warningQueue,
          currentWarning: nextWarning,
          isWarningActive: nextWarning !== null,
        };
      }
      return {}; // No change if queue is empty or active
    });
  },

  // ... other HUD actions and state (if any)
}));
