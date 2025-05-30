
import { elements, rssFeedUrls, corsProxy } from './constants.js';
import { loadImageFromUrl } from './imageLoader.js';

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

// Function to fetch images from RSS feeds
export async function fetchImagesFromRSS() {
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

// RSS gallery event handler
elements.loadNewsBtn.addEventListener('click', async () => {
  // First run the test
  await testRSSParsing();

  elements.loadNewsBtn.disabled = true;
  elements.loadNewsBtn.textContent = 'Loading...';

  // Clear existing content
  elements.imageGrid.innerHTML = '';

  try {
    const images = await fetchImagesFromRSS();

    if (images.length === 0) {
      elements.imageGrid.innerHTML = '<p>No images found in RSS feeds. Please try again later.</p>';
      elements.newsGallery.style.display = 'block';
      return;
    }

    // Display fetched images
    images.forEach((item, index) => {
      const imageItem = document.createElement('div');
      imageItem.className = 'news-image-item';

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

      elements.imageGrid.appendChild(imageItem);
    });

    // Show the gallery
    elements.newsGallery.style.display = 'block';

  } catch (error) {
    console.error('Error fetching RSS images:', error);
    elements.imageGrid.innerHTML = '<p>Failed to load news images. Please check your internet connection and try again.</p>';
    elements.newsGallery.style.display = 'block';
  } finally {
    elements.loadNewsBtn.disabled = false;
    elements.loadNewsBtn.textContent = 'Inspiration';
  }
});
