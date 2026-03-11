import type { SettingPath } from '@/types/template';
import { Slider } from '@/components/ui';
import { TemplateStar } from './TemplateStar';

interface TemplateSliderProps {
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange?: (value: number) => void;
  showValue?: boolean;
  unit?: string;
  settingPath: SettingPath;
  className?: string;
}

export function TemplateSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  showValue = true,
  unit = '',
  settingPath,
  className = '',
}: TemplateSliderProps) {
  return (
    <div className={`flex items-start gap-2 ${className}`}>
      <div className="flex-1">
        <Slider
          label={label}
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={onChange}
          showValue={showValue}
          unit={unit}
        />
      </div>
      <div className="mt-1">
        <TemplateStar settingPath={settingPath} currentValue={value} />
      </div>
    </div>
  );
}
