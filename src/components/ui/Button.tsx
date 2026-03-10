import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
  loading,
  icon,
  ...props
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-medium rounded-xl
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cream-100
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    active:scale-[0.98]
  `;

  const variants = {
    primary: `
      bg-gradient-to-br from-gray-800 to-gray-900
      text-white
      hover:from-gray-700 hover:to-gray-800
      shadow-md hover:shadow-lg
      focus:ring-gray-500
    `,
    secondary: `
      bg-white
      text-gray-700
      border border-gray-200
      hover:bg-gray-50 hover:border-gray-300
      shadow-sm hover:shadow
      focus:ring-gray-400
    `,
    outline: `
      bg-transparent
      text-gray-700
      border-2 border-gray-300
      hover:bg-gray-50 hover:border-gray-400
      focus:ring-gray-400
    `,
    ghost: `
      bg-transparent
      text-gray-600
      hover:bg-black/5 hover:text-gray-800
      focus:ring-gray-400
    `,
    danger: `
      bg-gradient-to-br from-red-500 to-red-600
      text-white
      hover:from-red-400 hover:to-red-500
      shadow-md hover:shadow-lg
      focus:ring-red-500
    `,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
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

// Icon button variant
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  variant?: 'default' | 'ghost';
  size?: 'sm' | 'md';
  label: string;
}

export function IconButton({
  icon,
  variant = 'default',
  size = 'md',
  label,
  className = '',
  ...props
}: IconButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center
    rounded-full
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cream-100 focus:ring-gray-400
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-95
  `;

  const variants = {
    default: 'bg-white/70 hover:bg-white shadow-sm hover:shadow text-gray-600 hover:text-gray-800',
    ghost: 'bg-transparent hover:bg-black/5 text-gray-500 hover:text-gray-700',
  };

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      aria-label={label}
      title={label}
      {...props}
    >
      {icon}
    </button>
  );
}
