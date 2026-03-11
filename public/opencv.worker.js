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
  const { threshold, enablePerspective } = options;

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
