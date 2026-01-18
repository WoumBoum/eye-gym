import { useEffect, useCallback } from 'react';
import { useCanvas } from '../../hooks/useCanvas';
import { useSettings } from '../../context/SettingsContext';
import { Point, GamePhase } from '../../types';

// Colors for light mode
const COLORS_LIGHT = {
  clearBlue: '#6eb5ff',
  clearRed: '#ff6e6e',
  clearGreen: '#6eff8e',
  darkBlue: '#1a5fb4',
  darkRed: '#c01c28',
  darkGreen: '#26a269',
  userPoint: '#1a1a1a',
  background: '#f5f5f0',
};

// Colors for dark mode
const COLORS_DARK = {
  clearBlue: '#6eb5ff',
  clearRed: '#ff6e6e',
  clearGreen: '#6eff8e',
  darkBlue: '#4a9eff',
  darkRed: '#ff6b6b',
  darkGreen: '#4ade80',
  userPoint: '#ffffff',
  background: '#1a1a1a',
};

const POINT_SIZE = 24;
const POINT_SIZE_SMALL = 18;

interface GameCanvasProps {
  phase: GamePhase;
  modelBlue: Point | null;
  modelRed: Point | null;
  modelGreen: Point | null;
  darkBlue: Point | null;
  darkRed: Point | null;
  idealGreen: Point | null;
  userGreen: Point | null;
  onTap: (point: Point) => void;
}

export function GameCanvas({
  phase,
  modelBlue,
  modelRed,
  modelGreen,
  darkBlue,
  darkRed,
  idealGreen,
  userGreen,
  onTap,
}: GameCanvasProps) {
  const { canvasRef, containerRef, size, getContext } = useCanvas();
  const { settings } = useSettings();

  const COLORS = settings.darkMode ? COLORS_DARK : COLORS_LIGHT;

  // Draw a point (circle)
  const drawPoint = useCallback(
    (ctx: CanvasRenderingContext2D, point: Point, color: string, radius: number) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    },
    []
  );

  // Draw a line between two points
  const drawLine = useCallback(
    (ctx: CanvasRenderingContext2D, p1: Point, p2: Point, color: string, width: number = 2) => {
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
    },
    []
  );

  // Main render function
  const render = useCallback(() => {
    const ctx = getContext();
    if (!ctx || size.width === 0) return;

    // Clear canvas
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, size.width, size.height);

    // Draw model triangle (light colors)
    if (modelBlue && modelRed && modelGreen) {
      // Draw lines first (behind points)
      drawLine(ctx, modelBlue, modelRed, COLORS.clearBlue + '40', 2);
      drawLine(ctx, modelRed, modelGreen, COLORS.clearRed + '40', 2);
      drawLine(ctx, modelGreen, modelBlue, COLORS.clearGreen + '40', 2);

      // Draw points
      drawPoint(ctx, modelBlue, COLORS.clearBlue, POINT_SIZE_SMALL / 2);
      drawPoint(ctx, modelRed, COLORS.clearRed, POINT_SIZE_SMALL / 2);
      drawPoint(ctx, modelGreen, COLORS.clearGreen, POINT_SIZE_SMALL / 2);
    }

    // Draw dark blue and red points
    if (darkBlue) {
      drawPoint(ctx, darkBlue, COLORS.darkBlue, POINT_SIZE / 2);
    }
    if (darkRed) {
      drawPoint(ctx, darkRed, COLORS.darkRed, POINT_SIZE / 2);
    }

    // Draw line between dark blue and red
    if (darkBlue && darkRed) {
      drawLine(ctx, darkBlue, darkRed, COLORS.darkBlue + '60', 2);
    }

    // In feedback phase, show ideal green position
    if (phase === 'feedback' && idealGreen) {
      drawPoint(ctx, idealGreen, COLORS.darkGreen, POINT_SIZE / 2);

      // Draw lines to show correct triangle
      if (darkBlue && darkRed) {
        drawLine(ctx, darkRed, idealGreen, COLORS.darkRed + '60', 2);
        drawLine(ctx, idealGreen, darkBlue, COLORS.darkGreen + '60', 2);
      }
    }

    // Draw user's guess
    if (userGreen) {
      drawPoint(ctx, userGreen, COLORS.userPoint, POINT_SIZE / 2);

      // In feedback, show error line from user to ideal
      if (phase === 'feedback' && idealGreen) {
        drawLine(ctx, userGreen, idealGreen, '#ff000080', 2);
      }
    }
  }, [
    getContext,
    size,
    phase,
    modelBlue,
    modelRed,
    modelGreen,
    darkBlue,
    darkRed,
    idealGreen,
    userGreen,
    drawPoint,
    drawLine,
    COLORS,
  ]);

  // Re-render when state changes
  useEffect(() => {
    render();
  }, [render]);

  // Handle touch/click events
  const handleInteraction = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      onTap({ x, y });
    },
    [onTap, containerRef]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      handleInteraction(e.clientX, e.clientY);
    },
    [handleInteraction]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [handleInteraction]
  );

  return (
    <div ref={containerRef} className="game-canvas-container">
      <canvas
        ref={canvasRef}
        className="game-canvas"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
      />
    </div>
  );
}
