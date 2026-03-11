import { useCallback, useRef, useState, useEffect } from 'react';

interface UseCanvasDragOptions {
  onDrag: (deltaX: number, deltaY: number) => void;
  onDragEnd?: () => void;
  scale?: number;
  disabled?: boolean;
}

interface UseCanvasDragReturn {
  isDragging: boolean;
  handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleTouchStart: (e: React.TouchEvent<HTMLCanvasElement>) => void;
}

export function useCanvasDrag({
  onDrag,
  onDragEnd,
  scale = 1,
  disabled = false,
}: UseCanvasDragOptions): UseCanvasDragReturn {
  const [isDragging, setIsDragging] = useState(false);
  const lastPosition = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
    lastPosition.current = { x: e.clientX, y: e.clientY };
  }, [disabled]);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    if (e.touches.length !== 1) return;
    e.preventDefault();
    setIsDragging(true);
    const touch = e.touches[0];
    lastPosition.current = { x: touch.clientX, y: touch.clientY };
  }, [disabled]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - lastPosition.current.x) / scale;
      const deltaY = (e.clientY - lastPosition.current.y) / scale;

      onDrag(deltaX, deltaY);
      lastPosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      e.preventDefault();

      const touch = e.touches[0];
      const deltaX = (touch.clientX - lastPosition.current.x) / scale;
      const deltaY = (touch.clientY - lastPosition.current.y) / scale;

      onDrag(deltaX, deltaY);
      lastPosition.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleEnd = () => {
      setIsDragging(false);
      onDragEnd?.();
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
  }, [isDragging, onDrag, onDragEnd, scale]);

  return {
    isDragging,
    handleMouseDown,
    handleTouchStart,
  };
}
