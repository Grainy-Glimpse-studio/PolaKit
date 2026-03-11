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
          <label className="text-sm font-medium text-gray-700">{label}</label>
          <TemplateStar settingPath={settingPath} currentValue={value} />
        </div>
      )}
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors flex items-center justify-center gap-2 ${
              value === option.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            }`}
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
