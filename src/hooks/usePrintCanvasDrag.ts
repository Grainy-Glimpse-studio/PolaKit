import { useCallback, useRef, useState, useEffect, type RefObject } from 'react';
import type { Position } from '@/types';

interface UsePrintCanvasDragOptions {
  onDragStart?: (id: string) => void;
  onDragMove?: (id: string, delta: Position) => void;
  onDragEnd?: (id: string) => void;
  onClick?: (id: string | null) => void;
}

interface UsePrintCanvasDragReturn {
  isDragging: boolean;
  draggedId: string | null;
  handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleTouchStart: (e: React.TouchEvent<HTMLCanvasElement>) => void;
}

export function usePrintCanvasDrag(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  getImageAtPoint: (point: Position) => string | null,
  options: UsePrintCanvasDragOptions
): UsePrintCanvasDragReturn {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const lastPosition = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  const getCanvasPoint = useCallback(
    (clientX: number, clientY: number): Position | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    [canvasRef]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();

      const point = getCanvasPoint(e.clientX, e.clientY);
      if (!point) return;

      const id = getImageAtPoint(point);

      setDraggedId(id);
      setIsDragging(true);
      hasMoved.current = false;
      lastPosition.current = { x: e.clientX, y: e.clientY };

      if (id) {
        options.onDragStart?.(id);
      }
    },
    [getCanvasPoint, getImageAtPoint, options]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (e.touches.length !== 1) return;
      e.preventDefault();

      const touch = e.touches[0];
      const point = getCanvasPoint(touch.clientX, touch.clientY);
      if (!point) return;

      const id = getImageAtPoint(point);

      setDraggedId(id);
      setIsDragging(true);
      hasMoved.current = false;
      lastPosition.current = { x: touch.clientX, y: touch.clientY };

      if (id) {
        options.onDragStart?.(id);
      }
    },
    [getCanvasPoint, getImageAtPoint, options]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!draggedId) return;

      const deltaX = e.clientX - lastPosition.current.x;
      const deltaY = e.clientY - lastPosition.current.y;

      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        hasMoved.current = true;
      }

      options.onDragMove?.(draggedId, { x: deltaX, y: deltaY });
      lastPosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!draggedId || e.touches.length !== 1) return;
      e.preventDefault();

      const touch = e.touches[0];
      const deltaX = touch.clientX - lastPosition.current.x;
      const deltaY = touch.clientY - lastPosition.current.y;

      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        hasMoved.current = true;
      }

      options.onDragMove?.(draggedId, { x: deltaX, y: deltaY });
      lastPosition.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleEnd = () => {
      if (!hasMoved.current) {
        // It was a click, not a drag
        options.onClick?.(draggedId);
      } else if (draggedId) {
        options.onDragEnd?.(draggedId);
      }

      setIsDragging(false);
      setDraggedId(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('touchcancel', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };
  }, [isDragging, draggedId, options]);

  return {
    isDragging,
    draggedId,
    handleMouseDown,
    handleTouchStart,
  };
}
