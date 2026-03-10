import type { CropperSettings } from '@/types';
import { Select, Slider } from '@/components/ui';

interface NamingOptionsProps {
  settings: CropperSettings;
  onUpdate: (settings: Partial<CropperSettings>) => void;
}

export function NamingOptions({ settings, onUpdate }: NamingOptionsProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm space-y-4">
      <h3 className="font-medium text-gray-900">Processing Options</h3>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="enablePerspective"
          checked={settings.enablePerspective}
          onChange={(e) => onUpdate({ enablePerspective: e.target.checked })}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <label htmlFor="enablePerspective" className="text-sm text-gray-700">
          Enable perspective correction
        </label>
      </div>

      <Slider
        label="Detection Threshold"
        value={settings.threshold}
        min={100}
        max={240}
        step={5}
        onChange={(value) => onUpdate({ threshold: value })}
      />

      <Select
        label="Naming Mode"
        value={settings.namingMode}
        onChange={(value) =>
          onUpdate({ namingMode: value as CropperSettings['namingMode'] })
        }
        options={[
          { value: 'numeric', label: 'Numeric (001, 002...)' },
          { value: 'prefix', label: 'With Prefix' },
          { value: 'original', label: 'Keep Original Name' },
        ]}
      />

      {settings.namingMode === 'prefix' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prefix
          </label>
          <input
            type="text"
            value={settings.prefix}
            onChange={(e) => onUpdate({ prefix: e.target.value })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="polaroid"
          />
        </div>
      )}

      {settings.namingMode !== 'original' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Number
          </label>
          <input
            type="number"
            value={settings.startNumber}
            onChange={(e) => onUpdate({ startNumber: Number(e.target.value) })}
            min={0}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}
    </div>
  );
}
