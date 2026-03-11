import type { SettingPath } from '@/types/template';
import { Toggle } from '@/components/ui';
import { TemplateStar } from './TemplateStar';

interface TemplateToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  settingPath: SettingPath;
}

export function TemplateToggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  settingPath,
}: TemplateToggleProps) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex-1">
        <Toggle
          checked={checked}
          onChange={onChange}
          label={label}
          description={description}
          disabled={disabled}
        />
      </div>
      <div className="mt-0.5">
        <TemplateStar settingPath={settingPath} currentValue={checked} />
      </div>
    </div>
  );
}
