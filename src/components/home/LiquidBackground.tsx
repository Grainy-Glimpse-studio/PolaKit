import { useEffect, useRef, useCallback } from 'react';
import type { IntroPhase } from '../../pages/Home';

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
  targetX: number;
  targetY: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  phase: number;
  phaseSpeed: number;
  amplitude: number;
  // Explosion properties
  explosionAngle: number;
  explosionSpeed: number;
  explosionDelay: number;
}

function createParticle(canvasWidth: number, canvasHeight: number, index: number): Particle {
  // Final resting position (spread across canvas)
  const finalX = Math.random() * canvasWidth;
  const finalY = Math.random() * canvasHeight;

  // Random explosion direction
  const angle = Math.random() * Math.PI * 2;
  const speed = 5 + Math.random() * 10;

  return {
    x: canvasWidth / 2, // Start at center
    y: canvasHeight / 2,
    baseX: finalX,
    baseY: finalY,
    targetX: finalX,
    targetY: finalY,
    radius: 60 + Math.random() * 80,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    phase: Math.random() * Math.PI * 2,
    phaseSpeed: 0.008 + Math.random() * 0.012,
    amplitude: 30 + Math.random() * 50,
    explosionAngle: angle,
    explosionSpeed: speed,
    explosionDelay: Math.random() * 0.3, // Staggered explosion
  };
}

interface LiquidBackgroundProps {
  introPhase?: IntroPhase;
}

export function LiquidBackground({ introPhase = 'main' }: LiquidBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>(0);
  const explosionStartRef = useRef<number | null>(null);
  const phaseRef = useRef<IntroPhase>(introPhase);

  // Keep phaseRef in sync
  useEffect(() => {
    if (introPhase === 'exploding' && phaseRef.current !== 'exploding') {
      explosionStartRef.current = performance.now();
    }
    phaseRef.current = introPhase;
  }, [introPhase]);

  const initParticles = useCallback((width: number, height: number) => {
    const particleCount = Math.floor((width * height) / 18000);
    const count = Math.max(25, Math.min(particleCount, 55));
    particlesRef.current = Array.from({ length: count }, (_, i) =>
      createParticle(width, height, i)
    );
  }, []);

  const drawParticle = useCallback(
    (ctx: CanvasRenderingContext2D, particle: Particle, globalOpacity: number = 1) => {
      const gradient = ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.radius
      );

      // Parse color and add opacity
      const color = particle.color;
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.4, color);
      gradient.addColorStop(1, 'transparent');

      ctx.globalAlpha = globalOpacity;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.globalAlpha = 1;
    },
    []
  );

  const updateParticle = useCallback(
    (particle: Particle, width: number, height: number, time: number, phase: IntroPhase, explosionProgress: number) => {
      if (phase === 'intro') {
        // Gather around mouse position (or center if no mouse)
        const targetX = mouseRef.current.x > 0 ? mouseRef.current.x : width / 2;
        const targetY = mouseRef.current.y > 0 ? mouseRef.current.y : height / 2;

        // Swirling cluster with breathing effect
        const breathe = Math.sin(time * 0.003) * 0.3 + 1;
        const clusterRadius = (25 + Math.sin(time * 0.002 + particle.phase) * 15) * breathe;
        const offsetX = Math.cos(particle.phase) * clusterRadius;
        const offsetY = Math.sin(particle.phase) * clusterRadius;

        // Smooth movement to cluster position
        particle.x += ((targetX + offsetX) - particle.x) * 0.06;
        particle.y += ((targetY + offsetY) - particle.y) * 0.06;

        // Animate phase for swirling effect
        particle.phase += particle.phaseSpeed * 1.5;

        // Store current position for flow start
        particle.targetX = particle.x;
        particle.targetY = particle.y;

      } else if (phase === 'exploding') {
        // FLUID FLOW animation - not explosion
        // Each particle flows smoothly toward its final position
        // with organic, liquid-like movement

        const delay = particle.explosionDelay * 0.8;
        const adjustedProgress = Math.max(0, explosionProgress - delay);
        const t = Math.min(1, adjustedProgress / (1.2 - delay * 0.5));

        // Smooth flow easing - like thick liquid spreading
        const flowEase = (x: number) => {
          // Slow start, smooth middle, gentle end
          return x < 0.5
            ? 2 * x * x
            : 1 - Math.pow(-2 * x + 2, 2) / 2;
        };

        const flow = flowEase(t);

        // Flow path: curve toward final position, not straight line
        // Add organic waviness during flow
        const waveAmplitude = (1 - flow) * 80;
        const waveX = Math.sin(t * Math.PI * 2 + particle.phase) * waveAmplitude;
        const waveY = Math.cos(t * Math.PI * 1.5 + particle.phase * 0.7) * waveAmplitude * 0.6;

        // Interpolate from cluster to final position with wave
        const startX = particle.targetX;
        const startY = particle.targetY;

        particle.x = startX + (particle.baseX - startX) * flow + waveX;
        particle.y = startY + (particle.baseY - startY) * flow + waveY;

        // Continue swirling phase during flow
        particle.phase += particle.phaseSpeed * (1 + (1 - flow) * 2);

      } else {
        // Main phase - normal floating behavior
        particle.phase += particle.phaseSpeed;
        const floatX = Math.sin(particle.phase) * particle.amplitude;
        const floatY = Math.cos(particle.phase * 0.7) * particle.amplitude * 0.8;

        particle.baseX += particle.vx;
        particle.baseY += particle.vy;

        // Wrap around edges
        if (particle.baseX < -particle.radius) particle.baseX = width + particle.radius;
        if (particle.baseX > width + particle.radius) particle.baseX = -particle.radius;
        if (particle.baseY < -particle.radius) particle.baseY = height + particle.radius;
        if (particle.baseY > height + particle.radius) particle.baseY = -particle.radius;

        let targetX = particle.baseX + floatX;
        let targetY = particle.baseY + floatY;

        // Mouse repulsion
        const dx = targetX - mouseRef.current.x;
        const dy = targetY - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const repelRadius = 250;

        if (distance < repelRadius && distance > 0) {
          const force = (1 - distance / repelRadius) * 100;
          targetX += (dx / distance) * force;
          targetY += (dy / distance) * force;
        }

        particle.x += (targetX - particle.x) * 0.05;
        particle.y += (targetY - particle.y) * 0.05;
      }
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
      const phase = phaseRef.current;

      // Calculate explosion progress
      let explosionProgress = 0;
      if (explosionStartRef.current !== null) {
        explosionProgress = (time - explosionStartRef.current) / 2000; // 2 second animation
      }
      // In main phase, animation is complete
      if (phase === 'main') {
        explosionProgress = 2; // Ensure it's well past 1
      }

      // Clear with dark background
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        updateParticle(particle, width, height, time, phase, explosionProgress);
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
