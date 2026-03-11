interface ApplyModeToggleProps {
  mode: 'all' | 'single';
  onChange: (mode: 'all' | 'single') => void;
  disabled?: boolean;
}

export function ApplyModeToggle({ mode, onChange, disabled }: ApplyModeToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="pixel-body text-pixel-text">Apply to:</span>
      <div className="flex gap-2">
        <button
          onClick={() => onChange('all')}
          disabled={disabled}
          className={`
            pixel-toggle px-3 py-1.5 pixel-body
            ${mode === 'all' ? 'active' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          data-active={mode === 'all'}
        >
          All
        </button>
        <button
          onClick={() => onChange('single')}
          disabled={disabled}
          className={`
            pixel-toggle px-3 py-1.5 pixel-body
            ${mode === 'single' ? 'active' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          data-active={mode === 'single'}
        >
          This
        </button>
      </div>
    </div>
  );
}
