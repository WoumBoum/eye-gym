import { useEffect, useRef } from 'react';
import { CurveData } from '../../types';

interface AngleDeltaCurveProps {
  data: CurveData;
}

export function AngleDeltaCurve({ data }: AngleDeltaCurveProps) {
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
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);

    // Draw axes
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();

    // Draw Y-axis labels (0, 50, 100)
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    [0, 50, 100].forEach(val => {
      const y = height - padding.bottom - (val / 100) * chartHeight;
      ctx.fillText(val.toString(), padding.left - 5, y);
    });

    // Draw X-axis labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const step = Math.max(1, Math.floor(data.labels.length / 6));
    data.labels.forEach((label, i) => {
      if (i % step === 0 || i === data.labels.length - 1) {
        const x = padding.left + (i / (data.labels.length - 1)) * chartWidth;
        ctx.fillText(`${label}°`, x, height - padding.bottom + 5);
      }
    });

    // Draw axis titles
    ctx.fillStyle = '#333';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Rotation (delta)', width / 2, height - 5);

    // Draw bars
    const barWidth = chartWidth / data.labels.length * 0.8;
    data.scores.forEach((score, i) => {
      if (data.counts[i] === 0) return;

      const x = padding.left + (i / (data.labels.length - 1)) * chartWidth - barWidth / 2;
      const barHeight = (score / 100) * chartHeight;
      const y = height - padding.bottom - barHeight;

      // Color based on score
      const hue = (score / 100) * 120; // 0 = red, 120 = green
      ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
      ctx.fillRect(x, y, barWidth, barHeight);
    });

    // Draw line connecting points
    ctx.strokeStyle = '#e66100';
    ctx.lineWidth = 2;
    ctx.beginPath();
    let started = false;
    data.scores.forEach((score, i) => {
      if (data.counts[i] === 0) return;

      const x = padding.left + (i / (data.labels.length - 1)) * chartWidth;
      const y = height - padding.bottom - (score / 100) * chartHeight;

      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw points
    data.scores.forEach((score, i) => {
      if (data.counts[i] === 0) return;

      const x = padding.left + (i / (data.labels.length - 1)) * chartWidth;
      const y = height - padding.bottom - (score / 100) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#e66100';
      ctx.fill();
    });
  }, [data]);

  return (
    <div ref={containerRef} className="chart-container">
      <canvas ref={canvasRef} />
    </div>
  );
}
