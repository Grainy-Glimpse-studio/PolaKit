interface ApplyModeToggleProps {
  mode: 'all' | 'single';
  onChange: (mode: 'all' | 'single') => void;
  disabled?: boolean;
}

export function ApplyModeToggle({ mode, onChange, disabled }: ApplyModeToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Apply to:</span>
      <div className="flex rounded-lg border border-gray-300 overflow-hidden">
        <button
          onClick={() => onChange('all')}
          disabled={disabled}
          className={`px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          All
        </button>
        <button
          onClick={() => onChange('single')}
          disabled={disabled}
          className={`px-3 py-1.5 text-sm font-medium transition-colors border-l border-gray-300 ${
            mode === 'single'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          This
        </button>
      </div>
    </div>
  );
}
