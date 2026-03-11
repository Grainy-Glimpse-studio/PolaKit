import type { InputHTMLAttributes } from 'react';

interface PixelSliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange?: (value: number) => void;
  showValue?: boolean;
  unit?: string;
}

export function PixelSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  showValue = true,
  unit = '',
  className = '',
  ...props
}: PixelSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <label className="pixel-body text-pixel-text">{label}</label>
          )}
          {showValue && (
            <span className="pixel-body font-bold text-pixel-text tabular-nums">
              {value}{unit}
            </span>
          )}
        </div>
      )}
      <div className="relative">
        {/* Track background */}
        <div className="absolute inset-0 h-3 bg-gray-200 border-2 border-pixel-border" />

        {/* Filled track */}
        <div
          className="absolute h-3 border-2 border-pixel-border border-r-0"
          style={{ width: `${percentage}%`, backgroundColor: 'var(--theme-color, #c0c0c0)' }}
        />

        {/* Native input for accessibility */}
        <input
          type="range"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange?.(Number(e.target.value))}
          className="
            relative w-full h-3 appearance-none cursor-pointer bg-transparent z-10
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:bg-pixel-gray
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-pixel-border
            [&::-webkit-slider-thumb]:cursor-grab
            [&::-webkit-slider-thumb]:active:cursor-grabbing
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:bg-pixel-gray
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-pixel-border
            [&::-moz-range-thumb]:cursor-grab
            [&::-moz-range-thumb]:rounded-none
            pixel-slider
          "
          {...props}
        />
      </div>
    </div>
  );
}

// Compact version for toolbar
interface CompactPixelSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange?: (value: number) => void;
  icon?: React.ReactNode;
}

export function CompactPixelSlider({
  value,
  min,
  max,
  step = 1,
  onChange,
  icon,
}: CompactPixelSliderProps) {
  return (
    <div className="flex items-center gap-2">
      {icon && (
        <span className="text-pixel-text flex-shrink-0">{icon}</span>
      )}
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange?.(Number(e.target.value))}
        className="
          flex-1 h-2 appearance-none cursor-pointer
          bg-gray-200 border border-pixel-border
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-3
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:bg-pixel-gray
          [&::-webkit-slider-thumb]:border
          [&::-webkit-slider-thumb]:border-pixel-border
          [&::-moz-range-thumb]:w-3
          [&::-moz-range-thumb]:h-4
          [&::-moz-range-thumb]:bg-pixel-gray
          [&::-moz-range-thumb]:border
          [&::-moz-range-thumb]:border-pixel-border
          [&::-moz-range-thumb]:rounded-none
          pixel-slider
        "
      />
      <span className="pixel-body text-pixel-text w-8 text-right tabular-nums">
        {value}
      </span>
    </div>
  );
}
