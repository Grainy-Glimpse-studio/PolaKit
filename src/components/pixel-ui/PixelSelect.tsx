import type { SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface PixelSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: SelectOption[];
  onChange?: (value: string) => void;
}

export function PixelSelect({
  label,
  options,
  value,
  onChange,
  className = '',
  ...props
}: PixelSelectProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block pixel-body text-pixel-text mb-2">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="pixel-select w-full"
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Button group style selector (like C64 menu)
interface PixelButtonGroupProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function PixelButtonGroup({
  label,
  options,
  value,
  onChange,
  className = '',
}: PixelButtonGroupProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block pixel-body text-pixel-text mb-2">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-0 border-2 border-pixel-border">
        {options.map((option, index) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange?.(option.value)}
            className={`
              pixel-body px-3 py-1.5
              ${value === option.value
                ? 'text-pixel-text'
                : 'bg-white text-pixel-text hover:bg-gray-100'
              }
              ${index > 0 ? 'border-l-2 border-pixel-border' : ''}
              transition-colors cursor-pointer
            `}
            style={value === option.value ? { backgroundColor: 'var(--theme-color, #c0c0c0)' } : undefined}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
