const upload = document.getElementById('image-upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const watermark = document.getElementById('watermark');
const saveBtn = document.getElementById('save-btn');

// Disable save button initially
saveBtn.disabled = true;

const watermarkImage = new Image();
watermarkImage.crossOrigin = 'anonymous';
watermarkImage.src = watermark.src;

let image = new Image();
let isDragging = false;
let offsetX = 0, offsetY = 0;
let watermarkPos = { x: 50, y: 50 };
let scale = 1;

function positionWatermark() {
  watermark.style.left = watermarkPos.x + 'px';
  watermark.style.top = watermarkPos.y + 'px';
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Calculate dimensions to maintain aspect ratio
  let drawWidth, drawHeight, offsetX = 0, offsetY = 0;

  const imageRatio = image.width / image.height;
  const canvasRatio = canvas.width / canvas.height;

  if (imageRatio > canvasRatio) {
    // Image is wider than canvas ratio - fit to width
    drawWidth = canvas.width;
    drawHeight = canvas.width / imageRatio;
    offsetY = (canvas.height - drawHeight) / 2;
  } else {
    // Image is taller than canvas ratio - fit to height
    drawHeight = canvas.height;
    drawWidth = canvas.height * imageRatio;
    offsetX = (canvas.width - drawWidth) / 2;
  }

  // Fill background with black
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw the image centered and maintaining aspect ratio
  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

  // Add fist and sun emojis to bottom right corner of the image
  ctx.font = "24px Arial";
  const emojiPadding = 10; // Padding from the edge of the image
  const emojiY = offsetY + drawHeight - emojiPadding; // Bottom of the image minus padding
  const emojiX = offsetX + drawWidth - emojiPadding - ctx.measureText("✊☀️").width; // Right of the image minus padding and emoji width
  ctx.fillText("✊☀️", emojiX, emojiY);

  // Draw watermark on top
  ctx.drawImage(watermarkImage, watermarkPos.x, watermarkPos.y, watermark.width, watermark.height);
}

upload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Enable the save button as soon as a file is selected
  saveBtn.disabled = false;

  const reader = new FileReader();
  reader.onload = function (evt) {
    image.src = evt.target.result;
  };
  reader.readAsDataURL(file);
});

image.onload = () => {
  const maxWidth = 400;
  // Set canvas to a fixed 2:3 aspect ratio container
  canvas.width = maxWidth; // Fixed width of 400px
  canvas.height = Math.round(maxWidth * 3/2); // Height is 3/2 of width for 2:3 ratio

  // Calculate scale factor for display purposes
  if (image.width > maxWidth) {
    scale = maxWidth / image.width;
  } else {
    scale = 1;
  }

  if (watermarkImage.complete) {
    watermark.style.display = 'block';
    positionWatermark();
    draw();

    // Enable save button once image is loaded
    saveBtn.disabled = false;
  }
};

watermarkImage.onload = () => {
  if (image.complete && image.src) {
    watermark.style.display = 'block';
    positionWatermark();
    draw();

    // Enable save button if image is already loaded
    saveBtn.disabled = false;
  }
};

watermark.addEventListener('mousedown', (e) => {
  if (!isDragging) { // First click: pick up
    isDragging = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    watermark.classList.add('dragging'); // Add dragging class
  } else { // Second click: drop
    isDragging = false;
    watermark.classList.remove('dragging'); // Remove dragging class
    // watermarkPos is already up-to-date from the last mousemove.
    // The visual position (watermark.style) is also up-to-date via positionWatermark in mousemove.
    // Now, permanently draw it onto the canvas at its current position.
    draw();
  }
  e.preventDefault(); // Prevents default browser actions like text selection
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return; // Only move if dragging

  const container = canvas.getBoundingClientRect();
  let newX = e.clientX - container.left - offsetX;
  let newY = e.clientY - container.top - offsetY;

  // Get watermark dimensions
  const watermarkWidth = watermark.width;
  const watermarkHeight = watermark.height;

  // Enforce boundaries - prevent dragging outside of canvas
  // Left boundary
  newX = Math.max(0, newX);
  // Top boundary
  newY = Math.max(0, newY);
  // Right boundary (considering watermark width)
  newX = Math.min(canvas.width - watermarkWidth, newX);
  // Bottom boundary (considering watermark height)
  newY = Math.min(canvas.height - watermarkHeight, newY);

  watermarkPos.x = newX;
  watermarkPos.y = newY;

  positionWatermark(); // Update the visual position of the #watermark img
});

// Modified mouseup listener: it no longer handles the "drop" action for the watermark.
document.addEventListener('mouseup', (e) => {
  // The drop action is now handled by the second mousedown event on the watermark image.
  // This listener can be removed if it had no other purpose than releasing the drag,
  // or its original logic for other purposes can be maintained if necessary.
  // For the watermark drag functionality, it no longer sets isDragging = false or calls draw().
});

document.getElementById('save-btn').addEventListener('click', () => {
  try {
    draw();
    const link = document.createElement('a');
    link.download = 'watermarked-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    alert("Download failed: " + err.message);
  }
});
