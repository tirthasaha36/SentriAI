import React, { useEffect, useRef } from 'react';

const Waveform = ({ data = [], width = 600, height = 200, color = '#0e9e7a' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Draw subtle grid
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= width; x += 40) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += 40) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    if (!data || data.length === 0) return;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const points = [];
    for (let i = 0; i < data.length; i++) {
      const x = (i / (data.length - 1)) * width;
      const normalizedY = (data[i] - min) / range;
      const y = height - (normalizedY * height * 0.8 + height * 0.1);
      points.push({ x, y });
    }

    // Soft fill below the line
    ctx.beginPath();
    ctx.moveTo(0, height);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = 'rgba(14, 158, 122, 0.08)';
    ctx.fill();
    
    // Draw solid line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    points.forEach((point, i) => {
      if (i === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
    
  }, [data, width, height, color]);

  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height}
      style={{
        width: '100%',
        maxWidth: `${width}px`,
        height: 'auto',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        display: 'block'
      }}
    />
  );
};

export default Waveform;
