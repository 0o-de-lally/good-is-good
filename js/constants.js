
// DOM element references
export const elements = {
  upload: document.getElementById('image-upload'),
  imageUrlInput: document.getElementById('image-url'),
  loadUrlBtn: document.getElementById('load-url-btn'),
  canvas: document.getElementById('canvas'),
  watermark: document.getElementById('watermark'),
  saveBtn: document.getElementById('save-btn'),
  loadReutersBtn: document.getElementById('load-reuters-btn'),
  reutersGallery: document.getElementById('reuters-gallery'),
  imageGrid: document.getElementById('image-grid')
};

// Canvas context
export const ctx = elements.canvas.getContext('2d');

// RSS feeds for news images
export const rssFeedUrls = [
  'https://www.theguardian.com/news/series/ten-best-photographs-of-the-day/rss',
  // 'https://feeds.reuters.com/reuters/picturesoftheday',
  // 'https://www.theatlantic.com/feed/channel/photo/',
  // 'https://feeds.bbci.co.uk/news/in_pictures/rss.xml',
  // 'https://www.nationalgeographic.com/photography/rss'
];

// CORS proxy to fetch RSS feeds
export const corsProxy = 'https://api.allorigins.win/raw?url=';

// Initial state
export const state = {
  image: new Image(),
  isDragging: false,
  offsetX: 0,
  offsetY: 0,
  watermarkPos: { x: 50, y: 50 }
};
