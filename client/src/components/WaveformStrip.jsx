import React, { useEffect, useRef } from 'react';

const WaveformStrip = ({ active = false, alert = false }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrame;
    let offset = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      
      ctx.beginPath();
      ctx.moveTo(0, centerY);

      // Determine color and speed
      const color = alert ? '#F0524B' : (active ? '#5EEAD4' : '#112233');
      const speed = active ? 0.05 : 0.01;
      const amplitude = active ? 10 : 2;
      const frequency = active ? 0.05 : 0.02;

      for (let x = 0; x < width; x++) {
        // Create a heart-beat like wave
        const y = centerY + Math.sin(x * frequency + offset) * amplitude * Math.cos((x * frequency + offset) / 3);
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      offset += speed;
      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationFrame);
  }, [active, alert]);

  return (
    <div className="w-full h-8 absolute top-0 left-0 bg-navy-900 border-b border-slate-800">
      <canvas 
        ref={canvasRef} 
        width={1000} 
        height={32}
        className="w-full h-full opacity-60"
      />
    </div>
  );
};

export default WaveformStrip;
