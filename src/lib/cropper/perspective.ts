import { loadOpenCV } from './opencv-utils';

export interface CropResult {
  success: boolean;
  blob?: Blob;
  error?: string;
}

export async function processPolaroidImage(
  imageFile: File,
  options: {
    threshold?: number;
    enablePerspective?: boolean;
  } = {}
): Promise<CropResult> {
  const { threshold = 180, enablePerspective = true } = options;

  try {
    const cv = await loadOpenCV();

    const img = await loadImageToMat(cv, imageFile);

    const gray = new cv.Mat();
    cv.cvtColor(img, gray, cv.COLOR_RGBA2GRAY);

    const binary = new cv.Mat();
    cv.threshold(gray, binary, threshold, 255, cv.THRESH_BINARY);

    const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(5, 5));
    cv.morphologyEx(binary, binary, cv.MORPH_CLOSE, kernel);
    cv.morphologyEx(binary, binary, cv.MORPH_OPEN, kernel);

    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(binary, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    let maxArea = 0;
    let maxContourIdx = -1;
    for (let i = 0; i < contours.size(); i++) {
      const area = cv.contourArea(contours.get(i));
      if (area > maxArea) {
        maxArea = area;
        maxContourIdx = i;
      }
    }

    let result: ReturnType<typeof cv.Mat.prototype.roi> & { delete: () => void };

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

    const blob = await matToBlob(cv, result);

    img.delete();
    gray.delete();
    binary.delete();
    kernel.delete();
    contours.delete();
    hierarchy.delete();
    result.delete();

    return { success: true, blob };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function loadImageToMat(cv: Awaited<ReturnType<typeof loadOpenCV>>, file: File): Promise<ReturnType<typeof cv.imread>> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const mat = cv.imread(canvas);
      URL.revokeObjectURL(img.src);
      resolve(mat);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function perspectiveTransform(
  cv: Awaited<ReturnType<typeof loadOpenCV>>,
  src: ReturnType<typeof cv.imread>,
  corners: ReturnType<typeof cv.Mat.prototype.roi>
): ReturnType<typeof cv.Mat.prototype.roi> {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < 4; i++) {
    points.push({
      x: corners.data32S[i * 2],
      y: corners.data32S[i * 2 + 1],
    });
  }

  points.sort((a, b) => a.y - b.y);
  const top = points.slice(0, 2).sort((a, b) => a.x - b.x);
  const bottom = points.slice(2, 4).sort((a, b) => a.x - b.x);

  const ordered = [top[0], top[1], bottom[1], bottom[0]];

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
  cv: Awaited<ReturnType<typeof loadOpenCV>>,
  src: ReturnType<typeof cv.imread>,
  binary: ReturnType<typeof cv.imread>
): ReturnType<typeof cv.Mat.prototype.roi> {
  const rect = cv.boundingRect(binary);

  const roi = src.roi(rect);
  const dst = new cv.Mat();
  roi.copyTo(dst);
  roi.delete();

  return dst;
}

async function matToBlob(
  cv: Awaited<ReturnType<typeof loadOpenCV>>,
  mat: ReturnType<typeof cv.imread>
): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    cv.imshow(canvas, mat);
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/png');
  });
}
