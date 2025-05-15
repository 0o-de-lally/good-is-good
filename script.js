const upload = document.getElementById('image-upload');
const imageUrlInput = document.getElementById('image-url');
const loadUrlBtn = document.getElementById('load-url-btn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const watermark = document.getElementById('watermark');
const saveBtn = document.getElementById('save-btn');

// Disable save button initially
saveBtn.disabled = true;

// Initialize watermark image
const watermarkImage = new Image();
watermarkImage.crossOrigin = 'anonymous';
watermarkImage.src = watermark.src;

let image = new Image();
let isDragging = false;
let offsetX = 0, offsetY = 0;
let watermarkPos = { x: 50, y: 50 };

// Helper function to calculate image dimensions
function calculateImageDimensions() {
  const imageRatio = image.width / image.height;
  const canvasRatio = canvas.width / canvas.height;
  let offsetX = 0, offsetY = 0;
  let drawWidth, drawHeight;

  if (imageRatio > canvasRatio) {
    drawWidth = canvas.width;
    drawHeight = canvas.width / imageRatio;
    offsetY = (canvas.height - drawHeight) / 2;
  } else {
    drawHeight = canvas.height;
    drawWidth = canvas.height * imageRatio;
    offsetX = (canvas.width - drawWidth) / 2;
  }

  return { offsetX, offsetY, drawWidth, drawHeight };
}

// Function to position elements
function positionElements() {
  // Position watermark
  watermark.style.left = watermarkPos.x + 'px';
  watermark.style.top = watermarkPos.y + 'px';

  // No need to position logo container anymore as it's drawn directly on canvas
}

// Initialize logo SVG images
const fistImage = new Image();
fistImage.crossOrigin = 'anonymous';
fistImage.src = './assets/8665569_hand_fist_icon.svg';

const sunImage = new Image();
sunImage.crossOrigin = 'anonymous';
sunImage.src = './assets/8665965_sun_icon.svg';

// Helper function to position and draw logo
function positionLogo(targetContext, origDimensions, downloadScaleFactor = 1, forDownload = false) {
  if (!image.complete || !image.src) return; // Only draw logo if an image is loaded

  const targetCanvas = targetContext.canvas;

  // SVG logo parameters - size scales based on download factor
  const logoSize = 24 * downloadScaleFactor;
  const logoPadding = 10 * downloadScaleFactor; // Equal padding for right and bottom
  const logoSpacing = 5 * downloadScaleFactor;
  const bgPadding = 5 * downloadScaleFactor;

  // Calculate the dimensions to draw at
  let logoX, logoY;

  if (forDownload) {
    // For download: position directly in the image coordinates
    logoX = targetCanvas.width - logoPadding - (logoSize * 2) - logoSpacing;
    logoY = targetCanvas.height - logoPadding - logoSize; // Same padding on bottom as on right
  } else {
    // For display: position relative to the image area in the canvas
    logoX = origDimensions.offsetX + origDimensions.drawWidth - logoPadding - (logoSize * 2) - logoSpacing;
    logoY = origDimensions.offsetY + origDimensions.drawHeight - logoPadding - logoSize; // Same padding on bottom as on right
  }

  // Black background for logo
  targetContext.fillStyle = 'black';
  targetContext.fillRect(
    logoX - bgPadding,
    logoY - bgPadding,
    (logoSize * 2) + logoSpacing + (bgPadding * 2),
    logoSize + (bgPadding * 2)
  );

  // Draw SVG logos with white filter
  targetContext.save();
  targetContext.filter = 'invert(1)';

  // Only draw if logo images are loaded
  if (fistImage.complete && sunImage.complete) {
    // Draw fist logo
    targetContext.drawImage(fistImage, logoX, logoY, logoSize, logoSize);

    // Draw sun logo
    targetContext.drawImage(sunImage, logoX + logoSize + logoSpacing, logoY, logoSize, logoSize);
  }

  targetContext.restore();
}

function draw(targetContext = ctx, downloadScaleFactor = 1, forDownload = false) {
  // Determine the context and canvas to use
  const targetCanvas = targetContext.canvas;
  const origDimensions = calculateImageDimensions();

  if (forDownload) {
    // For download: only use the actual image area, not the padding
    targetCanvas.width = origDimensions.drawWidth * downloadScaleFactor;
    targetCanvas.height = origDimensions.drawHeight * downloadScaleFactor;
  } else {
    // For display: clear the existing canvas
    targetContext.clearRect(0, 0, targetCanvas.width, targetCanvas.height);

    // Fill background with black
    targetContext.fillStyle = "#000000";
    targetContext.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
  }

  if (forDownload) {
    // Draw the image at full size for downloads
    targetContext.drawImage(image, 0, 0, targetCanvas.width, targetCanvas.height);
  } else {
    // Draw the image centered and maintaining aspect ratio for display
    targetContext.drawImage(
      image,
      origDimensions.offsetX,
      origDimensions.offsetY,
      origDimensions.drawWidth,
      origDimensions.drawHeight
    );
  }

  // Draw watermark with the appropriate scaling
  if (!forDownload) {
    // For display, use the existing watermark position
    targetContext.drawImage(
      watermarkImage,
      watermarkPos.x,
      watermarkPos.y,
      watermark.width,
      watermark.height
    );
  } else if (!isDragging) {
    // For download, scale the watermark
    // Adjust watermark position relative to the image area
    const watermarkRelX = watermarkPos.x - origDimensions.offsetX;
    const watermarkRelY = watermarkPos.y - origDimensions.offsetY;

    // Scale watermark properties
    const scaledWatermarkX = watermarkRelX * downloadScaleFactor;
    const scaledWatermarkY = watermarkRelY * downloadScaleFactor;
    const scaledWatermarkWidth = watermark.width * downloadScaleFactor;
    const scaledWatermarkHeight = watermark.height * downloadScaleFactor;

    // Draw only if watermark is within bounds
    if (scaledWatermarkX + scaledWatermarkWidth > 0 && scaledWatermarkX < targetCanvas.width &&
        scaledWatermarkY + scaledWatermarkHeight > 0 && scaledWatermarkY < targetCanvas.height) {
      targetContext.drawImage(
        watermarkImage,
        scaledWatermarkX,
        scaledWatermarkY,
        scaledWatermarkWidth,
        scaledWatermarkHeight
      );
    }
  }

  // Draw the logo using our dedicated logo positioning function
  positionLogo(targetContext, origDimensions, downloadScaleFactor, forDownload);
}

// Common image loading logic
function setupLoadedImage() {
  const maxWidth = 400;
  canvas.width = maxWidth;
  canvas.height = Math.round(maxWidth * 3/2);

  watermark.style.display = 'block';

  // Need to draw first so the image is rendered, then position elements
  draw();
  positionElements();

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
  const { offsetX: imgOffsetX, offsetY: imgOffsetY, drawWidth, drawHeight } = calculateImageDimensions();

  // Enforce boundaries within image area
  newX = Math.max(imgOffsetX, Math.min(imgOffsetX + drawWidth - watermark.width, newX));
  newY = Math.max(imgOffsetY, Math.min(imgOffsetY + drawHeight - watermark.height, newY));

  watermarkPos.x = newX;
  watermarkPos.y = newY;
  positionElements();
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
    // Define a scale factor for higher resolution download
    const downloadScaleFactor = 3; // Increase this for higher resolution

    // Create a temporary canvas for high-resolution rendering
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    // Use our enhanced draw function for download
    draw(tempCtx, downloadScaleFactor, true);

    // Download the image
    const link = document.createElement('a');
    link.download = 'good-image.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    alert("Download failed: " + err.message);
  }
});
