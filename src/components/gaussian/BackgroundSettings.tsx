import type { BgType, GaussianSettings } from '@/store/gaussian-store';
import { Slider } from '@/components/ui';

interface BackgroundSettingsProps {
  settings: GaussianSettings;
  onUpdate: (settings: Partial<GaussianSettings>) => void;
}

const BG_TYPES: { value: BgType; label: string }[] = [
  { value: 'blur', label: 'Blur' },
  { value: 'solid', label: 'Solid Color' },
];

export function BackgroundSettings({ settings, onUpdate }: BackgroundSettingsProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Background</h3>

      <div className="flex gap-2">
        {BG_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => onUpdate({ bgType: type.value })}
            className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
              settings.bgType === type.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {settings.bgType === 'blur' && (
        <>
          <Slider
            label="Blur Intensity"
            value={settings.blurIntensity}
            min={0}
            max={100}
            step={1}
            onChange={(value) => onUpdate({ blurIntensity: value })}
          />

          <Slider
            label="Brightness"
            value={settings.brightness}
            min={50}
            max={150}
            step={1}
            onChange={(value) => onUpdate({ brightness: value })}
          />

          <Slider
            label="Background Scale"
            value={settings.bgScale}
            min={100}
            max={200}
            step={5}
            onChange={(value) => onUpdate({ bgScale: value })}
          />
        </>
      )}

      {settings.bgType === 'solid' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Background Color
          </label>
          <input
            type="color"
            value={settings.bgColor}
            onChange={(e) => onUpdate({ bgColor: e.target.value })}
            className="w-full h-10 rounded border border-gray-300 cursor-pointer"
          />
        </div>
      )}
    </div>
  );
}
