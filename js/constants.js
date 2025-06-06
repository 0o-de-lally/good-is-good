
// DOM element references
export const elements = {
  upload: document.getElementById('image-upload'),
  imageUrlInput: document.getElementById('image-url'),
  loadUrlBtn: document.getElementById('load-url-btn'),
  canvas: document.getElementById('canvas'),
  watermark: document.getElementById('watermark'),
  saveBtn: document.getElementById('save-btn'),
  loadNewsBtn: document.getElementById('load-news-btn'),
  newsGallery: document.getElementById('news-gallery'),
  imageGrid: document.getElementById('image-grid')
};

// Canvas context
export const ctx = elements.canvas.getContext('2d');

// RSS feeds for news images
export const rssFeedUrls = [
  'https://www.theguardian.com/news/series/ten-best-photographs-of-the-day/rss',
];

// CORS proxy to fetch RSS feeds
export const corsProxy = 'https://api.allorigins.win/raw?url=';

// Initial state
export const state = {
  image: new Image(),
  isDragging: false,
  isDraggingLogo: false,
  offsetX: 0,
  offsetY: 0,
  logoOffsetX: 0,
  logoOffsetY: 0,
  watermarkPos: { x: 50, y: 50 },
  logoPos: { x: null, y: null }, // null means use default positioning
  logoScale: 1.0, // Default scale factor for logo
  logoSelected: false // Track if logo is currently selected
};
