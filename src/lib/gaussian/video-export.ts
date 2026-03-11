import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import GIFEncoder from 'gif-encoder-2';
import type { GaussianSettings } from '@/store/gaussian-store';
import { renderComposite } from './composite';
import { getRatioDimensions } from './presets';

export interface VideoExportOptions {
  settings: GaussianSettings;
  polaroidImage: HTMLImageElement;
  bgVideo: HTMLVideoElement;
  startTime: number;
  duration: number;
  fps?: number;
  onProgress?: (progress: number) => void;
}

export interface GifExportOptions {
  settings: GaussianSettings;
  polaroidImage: HTMLImageElement;
  bgVideo: HTMLVideoElement;
  startTime: number;
  duration: number;
  fps?: number;
  quality?: number;
  onProgress?: (progress: number) => void;
}

/**
 * Export as MP4 video
 */
export async function exportAsVideo(options: VideoExportOptions): Promise<Blob> {
  const {
    settings,
    polaroidImage,
    bgVideo,
    startTime,
    duration,
    fps = 30,
    onProgress,
  } = options;

  const { width, height } = getRatioDimensions(
    settings.ratio,
    settings.customRatioW,
    settings.customRatioH,
    settings.resolution
  );

  const totalFrames = Math.ceil(duration * fps);
  const frameDuration = 1 / fps;

  // Create canvas for rendering frames
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Create temp canvas for video frames
  const videoFrameCanvas = document.createElement('canvas');
  videoFrameCanvas.width = bgVideo.videoWidth;
  videoFrameCanvas.height = bgVideo.videoHeight;
  const videoFrameCtx = videoFrameCanvas.getContext('2d')!;

  // Initialize MP4 muxer
  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: {
      codec: 'avc',
      width,
      height,
    },
    fastStart: 'in-memory',
  });

  // Check if VideoEncoder is available
  if (typeof VideoEncoder === 'undefined') {
    throw new Error('VideoEncoder API not supported in this browser');
  }

  const encoder = new VideoEncoder({
    output: (chunk, meta) => {
      muxer.addVideoChunk(chunk, meta);
    },
    error: (e) => {
      console.error('VideoEncoder error:', e);
    },
  });

  encoder.configure({
    codec: 'avc1.42001f',
    width,
    height,
    bitrate: 5_000_000,
    framerate: fps,
  });

  // Render each frame
  for (let i = 0; i < totalFrames; i++) {
    const time = startTime + i * frameDuration;

    // Seek video to current time
    bgVideo.currentTime = time;
    await new Promise<void>((resolve) => {
      const onSeeked = () => {
        bgVideo.removeEventListener('seeked', onSeeked);
        resolve();
      };
      bgVideo.addEventListener('seeked', onSeeked);
    });

    // Capture video frame
    videoFrameCtx.drawImage(bgVideo, 0, 0);

    // Render composite
    renderComposite({
      settings,
      image: polaroidImage,
      canvas,
      scale: 1,
      bgVideoFrame: videoFrameCanvas,
    });

    // Create VideoFrame
    const frame = new VideoFrame(canvas, {
      timestamp: i * frameDuration * 1_000_000, // microseconds
      duration: frameDuration * 1_000_000,
    });

    encoder.encode(frame);
    frame.close();

    onProgress?.(((i + 1) / totalFrames) * 100);
  }

  await encoder.flush();
  muxer.finalize();

  const { buffer } = muxer.target;
  return new Blob([buffer], { type: 'video/mp4' });
}

/**
 * Export as GIF
 */
export async function exportAsGif(options: GifExportOptions): Promise<Blob> {
  const {
    settings,
    polaroidImage,
    bgVideo,
    startTime,
    duration,
    fps = 15,
    quality = 10,
    onProgress,
  } = options;

  const { width, height } = getRatioDimensions(
    settings.ratio,
    settings.customRatioW,
    settings.customRatioH,
    Math.min(settings.resolution, 720) // Limit GIF resolution
  );

  const totalFrames = Math.ceil(duration * fps);
  const frameDuration = 1 / fps;
  const delay = Math.round(1000 / fps);

  // Create canvas for rendering frames
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  // Create temp canvas for video frames
  const videoFrameCanvas = document.createElement('canvas');
  videoFrameCanvas.width = bgVideo.videoWidth;
  videoFrameCanvas.height = bgVideo.videoHeight;
  const videoFrameCtx = videoFrameCanvas.getContext('2d')!;

  // Initialize GIF encoder
  const encoder = new GIFEncoder(width, height, 'neuquant', true);
  encoder.setDelay(delay);
  encoder.setQuality(quality);
  encoder.start();

  // Render each frame
  for (let i = 0; i < totalFrames; i++) {
    const time = startTime + i * frameDuration;

    // Seek video to current time
    bgVideo.currentTime = time;
    await new Promise<void>((resolve) => {
      const onSeeked = () => {
        bgVideo.removeEventListener('seeked', onSeeked);
        resolve();
      };
      bgVideo.addEventListener('seeked', onSeeked);
    });

    // Capture video frame
    videoFrameCtx.drawImage(bgVideo, 0, 0);

    // Render composite
    renderComposite({
      settings,
      image: polaroidImage,
      canvas,
      scale: 1,
      bgVideoFrame: videoFrameCanvas,
    });

    // Add frame to GIF
    const ctx = canvas.getContext('2d')!;
    encoder.addFrame(ctx);

    onProgress?.(((i + 1) / totalFrames) * 100);
  }

  encoder.finish();
  const buffer = encoder.out.getData();
  return new Blob([buffer], { type: 'image/gif' });
}

/**
 * Load video element from URL
 */
export function loadVideo(url: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => resolve(video);
    video.onerror = () => reject(new Error('Failed to load video'));

    video.src = url;
    video.load();
  });
}
