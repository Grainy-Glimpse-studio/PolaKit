import { createContext, useContext, type ReactNode } from 'react';

// Theme colors
export const THEME_COLORS = {
  orange: '#f97316',  // Orange (GaussianBg)
  yellow: '#fdc800',  // Polaroid Supernova (Cropper)
  cyan: '#00a3e2',    // Polaroid Cerulean (PrintLayout)
} as const;

export type ThemeColorKey = keyof typeof THEME_COLORS;

const ThemeColorContext = createContext<string>(THEME_COLORS.red);

interface ThemeColorProviderProps {
  color: string;
  children: ReactNode;
}

export function ThemeColorProvider({ color, children }: ThemeColorProviderProps) {
  return (
    <ThemeColorContext.Provider value={color}>
      <div style={{ '--theme-color': color } as React.CSSProperties}>
        {children}
      </div>
    </ThemeColorContext.Provider>
  );
}

export function useThemeColor() {
  return useContext(ThemeColorContext);
}
