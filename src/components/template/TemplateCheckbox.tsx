import type { SettingPath } from '@/types/template';
import { TemplateStar } from './TemplateStar';

interface TemplateCheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  settingPath: SettingPath;
  className?: string;
}

export function TemplateCheckbox({
  id,
  checked,
  onChange,
  label,
  settingPath,
  className = '',
}: TemplateCheckboxProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
      />
      <label htmlFor={id} className="text-sm text-gray-700 flex-1">
        {label}
      </label>
      <TemplateStar settingPath={settingPath} currentValue={checked} />
    </div>
  );
}
