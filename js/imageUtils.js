
import { elements, ctx, state } from './constants.js';
import { draw } from './canvas.js';

// Helper function to calculate image dimensions
export function calculateImageDimensions() {
  const imageRatio = state.image.width / state.image.height;
  const canvasRatio = elements.canvas.width / elements.canvas.height;
  let offsetX = 0, offsetY = 0;
  let drawWidth, drawHeight;

  if (imageRatio > canvasRatio) {
    drawWidth = elements.canvas.width;
    drawHeight = elements.canvas.width / imageRatio;
    offsetY = (elements.canvas.height - drawHeight) / 2;
  } else {
    drawHeight = elements.canvas.height;
    drawWidth = elements.canvas.height * imageRatio;
    offsetX = (elements.canvas.width - drawWidth) / 2;
  }

  return { offsetX, offsetY, drawWidth, drawHeight };
}

// Function to position elements
export function positionElements() {
  // Position watermark
  elements.watermark.style.left = state.watermarkPos.x + 'px';
  elements.watermark.style.top = state.watermarkPos.y + 'px';
}

// Common image loading logic
export function setupLoadedImage() {
  const maxWidth = 400;
  elements.canvas.width = maxWidth;
  elements.canvas.height = Math.round(maxWidth * 3/2);

  elements.watermark.style.display = 'block';

  // Need to draw first so the image is rendered, then position elements
  draw();
  positionElements();

  elements.saveBtn.disabled = false;
}
