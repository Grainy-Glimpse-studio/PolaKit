import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  headerActions?: ReactNode;
  accentColor?: 'rose' | 'violet' | 'cyan';
}

const accentColors = {
  rose: {
    gradient: 'from-rose-400 to-orange-300',
    text: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    ring: 'ring-rose-500/20',
  },
  violet: {
    gradient: 'from-violet-400 to-purple-300',
    text: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    ring: 'ring-violet-500/20',
  },
  cyan: {
    gradient: 'from-cyan-400 to-blue-300',
    text: 'text-cyan-600',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    ring: 'ring-cyan-500/20',
  },
};

export function PageLayout({
  title,
  subtitle,
  children,
  headerActions,
  accentColor = 'violet',
}: PageLayoutProps) {
  const navigate = useNavigate();
  const colors = accentColors[accentColor];

  return (
    <div className="min-h-screen bg-cream-100 relative">
      {/* Subtle texture overlay - z-0 to stay behind everything */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
           }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-cream-100/80 backdrop-blur-md border-b border-cream-300/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Back button and title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="group flex items-center justify-center w-10 h-10 rounded-full bg-white/60 hover:bg-white shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <svg
                  className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>

              <div>
                <h1 className="text-xl font-display font-medium text-gray-800">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-gray-500 handwritten">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Right side - Actions */}
            {headerActions && (
              <div className="flex items-center gap-3">
                {headerActions}
              </div>
            )}
          </div>
        </div>

        {/* Accent line */}
        <div className={`h-0.5 bg-gradient-to-r ${colors.gradient} opacity-60`} />
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}

// Panel component for consistent card styling
interface PanelProps {
  children: ReactNode;
  title?: string;
  className?: string;
  noPadding?: boolean;
}

export function Panel({ children, title, className = '', noPadding }: PanelProps) {
  return (
    <div className={`bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 ${className}`}>
      {title && (
        <div className="px-5 py-3 border-b border-gray-100">
          <h3 className="font-medium text-gray-800">{title}</h3>
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>
        {children}
      </div>
    </div>
  );
}

// Section header for organizing content
interface SectionHeaderProps {
  title: string;
  description?: string;
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
}
