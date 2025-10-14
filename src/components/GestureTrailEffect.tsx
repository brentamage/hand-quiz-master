import { useEffect, useRef } from 'react';

interface TrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  angle: number;
}

interface GestureTrailEffectProps {
  videoElement: HTMLVideoElement | null;
  enabled?: boolean;
}

const GestureTrailEffect = ({ videoElement, enabled = true }: GestureTrailEffectProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<TrailParticle[]>([]);
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);
  const animationFrameRef = useRef<number>();
  const mousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current || !enabled) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Track mouse position for trail effect
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePositionRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      // Create particles at mouse position
      if (Math.random() < 0.3) {
        createParticles(mousePositionRef.current.x, mousePositionRef.current.y, 3);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    const colors = [
      'rgba(192, 132, 252, ',  // purple-400
      'rgba(168, 85, 247, ',   // purple-500
      'rgba(147, 51, 234, ',   // purple-600
      'rgba(99, 102, 241, ',   // indigo-500
      'rgba(236, 72, 153, ',   // pink-500
    ];

    const createParticles = (x: number, y: number, count: number = 5) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.random() * Math.PI * 2);
        const speed = Math.random() * 2 + 0.5;
        const size = Math.random() * 4 + 2;
        const life = Math.random() * 30 + 40;

        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life,
          maxLife: life,
          size,
          color: colors[Math.floor(Math.random() * colors.length)],
          angle: Math.random() * Math.PI * 2
        });
      }

      // Limit particle count for performance
      if (particlesRef.current.length > 500) {
        particlesRef.current = particlesRef.current.slice(-500);
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;

      // Fade effect for trail
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.life--;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.98;
        particle.vy *= 0.98;
        particle.angle += 0.1;

        if (particle.life <= 0) return false;

        const opacity = particle.life / particle.maxLife;
        const currentSize = particle.size * opacity;

        // Outer glow
        ctx.shadowBlur = 20 * opacity;
        ctx.shadowColor = particle.color + opacity + ')';
        ctx.fillStyle = particle.color + (opacity * 0.3) + ')';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, currentSize * 2, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright particle
        ctx.shadowBlur = 10 * opacity;
        ctx.fillStyle = particle.color + opacity + ')';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
        ctx.fill();

        // Sparkle effect for some particles
        if (Math.random() < 0.1) {
          ctx.shadowBlur = 15;
          ctx.strokeStyle = 'rgba(255, 255, 255, ' + (opacity * 0.8) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          const sparkleSize = currentSize * 1.5;
          ctx.moveTo(particle.x - sparkleSize, particle.y);
          ctx.lineTo(particle.x + sparkleSize, particle.y);
          ctx.moveTo(particle.x, particle.y - sparkleSize);
          ctx.lineTo(particle.x, particle.y + sparkleSize);
          ctx.stroke();
        }

        return true;
      });

      ctx.shadowBlur = 0;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled]);

  // Sync canvas size
  useEffect(() => {
    if (!videoElement || !canvasRef.current) return;

    const updateSize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, [videoElement]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ 
        transform: 'scaleX(-1)',
        mixBlendMode: 'screen',
        zIndex: 10
      }}
    />
  );
};

export default GestureTrailEffect;
