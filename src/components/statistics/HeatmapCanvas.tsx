import { useEffect, useRef, useCallback } from 'react';
import {
  HeatmapData,
  HEATMAP_MIN_X,
  HEATMAP_MAX_X,
  HEATMAP_MIN_Y,
  HEATMAP_MAX_Y,
  HEATMAP_BLUE_POINT,
  HEATMAP_RED_POINT,
} from '../../types';

interface HeatmapCanvasProps {
  data: HeatmapData;
  showLegend?: boolean;
}

// Color interpolation: red (score 0) → yellow (score 50) → green (score 100)
function scoreToColor(score: number): { r: number; g: number; b: number } {
  const t = Math.max(0, Math.min(100, score)) / 100;

  if (t < 0.5) {
    // Red (#c01c28) to Yellow (#e5a50a)
    const s = t * 2; // 0 to 1 for this segment
    const r = Math.round(192 + s * (229 - 192));
    const g = Math.round(28 + s * (165 - 28));
    const b = Math.round(40 + s * (10 - 40));
    return { r, g, b };
  } else {
    // Yellow (#e5a50a) to Green (#26a269)
    const s = (t - 0.5) * 2; // 0 to 1 for this segment
    const r = Math.round(229 + s * (38 - 229));
    const g = Math.round(165 + s * (162 - 165));
    const b = Math.round(10 + s * (105 - 10));
    return { r, g, b };
  }
}

// Bilinear interpolation for smooth rendering
function bilinearInterpolate(
  grid: number[][],
  counts: number[][],
  x: number,
  y: number,
  width: number,
  height: number
): { score: number; hasData: boolean } {
  // Convert to grid coordinates (0 to width-1, 0 to height-1)
  const gx = x * (width - 1);
  const gy = y * (height - 1);

  // Get the four surrounding cells
  const x0 = Math.floor(gx);
  const x1 = Math.min(x0 + 1, width - 1);
  const y0 = Math.floor(gy);
  const y1 = Math.min(y0 + 1, height - 1);

  // Interpolation weights
  const tx = gx - x0;
  const ty = gy - y0;

  // Get values and data presence for all four corners
  const v00 = grid[y0][x0];
  const v10 = grid[y0][x1];
  const v01 = grid[y1][x0];
  const v11 = grid[y1][x1];

  const c00 = counts[y0][x0] > 0;
  const c10 = counts[y0][x1] > 0;
  const c01 = counts[y1][x0] > 0;
  const c11 = counts[y1][x1] > 0;

  // Check if we have any data nearby
  const hasData = c00 || c10 || c01 || c11;

  if (!hasData) {
    return { score: 0, hasData: false };
  }

  // For cells without data, use nearest neighbor with data
  const getValueOrFallback = (hasIt: boolean, value: number, fallbacks: { has: boolean; val: number }[]) => {
    if (hasIt) return value;
    for (const fb of fallbacks) {
      if (fb.has) return fb.val;
    }
    return 50; // Default to middle score if no data
  };

  const val00 = getValueOrFallback(c00, v00, [{ has: c10, val: v10 }, { has: c01, val: v01 }, { has: c11, val: v11 }]);
  const val10 = getValueOrFallback(c10, v10, [{ has: c00, val: v00 }, { has: c11, val: v11 }, { has: c01, val: v01 }]);
  const val01 = getValueOrFallback(c01, v01, [{ has: c00, val: v00 }, { has: c11, val: v11 }, { has: c10, val: v10 }]);
  const val11 = getValueOrFallback(c11, v11, [{ has: c10, val: v10 }, { has: c01, val: v01 }, { has: c00, val: v00 }]);

  // Bilinear interpolation
  const top = val00 * (1 - tx) + val10 * tx;
  const bottom = val01 * (1 - tx) + val11 * tx;
  const score = top * (1 - ty) + bottom * ty;

  return { score, hasData };
}

export function HeatmapCanvas({ data, showLegend = true }: HeatmapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Coordinate system dimensions
  const coordWidth = HEATMAP_MAX_X - HEATMAP_MIN_X; // 7
  const coordHeight = HEATMAP_MAX_Y - HEATMAP_MIN_Y; // 5
  const aspectRatio = coordWidth / coordHeight; // 7/5 = 1.4

  // Legend dimensions
  const legendWidth = 50;
  const legendPadding = 15;

  // Convert normalized coordinates to canvas pixels
  const coordToCanvas = useCallback(
    (x: number, y: number, canvasWidth: number, canvasHeight: number, leftPadding: number = 0) => {
      const heatmapWidth = canvasWidth - leftPadding - (showLegend ? legendWidth + legendPadding : 0);
      const heatmapHeight = canvasHeight;

      // Maintain aspect ratio
      let drawWidth = heatmapWidth;
      let drawHeight = heatmapWidth / aspectRatio;

      if (drawHeight > heatmapHeight) {
        drawHeight = heatmapHeight;
        drawWidth = heatmapHeight * aspectRatio;
      }

      const offsetX = leftPadding + (heatmapWidth - drawWidth) / 2;
      const offsetY = (heatmapHeight - drawHeight) / 2;

      // Map coordinates to pixels
      const px = offsetX + ((x - HEATMAP_MIN_X) / coordWidth) * drawWidth;
      // Flip Y axis (canvas Y increases downward, but we want Y to increase upward)
      const py = offsetY + ((HEATMAP_MAX_Y - y) / coordHeight) * drawHeight;

      return { px, py, drawWidth, drawHeight, offsetX, offsetY };
    },
    [aspectRatio, showLegend]
  );

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

    const canvasWidth = rect.width;
    const canvasHeight = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Calculate heatmap drawing area
    const heatmapWidth = canvasWidth - (showLegend ? legendWidth + legendPadding : 0);

    let drawWidth = heatmapWidth;
    let drawHeight = heatmapWidth / aspectRatio;

    if (drawHeight > canvasHeight) {
      drawHeight = canvasHeight;
      drawWidth = canvasHeight * aspectRatio;
    }

    const offsetX = (heatmapWidth - drawWidth) / 2;
    const offsetY = (canvasHeight - drawHeight) / 2;

    // Render heatmap with higher resolution (4x upscaling for smoothness)
    const renderWidth = Math.ceil(drawWidth);
    const renderHeight = Math.ceil(drawHeight);

    // Detect dark mode for no-data color
    const isDarkMode = document.body.classList.contains('dark-mode');
    const noDataColor = isDarkMode ? { r: 60, g: 60, b: 60 } : { r: 224, g: 224, b: 224 };

    // Create image data for smooth rendering
    const imageData = ctx.createImageData(renderWidth, renderHeight);
    const pixels = imageData.data;

    for (let py = 0; py < renderHeight; py++) {
      for (let px = 0; px < renderWidth; px++) {
        // Convert pixel to normalized grid position (0-1)
        const nx = px / renderWidth;
        const ny = py / renderHeight;

        // Bilinear interpolation
        const { score, hasData } = bilinearInterpolate(
          data.scores,
          data.counts,
          nx,
          ny,
          data.width,
          data.height
        );

        const idx = (py * renderWidth + px) * 4;

        if (!hasData) {
          // No data: neutral gray (adapts to dark mode)
          pixels[idx] = noDataColor.r;
          pixels[idx + 1] = noDataColor.g;
          pixels[idx + 2] = noDataColor.b;
          pixels[idx + 3] = 255;
        } else {
          const { r, g, b } = scoreToColor(score);
          pixels[idx] = r;
          pixels[idx + 1] = g;
          pixels[idx + 2] = b;
          pixels[idx + 3] = 255;
        }
      }
    }

    // Draw heatmap image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = renderWidth;
    tempCanvas.height = renderHeight;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.putImageData(imageData, 0, 0);
      ctx.drawImage(tempCanvas, offsetX, offsetY, drawWidth, drawHeight);
    }

    // Draw border around heatmap
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.strokeRect(offsetX, offsetY, drawWidth, drawHeight);

    // Draw reference points (blue and red)
    const pointRadius = Math.max(6, Math.min(12, drawWidth / 50));

    // Blue point at (+0.5, 0)
    const bluePos = coordToCanvas(HEATMAP_BLUE_POINT.x, HEATMAP_BLUE_POINT.y, canvasWidth, canvasHeight);
    ctx.beginPath();
    ctx.arc(bluePos.px, bluePos.py, pointRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#1a5fb4';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Red point at (-0.5, 0)
    const redPos = coordToCanvas(HEATMAP_RED_POINT.x, HEATMAP_RED_POINT.y, canvasWidth, canvasHeight);
    ctx.beginPath();
    ctx.arc(redPos.px, redPos.py, pointRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#c01c28';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw legend if enabled
    if (showLegend) {
      const legendX = canvasWidth - legendWidth - 5;
      const legendTop = offsetY + drawHeight * 0.1;
      const legendBottom = offsetY + drawHeight * 0.9;
      const legendHeight = legendBottom - legendTop;
      const barWidth = 20;

      // Draw gradient bar
      const gradient = ctx.createLinearGradient(0, legendTop, 0, legendBottom);
      // Green at top (score 100), yellow in middle, red at bottom (score 0)
      gradient.addColorStop(0, 'rgb(38, 162, 105)');    // Green (#26a269)
      gradient.addColorStop(0.5, 'rgb(229, 165, 10)');  // Yellow (#e5a50a)
      gradient.addColorStop(1, 'rgb(192, 28, 40)');     // Red (#c01c28)

      ctx.fillStyle = gradient;
      ctx.fillRect(legendX, legendTop, barWidth, legendHeight);

      // Legend border
      ctx.strokeStyle = '#999';
      ctx.lineWidth = 1;
      ctx.strokeRect(legendX, legendTop, barWidth, legendHeight);

      // Legend labels
      ctx.fillStyle = isDarkMode ? '#e0e0e0' : '#333';
      ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      ctx.fillText('100', legendX + barWidth + 5, legendTop);
      ctx.fillText('75', legendX + barWidth + 5, legendTop + legendHeight * 0.25);
      ctx.fillText('50', legendX + barWidth + 5, legendTop + legendHeight * 0.5);
      ctx.fillText('25', legendX + barWidth + 5, legendTop + legendHeight * 0.75);
      ctx.fillText('0', legendX + barWidth + 5, legendBottom);

      // Tick marks
      ctx.strokeStyle = isDarkMode ? '#999' : '#666';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = legendTop + (legendHeight * i) / 4;
        ctx.beginPath();
        ctx.moveTo(legendX + barWidth, y);
        ctx.lineTo(legendX + barWidth + 3, y);
        ctx.stroke();
      }
    }
  }, [data, showLegend, aspectRatio, coordToCanvas, coordWidth, coordHeight]);

  return (
    <div ref={containerRef} className="heatmap-container">
      <canvas ref={canvasRef} className="heatmap-canvas" />
    </div>
  );
}
