import { useState, useCallback, useEffect, useRef } from 'react';
import { LiquidBackground, PolaroidScene3D } from '../components/home';

// Fake orb overlay - identical to background fluid orb, but rendered on top
function FakeOrbOverlay({ phase }: { phase: IntroPhase }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<{ phase: number; radius: number; color: string }[]>([]);

  const COLORS = [
    '#FF6B6B',
    '#FFE66D',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
  ];

  useEffect(() => {
    // Initialize particles (same as background)
    const count = 35;
    particlesRef.current = Array.from({ length: count }, () => ({
      phase: Math.random() * Math.PI * 2,
      radius: 60 + Math.random() * 80,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
  }, []);

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
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const animate = (time: number) => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Clear
      ctx.clearRect(0, 0, width, height);

      // Don't draw in main phase
      if (phase === 'main') {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const centerX = mouseRef.current.x > 0 ? mouseRef.current.x : width / 2;
      const centerY = mouseRef.current.y > 0 ? mouseRef.current.y : height / 2;

      // Draw particles clustered around mouse (same as background intro)
      particlesRef.current.forEach((particle, i) => {
        const breathe = Math.sin(time * 0.003) * 0.3 + 1;
        const clusterRadius = (25 + Math.sin(time * 0.002 + particle.phase) * 15) * breathe;

        particle.phase += 0.01;

        const x = centerX + Math.cos(particle.phase) * clusterRadius;
        const y = centerY + Math.sin(particle.phase) * clusterRadius;

        // Draw with radial gradient (same as background)
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, particle.radius);
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(0.4, particle.color);
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(x, y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, [phase]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{
        filter: 'blur(12px) contrast(1.5) brightness(1.2)',
        zIndex: 15,
        opacity: phase === 'intro' ? 1 : 0,
        transition: 'opacity 0.25s ease-out',
      }}
    />
  );
}

// Tool definitions
const tools = [
  {
    id: 'cropper',
    name: 'CROPPER',
    subtitle: 'Remove borders',
    path: '/cropper',
  },
  {
    id: 'gaussian',
    name: 'BLUR',
    subtitle: 'Gaussian magic',
    path: '/gaussian',
  },
  {
    id: 'print',
    name: 'PRINT',
    subtitle: 'Ready to print',
    path: '/print',
  },
];

export type IntroPhase = 'intro' | 'exploding' | 'main';

export function Home() {
  const [introPhase, setIntroPhase] = useState<IntroPhase>('intro');

  const handleExplosion = useCallback(() => {
    setIntroPhase('exploding');
    // Transition to main after animation
    setTimeout(() => {
      setIntroPhase('main');
    }, 2000);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden dark-liquid-bg">
      {/* Liquid background animation */}
      <LiquidBackground introPhase={introPhase} />

      {/* Fake orb overlay - same as background orb but on top of 3D scene */}
      <FakeOrbOverlay phase={introPhase} />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-16">
        {/* Title - fade in during explosion */}
        <header
          className="text-center mb-8"
          style={{
            opacity: introPhase === 'intro' ? 0 : 1,
            transition: 'opacity 1.3s ease-out',
            transitionDelay: introPhase === 'exploding' ? '0.7s' : '0s',
          }}
        >
          <h1 className="neon-tube-text text-4xl md:text-6xl font-bold tracking-tight mb-3">
            PolaKit
          </h1>
          <p className="text-lg text-white/50 font-light tracking-wide">
            Your instant photo toolkit
          </p>
        </header>

        {/* 3D Scene with all polaroids */}
        <div className="w-full max-w-5xl">
          <PolaroidScene3D tools={tools} onExplosion={handleExplosion} />
        </div>

        {/* Privacy badge - fade in during explosion */}
        <div
          className="mt-8"
          style={{
            opacity: introPhase === 'intro' ? 0 : 1,
            transition: 'opacity 1.3s ease-out',
            transitionDelay: introPhase === 'exploding' ? '0.7s' : '0s',
          }}
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-white/60">
              100% local processing &mdash; your photos never leave your device
            </span>
          </div>
        </div>

        {/* Footer - fade in during explosion */}
        <footer
          className="mt-8 text-center"
          style={{
            opacity: introPhase === 'intro' ? 0 : 1,
            transition: 'opacity 1.3s ease-out',
            transitionDelay: introPhase === 'exploding' ? '0.7s' : '0s',
          }}
        >
          <p className="text-sm text-white/30">Made for instant photo lovers</p>
        </footer>
      </div>
    </div>
  );
}
