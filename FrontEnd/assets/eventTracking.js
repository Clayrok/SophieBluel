const trackedEvents = new Map();

export function addTrackedEvent(element, eventType, eventFunction) {
    if (!trackedEvents.has(element)) {
        const eventMap = new Map();
        eventMap.set(eventType, eventFunction);
        trackedEvents.set(element, eventMap);
        element.addEventListener(eventType, eventFunction);
    }
    else {
        throw new Error("Tracked event name already exists.");
    }
}

export function removeTrackedEvent(element, eventType) {
    const trackedEvent = trackedEvents.get(element);
    if (trackedEvent) {
        element.removeEventListener(eventType, trackedEvent.get(eventType));
        trackedEvents.delete(element);
    }
}