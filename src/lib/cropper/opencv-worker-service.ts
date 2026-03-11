import type { WorkerRequest, WorkerResponse } from '@/workers/opencv.worker';

export interface ProcessOptions {
  threshold?: number;
  enablePerspective?: boolean;
}

export interface ProcessResult {
  success: boolean;
  blob?: Blob;
  error?: string;
}

type ReadyCallback = () => void;
type ErrorCallback = (error: string) => void;

class OpenCVWorkerService {
  private worker: Worker | null = null;
  private ready = false;
  private loading = false;
  private error: string | null = null;
  private pendingRequests = new Map<string, {
    resolve: (result: ProcessResult) => void;
    reject: (error: Error) => void;
  }>();
  private readyCallbacks: ReadyCallback[] = [];
  private errorCallbacks: ErrorCallback[] = [];

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    if (this.worker) return;

    this.loading = true;

    // Use classic worker (not module) to support importScripts for OpenCV.js
    this.worker = new Worker(
      new URL('../../workers/opencv.worker.ts', import.meta.url)
    );

    this.worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const { type, id, imageData, error: workerError } = e.data;

      if (type === 'ready') {
        this.ready = true;
        this.loading = false;
        this.error = null;
        this.readyCallbacks.forEach(cb => cb());
        this.readyCallbacks = [];
      } else if (type === 'error' && !id) {
        this.error = workerError || 'Unknown error';
        this.loading = false;
        this.errorCallbacks.forEach(cb => cb(this.error!));
        this.errorCallbacks = [];
      } else if (type === 'result' && id) {
        const pending = this.pendingRequests.get(id);
        if (pending && imageData) {
          this.imageDataToBlob(imageData).then((blob) => {
            pending.resolve({ success: true, blob });
            this.pendingRequests.delete(id);
          });
        }
      } else if (type === 'error' && id) {
        const pending = this.pendingRequests.get(id);
        if (pending) {
          pending.resolve({ success: false, error: workerError });
          this.pendingRequests.delete(id);
        }
      }
    };

    this.worker.onerror = (e) => {
      this.error = `Worker error: ${e.message}`;
      this.loading = false;
      this.errorCallbacks.forEach(cb => cb(this.error!));
      this.errorCallbacks = [];
    };
  }

  isReady(): boolean {
    return this.ready;
  }

  isLoading(): boolean {
    return this.loading;
  }

  getError(): string | null {
    return this.error;
  }

  onReady(callback: ReadyCallback): () => void {
    if (this.ready) {
      callback();
      return () => {};
    }
    this.readyCallbacks.push(callback);
    return () => {
      const idx = this.readyCallbacks.indexOf(callback);
      if (idx >= 0) this.readyCallbacks.splice(idx, 1);
    };
  }

  onError(callback: ErrorCallback): () => void {
    if (this.error) {
      callback(this.error);
      return () => {};
    }
    this.errorCallbacks.push(callback);
    return () => {
      const idx = this.errorCallbacks.indexOf(callback);
      if (idx >= 0) this.errorCallbacks.splice(idx, 1);
    };
  }

  async processImage(file: File, options: ProcessOptions = {}): Promise<ProcessResult> {
    if (!this.worker || !this.ready) {
      return { success: false, error: 'OpenCV not ready' };
    }

    try {
      const imageData = await this.fileToImageData(file);
      const id = crypto.randomUUID();

      return new Promise((resolve, reject) => {
        this.pendingRequests.set(id, { resolve, reject });

        const request: WorkerRequest = {
          type: 'process',
          id,
          imageData,
          options: {
            threshold: options.threshold ?? 180,
            enablePerspective: options.enablePerspective ?? true,
          },
        };

        this.worker!.postMessage(request);
      });
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to process image'
      };
    }
  }

  private async fileToImageData(file: File): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(img.src);
        resolve(imageData);
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };
      img.src = URL.createObjectURL(file);
    });
  }

  private async imageDataToBlob(imageData: ImageData): Promise<Blob> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      const ctx = canvas.getContext('2d')!;
      ctx.putImageData(imageData, 0, 0);
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png');
    });
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.ready = false;
    }
  }
}

// Singleton instance
export const opencvWorkerService = new OpenCVWorkerService();
