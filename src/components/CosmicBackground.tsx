
import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  pulse: number;
  angle: number;
  speed: number;
}

const CosmicBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initParticles = () => {
      const particles: Particle[] = [];
      const numParticles = Math.floor((canvas.width * canvas.height) / 8000);
      
      const colors = [
        '#fbbf24', '#f59e0b', '#d97706', '#92400e', 
        '#ffffff', '#a855f7', '#ec4899', '#06b6d4'
      ];
      
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          size: Math.random() * 3 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          pulse: Math.random() * Math.PI * 2,
          angle: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.02 + 0.01
        });
      }
      particlesRef.current = particles;
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const time = Date.now() * 0.001;
      
      particlesRef.current.forEach((particle, index) => {
        // Update position with wave motion
        particle.x += particle.vx + Math.sin(time + particle.angle) * 0.3;
        particle.y += particle.vy + Math.cos(time + particle.angle) * 0.3;
        
        // Update pulse
        particle.pulse += particle.speed;
        
        // Wrap around edges with smooth transition
        if (particle.x < -50) particle.x = canvas.width + 50;
        if (particle.x > canvas.width + 50) particle.x = -50;
        if (particle.y < -50) particle.y = canvas.height + 50;
        if (particle.y > canvas.height + 50) particle.y = -50;
        
        // Mouse interaction effect
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const force = (150 - distance) / 150;
          particle.x -= (dx / distance) * force * 2;
          particle.y -= (dy / distance) * force * 2;
        }
        
        // Dynamic opacity with pulse
        const pulseOpacity = 0.5 + Math.sin(particle.pulse) * 0.3;
        particle.opacity = Math.max(0.1, Math.min(0.9, pulseOpacity));
        
        // Dynamic size with pulse
        const pulseSize = particle.size * (1 + Math.sin(particle.pulse * 2) * 0.3);
        
        // Draw particle with enhanced effects
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, pulseSize, 0, Math.PI * 2);
        
        // Create gradient for each particle
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, pulseSize * 2
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
        
        // Add extra glow for golden particles
        if (particle.color.includes('f')) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = particle.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        
        // Connect nearby particles with lines
        particlesRef.current.slice(index + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(251, 191, 36, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      
      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    resizeCanvas();
    initParticles();
    animate();

    const handleResize = () => {
      resizeCanvas();
      initParticles();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ mixBlendMode: 'screen' }}
      />
      {/* Additional floating elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="particle-large" style={{ top: '20%', left: '10%', animationDelay: '0s' }} />
        <div className="particle-large" style={{ top: '60%', right: '15%', animationDelay: '2s' }} />
        <div className="particle-large" style={{ bottom: '30%', left: '20%', animationDelay: '4s' }} />
        <div className="particle-medium" style={{ top: '40%', left: '70%', animationDelay: '1s' }} />
        <div className="particle-medium" style={{ top: '80%', left: '40%', animationDelay: '3s' }} />
        <div className="particle-small" style={{ top: '10%', right: '30%', animationDelay: '0.5s' }} />
        <div className="particle-small" style={{ bottom: '20%', right: '40%', animationDelay: '2.5s' }} />
      </div>
    </>
  );
};

export default CosmicBackground;
