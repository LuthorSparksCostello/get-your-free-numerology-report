import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  pulse: number;
  speed: number;
}

/**
 * Optimized cosmic particle canvas background.
 * Uses requestAnimationFrame with reduced particle count
 * and will-change hints for GPU acceleration.
 */
const CosmicBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    // Reduced count for performance (~60 on a 1920x1080 screen)
    const numParticles = Math.min(Math.floor((width * height) / 35000), 80);

    const colors = [
      'rgba(222, 174, 82, 0.8)',   // gold
      'rgba(250, 204, 21, 0.6)',   // bright gold
      'rgba(139, 92, 246, 0.5)',   // nebula purple
      'rgba(236, 72, 153, 0.4)',   // stardust pink
      'rgba(20, 184, 166, 0.4)',   // aurora teal
      'rgba(255, 255, 255, 0.6)',  // white
    ];

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.15,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulse: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.015 + 0.005,
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const time = Date.now() * 0.0008;
      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Gentle drift
        p.x += p.vx + Math.sin(time + i) * 0.15;
        p.y += p.vy + Math.cos(time + i * 0.7) * 0.15;
        p.pulse += p.speed;

        // Wrap
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        // Mouse repulsion
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = dx * dx + dy * dy;
        if (dist < 22500) { // 150px radius squared
          const d = Math.sqrt(dist);
          const force = (150 - d) / 150;
          p.x -= (dx / d) * force * 1.5;
          p.y -= (dy / d) * force * 1.5;
        }

        // Pulsing opacity
        const pulseOpacity = p.opacity * (0.7 + Math.sin(p.pulse) * 0.3);
        const pulseSize = p.size * (1 + Math.sin(p.pulse * 1.5) * 0.2);

        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = pulseOpacity;
        ctx.fill();

        // Connect nearby particles (limited range for perf)
        for (let j = i + 1; j < Math.min(i + 15, particles.length); j++) {
          const q = particles[j];
          const cx = p.x - q.x;
          const cy = p.y - q.y;
          const cdist = cx * cx + cy * cy;
          if (cdist < 8100) { // 90px
            const alpha = 0.06 * (1 - Math.sqrt(cdist) / 90);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(222, 174, 82, ${alpha})`;
            ctx.lineWidth = 0.4;
            ctx.globalAlpha = 1;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleResize = () => {
      resizeCanvas();
      initParticles(window.innerWidth, window.innerHeight);
    };

    resizeCanvas();
    initParticles(window.innerWidth, window.innerHeight);
    animate();

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [initParticles]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ willChange: 'transform', mixBlendMode: 'screen' }}
        aria-hidden="true"
      />
      {/* Static CSS particles for layered depth */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="particle-large" style={{ top: '15%', left: '8%', animationDelay: '0s' }} />
        <div className="particle-large" style={{ top: '55%', right: '12%', animationDelay: '3s' }} />
        <div className="particle-medium" style={{ top: '35%', left: '65%', animationDelay: '1.5s' }} />
        <div className="particle-medium" style={{ top: '75%', left: '35%', animationDelay: '4s' }} />
        <div className="particle-small" style={{ top: '10%', right: '25%', animationDelay: '0.5s' }} />
        <div className="particle-small" style={{ bottom: '15%', right: '35%', animationDelay: '2.5s' }} />
      </div>
    </>
  );
};

export default CosmicBackground;
