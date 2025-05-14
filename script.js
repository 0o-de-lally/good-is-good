const upload = document.getElementById('image-upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const watermark = document.getElementById('watermark');

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
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(watermarkImage, watermarkPos.x, watermarkPos.y, watermark.width, watermark.height);
}

upload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (evt) {
    image.src = evt.target.result;
  };
  reader.readAsDataURL(file);
});

image.onload = () => {
  const maxWidth = 400;
  scale = (image.width > maxWidth) ? maxWidth / image.width : 1;
  canvas.width = image.width * scale;
  canvas.height = image.height * scale;

  if (watermarkImage.complete) {
    watermark.style.display = 'block';
    positionWatermark();
    draw();
  }
};

watermarkImage.onload = () => {
  if (image.complete && image.src) {
    watermark.style.display = 'block';
    positionWatermark();
    draw();
  }
};

watermark.addEventListener('mousedown', (e) => {
  if (!isDragging) { // First click: pick up
    isDragging = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
  } else { // Second click: drop
    isDragging = false;
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
  const newX = e.clientX - container.left - offsetX;
  const newY = e.clientY - container.top - offsetY;

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
