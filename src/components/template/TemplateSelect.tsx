import type { SettingPath } from '@/types/template';
import { Select } from '@/components/ui';
import { TemplateStar } from './TemplateStar';

interface SelectOption {
  value: string;
  label: string;
}

interface TemplateSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  settingPath: SettingPath;
  className?: string;
}

export function TemplateSelect({
  label,
  value,
  onChange,
  options,
  settingPath,
  className = '',
}: TemplateSelectProps) {
  return (
    <div className={`flex items-start gap-2 ${className}`}>
      <div className="flex-1">
        <Select
          label={label}
          value={value}
          onChange={onChange}
          options={options}
        />
      </div>
      <div className="mt-6">
        <TemplateStar settingPath={settingPath} currentValue={value} />
      </div>
    </div>
  );
}
