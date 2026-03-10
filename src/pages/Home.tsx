import { useState, useCallback } from 'react';
import { LiquidBackground, PolaroidScene3D } from '../components/home';

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

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-16">
        {/* Title - fade in after explosion */}
        <header
          className="text-center mb-8 transition-opacity duration-1000"
          style={{ opacity: introPhase === 'main' ? 1 : 0 }}
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

        {/* Privacy badge - fade in after explosion */}
        <div
          className="mt-8 transition-opacity duration-1000"
          style={{ opacity: introPhase === 'main' ? 1 : 0 }}
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-white/60">
              100% local processing &mdash; your photos never leave your device
            </span>
          </div>
        </div>

        {/* Footer - fade in after explosion */}
        <footer
          className="mt-8 text-center transition-opacity duration-1000"
          style={{ opacity: introPhase === 'main' ? 1 : 0 }}
        >
          <p className="text-sm text-white/30">Made for instant photo lovers</p>
        </footer>
      </div>
    </div>
  );
}
