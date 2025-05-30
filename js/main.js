
// Main entry point - imports all modules and initializes the application
import { elements, state } from './constants.js';
import './imageLoader.js';
import './watermarkControls.js';
import './rssLoader.js';
import './downloadHandler.js';

// Disable save button initially
elements.saveBtn.disabled = true;

// Initialize application
console.log('Good is Good - Image Editor initialized');
