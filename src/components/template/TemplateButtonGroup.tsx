import type { SettingPath } from '@/types/template';
import { TemplateStar } from './TemplateStar';

interface ButtonOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface TemplateButtonGroupProps<T extends string> {
  label?: string;
  value: T;
  onChange: (value: T) => void;
  options: ButtonOption<T>[];
  settingPath: SettingPath;
  className?: string;
}

export function TemplateButtonGroup<T extends string>({
  label,
  value,
  onChange,
  options,
  settingPath,
  className = '',
}: TemplateButtonGroupProps<T>) {
  return (
    <div className={className}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="pixel-body text-pixel-text">{label}</label>
          <TemplateStar settingPath={settingPath} currentValue={value} />
        </div>
      )}
      <div className="flex border-2 border-pixel-border">
        {options.map((option, index) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              flex-1 px-3 py-2 pixel-body transition-colors
              flex items-center justify-center gap-2
              ${value === option.value
                ? 'text-pixel-text'
                : 'bg-white text-pixel-text hover:bg-gray-100'
              }
              ${index > 0 ? 'border-l-2 border-pixel-border' : ''}
            `}
            style={value === option.value ? { backgroundColor: 'var(--theme-color, #c0c0c0)' } : undefined}
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </div>
      {!label && (
        <div className="flex justify-end mt-1">
          <TemplateStar settingPath={settingPath} currentValue={value} />
        </div>
      )}
    </div>
  );
}
