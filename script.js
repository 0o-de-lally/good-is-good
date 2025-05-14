const upload = document.getElementById('image-upload');
const imageUrlInput = document.getElementById('image-url');
const loadUrlBtn = document.getElementById('load-url-btn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const watermark = document.getElementById('watermark');
const saveBtn = document.getElementById('save-btn');
const inverseCheckbox = document.getElementById('inverse-checkbox');

// Disable save button initially
saveBtn.disabled = true;

// Initialize watermark image
const watermarkImage = new Image();
watermarkImage.crossOrigin = 'anonymous';
watermarkImage.src = watermark.src;

// Initialize pepe image
const pepeImage = new Image();
pepeImage.crossOrigin = 'anonymous';
pepeImage.src = './assets/pepe.png';

let image = new Image();
let isDragging = false;
let offsetX = 0, offsetY = 0;
let watermarkPos = { x: 50, y: 50 };
let scale = 1;

// Unified function to position all elements
function positionElements() {
  // Position watermark
  watermark.style.left = watermarkPos.x + 'px';
  watermark.style.top = watermarkPos.y + 'px';

    // We just need to ensure watermark positioning is correct
  // No need to position Pepe element as it's drawn directly on canvas
}

// For backward compatibility
function positionWatermark() {
  positionElements();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Fill background with black
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Calculate dimensions to maintain aspect ratio
  let drawWidth, drawHeight, offsetX = 0, offsetY = 0;

  const imageRatio = image.width / image.height;
  const canvasRatio = canvas.width / canvas.height;

  if (imageRatio > canvasRatio) {
    drawWidth = canvas.width;
    drawHeight = canvas.width / imageRatio;
    offsetY = (canvas.height - drawHeight) / 2;
  } else {
    drawHeight = canvas.height;
    drawWidth = canvas.height * imageRatio;
    offsetX = (canvas.width - drawWidth) / 2;
  }

  // Draw the image centered and maintaining aspect ratio
  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

  // Add fist and sun emojis to bottom right corner of the image
  ctx.font = "24px Arial";
  const emojiPadding = 10;
  const emojiY = offsetY + drawHeight - emojiPadding;
  const emojiX = offsetX + drawWidth - emojiPadding - ctx.measureText("✊☀️").width;

  // Draw emojis and potentially Pepe
  if (inverseCheckbox.checked && pepeImage.complete) {
    // First draw Pepe
    const pepeHeight = 24;
    const pepeWidth = (pepeImage.width / pepeImage.height) * pepeHeight;
    // Position Pepe to the left of the emojis
    const pepeX = emojiX - pepeWidth - 5; // 5px spacing between pepe and emoji
    const pepeY = emojiY - pepeHeight;

    ctx.drawImage(pepeImage, pepeX, pepeY, pepeWidth, pepeHeight);
  }

  // Draw the emojis
  ctx.fillText("✊☀️", emojiX, emojiY);

  // Draw watermark on top
  ctx.drawImage(watermarkImage, watermarkPos.x, watermarkPos.y, watermark.width, watermark.height);

  // Update element positions
  positionElements();
}

// Common image loading logic
function setupLoadedImage() {
  const maxWidth = 400;
  canvas.width = maxWidth;
  canvas.height = Math.round(maxWidth * 3/2);

  scale = image.width > maxWidth ? maxWidth / image.width : 1;

  watermark.style.display = 'block';
  positionElements();
  draw();

  saveBtn.disabled = false;
}

// Event listeners
upload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (evt) {
    image.src = evt.target.result;
  };
  reader.readAsDataURL(file);
});

image.onload = setupLoadedImage;

watermarkImage.onload = () => {
  if (image.complete && image.src) {
    setupLoadedImage();
  }
};

watermark.addEventListener('mousedown', (e) => {
  if (!isDragging) {
    isDragging = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    watermark.classList.add('dragging');
  } else {
    isDragging = false;
    watermark.classList.remove('dragging');
    draw();
  }
  e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;

  const container = canvas.getBoundingClientRect();
  let newX = e.clientX - container.left - offsetX;
  let newY = e.clientY - container.top - offsetY;

  // Calculate image boundaries
  let drawWidth, drawHeight, imgOffsetX = 0, imgOffsetY = 0;
  const imageRatio = image.width / image.height;
  const canvasRatio = canvas.width / canvas.height;

  if (imageRatio > canvasRatio) {
    drawWidth = canvas.width;
    drawHeight = canvas.width / imageRatio;
    imgOffsetY = (canvas.height - drawHeight) / 2;
  } else {
    drawHeight = canvas.height;
    drawWidth = canvas.height * imageRatio;
    imgOffsetX = (canvas.width - drawWidth) / 2;
  }

  // Enforce boundaries within image area
  newX = Math.max(imgOffsetX, Math.min(imgOffsetX + drawWidth - watermark.width, newX));
  newY = Math.max(imgOffsetY, Math.min(imgOffsetY + drawHeight - watermark.height, newY));

  watermarkPos.x = newX;
  watermarkPos.y = newY;
  positionWatermark();
});

loadUrlBtn.addEventListener('click', () => {
  const url = imageUrlInput.value.trim();
  if (!url) {
    alert('Please enter an image URL');
    return;
  }

  image = new Image();
  image.crossOrigin = 'anonymous';

  loadUrlBtn.disabled = true;
  loadUrlBtn.textContent = 'Loading...';

  image.onload = () => {
    setupLoadedImage();
    loadUrlBtn.disabled = false;
    loadUrlBtn.textContent = 'Load Image';
  };

  image.onerror = () => {
    alert('Failed to load image. Please check the URL and try again.');
    loadUrlBtn.disabled = false;
    loadUrlBtn.textContent = 'Load Image';
  };

  image.src = url;
});

document.getElementById('save-btn').addEventListener('click', () => {
  try {
    draw();

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    // Calculate image dimensions
    let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
    const imageRatio = image.width / image.height;
    const canvasRatio = canvas.width / canvas.height;

    if (imageRatio > canvasRatio) {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imageRatio;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      drawHeight = canvas.height;
      drawWidth = canvas.height * imageRatio;
      offsetX = (canvas.width - drawWidth) / 2;
    }

    // Set temp canvas to image dimensions
    tempCanvas.width = drawWidth;
    tempCanvas.height = drawHeight;

    // Draw image to temp canvas
    tempCtx.drawImage(canvas, offsetX, offsetY, drawWidth, drawHeight, 0, 0, drawWidth, drawHeight);

    // Add watermark if it's positioned
    if (!isDragging) {
      const adjustedX = watermarkPos.x - offsetX;
      const adjustedY = watermarkPos.y - offsetY;

      if (adjustedX >= 0 && adjustedY >= 0 && adjustedX < drawWidth && adjustedY < drawHeight) {
        tempCtx.drawImage(watermarkImage, adjustedX, adjustedY, watermark.width, watermark.height);
      }
    }

    // Draw emojis and potentially Pepe
    const emojiPadding = 10;
    tempCtx.font = "24px Arial";
    const emojiWidth = tempCtx.measureText("✊☀️").width;
    const emojiX = drawWidth - emojiPadding - emojiWidth;
    const emojiY = drawHeight - emojiPadding;

    // Add Pepe if inverse is checked (to the left of the emojis)
    if (inverseCheckbox.checked && pepeImage.complete) {
      const pepeHeight = 24; // Match the size used in the draw function
      const pepeWidth = (pepeImage.width / pepeImage.height) * pepeHeight;
      const pepeX = emojiX - pepeWidth - 5; // 5px spacing between pepe and emoji
      const pepeY = emojiY - pepeHeight;

      tempCtx.drawImage(pepeImage, pepeX, pepeY, pepeWidth, pepeHeight);
    }

    // Draw the emojis
    tempCtx.fillText("✊☀️", emojiX, emojiY);

    // Download the image
    const link = document.createElement('a');
    link.download = 'watermarked-image.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    alert("Download failed: " + err.message);
  }
});

inverseCheckbox.addEventListener('change', () => {
  // Only redraw if there's an image loaded
  if (image.complete && image.src) {
    draw();
  }
});
