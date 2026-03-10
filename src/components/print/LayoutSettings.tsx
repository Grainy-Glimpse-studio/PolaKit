import type { PrintSettings, FrameType, PaperType, ImageMode } from '@/types';
import { Select, Slider } from '@/components/ui';

interface LayoutSettingsProps {
  settings: PrintSettings;
  onUpdate: (settings: Partial<PrintSettings>) => void;
}

export function LayoutSettings({ settings, onUpdate }: LayoutSettingsProps) {
  return (
    <div className="space-y-4">
      <Select
        label="Paper Size"
        value={settings.paperType}
        onChange={(value) => onUpdate({ paperType: value as PaperType })}
        options={[
          { value: 'a4', label: 'A4 (210 x 297 mm)' },
          { value: 'a5', label: 'A5 (148 x 210 mm)' },
          { value: 'letter', label: 'Letter (8.5 x 11")' },
          { value: '4x6', label: '4 x 6"' },
          { value: '6x4', label: '6 x 4"' },
        ]}
      />

      <Select
        label="Frame Type"
        value={settings.frameType}
        onChange={(value) => onUpdate({ frameType: value as FrameType })}
        options={[
          { value: 'polaroid', label: 'Polaroid' },
          { value: 'instax-mini', label: 'Instax Mini' },
          { value: 'super8', label: 'Super 8' },
        ]}
      />

      <Select
        label="Image Mode"
        value={settings.imageMode}
        onChange={(value) => onUpdate({ imageMode: value as ImageMode })}
        options={[
          { value: 'frame', label: 'With Frame' },
          { value: 'inner', label: 'Inner Only' },
        ]}
      />

      <Slider
        label="Columns"
        value={settings.columns}
        min={1}
        max={6}
        step={1}
        onChange={(value) => onUpdate({ columns: value })}
      />

      <Slider
        label="Gap (mm)"
        value={settings.gap}
        min={0}
        max={10}
        step={0.5}
        onChange={(value) => onUpdate({ gap: value })}
      />

      <Slider
        label="Padding (mm)"
        value={settings.padding}
        min={0}
        max={20}
        step={1}
        onChange={(value) => onUpdate({ padding: value })}
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showCutMarks"
          checked={settings.showCutMarks}
          onChange={(e) => onUpdate({ showCutMarks: e.target.checked })}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <label htmlFor="showCutMarks" className="text-sm text-gray-700">
          Show cut marks
        </label>
      </div>
    </div>
  );
}
