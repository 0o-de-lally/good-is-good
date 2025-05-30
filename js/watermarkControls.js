
import { elements, state } from './constants.js';
import { calculateImageDimensions, positionElements } from './imageUtils.js';
import { draw } from './canvas.js';

// Watermark drag controls
elements.watermark.addEventListener('mousedown', (e) => {
  if (!state.isDragging) {
    state.isDragging = true;
    state.offsetX = e.offsetX;
    state.offsetY = e.offsetY;
    elements.watermark.classList.add('dragging');

    // Set cursor to grabbing
    elements.watermark.style.cursor = 'grabbing';
  } else {
    state.isDragging = false;
    elements.watermark.classList.remove('dragging');
    elements.watermark.style.cursor = 'grab';
    draw();
  }
  e.preventDefault();
});

// Add hover cursor for watermark
elements.watermark.addEventListener('mouseenter', () => {
  if (!state.isDragging) {
    elements.watermark.style.cursor = 'grab';
  }
});

elements.watermark.addEventListener('mouseleave', () => {
  if (!state.isDragging) {
    elements.watermark.style.cursor = 'move';
  }
});

document.addEventListener('mousemove', (e) => {
  if (!state.isDragging) return;

  const container = elements.canvas.getBoundingClientRect();
  let newX = e.clientX - container.left - state.offsetX;
  let newY = e.clientY - container.top - state.offsetY;

  // Calculate image boundaries
  const { offsetX: imgOffsetX, offsetY: imgOffsetY, drawWidth, drawHeight } = calculateImageDimensions();

  // Enforce boundaries within image area
  newX = Math.max(imgOffsetX, Math.min(imgOffsetX + drawWidth - elements.watermark.width, newX));
  newY = Math.max(imgOffsetY, Math.min(imgOffsetY + drawHeight - elements.watermark.height, newY));

  state.watermarkPos.x = newX;
  state.watermarkPos.y = newY;
  positionElements();

  // Redraw canvas to show dragging border
  draw();
});

// Mouse up handler to stop dragging
document.addEventListener('mouseup', () => {
  if (state.isDragging) {
    state.isDragging = false;
    elements.watermark.classList.remove('dragging');
    elements.watermark.style.cursor = 'grab';

    // Final redraw without dragging border
    draw();
  }
});
