import { useEffect, useRef } from 'react';
import { CurveData } from '../../types';

interface AngleCurveProps {
  data: CurveData;
}

export function AngleCurve({ data }: AngleCurveProps) {
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

    const width = rect.width;
    const height = rect.height;

    // Clear
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);

    // Polar chart for angles
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2 - 40;

    // Draw concentric circles (for score levels)
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75, 1].forEach(ratio => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius * ratio, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Draw score labels
    ctx.fillStyle = '#999';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    [25, 50, 75, 100].forEach((score, i) => {
      const y = centerY - maxRadius * ((i + 1) / 4);
      ctx.fillText(score.toString(), centerX + 3, y + 3);
    });

    // Draw angle labels (every 45 degrees)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    [0, 45, 90, 135, 180, 225, 270, 315].forEach(deg => {
      const rad = (deg - 90) * (Math.PI / 180);
      const x = centerX + (maxRadius + 20) * Math.cos(rad);
      const y = centerY + (maxRadius + 20) * Math.sin(rad);
      ctx.fillText(`${deg}°`, x, y);
    });

    // Draw radial lines
    ctx.strokeStyle = '#e0e0e0';
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + maxRadius * Math.cos(angle),
        centerY + maxRadius * Math.sin(angle)
      );
      ctx.stroke();
    }

    // Draw data polygon
    if (data.scores.some(s => s > 0)) {
      ctx.beginPath();
      let firstPoint = true;

      data.scores.forEach((score, i) => {
        if (data.counts[i] === 0) return;

        const angle = (i / data.labels.length) * Math.PI * 2 - Math.PI / 2;
        const radius = (score / 100) * maxRadius;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        if (firstPoint) {
          ctx.moveTo(x, y);
          firstPoint = false;
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.closePath();
      ctx.fillStyle = 'rgba(26, 95, 180, 0.2)';
      ctx.fill();
      ctx.strokeStyle = '#1a5fb4';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw data points
      data.scores.forEach((score, i) => {
        if (data.counts[i] === 0) return;

        const angle = (i / data.labels.length) * Math.PI * 2 - Math.PI / 2;
        const radius = (score / 100) * maxRadius;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#1a5fb4';
        ctx.fill();
      });
    }
  }, [data]);

  return (
    <div ref={containerRef} className="chart-container">
      <canvas ref={canvasRef} />
    </div>
  );
}
