import { elements, state } from './constants.js';
import { calculateImageDimensions } from './imageUtils.js';
import { draw } from './canvas.js';

// Helper function to check if a point is inside the logo bounds
function isPointInLogo(x, y) {
  if (!state.logoBounds) return false;

  return x >= state.logoBounds.x &&
         x <= state.logoBounds.x + state.logoBounds.width &&
         y >= state.logoBounds.y &&
         y <= state.logoBounds.y + state.logoBounds.height;
}

// Canvas mouse event handlers for logo dragging
elements.canvas.addEventListener('mousedown', (e) => {
  if (!state.image.complete || !state.image.src) return;

  const rect = elements.canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Check if click is on logo
  if (isPointInLogo(mouseX, mouseY)) {
    state.isDraggingLogo = true;
    state.logoOffsetX = mouseX - state.logoBounds.x;
    state.logoOffsetY = mouseY - state.logoBounds.y;

    // Set cursor to grabbing
    elements.canvas.style.cursor = 'grabbing';

    // If logo hasn't been moved yet, initialize its position
    if (state.logoPos.x === null || state.logoPos.y === null) {
      state.logoPos.x = state.logoBounds.x;
      state.logoPos.y = state.logoBounds.y;
    }

    // Redraw to show dragging state
    draw();
    e.preventDefault();
  }
});

// Mouse move handler for logo dragging
document.addEventListener('mousemove', (e) => {
  if (!state.isDraggingLogo) {
    // Check if hovering over logo to change cursor
    if (state.image.complete && state.image.src) {
      const rect = elements.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (isPointInLogo(mouseX, mouseY)) {
        elements.canvas.style.cursor = 'grab';
      } else {
        elements.canvas.style.cursor = 'default';
      }
    }
    return;
  }

  const rect = elements.canvas.getBoundingClientRect();
  let newX = e.clientX - rect.left - state.logoOffsetX;
  let newY = e.clientY - rect.top - state.logoOffsetY;

  // Calculate image boundaries
  const { offsetX: imgOffsetX, offsetY: imgOffsetY, drawWidth, drawHeight } = calculateImageDimensions();

  // Enforce boundaries within image area
  const logoWidth = state.logoBounds ? state.logoBounds.width : 60; // fallback width
  const logoHeight = state.logoBounds ? state.logoBounds.height : 30; // fallback height

  newX = Math.max(imgOffsetX, Math.min(imgOffsetX + drawWidth - logoWidth, newX));
  newY = Math.max(imgOffsetY, Math.min(imgOffsetY + drawHeight - logoHeight, newY));

  state.logoPos.x = newX;
  state.logoPos.y = newY;

  // Redraw canvas
  draw();
});

// Mouse up handler to stop dragging
document.addEventListener('mouseup', () => {
  if (state.isDraggingLogo) {
    state.isDraggingLogo = false;
    elements.canvas.style.cursor = 'default';

    // Final redraw without dragging border
    draw();
  }
});

// Touch events for mobile support
elements.canvas.addEventListener('touchstart', (e) => {
  if (!state.image.complete || !state.image.src) return;

  const rect = elements.canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const touchX = touch.clientX - rect.left;
  const touchY = touch.clientY - rect.top;

  if (isPointInLogo(touchX, touchY)) {
    state.isDraggingLogo = true;
    state.logoOffsetX = touchX - state.logoBounds.x;
    state.logoOffsetY = touchY - state.logoBounds.y;

    if (state.logoPos.x === null || state.logoPos.y === null) {
      state.logoPos.x = state.logoBounds.x;
      state.logoPos.y = state.logoBounds.y;
    }

    draw();
    e.preventDefault();
  }
});

elements.canvas.addEventListener('touchmove', (e) => {
  if (!state.isDraggingLogo) return;

  const rect = elements.canvas.getBoundingClientRect();
  const touch = e.touches[0];
  let newX = touch.clientX - rect.left - state.logoOffsetX;
  let newY = touch.clientY - rect.top - state.logoOffsetY;

  const { offsetX: imgOffsetX, offsetY: imgOffsetY, drawWidth, drawHeight } = calculateImageDimensions();
  const logoWidth = state.logoBounds ? state.logoBounds.width : 60;
  const logoHeight = state.logoBounds ? state.logoBounds.height : 30;

  newX = Math.max(imgOffsetX, Math.min(imgOffsetX + drawWidth - logoWidth, newX));
  newY = Math.max(imgOffsetY, Math.min(imgOffsetY + drawHeight - logoHeight, newY));

  state.logoPos.x = newX;
  state.logoPos.y = newY;

  draw();
  e.preventDefault();
});

elements.canvas.addEventListener('touchend', () => {
  if (state.isDraggingLogo) {
    state.isDraggingLogo = false;
    draw();
  }
});
