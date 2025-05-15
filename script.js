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

// Make sure Pepe image loads fully
pepeImage.onload = function() {
  console.log("Pepe image loaded successfully");
  // If an image is already loaded, we might want to redraw
  // in case the page loaded with the gaslight checkbox checked
  if (image.complete && image.src && inverseCheckbox.checked) {
    draw();
  }
};

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

  // Position logo container relative to the actual image, not just the canvas
  const logoContainer = document.getElementById('logo-container');

  // Calculate image dimensions and position within canvas
  const imageRatio = image.width / image.height;
  const canvasRatio = canvas.width / canvas.height;
  let imgOffsetX = 0, imgOffsetY = 0;
  let drawWidth, drawHeight;

  if (imageRatio > canvasRatio) {
    drawWidth = canvas.width;
    drawHeight = canvas.width / imageRatio;
    imgOffsetY = (canvas.height - drawHeight) / 2;
  } else {
    drawHeight = canvas.height;
    drawWidth = canvas.height * imageRatio;
    imgOffsetX = (canvas.width - drawWidth) / 2;
  }

  // Position logo at the bottom right of the actual image
  // Add a small padding (10px) from the image edge
  logoContainer.style.top = (imgOffsetY + drawHeight - logoContainer.offsetHeight - 10) + 'px';
  logoContainer.style.left = (imgOffsetX + drawWidth - logoContainer.offsetWidth - 10) + 'px';
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

  // Draw Pepe when gaslight option is checked
  if (inverseCheckbox.checked && pepeImage.complete) {
    // Get the logo container dimensions to position Pepe relative to it
    const logoContainer = document.getElementById('logo-container');
    const pepeHeight = 24;
    const pepeWidth = (pepeImage.width / pepeImage.height) * pepeHeight;

    // Calculate position: to the left of where the logo container would be
    const logoWidth = 60; // Approximate width of logo container
    const pepeX = offsetX + drawWidth - pepeWidth - logoWidth; // Position to the left of the logo
    const pepeY = offsetY + drawHeight - pepeHeight - 10; // Position near bottom

    ctx.drawImage(pepeImage, pepeX, pepeY, pepeWidth, pepeHeight);
  }

  // No longer drawing emojis as we're using HTML/SVG

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

  // Show the logo container
  const logoContainer = document.getElementById('logo-container');
  logoContainer.style.display = 'flex';

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
    // Define a scale factor for higher resolution download
    const downloadScaleFactor = 3; // Increase this for higher resolution

    // Create a temporary canvas for high-resolution rendering
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    // Calculate original display dimensions of the image on the main canvas
    let displayDrawWidth, displayDrawHeight, displayOffsetX = 0, displayOffsetY = 0;
    const imageRatio = image.width / image.height;
    const mainCanvasRatio = canvas.width / canvas.height;

    if (imageRatio > mainCanvasRatio) {
      displayDrawWidth = canvas.width;
      displayDrawHeight = canvas.width / imageRatio;
      displayOffsetY = (canvas.height - displayDrawHeight) / 2;
    } else {
      displayDrawHeight = canvas.height;
      displayDrawWidth = canvas.height * imageRatio;
      displayOffsetX = (canvas.width - displayDrawWidth) / 2;
    }

    // Set temp canvas dimensions scaled for high resolution
    tempCanvas.width = displayDrawWidth * downloadScaleFactor;
    tempCanvas.height = displayDrawHeight * downloadScaleFactor;

    // Draw the main image onto the temporary canvas, scaled up
    // We draw the original image (image object) directly to ensure max quality
    tempCtx.drawImage(image, 0, 0, tempCanvas.width, tempCanvas.height);

    // Add watermark, scaled and positioned correctly
    if (!isDragging) {
      // Adjust watermark position relative to the image on the main canvas
      const watermarkRelX = watermarkPos.x - displayOffsetX;
      const watermarkRelY = watermarkPos.y - displayOffsetY;

      // Scale watermark properties for the high-resolution canvas
      const scaledWatermarkX = watermarkRelX * downloadScaleFactor;
      const scaledWatermarkY = watermarkRelY * downloadScaleFactor;
      const scaledWatermarkWidth = watermark.width * downloadScaleFactor;
      const scaledWatermarkHeight = watermark.height * downloadScaleFactor;

      // Draw only if watermark is within the bounds of the scaled image
      if (scaledWatermarkX + scaledWatermarkWidth > 0 && scaledWatermarkX < tempCanvas.width &&
          scaledWatermarkY + scaledWatermarkHeight > 0 && scaledWatermarkY < tempCanvas.height) {
        tempCtx.drawImage(watermarkImage, scaledWatermarkX, scaledWatermarkY, scaledWatermarkWidth, scaledWatermarkHeight);
      }
    }

    // Draw SVG logos and potentially Pepe, scaled
    const logoSize = 24 * downloadScaleFactor;
    const logoPadding = 10 * downloadScaleFactor;
    const logoSpacing = 5 * downloadScaleFactor;

    // Load the SVG images from the DOM
    const fistSvg = document.querySelector('#logo-container img[alt="carpe"]');
    const sunSvg = document.querySelector('#logo-container img[alt="diem"]');

    // Create image objects for the SVGs
    const fistImage = new Image();
    fistImage.src = fistSvg.src;

    const sunImage = new Image();
    sunImage.src = sunSvg.src;

    // Calculate positions
    const totalWidth = (logoSize * 2) + logoSpacing; // Two logos plus spacing
    const logoX = tempCanvas.width - logoPadding - totalWidth;
    const logoY = tempCanvas.height - logoPadding - logoSize;

    // Black background for the logo
    const bgPadding = 5 * downloadScaleFactor;
    tempCtx.fillStyle = 'black';
    tempCtx.fillRect(
      logoX - bgPadding,
      logoY - bgPadding,
      totalWidth + (bgPadding * 2),
      logoSize + (bgPadding * 2)
    );

    // Draw Pepe if checked
    if (inverseCheckbox.checked && pepeImage.complete) {
      const pepeHeight = logoSize;
      const pepeWidth = (pepeImage.width / pepeImage.height) * pepeHeight;
      const pepeSpacing = 5 * downloadScaleFactor;
      const pepeX = logoX - pepeWidth - pepeSpacing;
      const pepeY = logoY; // Align with the logos
      tempCtx.drawImage(pepeImage, pepeX, pepeY, pepeWidth, pepeHeight);
    }

    // Draw the SVG logos with white filter
    tempCtx.save();
    tempCtx.filter = 'invert(1)'; // Make SVGs white

    // Draw fist logo
    tempCtx.drawImage(fistImage, logoX, logoY, logoSize, logoSize);

    // Draw sun logo
    tempCtx.drawImage(sunImage, logoX + logoSize + logoSpacing, logoY, logoSize, logoSize);

    tempCtx.restore();

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
    console.log("Gaslight mode: " + (inverseCheckbox.checked ? "ON" : "OFF"));
    draw(); // Redraw with or without Pepe based on checkbox
  }
});
