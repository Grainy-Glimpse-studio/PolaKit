import { LiquidBackground, PixelPolaroid } from '../components/home';

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

export function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden dark-liquid-bg">
      {/* Liquid background animation */}
      <LiquidBackground />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-16">
        {/* Title */}
        <header className="text-center mb-16">
          <h1
            className="text-4xl md:text-6xl font-bold text-white/90 tracking-tight mb-3"
            style={{
              textShadow: `
                0 0 20px rgba(255, 107, 107, 0.5),
                0 0 40px rgba(78, 205, 196, 0.3),
                0 0 60px rgba(69, 183, 209, 0.2)
              `,
            }}
          >
            PolaKit
          </h1>
          <p className="text-lg text-white/50 font-light tracking-wide">
            Your instant photo toolkit
          </p>
        </header>

        {/* Pixel Polaroid cards */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-12 md:gap-8">
          {tools.map((tool, index) => (
            <div
              key={tool.id}
              className="transform transition-transform duration-500 hover:scale-105"
              style={{
                transform: `rotate(${(index - 1) * 5}deg)`,
                animationDelay: `${index * 0.2}s`,
              }}
            >
              <PixelPolaroid
                tool={tool}
                index={index}
                width={160}
                height={200}
              />
            </div>
          ))}
        </div>

        {/* Privacy badge */}
        <div className="mt-20">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-white/60">
              100% local processing &mdash; your photos never leave your device
            </span>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-sm text-white/30">Made for instant photo lovers</p>
        </footer>
      </div>
    </div>
  );
}
