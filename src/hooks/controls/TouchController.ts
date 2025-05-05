type TouchCallback = (event: TouchEvent, touch: Touch) => void;

export type optionsType = {};

interface ElementEntry {
  element: HTMLElement;
  eventCallbacks: {
    touchStart?: TouchCallback;
    touchMove?: TouchCallback;
    touchEnd?: TouchCallback;
  };
  activeTouches: Map<number, Touch>; // Keeps track of active touches by their identifier
  options: optionsType;
  eventListeners: {
    //TODO use the type
    touchStart: (event: TouchEvent) => void;
    touchMove: (event: TouchEvent) => void;
    touchEnd: (event: TouchEvent) => void;
    touchCancel: (event: TouchEvent) => void;
  };
}

class TouchController {
  private elements: ElementEntry[] = [];

  // Register an element with its touch event callbacks
  public registerElement(
    element: HTMLElement,
    eventCallbacks: {
      touchStart?: TouchCallback;
      touchMove?: TouchCallback;
      touchEnd?: TouchCallback;
    },
    options?: optionsType
  ): void {
    const listeners = {
      touchStart: (event: TouchEvent) => this.handleTouchStart(entry, event),
      touchMove: (event: TouchEvent) => this.handleTouchMove(entry, event),
      touchEnd: (event: TouchEvent) => this.handleTouchEnd(entry, event),
      touchCancel: (event: TouchEvent) => this.handleTouchEnd(entry, event),
    };

    const entry: ElementEntry = {
      element,
      eventCallbacks,
      activeTouches: new Map(),
      options: options || {},
      eventListeners: listeners,
    };

    // Add event listeners for touch events
    element.addEventListener("touchstart", entry.eventListeners.touchStart);
    element.addEventListener("touchmove", entry.eventListeners.touchMove);

    element.addEventListener("touchend", entry.eventListeners.touchEnd);
    element.addEventListener("touchcancel", entry.eventListeners.touchCancel);
    // Store the element and its listeners
    this.elements.push(entry);
  }

  // Unregister an element and remove its event listeners
  public unregisterElement(element: HTMLElement): void {
    const index = this.elements.findIndex((entry) => entry.element === element);
    if (index !== -1) {
      const entry = this.elements[index];
      element.removeEventListener(
        "touchstart",
        entry.eventListeners.touchStart
      );
      element.removeEventListener("touchmove", entry.eventListeners.touchMove);
      element.removeEventListener("touchend", entry.eventListeners.touchEnd);
      element.removeEventListener(
        "touchcancel",
        entry.eventListeners.touchCancel
      );
      this.elements.splice(index, 1);
    } else {
      console.warn("unregisterElement not found", this.elements);
    }
  }

  // Handle touchstart event
  private handleTouchStart(entry: ElementEntry, event: TouchEvent): void {
    for (const touch of Array.from(event.changedTouches)) {
      entry.activeTouches.set(touch.identifier, touch); // Track the touch by its identifier
      entry.eventCallbacks.touchStart?.(event, touch); // Call the touchStart callback if provided
    }
  }

  // Handle touchmove event
  private handleTouchMove(entry: ElementEntry, event: TouchEvent): void {
    for (const touch of Array.from(event.changedTouches)) {
      const activeTouch = entry.activeTouches.get(touch.identifier);
      if (activeTouch) {
        entry.activeTouches.set(touch.identifier, touch); // Update the touch position
        entry.eventCallbacks.touchMove?.(event, touch); // Call the touchMove callback if provided
      }
    }
  }

  // Handle touchend or touchcancel event
  private handleTouchEnd(entry: ElementEntry, event: TouchEvent): void {
    for (const touch of Array.from(event.changedTouches)) {
      if (entry.activeTouches.has(touch.identifier)) {
        entry.activeTouches.delete(touch.identifier); // Remove the touch from activeTouches
        entry.eventCallbacks.touchEnd?.(event, touch); // Call the touchEnd callback if provided
      }
    }
  }
}

export default TouchController;
