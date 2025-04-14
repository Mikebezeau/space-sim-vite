import { useEffect } from "react";
import { setCustomData } from "r3f-perf";

const ongoingTouches = [];

const ongoingTouchIndexById = (idToFind) => {
  for (let i = 0; i < ongoingTouches.length; i++) {
    const id = ongoingTouches[i].identifier;

    if (id === idToFind) {
      return i;
    }
  }
  return -1; // not found
};

const copyidentifier = ({ identifier }) => {
  return identifier;
};

const handleStart = (evt, eventCallbacks) => {
  //evt.preventDefault();
  const touches = evt.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    if (ongoingTouchIndexById(touches[i].identifier) === -1) {
      // add touch if not in list
      ongoingTouches.push({
        identifier: copyidentifier(touches[i]),
        eventCallbacks,
      });
    }
  }
};

const handleMove = (evt) => {
  evt.preventDefault();
  const touches = evt.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    const index = ongoingTouchIndexById(touches[i].identifier);

    if (index >= 0) {
      console.log(ongoingTouches[index].eventCallbacks.handleMove);
      ongoingTouches[index].eventCallbacks.handleMove(evt, touches[i]);

      const eventCallbacks = ongoingTouches[index].eventCallbacks;
      ongoingTouches.splice(index, 1, {
        identifier: copyidentifier(touches[i]),
        eventCallbacks,
      }); // swap in the new touch record
    }
  }
};

const handleEnd = (evt) => {
  //evt.preventDefault();
  const touches = evt.changedTouches;
  setCustomData(touches.length + 2.1);

  for (let i = 0; i < touches.length; i++) {
    let index = ongoingTouchIndexById(touches[i].identifier);
    if (index >= 0) {
      ongoingTouches.splice(index, 1); // remove it; we're done
    }
  }
};

function handleCancel(evt) {
  //evt.preventDefault();
  const touches = evt.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    let index = ongoingTouchIndexById(touches[i].identifier);
    ongoingTouches.splice(index, 1); // remove it; we're done
  }
}

export const useMultiTouchEventRegister = (elementID, eventCallbacks = {}) => {
  useEffect(() => {
    const element = document.getElementById(elementID);
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;
    element.addEventListener("touchstart", (evt) => {
      handleStart(evt, eventCallbacks);
    });
    element.addEventListener("touchend", handleEnd);
    element.addEventListener("touchcancel", handleCancel);
    element.addEventListener("touchmove", handleMove);

    return () => {
      element.removeEventListener("touchstart", (evt) => {
        handleStart(evt, eventCallbacks);
      });
      element.removeEventListener("touchend", handleEnd);
      element.removeEventListener("touchcancel", handleCancel);
      element.removeEventListener("touchmove", handleMove);
      // remove all ongoing touches
      ongoingTouches.length = 0; // clear the array
    };
  }, []);
};
