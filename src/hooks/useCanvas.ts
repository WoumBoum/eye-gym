import { useRef, useEffect, useState, useCallback } from 'react';

interface CanvasSize {
  width: number;
  height: number;
}

export function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<CanvasSize>({ width: 0, height: 0 });

  const updateSize = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      setSize({
        width: rect.width,
        height: rect.height,
      });

      if (canvasRef.current) {
        // Set display size
        canvasRef.current.style.width = `${rect.width}px`;
        canvasRef.current.style.height = `${rect.height}px`;

        // Set actual canvas size for high DPI
        canvasRef.current.width = rect.width * dpr;
        canvasRef.current.height = rect.height * dpr;

        // Scale context for high DPI
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.scale(dpr, dpr);
        }
      }
    }
  }, []);

  useEffect(() => {
    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateSize]);

  const getContext = useCallback(() => {
    return canvasRef.current?.getContext('2d') || null;
  }, []);

  return {
    canvasRef,
    containerRef,
    size,
    getContext,
  };
}
