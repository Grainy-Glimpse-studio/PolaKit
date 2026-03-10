import { useEffect, useRef, useCallback } from 'react';

// Polaroid rainbow colors
const COLORS = [
  '#FF6B6B', // red (rainbow-1)
  '#FFE66D', // yellow (rainbow-2)
  '#4ECDC4', // teal (rainbow-3)
  '#45B7D1', // blue (rainbow-4)
  '#96CEB4', // mint (rainbow-5)
];

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  phase: number;
  phaseSpeed: number;
  amplitude: number;
}

function createParticle(canvasWidth: number, canvasHeight: number): Particle {
  const x = Math.random() * canvasWidth;
  const y = Math.random() * canvasHeight;
  return {
    x,
    y,
    baseX: x,
    baseY: y,
    radius: 60 + Math.random() * 80, // 60-140px radius (larger)
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    phase: Math.random() * Math.PI * 2,
    phaseSpeed: 0.008 + Math.random() * 0.012,
    amplitude: 30 + Math.random() * 50,
  };
}

export function LiquidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>(0);

  const initParticles = useCallback((width: number, height: number) => {
    const particleCount = Math.floor((width * height) / 18000); // More particles
    const count = Math.max(25, Math.min(particleCount, 55));
    particlesRef.current = Array.from({ length: count }, () =>
      createParticle(width, height)
    );
  }, []);

  const drawParticle = useCallback(
    (ctx: CanvasRenderingContext2D, particle: Particle) => {
      const gradient = ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.radius
      );
      gradient.addColorStop(0, particle.color);
      gradient.addColorStop(0.4, particle.color);
      gradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    },
    []
  );

  const updateParticle = useCallback(
    (particle: Particle, width: number, height: number, time: number) => {
      // Organic floating movement
      particle.phase += particle.phaseSpeed;
      const floatX = Math.sin(particle.phase) * particle.amplitude;
      const floatY = Math.cos(particle.phase * 0.7) * particle.amplitude * 0.8;

      // Base movement
      particle.baseX += particle.vx;
      particle.baseY += particle.vy;

      // Wrap around edges
      if (particle.baseX < -particle.radius) particle.baseX = width + particle.radius;
      if (particle.baseX > width + particle.radius) particle.baseX = -particle.radius;
      if (particle.baseY < -particle.radius) particle.baseY = height + particle.radius;
      if (particle.baseY > height + particle.radius) particle.baseY = -particle.radius;

      // Target position
      let targetX = particle.baseX + floatX;
      let targetY = particle.baseY + floatY;

      // Mouse repulsion - larger radius and stronger force
      const dx = targetX - mouseRef.current.x;
      const dy = targetY - mouseRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const repelRadius = 250; // Larger interaction radius

      if (distance < repelRadius && distance > 0) {
        const force = (1 - distance / repelRadius) * 100; // Stronger force
        targetX += (dx / distance) * force;
        targetY += (dy / distance) * force;
      }

      // Smooth movement
      particle.x += (targetX - particle.x) * 0.05;
      particle.y += (targetY - particle.y) * 0.05;
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      initParticles(window.innerWidth, window.innerHeight);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    const animate = (time: number) => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Clear with dark background
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        updateParticle(particle, width, height, time);
        drawParticle(ctx, particle);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationRef.current);
    };
  }, [initParticles, updateParticle, drawParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{
        filter: 'blur(12px) contrast(1.5) brightness(1.2)',
        zIndex: 0,
      }}
    />
  );
}
