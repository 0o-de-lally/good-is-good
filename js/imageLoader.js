
import { elements, state } from './constants.js';
import { setupLoadedImage } from './imageUtils.js';

// Initialize watermark image
export const watermarkImage = new Image();
watermarkImage.crossOrigin = 'anonymous';
watermarkImage.src = elements.watermark.src;

// Initialize logo SVG images
export const fistImage = new Image();
fistImage.crossOrigin = 'anonymous';
fistImage.src = './assets/8665569_hand_fist_icon.svg';

export const sunImage = new Image();
sunImage.crossOrigin = 'anonymous';
sunImage.src = './assets/8665965_sun_icon.svg';

// Image load event handlers
state.image.onload = setupLoadedImage;

watermarkImage.onload = () => {
  if (state.image.complete && state.image.src) {
    setupLoadedImage();
  }
};

// File upload handler
elements.upload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (evt) {
    state.image.src = evt.target.result;
  };
  reader.readAsDataURL(file);
});

// URL loading handler
elements.loadUrlBtn.addEventListener('click', () => {
  const url = elements.imageUrlInput.value.trim();
  if (!url) {
    alert('Please enter an image URL');
    return;
  }

  state.image = new Image();
  state.image.crossOrigin = 'anonymous';

  elements.loadUrlBtn.disabled = true;
  elements.loadUrlBtn.textContent = 'Loading...';

  state.image.onload = () => {
    setupLoadedImage();
    elements.loadUrlBtn.disabled = false;
    elements.loadUrlBtn.textContent = 'Load Image';
  };

  state.image.onerror = () => {
    alert('Failed to load image. Please check the URL and try again.');
    elements.loadUrlBtn.disabled = false;
    elements.loadUrlBtn.textContent = 'Load Image';
  };

  state.image.src = url;
});

// Helper function to load image from URL
export function loadImageFromUrl(url) {
  state.image = new Image();
  state.image.crossOrigin = 'anonymous';

  state.image.onload = () => {
    setupLoadedImage();
  };

  state.image.onerror = () => {
    alert('Failed to load selected image.');
  };

  state.image.src = url;
}
