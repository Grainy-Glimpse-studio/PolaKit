interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: ToggleProps) {
  return (
    <label
      className={`flex items-start gap-3 cursor-pointer select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div
          className={`
            w-11 h-6 rounded-full transition-colors duration-200
            ${checked ? 'bg-rose-500' : 'bg-gray-200'}
            peer-focus:ring-2 peer-focus:ring-rose-500/20
          `}
        />
        <div
          className={`
            absolute top-0.5 left-0.5
            w-5 h-5 bg-white rounded-full shadow-sm
            transition-transform duration-200 ease-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </div>
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <span className="block text-sm font-medium text-gray-800">
              {label}
            </span>
          )}
          {description && (
            <span className="block text-sm text-gray-500 mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
}
