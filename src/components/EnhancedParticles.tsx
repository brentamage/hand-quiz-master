import { useEffect, useRef } from 'react';

interface ParticleConfig {
  count?: number;
  colors?: string[];
  speed?: number;
  size?: { min: number; max: number };
  interactive?: boolean;
  connectionDistance?: number;
}

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  baseOpacity: number;

  constructor(
    canvas: HTMLCanvasElement,
    colors: string[],
    speed: number,
    sizeRange: { min: number; max: number }
  ) {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * speed;
    this.vy = (Math.random() - 0.5) * speed;
    this.size = Math.random() * (sizeRange.max - sizeRange.min) + sizeRange.min;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.baseOpacity = Math.random() * 0.5 + 0.3;
    this.opacity = this.baseOpacity;
  }

  update(
    canvas: HTMLCanvasElement,
    mouse: { x: number; y: number; radius: number },
    interactive: boolean,
    speed: number
  ) {
    // Mouse interaction
    if (interactive) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < mouse.radius) {
        const force = (mouse.radius - distance) / mouse.radius;
        const angle = Math.atan2(dy, dx);
        this.vx -= Math.cos(angle) * force * 0.5;
        this.vy -= Math.sin(angle) * force * 0.5;
        this.opacity = Math.min(1, this.baseOpacity + force * 0.5);
      } else {
        this.opacity += (this.baseOpacity - this.opacity) * 0.05;
      }
    }

    // Update position
    this.x += this.vx;
    this.y += this.vy;

    // Friction
    this.vx *= 0.99;
    this.vy *= 0.99;

    // Boundary check with wrapping
    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;

    // Maintain minimum velocity
    const minSpeed = speed * 0.3;
    if (Math.abs(this.vx) < minSpeed) this.vx += (Math.random() - 0.5) * 0.1;
    if (Math.abs(this.vy) < minSpeed) this.vy += (Math.random() - 0.5) * 0.1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Glow effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;

    // Draw particle
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

const EnhancedParticles = ({
  count = 150,
  colors = ['#a855f7', '#c084fc', '#9333ea', '#7c3aed', '#6366f1'],
  speed = 0.5,
  size = { min: 1, max: 3 },
  interactive = true,
  connectionDistance = 120
}: ParticleConfig) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, radius: 150 });
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
      }
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouch);
    }

    // Initialize particles
    particlesRef.current = [];
    for (let i = 0; i < count; i++) {
      particlesRef.current.push(new Particle(canvas, colors, speed, size));
    }

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      if (!ctx) return;

      // Clear with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current.forEach(particle => {
        particle.update(canvas, mouseRef.current, interactive, speed);
        particle.draw(ctx);
      });

      // Draw connections
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i];
          const p2 = particlesRef.current[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.3;
            ctx.strokeStyle = `rgba(168, 85, 247, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Mouse glow
      if (interactive) {
        const mouse = mouseRef.current;
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius);
        gradient.addColorStop(0, 'rgba(168, 85, 247, 0.15)');
        gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.05)');
        gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(mouse.x - mouse.radius, mouse.y - mouse.radius, mouse.radius * 2, mouse.radius * 2);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleTouch);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [count, colors, speed, size, interactive, connectionDistance]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default EnhancedParticles;
