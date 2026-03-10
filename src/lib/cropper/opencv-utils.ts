declare global {
  interface Window {
    cv: CVInstance;
    Module: {
      onRuntimeInitialized?: () => void;
    };
  }
}

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
  getPerspectiveTransform: (src: CVMat, dst: CVMat) => CVMat;
  warpPerspective: (src: CVMat, dst: CVMat, M: CVMat, size: CVSize) => void;
  imread: (canvas: HTMLCanvasElement) => CVMat;
  imshow: (canvas: HTMLCanvasElement, mat: CVMat) => void;
}

interface CVMat {
  rows: number;
  cols: number;
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

let cvReady = false;
let cvPromise: Promise<CVInstance> | null = null;

export function loadOpenCV(): Promise<CVInstance> {
  if (cvReady && window.cv) {
    return Promise.resolve(window.cv);
  }

  if (cvPromise) {
    return cvPromise;
  }

  cvPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.cv && window.cv.Mat) {
      cvReady = true;
      resolve(window.cv);
      return;
    }

    // Set up the onRuntimeInitialized callback BEFORE loading the script
    window.Module = window.Module || {};
    window.Module.onRuntimeInitialized = () => {
      console.log('OpenCV.js runtime initialized');
      if (window.cv && window.cv.Mat) {
        cvReady = true;
        resolve(window.cv);
      }
    };

    const script = document.createElement('script');
    script.src = '/opencv.js';
    script.async = true;

    script.onload = () => {
      console.log('OpenCV.js script loaded, waiting for runtime...');

      // If cv is already ready (some builds don't use onRuntimeInitialized)
      if (window.cv && window.cv.Mat) {
        cvReady = true;
        resolve(window.cv);
        return;
      }

      // Fallback: poll for cv to be ready
      const checkReady = setInterval(() => {
        if (window.cv && window.cv.Mat) {
          clearInterval(checkReady);
          cvReady = true;
          console.log('OpenCV.js ready (via polling)');
          resolve(window.cv);
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkReady);
        if (!cvReady) {
          reject(new Error('OpenCV.js load timeout - WASM may have failed to load'));
        }
      }, 30000);
    };

    script.onerror = (e) => {
      console.error('Failed to load OpenCV.js script', e);
      reject(new Error('Failed to load OpenCV.js'));
    };

    document.head.appendChild(script);
  });

  return cvPromise;
}

export function isOpenCVReady(): boolean {
  return cvReady && !!window.cv;
}
