import { useEffect, useRef } from 'react';
import { HeatmapData } from '../../types';

interface HeatmapCanvasProps {
  data: HeatmapData;
}

// Color interpolation for heatmap
function getHeatmapColor(score: number, hasData: boolean): string {
  if (!hasData) return '#e0e0e0'; // No data

  // Interpolate from red (0) -> yellow (50) -> green (100)
  const normalized = Math.max(0, Math.min(100, score)) / 100;

  if (normalized < 0.5) {
    // Red to yellow
    const t = normalized * 2;
    const r = 200;
    const g = Math.round(50 + 150 * t);
    const b = 50;
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Yellow to green
    const t = (normalized - 0.5) * 2;
    const r = Math.round(200 - 160 * t);
    const g = Math.round(200 - 30 * t);
    const b = Math.round(50 + 50 * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

export function HeatmapCanvas({ data }: HeatmapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Calculate cell size
    const cellWidth = rect.width / data.width;
    const cellHeight = rect.height / data.height;

    // Draw cells
    for (let y = 0; y < data.height; y++) {
      for (let x = 0; x < data.width; x++) {
        const score = data.scores[y][x];
        const count = data.counts[y][x];
        const color = getHeatmapColor(score, count > 0);

        ctx.fillStyle = color;
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);

        // Add cell border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      }
    }

    // Draw border
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, rect.width, rect.height);
  }, [data]);

  return (
    <div ref={containerRef} className="heatmap-container">
      <canvas ref={canvasRef} className="heatmap-canvas" />
    </div>
  );
}
