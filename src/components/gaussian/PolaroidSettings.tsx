import type { GaussianSettings } from '@/store/gaussian-store';
import { Slider } from '@/components/ui';

interface PolaroidSettingsProps {
  settings: GaussianSettings;
  onUpdate: (settings: Partial<GaussianSettings>) => void;
}

export function PolaroidSettings({ settings, onUpdate }: PolaroidSettingsProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Polaroid</h3>

      <Slider
        label="Size"
        value={settings.polaroidSize}
        min={30}
        max={100}
        step={1}
        onChange={(value) => onUpdate({ polaroidSize: value })}
      />

      <Slider
        label="Horizontal Offset"
        value={settings.polaroidOffsetX}
        min={-200}
        max={200}
        step={1}
        onChange={(value) => onUpdate({ polaroidOffsetX: value })}
      />

      <Slider
        label="Vertical Offset"
        value={settings.polaroidOffsetY}
        min={-200}
        max={200}
        step={1}
        onChange={(value) => onUpdate({ polaroidOffsetY: value })}
      />

      <div className="border-t pt-4 mt-4">
        <h4 className="font-medium text-gray-900 mb-3">Shadow</h4>

        <div className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            id="shadow"
            checked={settings.shadow}
            onChange={(e) => onUpdate({ shadow: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="shadow" className="text-sm text-gray-700">
            Enable shadow
          </label>
        </div>

        {settings.shadow && (
          <>
            <Slider
              label="Shadow Blur"
              value={settings.shadowBlur}
              min={0}
              max={50}
              step={1}
              onChange={(value) => onUpdate({ shadowBlur: value })}
            />

            <Slider
              label="Shadow Opacity"
              value={settings.shadowOpacity}
              min={0}
              max={100}
              step={1}
              onChange={(value) => onUpdate({ shadowOpacity: value })}
            />
          </>
        )}
      </div>
    </div>
  );
}
