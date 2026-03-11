import type { GaussianSettings } from '@/store/gaussian-store';
import { TemplateSlider, TemplateCheckbox } from '@/components/template';

interface PolaroidSettingsProps {
  settings: GaussianSettings;
  onUpdate: (settings: Partial<GaussianSettings>) => void;
}

export function PolaroidSettings({ settings, onUpdate }: PolaroidSettingsProps) {
  return (
    <div className="space-y-4">
      <TemplateSlider
        label="Size"
        value={settings.polaroidSize}
        min={30}
        max={100}
        step={1}
        onChange={(value) => onUpdate({ polaroidSize: value })}
        settingPath="gaussian.polaroidSize"
      />

      <TemplateSlider
        label="Horizontal Offset"
        value={settings.polaroidOffsetX}
        min={-200}
        max={200}
        step={1}
        onChange={(value) => onUpdate({ polaroidOffsetX: value })}
        settingPath="gaussian.polaroidOffsetX"
      />

      <TemplateSlider
        label="Vertical Offset"
        value={settings.polaroidOffsetY}
        min={-200}
        max={200}
        step={1}
        onChange={(value) => onUpdate({ polaroidOffsetY: value })}
        settingPath="gaussian.polaroidOffsetY"
      />

      <div className="border-t pt-4 mt-4">
        <h4 className="font-medium text-gray-900 mb-3">Shadow</h4>

        <TemplateCheckbox
          id="shadow"
          checked={settings.shadow}
          onChange={(checked) => onUpdate({ shadow: checked })}
          label="Enable shadow"
          settingPath="gaussian.shadow"
          className="mb-3"
        />

        {settings.shadow && (
          <>
            <TemplateSlider
              label="Shadow Blur"
              value={settings.shadowBlur}
              min={0}
              max={50}
              step={1}
              onChange={(value) => onUpdate({ shadowBlur: value })}
              settingPath="gaussian.shadowBlur"
            />

            <TemplateSlider
              label="Shadow Opacity"
              value={settings.shadowOpacity}
              min={0}
              max={100}
              step={1}
              onChange={(value) => onUpdate({ shadowOpacity: value })}
              settingPath="gaussian.shadowOpacity"
              className="mt-4"
            />
          </>
        )}
      </div>
    </div>
  );
}
