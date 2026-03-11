import { useState, useEffect, useCallback } from 'react';
import { opencvWorkerService, type ProcessOptions, type ProcessResult } from '@/lib/cropper/opencv-worker-service';

interface UseOpenCVResult {
  ready: boolean;
  loading: boolean;
  error: string | null;
  processImage: (file: File, options?: ProcessOptions) => Promise<ProcessResult>;
}

export function useOpenCV(): UseOpenCVResult {
  const [ready, setReady] = useState(opencvWorkerService.isReady());
  const [loading, setLoading] = useState(opencvWorkerService.isLoading());
  const [error, setError] = useState<string | null>(opencvWorkerService.getError());

  useEffect(() => {
    // Subscribe to ready state
    const unsubReady = opencvWorkerService.onReady(() => {
      setReady(true);
      setLoading(false);
      setError(null);
    });

    // Subscribe to error state
    const unsubError = opencvWorkerService.onError((err) => {
      setError(err);
      setLoading(false);
    });

    return () => {
      unsubReady();
      unsubError();
    };
  }, []);

  const processImage = useCallback(async (
    file: File,
    options: ProcessOptions = {}
  ): Promise<ProcessResult> => {
    return opencvWorkerService.processImage(file, options);
  }, []);

  return { ready, loading, error, processImage };
}
