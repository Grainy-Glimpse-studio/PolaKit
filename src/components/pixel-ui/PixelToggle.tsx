interface PixelToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function PixelToggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: PixelToggleProps) {
  return (
    <label
      className={`flex items-start gap-3 cursor-pointer select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {/* Pixel-style toggle switch */}
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        {/* Track */}
        <div
          className="w-12 h-6 border-2 border-pixel-border transition-colors"
          style={{ backgroundColor: checked ? 'var(--theme-color, #c0c0c0)' : '#e5e5e5' }}
        />
        {/* Thumb */}
        <div
          className={`
            absolute top-0.5 w-5 h-5
            bg-white border-2 border-pixel-border
            transition-all duration-100
            ${checked ? 'left-6' : 'left-0.5'}
          `}
        />
      </div>

      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <span className="block pixel-body font-bold text-pixel-text">
              {label}
            </span>
          )}
          {description && (
            <span className="block pixel-body text-gray-500 mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
}

// Pixel checkbox (alternative style)
interface PixelCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function PixelCheckbox({
  checked,
  onChange,
  label,
  disabled = false,
}: PixelCheckboxProps) {
  return (
    <label
      className={`inline-flex items-center gap-2 cursor-pointer select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
        className="pixel-checkbox"
      />
      {label && (
        <span className="pixel-body text-pixel-text">{label}</span>
      )}
    </label>
  );
}
