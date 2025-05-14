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
  isDragging = true;
  offsetX = e.offsetX;
  offsetY = e.offsetY;
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const container = canvas.getBoundingClientRect();
  const newX = e.clientX - container.left - offsetX;
  const newY = e.clientY - container.top - offsetY;
  watermark.style.left = newX + 'px';
  watermark.style.top = newY + 'px';
});

document.addEventListener('mouseup', (e) => {
  if (isDragging) {
    const container = canvas.getBoundingClientRect();
    watermarkPos.x = e.clientX - container.left - offsetX;
    watermarkPos.y = e.clientY - container.top - offsetY;
    positionWatermark();
    draw();
    isDragging = false;
  }
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
