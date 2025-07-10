import { create } from "zustand";
import useHudWarningStore from "./hudWarningStore";

interface eventStoreInt {
  // Function to log event
  logEvent: (eventType: number) => void;
}

const useEventStore = create<eventStoreInt>((set, get) => ({
  logEvent: (eventType: number) => {
    // check current hud message and update it if necessaryconst currentWarning = useHudWarningStore.getState().currentActiveWarning;
    const currentWarning = useHudWarningStore.getState().currentActiveWarning;
    if (currentWarning !== null) {
      // check eventCompletionCondition
      if (currentWarning.eventCompletionCondition === eventType) {
        // Increment the count of completion conditions met
        currentWarning.eventConditionCountCurrent += 1;
      }
    }
    // check current missions and update them if necessary
    console.log(`Event logged: ${eventType}`);
  },
}));

export default useEventStore;
