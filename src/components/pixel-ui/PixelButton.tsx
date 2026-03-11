import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  loading?: boolean;
  icon?: ReactNode;
}

const variantStyles = {
  primary: 'bg-pixel-gray text-pixel-text',
  secondary: 'bg-white text-pixel-text hover:bg-gray-50',
  ghost: 'bg-transparent text-pixel-text border-transparent shadow-none hover:bg-gray-100',
  danger: 'bg-pixel-gray text-pixel-text',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-[8px]',
  md: 'px-4 py-2 text-[10px]',
  lg: 'px-6 py-3 text-[12px]',
};

export function PixelButton({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
  loading,
  icon,
  ...props
}: PixelButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={`
        pixel-btn
        inline-flex items-center justify-center gap-2
        font-['Press_Start_2P']
        uppercase tracking-wide
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${variant === 'ghost' ? '' : 'border-3 border-pixel-border'}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <svg
          className="w-4 h-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
}

// Pixel Icon Button - Retro Peak Studio inspired
interface PixelIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  size?: 'sm' | 'md';
  active?: boolean;
}

export function PixelIconButton({
  icon,
  label,
  size = 'md',
  active = false,
  className = '',
  ...props
}: PixelIconButtonProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
  };

  return (
    <button
      className={`
        pixel-toggle
        inline-flex items-center justify-center
        ${sizeClasses[size]}
        ${active ? 'active' : ''}
        ${active ? 'text-pixel-text' : 'text-pixel-text'}
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      aria-label={label}
      title={label}
      data-active={active}
      {...props}
    >
      {icon}
    </button>
  );
}
