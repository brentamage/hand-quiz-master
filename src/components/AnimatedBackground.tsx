import { useEffect, useRef } from 'react';

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

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

    // Smooth mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };

    const handleClick = (e: MouseEvent) => {
      // Create beautiful burst on click
      for (let i = 0; i < 15; i++) {
        particles.push(new Particle(e.clientX, e.clientY, true));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    // Particle class
    class Particle {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;
      isBurst: boolean;
      life: number;

      constructor(x?: number, y?: number, isBurst = false) {
        this.x = x ?? Math.random() * canvas.width;
        this.y = y ?? Math.random() * canvas.height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.2 - 0.1;
        this.speedY = Math.random() * 0.2 - 0.1;
        this.opacity = Math.random() * 0.4 + 0.2;
        this.isBurst = isBurst;
        this.life = isBurst ? 100 : Infinity;
        
        // Purple/violet color palette
        const colors = [
          'rgba(192, 132, 252, ',  // purple-400
          'rgba(168, 85, 247, ',   // purple-500
          'rgba(147, 51, 234, ',   // purple-600
          'rgba(124, 58, 237, ',   // violet-600
          'rgba(99, 102, 241, ',   // indigo-500
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];

        if (isBurst) {
          // Elegant burst particles
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 2 + 1;
          this.speedX = Math.cos(angle) * speed;
          this.speedY = Math.sin(angle) * speed;
          this.size = Math.random() * 2.5 + 1;
          this.opacity = 1;
        }
      }

      update() {
        if (!this.isBurst) {
          // Smooth parallax effect based on mouse position
          const mouse = mouseRef.current;
          
          // Calculate parallax offset
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const mouseOffsetX = (mouse.x - centerX) / centerX;
          const mouseOffsetY = (mouse.y - centerY) / centerY;
          
          // Apply parallax based on particle depth (size)
          const depth = this.size * 0.5;
          const parallaxX = mouseOffsetX * 20 * depth;
          const parallaxY = mouseOffsetY * 20 * depth;
          
          // Smooth interpolation to target position
          const targetX = this.baseX + parallaxX;
          const targetY = this.baseY + parallaxY;
          
          this.x += (targetX - this.x) * 0.03;
          this.y += (targetY - this.y) * 0.03;
        }

        // Gentle ambient movement
        this.x += this.speedX * 0.5;
        this.y += this.speedY * 0.5;

        // Burst particles fade elegantly
        if (this.isBurst) {
          this.life--;
          this.opacity = Math.max(0, this.life / 100);
          this.speedX *= 0.97;
          this.speedY *= 0.97;
        }

        // Wrap around screen smoothly
        if (!this.isBurst) {
          if (this.x > canvas.width + 50) {
            this.x = -50;
            this.baseX = this.x;
          }
          if (this.x < -50) {
            this.x = canvas.width + 50;
            this.baseX = this.x;
          }
          if (this.y > canvas.height + 50) {
            this.y = -50;
            this.baseY = this.y;
          }
          if (this.y < -50) {
            this.y = canvas.height + 50;
            this.baseY = this.y;
          }
        }
      }

      draw() {
        if (!ctx) return;
        
        const mouse = mouseRef.current;
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Beautiful glow effect near mouse
        const glowRange = 200;
        if (distance < glowRange) {
          const glowIntensity = (1 - distance / glowRange) * 0.6;
          ctx.shadowBlur = glowIntensity * 25;
          ctx.shadowColor = this.color + glowIntensity + ')';
        }
        
        ctx.fillStyle = this.color + this.opacity + ')';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
      }
    }

    // Create particles
    const particleCount = 100;
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      if (!ctx) return;
      
      // Smooth mouse interpolation
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;
      
      // Clear with elegant fade
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Remove dead burst particles
      for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].isBurst && particles[i].life <= 0) {
          particles.splice(i, 1);
        }
      }

      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw elegant connections
      particles.forEach((particleA, indexA) => {
        particles.slice(indexA + 1).forEach(particleB => {
          const dx = particleA.x - particleB.x;
          const dy = particleA.y - particleB.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            const opacity = 0.2 * (1 - distance / 100);
            ctx.strokeStyle = `rgba(168, 85, 247, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particleA.x, particleA.y);
            ctx.lineTo(particleB.x, particleB.y);
            ctx.stroke();
          }
        });
      });

      // Beautiful cursor glow
      const currentMouse = mouseRef.current;
      const gradient = ctx.createRadialGradient(currentMouse.x, currentMouse.y, 0, currentMouse.x, currentMouse.y, 150);
      gradient.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
      gradient.addColorStop(0.4, 'rgba(168, 85, 247, 0.12)');
      gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(currentMouse.x - 150, currentMouse.y - 150, 300, 300);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 animate-gradient-shift" />
      
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-60"
        style={{ mixBlendMode: 'screen' }}
      />
      
      {/* Overlay gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/50" />
      
      {/* Animated orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float-delayed" />
    </>
  );
};

export default AnimatedBackground;
