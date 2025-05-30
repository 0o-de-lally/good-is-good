
import { ctx, state, elements } from './constants.js';
import { calculateImageDimensions } from './imageUtils.js';
import { watermarkImage, fistImage, sunImage } from './imageLoader.js';

// Helper function to position and draw logo
function positionLogo(targetContext, origDimensions, downloadScaleFactor = 1, forDownload = false) {
  if (!state.image.complete || !state.image.src) return; // Only draw logo if an image is loaded

  const targetCanvas = targetContext.canvas;

  // SVG logo parameters - size scales based on download factor
  const logoSize = 24 * downloadScaleFactor;
  const logoPadding = 10 * downloadScaleFactor; // Equal padding for right and bottom
  const logoSpacing = 10 * downloadScaleFactor;
  const bgPadding = 5 * downloadScaleFactor;

  // Calculate the dimensions to draw at
  let logoX, logoY;

  if (forDownload) {
    if (state.logoPos.x !== null && state.logoPos.y !== null) {
      // Use custom position relative to image area for download
      const logoRelX = state.logoPos.x - origDimensions.offsetX;
      const logoRelY = state.logoPos.y - origDimensions.offsetY;
      logoX = logoRelX * downloadScaleFactor;
      logoY = logoRelY * downloadScaleFactor;
    } else {
      // For download: position directly in the image coordinates (default position)
      logoX = targetCanvas.width - logoPadding - (logoSize * 2) - logoSpacing;
      logoY = targetCanvas.height - logoPadding - logoSize;
    }
  } else {
    if (state.logoPos.x !== null && state.logoPos.y !== null) {
      // Use custom dragged position
      logoX = state.logoPos.x;
      logoY = state.logoPos.y;
    } else {
      // For display: position relative to the image area in the canvas (default position)
      logoX = origDimensions.offsetX + origDimensions.drawWidth - logoPadding - (logoSize * 2) - logoSpacing;
      logoY = origDimensions.offsetY + origDimensions.drawHeight - logoPadding - logoSize;
    }
  }

  // Store the logo bounds for hit detection
  state.logoBounds = {
    x: logoX - bgPadding,
    y: logoY - bgPadding,
    width: (logoSize * 2) + logoSpacing + (bgPadding * 2),
    height: logoSize + (bgPadding * 2)
  };

  // Black background for logo
  targetContext.fillStyle = 'black';
  targetContext.fillRect(
    logoX - bgPadding,
    logoY - bgPadding,
    (logoSize * 2) + logoSpacing + (bgPadding * 2),
    logoSize + (bgPadding * 2)
  );

  // Add border when dragging
  if (state.isDraggingLogo && !forDownload) {
    targetContext.strokeStyle = '#fff';
    targetContext.lineWidth = 2;
    targetContext.setLineDash([5, 5]);
    targetContext.strokeRect(
      logoX - bgPadding,
      logoY - bgPadding,
      (logoSize * 2) + logoSpacing + (bgPadding * 2),
      logoSize + (bgPadding * 2)
    );
    targetContext.setLineDash([]);
  }

  // Draw SVG logos with white filter
  targetContext.save();
  targetContext.filter = 'invert(1)';

  // Only draw if logo images are loaded
  if (fistImage.complete && sunImage.complete) {
    // Draw fist logo
    targetContext.drawImage(fistImage, logoX, logoY, logoSize, logoSize);

    // Draw sun logo
    targetContext.drawImage(sunImage, logoX + logoSize + logoSpacing, logoY, logoSize, logoSize);
  } else {
    // Debug: Log if images aren't loaded yet
    console.log('Logo images not yet loaded:', {
      fistComplete: fistImage.complete,
      sunComplete: sunImage.complete,
      fistSrc: fistImage.src,
      sunSrc: sunImage.src
    });

    // Try to draw a simple rectangle instead to test positioning
    targetContext.fillStyle = 'red';
    targetContext.fillRect(logoX, logoY, logoSize, logoSize);
    targetContext.fillRect(logoX + logoSize + logoSpacing, logoY, logoSize, logoSize);
  }

  targetContext.restore();
}

export function draw(targetContext = ctx, downloadScaleFactor = 1, forDownload = false) {
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
    targetContext.drawImage(state.image, 0, 0, targetCanvas.width, targetCanvas.height);
  } else {
    // Draw the image centered and maintaining aspect ratio for display
    targetContext.drawImage(
      state.image,
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
      state.watermarkPos.x,
      state.watermarkPos.y,
      elements.watermark.width,
      elements.watermark.height
    );

    // Add border when dragging watermark
    if (state.isDragging) {
      targetContext.strokeStyle = '#fff';
      targetContext.lineWidth = 2;
      targetContext.setLineDash([5, 5]);
      targetContext.strokeRect(
        state.watermarkPos.x,
        state.watermarkPos.y,
        elements.watermark.width,
        elements.watermark.height
      );
      targetContext.setLineDash([]);
    }
  } else if (!state.isDragging) {
    // For download, scale the watermark
    // Adjust watermark position relative to the image area
    const watermarkRelX = state.watermarkPos.x - origDimensions.offsetX;
    const watermarkRelY = state.watermarkPos.y - origDimensions.offsetY;

    // Scale watermark properties
    const scaledWatermarkX = watermarkRelX * downloadScaleFactor;
    const scaledWatermarkY = watermarkRelY * downloadScaleFactor;
    const scaledWatermarkWidth = elements.watermark.width * downloadScaleFactor;
    const scaledWatermarkHeight = elements.watermark.height * downloadScaleFactor;

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
