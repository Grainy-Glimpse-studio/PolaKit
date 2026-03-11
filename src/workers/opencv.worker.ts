/// <reference lib="webworker" />

declare const self: DedicatedWorkerGlobalScope;

// Declare global cv variable that OpenCV.js creates
declare let cv: CVInstance;

// OpenCV types for Worker context
interface CVInstance {
  Mat: new () => CVMat;
  MatVector: new () => CVMatVector;
  Size: new (width: number, height: number) => CVSize;
  COLOR_RGBA2GRAY: number;
  THRESH_BINARY: number;
  MORPH_RECT: number;
  MORPH_CLOSE: number;
  MORPH_OPEN: number;
  RETR_EXTERNAL: number;
  CHAIN_APPROX_SIMPLE: number;
  CV_32FC2: number;
  cvtColor: (src: CVMat, dst: CVMat, code: number) => void;
  threshold: (src: CVMat, dst: CVMat, thresh: number, maxval: number, type: number) => void;
  getStructuringElement: (shape: number, size: CVSize) => CVMat;
  morphologyEx: (src: CVMat, dst: CVMat, op: number, kernel: CVMat) => void;
  findContours: (image: CVMat, contours: CVMatVector, hierarchy: CVMat, mode: number, method: number) => void;
  contourArea: (contour: CVMat) => number;
  arcLength: (contour: CVMat, closed: boolean) => number;
  approxPolyDP: (contour: CVMat, approx: CVMat, epsilon: number, closed: boolean) => void;
  boundingRect: (src: CVMat) => { x: number; y: number; width: number; height: number };
  matFromArray: (rows: number, cols: number, type: number, data: number[]) => CVMat;
  matFromImageData: (imageData: ImageData) => CVMat;
  getPerspectiveTransform: (src: CVMat, dst: CVMat) => CVMat;
  warpPerspective: (src: CVMat, dst: CVMat, M: CVMat, size: CVSize) => void;
}

interface CVMat {
  rows: number;
  cols: number;
  data: Uint8ClampedArray;
  data32S: Int32Array;
  delete: () => void;
  copyTo: (dst: CVMat) => void;
  roi: (rect: { x: number; y: number; width: number; height: number }) => CVMat;
}

interface CVMatVector {
  size: () => number;
  get: (index: number) => CVMat;
  delete: () => void;
}

interface CVSize {
  width: number;
  height: number;
}

// Message types
export interface WorkerRequest {
  type: 'process';
  id: string;
  imageData: ImageData;
  options: {
    threshold: number;
    enablePerspective: boolean;
  };
}

export interface WorkerResponse {
  type: 'ready' | 'result' | 'error' | 'progress';
  id?: string;
  imageData?: ImageData;
  error?: string;
  progress?: number;
}

let cvInstance: CVInstance | null = null;

// Load OpenCV.js using importScripts (works in dedicated workers)
function loadOpenCV(): Promise<CVInstance> {
  return new Promise((resolve, reject) => {
    try {
      // importScripts is synchronous in classic workers
      self.importScripts('/opencv.js');

      // Poll for cv to be ready (OpenCV WASM initialization)
      const maxWait = 30000;
      const startTime = Date.now();

      const checkReady = () => {
        // Check if cv is defined and has Mat constructor
        if (typeof cv !== 'undefined' && cv && cv.Mat) {
          resolve(cv);
          return;
        }

        if (Date.now() - startTime > maxWait) {
          reject(new Error('OpenCV initialization timeout'));
          return;
        }

        setTimeout(checkReady, 50);
      };

      checkReady();
    } catch (error) {
      reject(error);
    }
  });
}

// Initialize OpenCV when worker starts
loadOpenCV()
  .then((instance) => {
    cvInstance = instance;
    self.postMessage({ type: 'ready' } as WorkerResponse);
  })
  .catch((error) => {
    self.postMessage({
      type: 'error',
      error: `Failed to load OpenCV: ${error instanceof Error ? error.message : String(error)}`
    } as WorkerResponse);
  });

// Process incoming messages
self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { type, id, imageData, options } = e.data;

  if (type === 'process') {
    if (!cvInstance) {
      self.postMessage({
        type: 'error',
        id,
        error: 'OpenCV not ready'
      } as WorkerResponse);
      return;
    }

    try {
      const result = processImage(cvInstance, imageData, options);
      self.postMessage({
        type: 'result',
        id,
        imageData: result
      } as WorkerResponse);
    } catch (error) {
      self.postMessage({
        type: 'error',
        id,
        error: error instanceof Error ? error.message : 'Processing failed'
      } as WorkerResponse);
    }
  }
};

function processImage(
  cv: CVInstance,
  imageData: ImageData,
  options: { threshold: number; enablePerspective: boolean }
): ImageData {
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

  let result: CVMat;

  if (maxContourIdx >= 0 && enablePerspective) {
    const contour = contours.get(maxContourIdx);
    const approx = new cv.Mat();
    const epsilon = 0.02 * cv.arcLength(contour, true);
    cv.approxPolyDP(contour, approx, epsilon, true);

    if (approx.rows === 4) {
      result = perspectiveTransform(cv, img, approx);
    } else {
      result = simpleCrop(cv, img, binary);
    }

    approx.delete();
  } else {
    result = simpleCrop(cv, img, binary);
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

function perspectiveTransform(
  cv: CVInstance,
  src: CVMat,
  corners: CVMat
): CVMat {
  const points: { x: number; y: number }[] = [];
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

function simpleCrop(
  cv: CVInstance,
  src: CVMat,
  binary: CVMat
): CVMat {
  const rect = cv.boundingRect(binary);
  const roi = src.roi(rect);
  const dst = new cv.Mat();
  roi.copyTo(dst);
  roi.delete();
  return dst;
}

export {};
