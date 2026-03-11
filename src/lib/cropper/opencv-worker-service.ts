// Worker message types (duplicated to avoid importing from worker file)
interface WorkerRequest {
  type: 'process';
  id: string;
  imageData: ImageData;
  options: {
    threshold: number;
    enablePerspective: boolean;
  };
}

interface WorkerResponse {
  type: 'ready' | 'result' | 'error' | 'progress' | 'log';
  id?: string;
  imageData?: ImageData;
  width?: number;
  height?: number;
  data?: Uint8ClampedArray;
  error?: string;
  progress?: number;
  message?: string;
}

export interface ProcessOptions {
  threshold?: number;
  enablePerspective?: boolean;
  extractInnerImage?: boolean;
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
    console.log('[OpenCV] Initializing worker...');

    try {
      // Use worker from public directory (classic worker with importScripts)
      this.worker = new Worker('/opencv.worker.js');
      console.log('[OpenCV] Worker created successfully');
    } catch (e) {
      console.error('[OpenCV] Failed to create worker:', e);
      this.error = 'Failed to create worker';
      this.loading = false;
      return;
    }

    this.worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const { type, id, error: workerError, message } = e.data;

      // Handle log messages from worker
      if (type === 'log') {
        console.log('[OpenCV Worker]', message);
        return;
      }

      console.log('[OpenCV] Worker message:', type, id ? `(id: ${id})` : '');

      if (type === 'ready') {
        console.log('[OpenCV] Worker ready!');
        this.ready = true;
        this.loading = false;
        this.error = null;
        this.readyCallbacks.forEach(cb => cb());
        this.readyCallbacks = [];
      } else if (type === 'error' && !id) {
        console.error('[OpenCV] Worker init error:', workerError);
        this.error = workerError || 'Unknown error';
        this.loading = false;
        this.errorCallbacks.forEach(cb => cb(this.error!));
        this.errorCallbacks = [];
      } else if (type === 'result' && id) {
        const pending = this.pendingRequests.get(id);
        const { imageData: resultImageData } = e.data as { imageData: ImageData };
        if (pending && resultImageData) {
          console.log('[OpenCV] Result received:', resultImageData.width, 'x', resultImageData.height);
          this.imageDataToBlob(resultImageData).then((blob) => {
            console.log('[OpenCV] Blob created, size:', blob.size);
            pending.resolve({ success: true, blob });
            this.pendingRequests.delete(id);
          });
        }
      } else if (type === 'error' && id) {
        console.error('[OpenCV] Processing error:', workerError);
        const pending = this.pendingRequests.get(id);
        if (pending) {
          pending.resolve({ success: false, error: workerError });
          this.pendingRequests.delete(id);
        }
      }
    };

    this.worker.onerror = (e) => {
      console.error('[OpenCV] Worker error:', e);
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
    console.log('[OpenCV] processImage called, ready:', this.ready);
    if (!this.worker || !this.ready) {
      console.error('[OpenCV] Not ready!');
      return { success: false, error: 'OpenCV not ready' };
    }

    try {
      console.log('[OpenCV] Converting file to ImageData...');
      const imageData = await this.fileToImageData(file);
      console.log('[OpenCV] ImageData ready:', imageData.width, 'x', imageData.height);
      const id = crypto.randomUUID();

      return new Promise((resolve, reject) => {
        this.pendingRequests.set(id, { resolve, reject });

        const request = {
          type: 'process',
          id,
          imageData: imageData,
          options: {
            threshold: options.threshold ?? 180,
            enablePerspective: options.enablePerspective ?? true,
            extractInnerImage: options.extractInnerImage ?? false,
          },
        };

        console.log('[OpenCV] Sending to worker, id:', id);

        // Test: send a simple ping first
        this.worker!.postMessage({ type: 'ping' });

        try {
          this.worker!.postMessage(request);
          console.log('[OpenCV] Message sent, imageData size:', imageData.data.length);
        } catch (e) {
          console.error('[OpenCV] postMessage failed:', e);
        }
      });
    } catch (err) {
      console.error('[OpenCV] Process error:', err);
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
