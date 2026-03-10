import { useRef, useCallback, useEffect } from 'react';
import type { Position } from '@/types';

interface UseCanvasDragOptions {
  onDragStart?: (id: string) => void;
  onDragMove?: (id: string, delta: Position) => void;
  onDragEnd?: (id: string, totalDelta: Position) => void;
}

export function useCanvasDrag(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  getImageAtPoint: (point: Position) => string | null,
  options: UseCanvasDragOptions = {}
) {
  const { onDragStart, onDragMove, onDragEnd } = options;

  const draggingRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
  } | null>(null);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const imageId = getImageAtPoint({ x, y });
      if (imageId) {
        draggingRef.current = {
          id: imageId,
          startX: x,
          startY: y,
          lastX: x,
          lastY: y,
        };
        onDragStart?.(imageId);
      }
    },
    [canvasRef, getImageAtPoint, onDragStart]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const delta: Position = {
        x: x - draggingRef.current.lastX,
        y: y - draggingRef.current.lastY,
      };

      draggingRef.current.lastX = x;
      draggingRef.current.lastY = y;

      onDragMove?.(draggingRef.current.id, delta);
    },
    [canvasRef, onDragMove]
  );

  const handleMouseUp = useCallback(() => {
    if (!draggingRef.current) return;

    const totalDelta: Position = {
      x: draggingRef.current.lastX - draggingRef.current.startX,
      y: draggingRef.current.lastY - draggingRef.current.startY,
    };

    onDragEnd?.(draggingRef.current.id, totalDelta);
    draggingRef.current = null;
  }, [onDragEnd]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, canvasRef]);
}
