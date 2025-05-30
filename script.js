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

// Reuters Images Functionality
const loadReutersBtn = document.getElementById('load-reuters-btn');
const reutersGallery = document.getElementById('reuters-gallery');
const imageGrid = document.getElementById('image-grid');

// RSS feeds for news images - hardcoded list of photography-focused feeds
const rssFeedUrls = [
  'https://www.theguardian.com/news/series/ten-best-photographs-of-the-day/rss',
  // 'https://feeds.reuters.com/reuters/picturesoftheday',
  // 'https://www.theatlantic.com/feed/channel/photo/',
  // 'https://feeds.bbci.co.uk/news/in_pictures/rss.xml',
  // 'https://www.nationalgeographic.com/photography/rss'
];

// CORS proxy to fetch RSS feeds
const corsProxy = 'https://api.allorigins.win/raw?url=';

// Simple test function to check if RSS parsing works
async function testRSSParsing() {
  try {
    const testUrl = 'https://www.theguardian.com/news/series/ten-best-photographs-of-the-day/rss';
    console.log('Testing RSS parsing with URL:', testUrl);

    const response = await fetch(corsProxy + encodeURIComponent(testUrl));
    console.log('Response status:', response.status);

    const xmlText = await response.text();
    console.log('XML length:', xmlText.length);
    console.log('XML preview:', xmlText.substring(0, 500));

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    console.log('Parsed XML doc:', xmlDoc);

    const items = xmlDoc.querySelectorAll('item');
    console.log('Found items:', items.length);

    if (items.length > 0) {
      const firstItem = items[0];
      console.log('First item HTML:', firstItem.innerHTML);

      // Test different ways to find media content
      const mediaContent1 = firstItem.querySelector('[url]');
      console.log('Method 1 - [url]:', mediaContent1);

      const mediaContent2 = firstItem.querySelector('content');
      console.log('Method 2 - content:', mediaContent2);

      const allElements = firstItem.querySelectorAll('*');
      console.log('All child elements:', allElements.length);

      for (let i = 0; i < Math.min(5, allElements.length); i++) {
        const el = allElements[i];
        console.log(`Element ${i}:`, el.tagName, 'url attr:', el.getAttribute('url'));
      }
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

loadReutersBtn.addEventListener('click', async () => {
  // First run the test
  await testRSSParsing();

  loadReutersBtn.disabled = true;
  loadReutersBtn.textContent = 'Loading...';

  // Clear existing content
  imageGrid.innerHTML = '';

  try {
    const images = await fetchImagesFromRSS();

    if (images.length === 0) {
      imageGrid.innerHTML = '<p>No images found in RSS feeds. Please try again later.</p>';
      reutersGallery.style.display = 'block';
      return;
    }

    // Display fetched images
    images.forEach((item, index) => {
      const imageItem = document.createElement('div');
      imageItem.className = 'reuters-image-item';

      const img = document.createElement('img');
      img.src = item.imageUrl;
      img.alt = `${item.sourceName} image ${index + 1}`;
      img.loading = 'lazy';

      // Handle image load errors
      img.onerror = () => {
        imageItem.style.display = 'none';
      };

      const caption = document.createElement('div');
      caption.className = 'caption';
      caption.innerHTML = `
        <div class="source-tag">${item.sourceName}</div>
        <strong>${item.title}</strong><br>
        <span class="description">${item.description}</span>
      `;

      imageItem.appendChild(img);
      imageItem.appendChild(caption);

      // Add click handler to load image into canvas
      imageItem.addEventListener('click', () => {
        loadImageFromUrl(item.imageUrl);
      });

      imageGrid.appendChild(imageItem);
    });

    // Show the gallery
    reutersGallery.style.display = 'block';

  } catch (error) {
    console.error('Error fetching RSS images:', error);
    imageGrid.innerHTML = '<p>Failed to load news images. Please check your internet connection and try again.</p>';
    reutersGallery.style.display = 'block';
  } finally {
    loadReutersBtn.disabled = false;
    loadReutersBtn.textContent = 'Load Best Photographs from News Sources';
  }
});

// Helper function to load image from URL
function loadImageFromUrl(url) {
  image = new Image();
  image.crossOrigin = 'anonymous';

  image.onload = () => {
    setupLoadedImage();
  };

  image.onerror = () => {
    alert('Failed to load selected image.');
  };

  image.src = url;
}

// Function to fetch images from RSS feeds
async function fetchImagesFromRSS() {
  const allImages = [];

  for (const feedUrl of rssFeedUrls) {
    try {
      console.log(`Fetching from: ${feedUrl}`);
      const response = await fetch(corsProxy + encodeURIComponent(feedUrl));
      const xmlText = await response.text();
      console.log('XML response received, length:', xmlText.length);
      const images = parseRSSForImages(xmlText, feedUrl);
      console.log(`Found ${images.length} images from ${feedUrl}`);
      allImages.push(...images);

      // Limit to prevent too many requests
      if (allImages.length >= 20) break;
    } catch (error) {
      console.warn(`Failed to fetch from ${feedUrl}:`, error);
      continue;
    }
  }

  // Remove duplicates and limit results
  const uniqueImages = allImages.filter((img, index, self) =>
    index === self.findIndex(t => t.imageUrl === img.imageUrl)
  );

  return uniqueImages.slice(0, 12); // Limit to 12 images
}

// Function to parse RSS XML and extract images
function parseRSSForImages(xmlText, sourceUrl) {
  console.log('Parsing RSS for:', sourceUrl);
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  const items = xmlDoc.querySelectorAll('item');
  console.log(`Found ${items.length} items in RSS feed`);
  const images = [];

  items.forEach((item, index) => {
    console.log(`Processing item ${index + 1}`);
    const title = item.querySelector('title')?.textContent || 'No title';
    const description = item.querySelector('description')?.textContent || '';
    const link = item.querySelector('link')?.textContent || '';
    const pubDate = item.querySelector('pubDate')?.textContent || '';

    // Look for images in different places
    let imageUrl = null;

    // Method 1: Look for media:content elements using getElementsByTagNameNS (more reliable for namespaces)
    try {
      // Try to find media:content elements
      const mediaElements = item.getElementsByTagName('media:content');
      if (mediaElements.length > 0) {
        // Get the largest width available
        let bestElement = mediaElements[0];
        let maxWidth = parseInt(mediaElements[0].getAttribute('width') || '0');

        for (let i = 1; i < mediaElements.length; i++) {
          const width = parseInt(mediaElements[i].getAttribute('width') || '0');
          if (width > maxWidth) {
            maxWidth = width;
            bestElement = mediaElements[i];
          }
        }

        imageUrl = bestElement.getAttribute('url');
        console.log(`Found image via media:content: ${imageUrl} (width: ${maxWidth})`);
      }
    } catch (e) {
      console.log('media:content search failed:', e.message);
    }

    // Method 2: Fallback - search all child elements for url attributes
    if (!imageUrl) {
      const allChildren = item.children;
      for (const child of allChildren) {
        const url = child.getAttribute('url');
        if (url && (url.includes('i.guim.co.uk') || url.match(/\.(jpg|jpeg|png|gif|webp)/i))) {
          imageUrl = url;
          console.log(`Found image via child element scan: ${imageUrl}`);
          break;
        }
      }
    }

    // Method 3: Extract image from description HTML
    if (!imageUrl && description) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = description;
      const imgTag = tempDiv.querySelector('img');
      if (imgTag) {
        imageUrl = imgTag.src || imgTag.getAttribute('data-src');
        console.log(`Found image in description: ${imageUrl}`);
      }
    }

    if (imageUrl && title) {
      console.log(`Successfully extracted image: ${imageUrl} for title: ${title.substring(0, 50)}...`);
      // Clean up description (remove HTML tags and extra whitespace)
      const cleanDescription = description
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 200) + (description.length > 200 ? '...' : '');

      // Extract source name from URL
      const sourceName = getSourceName(sourceUrl);

      images.push({
        title: title.substring(0, 150),
        description: cleanDescription,
        imageUrl: imageUrl,
        sourceUrl: sourceUrl,
        sourceName: sourceName,
        articleLink: link,
        pubDate: pubDate
      });
    } else {
      console.log(`No image found for item: ${title.substring(0, 50)}...`);
    }
  });

  console.log(`Total images extracted: ${images.length}`);
  return images;
}

// Helper function to get source name from URL
function getSourceName(url) {
  if (url.includes('theguardian.com')) return 'The Guardian';
  if (url.includes('reuters.com')) return 'Reuters';
  if (url.includes('theatlantic.com')) return 'The Atlantic';
  if (url.includes('bbci.co.uk')) return 'BBC';
  if (url.includes('nationalgeographic.com')) return 'National Geographic';
  return 'News Source';
}

// Save button event listener for downloading images
saveBtn.addEventListener('click', () => {
  if (!image.complete || !image.src) {
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
