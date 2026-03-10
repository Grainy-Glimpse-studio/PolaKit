import { useState, useEffect } from 'react';
import { loadOpenCV, isOpenCVReady } from '@/lib/cropper/opencv-utils';

interface UseOpenCVResult {
  ready: boolean;
  loading: boolean;
  error: string | null;
}

export function useOpenCV(): UseOpenCVResult {
  const [state, setState] = useState<UseOpenCVResult>({
    ready: isOpenCVReady(),
    loading: !isOpenCVReady(),
    error: null,
  });

  useEffect(() => {
    if (state.ready) return;

    loadOpenCV()
      .then(() => {
        setState({ ready: true, loading: false, error: null });
      })
      .catch((err) => {
        setState({ ready: false, loading: false, error: err.message });
      });
  }, [state.ready]);

  return state;
}
