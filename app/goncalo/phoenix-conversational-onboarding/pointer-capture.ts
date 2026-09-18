/**
 * Pointer capture throws when the pointer is no longer active (synthetic events,
 * a cancelled touch, a mouse released outside the window), which would otherwise
 * abort a gesture mid-drag.
 */
export function capture(event: React.PointerEvent) {
  try {
    event.currentTarget.setPointerCapture(event.pointerId);
  } catch {
    // The gesture still tracks via the window-level pointer stream.
  }
}

export function release(event: React.PointerEvent) {
  try {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  } catch {
    // Already released.
  }
}
