import type { InputHTMLAttributes } from 'react';

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange?: (value: number) => void;
  showValue?: boolean;
  unit?: string;
  accentColor?: 'gray' | 'rose' | 'violet' | 'cyan';
}

const accentClasses = {
  gray: 'accent-gray-600',
  rose: 'accent-rose-500',
  violet: 'accent-violet-500',
  cyan: 'accent-cyan-500',
};

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  showValue = true,
  unit = '',
  accentColor = 'gray',
  className = '',
  ...props
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <label className="text-sm text-gray-600">{label}</label>
          )}
          {showValue && (
            <span className="text-sm font-medium text-gray-800 tabular-nums">
              {value}{unit}
            </span>
          )}
        </div>
      )}
      <div className="relative">
        <input
          type="range"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange?.(Number(e.target.value))}
          className={`
            w-full h-1.5 rounded-full appearance-none cursor-pointer
            bg-gray-200
            ${accentClasses[accentColor]}
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-gray-300
            [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-webkit-slider-thumb]:hover:border-gray-400
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-gray-300
          `}
          style={{
            background: `linear-gradient(to right, rgb(107 114 128) 0%, rgb(107 114 128) ${percentage}%, rgb(229 231 235) ${percentage}%, rgb(229 231 235) 100%)`,
          }}
          {...props}
        />
      </div>
    </div>
  );
}

// Compact slider for tight spaces
interface CompactSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange?: (value: number) => void;
  icon?: React.ReactNode;
}

export function CompactSlider({
  value,
  min,
  max,
  step = 1,
  onChange,
  icon,
}: CompactSliderProps) {
  return (
    <div className="flex items-center gap-3">
      {icon && (
        <span className="text-gray-400 flex-shrink-0">{icon}</span>
      )}
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange?.(Number(e.target.value))}
        className="
          flex-1 h-1 rounded-full appearance-none cursor-pointer
          bg-gray-200 accent-gray-600
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-3
          [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-gray-600
        "
      />
      <span className="text-xs text-gray-500 w-8 text-right tabular-nums">
        {value}
      </span>
    </div>
  );
}
