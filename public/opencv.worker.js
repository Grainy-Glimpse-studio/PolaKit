// OpenCV Web Worker - processes images in background thread

let cv = null;
let ready = false;
let messageQueue = [];

// Set up message handler FIRST before loading OpenCV
self.onmessage = function(e) {
  const { type, id, imageData, options } = e.data;
  self.postMessage({ type: 'log', message: 'Received: ' + type + (imageData ? ' (with imageData)' : '') });

  if (type === 'ping') {
    self.postMessage({ type: 'log', message: 'Pong!' });
    return;
  }

  if (type === 'process') {
    if (!ready || !cv) {
      // Queue message if not ready
      self.postMessage({ type: 'log', message: 'Queuing message, not ready yet' });
      messageQueue.push(e.data);
      return;
    }
    processRequest(id, imageData, options);
  }
};

function processRequest(id, imageData, options) {
  try {
    self.postMessage({ type: 'log', message: 'Processing image ' + imageData.width + 'x' + imageData.height });

    const result = processImage(imageData, options);
    self.postMessage({ type: 'log', message: 'Processing done: ' + result.width + 'x' + result.height });

    self.postMessage({
      type: 'result',
      id: id,
      imageData: result
    });
  } catch (error) {
    self.postMessage({ type: 'log', message: 'Processing error: ' + (error.message || error) });
    self.postMessage({
      type: 'error',
      id: id,
      error: error.message || 'Processing failed'
    });
  }
}

// Process any queued messages
function processQueue() {
  self.postMessage({ type: 'log', message: 'Processing ' + messageQueue.length + ' queued messages' });
  while (messageQueue.length > 0) {
    const { id, imageData, options } = messageQueue.shift();
    processRequest(id, imageData, options);
  }
}

// Load OpenCV.js
function loadOpenCV() {
  self.postMessage({ type: 'log', message: 'Loading opencv.js...' });

  try {
    self.importScripts('/opencv.js');
  } catch (e) {
    self.postMessage({ type: 'log', message: 'importScripts error: ' + e.message });
    self.postMessage({ type: 'error', error: 'Failed to load opencv.js' });
    return;
  }

  self.postMessage({ type: 'log', message: 'opencv.js loaded, waiting for WASM...' });

  // Poll for cv to be ready
  const maxWait = 30000;
  const startTime = Date.now();

  function checkReady() {
    // Check if cv is ready (might be a function that needs to be called)
    if (typeof self.cv === 'function') {
      // cv is a factory function, call it
      self.postMessage({ type: 'log', message: 'cv is a factory function, calling it...' });
      self.cv().then(function(cvInstance) {
        cv = cvInstance;
        onCvReady();
      });
      return;
    }

    if (typeof self.cv !== 'undefined' && self.cv && self.cv.Mat) {
      cv = self.cv;
      onCvReady();
      return;
    }

    if (Date.now() - startTime > maxWait) {
      self.postMessage({ type: 'error', error: 'OpenCV initialization timeout' });
      return;
    }

    setTimeout(checkReady, 100);
  }

  checkReady();
}

function onCvReady() {
  self.postMessage({ type: 'log', message: 'OpenCV ready!' });
  ready = true;
  self.postMessage({ type: 'ready' });
  processQueue();
}

// Start loading OpenCV after a small delay to ensure message handler is set up
setTimeout(loadOpenCV, 10);

function processImage(imageData, options) {
  const { threshold, enablePerspective, extractInnerImage } = options;

  // Convert ImageData to Mat
  const img = cv.matFromImageData(imageData);

  // Convert to grayscale
  const gray = new cv.Mat();
  cv.cvtColor(img, gray, cv.COLOR_RGBA2GRAY);

  // Threshold to binary
  const binary = new cv.Mat();
  cv.threshold(gray, binary, threshold, 255, cv.THRESH_BINARY);

  // Morphological operations to clean up
  const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(5, 5));
  cv.morphologyEx(binary, binary, cv.MORPH_CLOSE, kernel);
  cv.morphologyEx(binary, binary, cv.MORPH_OPEN, kernel);

  // Find contours
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(binary, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  // Find largest contour
  let maxArea = 0;
  let maxContourIdx = -1;
  for (let i = 0; i < contours.size(); i++) {
    const area = cv.contourArea(contours.get(i));
    if (area > maxArea) {
      maxArea = area;
      maxContourIdx = i;
    }
  }

  let result;

  if (maxContourIdx >= 0 && enablePerspective) {
    const contour = contours.get(maxContourIdx);
    const approx = new cv.Mat();
    const epsilon = 0.02 * cv.arcLength(contour, true);
    cv.approxPolyDP(contour, approx, epsilon, true);

    if (approx.rows === 4) {
      result = perspectiveTransform(img, approx);
    } else {
      result = simpleCrop(img, binary);
    }

    approx.delete();
  } else {
    result = simpleCrop(img, binary);
  }

  // If extractInnerImage is enabled, crop away the white Polaroid border
  if (extractInnerImage) {
    const innerResult = extractInner(result);
    result.delete();
    result = innerResult;
  }

  // Convert result Mat to ImageData
  const outputImageData = new ImageData(
    new Uint8ClampedArray(result.data),
    result.cols,
    result.rows
  );

  // Clean up
  img.delete();
  gray.delete();
  binary.delete();
  kernel.delete();
  contours.delete();
  hierarchy.delete();
  result.delete();

  return outputImageData;
}

function perspectiveTransform(src, corners) {
  const points = [];
  for (let i = 0; i < 4; i++) {
    points.push({
      x: corners.data32S[i * 2],
      y: corners.data32S[i * 2 + 1],
    });
  }

  // Sort points: top-left, top-right, bottom-right, bottom-left
  points.sort((a, b) => a.y - b.y);
  const top = points.slice(0, 2).sort((a, b) => a.x - b.x);
  const bottom = points.slice(2, 4).sort((a, b) => a.x - b.x);
  const ordered = [top[0], top[1], bottom[1], bottom[0]];

  // Calculate output dimensions
  const width = Math.max(
    Math.hypot(ordered[1].x - ordered[0].x, ordered[1].y - ordered[0].y),
    Math.hypot(ordered[2].x - ordered[3].x, ordered[2].y - ordered[3].y)
  );
  const height = Math.max(
    Math.hypot(ordered[3].x - ordered[0].x, ordered[3].y - ordered[0].y),
    Math.hypot(ordered[2].x - ordered[1].x, ordered[2].y - ordered[1].y)
  );

  const srcPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
    ordered[0].x, ordered[0].y,
    ordered[1].x, ordered[1].y,
    ordered[2].x, ordered[2].y,
    ordered[3].x, ordered[3].y,
  ]);

  const dstPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
    0, 0,
    width, 0,
    width, height,
    0, height,
  ]);

  const M = cv.getPerspectiveTransform(srcPts, dstPts);
  const dst = new cv.Mat();
  cv.warpPerspective(src, dst, M, new cv.Size(width, height));

  srcPts.delete();
  dstPts.delete();
  M.delete();

  return dst;
}

function simpleCrop(src, binary) {
  const rect = cv.boundingRect(binary);
  const roi = src.roi(rect);
  const dst = new cv.Mat();
  roi.copyTo(dst);
  roi.delete();
  return dst;
}

// Extract inner photo from Polaroid by removing white border
function extractInner(src) {
  self.postMessage({ type: 'log', message: 'Extracting inner image...' });

  const width = src.cols;
  const height = src.rows;

  // Convert to grayscale
  const gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

  // Apply Gaussian blur to reduce noise
  const blurred = new cv.Mat();
  cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

  // Use Canny edge detection - more robust than simple thresholding
  const edges = new cv.Mat();
  cv.Canny(blurred, edges, 50, 150);

  // Dilate edges to connect broken lines
  const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
  cv.dilate(edges, edges, kernel);

  // Find contours
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(edges, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

  self.postMessage({ type: 'log', message: 'Found ' + contours.size() + ' contours' });

  // Find the best rectangular contour for the inner photo
  // It should be roughly in the center and reasonably large
  let bestContour = null;
  let bestScore = 0;
  const centerX = width / 2;
  const centerY = height / 2;
  const minArea = width * height * 0.15; // Inner photo should be at least 15% of image
  const maxArea = width * height * 0.85; // And at most 85%

  for (let i = 0; i < contours.size(); i++) {
    const contour = contours.get(i);
    const area = cv.contourArea(contour);

    if (area < minArea || area > maxArea) continue;

    // Approximate to polygon
    const approx = new cv.Mat();
    const epsilon = 0.02 * cv.arcLength(contour, true);
    cv.approxPolyDP(contour, approx, epsilon, true);

    // We want 4 corners (rectangle)
    if (approx.rows === 4) {
      const rect = cv.boundingRect(contour);
      const rectCenterX = rect.x + rect.width / 2;
      const rectCenterY = rect.y + rect.height / 2;

      // Score based on: size (larger is better) and centrality
      const distFromCenter = Math.sqrt(
        Math.pow(rectCenterX - centerX, 2) + Math.pow(rectCenterY - centerY, 2)
      );
      const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
      const centralityScore = 1 - (distFromCenter / maxDist);

      // Aspect ratio check - inner photo is roughly square (0.8 to 1.2)
      const aspectRatio = rect.width / rect.height;
      const aspectScore = (aspectRatio >= 0.7 && aspectRatio <= 1.3) ? 1 : 0.5;

      const score = (area / (width * height)) * centralityScore * aspectScore;

      if (score > bestScore) {
        bestScore = score;
        if (bestContour) bestContour.delete();
        bestContour = new cv.Mat();
        approx.copyTo(bestContour);
      }
    }

    approx.delete();
  }

  let result;

  if (bestContour && bestScore > 0.1) {
    self.postMessage({ type: 'log', message: 'Found inner rectangle, score: ' + bestScore.toFixed(3) });

    // Use perspective transform for the detected quadrilateral
    result = perspectiveTransform(src, bestContour);
    bestContour.delete();
  } else {
    // Fallback: use standard Polaroid proportions
    // Classic Polaroid: ~8% border on top and sides, ~25% on bottom
    self.postMessage({ type: 'log', message: 'Using estimated Polaroid proportions' });

    const borderLeft = Math.round(width * 0.08);
    const borderRight = Math.round(width * 0.08);
    const borderTop = Math.round(height * 0.08);
    const borderBottom = Math.round(height * 0.25);

    const x = borderLeft;
    const y = borderTop;
    const w = width - borderLeft - borderRight;
    const h = height - borderTop - borderBottom;

    if (w > 0 && h > 0) {
      const roi = src.roi(new cv.Rect(x, y, w, h));
      result = new cv.Mat();
      roi.copyTo(result);
      roi.delete();
    } else {
      result = new cv.Mat();
      src.copyTo(result);
    }
  }

  // Clean up
  gray.delete();
  blurred.delete();
  edges.delete();
  kernel.delete();
  contours.delete();
  hierarchy.delete();

  return result;
}
