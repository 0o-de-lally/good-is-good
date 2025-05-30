
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
  } else {
    state.isDragging = false;
    elements.watermark.classList.remove('dragging');
    draw();
  }
  e.preventDefault();
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
});
