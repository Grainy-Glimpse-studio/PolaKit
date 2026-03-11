import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ThemeColorProvider, THEME_COLORS } from '@/contexts/ThemeColorContext';

interface PixelPageLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  headerActions?: ReactNode;
  themeColor?: string;
  /** @deprecated Use themeColor instead */
  accentColor?: 'rose' | 'violet' | 'cyan';
}

export function PixelPageLayout({
  title,
  subtitle,
  children,
  headerActions,
  themeColor = THEME_COLORS.red,
  accentColor,
}: PixelPageLayoutProps) {
  const navigate = useNavigate();

  // Support legacy accentColor prop by mapping to new theme colors
  const resolvedThemeColor = accentColor
    ? (accentColor === 'rose' ? THEME_COLORS.yellow : accentColor === 'cyan' ? THEME_COLORS.cyan : THEME_COLORS.red)
    : themeColor;

  return (
    <ThemeColorProvider color={resolvedThemeColor}>
      <div className="min-h-screen bg-pixel-bg relative">
        {/* Pixel grid overlay */}
        <div className="fixed inset-0 z-0 pointer-events-none pixel-grid" />

        {/* Theme color banner */}
        <div
          className="h-2 w-full"
          style={{ backgroundColor: resolvedThemeColor }}
        />

        {/* Header */}
        <header className="sticky top-0 z-50 bg-pixel-bg border-b-3 border-pixel-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16">
              {/* Left side - Back button and title */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/')}
                  className="
                    group flex items-center justify-center w-10 h-10
                    border-2 border-pixel-border bg-white
                    hover:bg-gray-100
                    transition-transform
                    hover:translate-x-[-1px] hover:translate-y-[-1px]
                    active:translate-x-[1px] active:translate-y-[1px]
                    cursor-pointer
                  "
                >
                  <svg
                    className="w-5 h-5 text-pixel-text"
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
                  <h1 className="font-['Press_Start_2P'] text-sm text-pixel-text uppercase tracking-wide">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="pixel-body text-gray-500 mt-0.5">{subtitle}</p>
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
        </header>

        {/* Main content */}
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>
      </div>
    </ThemeColorProvider>
  );
}
