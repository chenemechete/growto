"use client";

import { useEffect, useRef } from "react";

interface ReadinessScoreRingProps {
  score: number;        // 0–100
  baseline?: number;
  size?: number;
}

export function ReadinessScoreRing({ score, baseline = 0, size = 160 }: ReadinessScoreRingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const radius = size / 2 - 12;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cx = size / 2;
    const cy = size / 2;
    const startAngle = -Math.PI / 2; // start at top

    ctx.clearRect(0, 0, size, size);

    // Track ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#F1EFEC";
    ctx.lineWidth = strokeWidth;
    ctx.stroke();

    // Baseline arc (subtle)
    if (baseline > 0) {
      const baseEnd = startAngle + (baseline / 100) * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, baseEnd);
      ctx.strokeStyle = "#E07A5F44";
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    // Score arc
    if (score > 0) {
      const scoreEnd = startAngle + (score / 100) * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, scoreEnd);
      ctx.strokeStyle = "#E07A5F";
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    // Score text
    ctx.fillStyle = "#1A1A1A";
    ctx.font = `bold ${Math.floor(size * 0.2)}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(score), cx, cy - 8);

    ctx.fillStyle = "#6B7280";
    ctx.font = `${Math.floor(size * 0.08)}px system-ui`;
    ctx.fillText("/ 100", cx, cy + size * 0.13);
  }, [score, baseline, size, radius]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      aria-label={`Readiness score: ${score} out of 100`}
      role="img"
    />
  );
}
