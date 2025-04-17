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
    const entry: ElementEntry = {
      element,
      eventCallbacks,
      activeTouches: new Map(),
      options: options || {},
    };

    // Add event listeners for touch events
    const handleTouchStart = (event: TouchEvent) =>
      this.handleTouchStart(entry, event);
    const handleTouchMove = (event: TouchEvent) =>
      this.handleTouchMove(entry, event);
    const handleTouchEnd = (event: TouchEvent) =>
      this.handleTouchEnd(entry, event);

    element.addEventListener("touchstart", handleTouchStart);
    element.addEventListener("touchmove", handleTouchMove);
    element.addEventListener("touchend", handleTouchEnd);
    element.addEventListener("touchcancel", handleTouchEnd);

    // Store the element and its listeners
    this.elements.push(entry);
  }

  // Unregister an element and remove its event listeners
  public unregisterElement(element: HTMLElement): void {
    const index = this.elements.findIndex((entry) => entry.element === element);
    if (index !== -1) {
      const entry = this.elements[index];
      element.removeEventListener("touchstart", (event) =>
        this.handleTouchStart(entry, event)
      );
      element.removeEventListener("touchmove", (event) =>
        this.handleTouchMove(entry, event)
      );
      element.removeEventListener("touchend", (event) =>
        this.handleTouchEnd(entry, event)
      );
      element.removeEventListener("touchcancel", (event) =>
        this.handleTouchEnd(entry, event)
      );
      this.elements.splice(index, 1);
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
