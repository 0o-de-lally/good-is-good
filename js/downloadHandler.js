
import { elements, state } from './constants.js';
import { draw } from './canvas.js';

// Save button event listener for downloading images
elements.saveBtn.addEventListener('click', () => {
  if (!state.image.complete || !state.image.src) {
    alert('Please load an image first');
    return;
  }

  // Create a high-resolution canvas for download
  const downloadCanvas = document.createElement('canvas');
  const downloadCtx = downloadCanvas.getContext('2d');

  // Set high resolution scale factor (e.g., 3x for better quality)
  const scaleFactor = 3;

  // Draw the image with high quality
  draw(downloadCtx, scaleFactor, true);

  // Create download link
  const link = document.createElement('a');
  link.download = 'good-is-good-image.png';
  link.href = downloadCanvas.toDataURL('image/png', 1.0);

  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
