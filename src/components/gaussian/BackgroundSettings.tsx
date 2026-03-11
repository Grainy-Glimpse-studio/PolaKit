import type { BgType, GaussianSettings } from '@/store/gaussian-store';
import { Slider } from '@/components/ui';
import { ImageLibrary } from './ImageLibrary';
import { VideoLibrary } from './VideoLibrary';

interface BackgroundSettingsProps {
  settings: GaussianSettings;
  onUpdate: (settings: Partial<GaussianSettings>) => void;
}

const BG_TYPES: { value: BgType; label: string }[] = [
  { value: 'blur', label: 'Blur' },
  { value: 'solid', label: 'Solid' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
];

const SOLID_PRESETS: { color: string; label: string }[] = [
  { color: '#ffffff', label: 'White' },
  { color: '#000000', label: 'Black' },
  { color: '#f5f5f5', label: 'Light Gray' },
  { color: '#e8e4df', label: 'Cream' },
  { color: '#d4e5f7', label: 'Light Blue' },
  { color: '#fce4ec', label: 'Light Pink' },
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

          <Slider
            label="Position X"
            value={settings.bgOffsetX}
            min={-50}
            max={50}
            step={1}
            onChange={(value) => onUpdate({ bgOffsetX: value })}
          />

          <Slider
            label="Position Y"
            value={settings.bgOffsetY}
            min={-50}
            max={50}
            step={1}
            onChange={(value) => onUpdate({ bgOffsetY: value })}
          />
        </>
      )}

      {settings.bgType === 'solid' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Colors
            </label>
            <div className="grid grid-cols-6 gap-2">
              {SOLID_PRESETS.map((preset) => (
                <button
                  key={preset.color}
                  onClick={() => onUpdate({ bgColor: preset.color })}
                  title={preset.label}
                  className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                    settings.bgColor.toLowerCase() === preset.color.toLowerCase()
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-300'
                  }`}
                  style={{
                    backgroundColor: preset.color,
                    boxShadow: preset.color === '#ffffff' ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' : undefined,
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Color
            </label>
            <input
              type="color"
              value={settings.bgColor}
              onChange={(e) => onUpdate({ bgColor: e.target.value })}
              className="w-full h-10 rounded border border-gray-300 cursor-pointer"
            />
          </div>
        </div>
      )}

      {settings.bgType === 'image' && (
        <div className="space-y-3">
          <ImageLibrary
            onSelect={(dataUrl) => onUpdate({ bgImageUrl: dataUrl })}
            selectedUrl={settings.bgImageUrl}
          />

          {settings.bgImageUrl && (
            <>
              <Slider
                label="Background Scale"
                value={settings.bgScale}
                min={100}
                max={200}
                step={5}
                onChange={(value) => onUpdate({ bgScale: value })}
              />

              <Slider
                label="Position X"
                value={settings.bgOffsetX}
                min={-50}
                max={50}
                step={1}
                onChange={(value) => onUpdate({ bgOffsetX: value })}
              />

              <Slider
                label="Position Y"
                value={settings.bgOffsetY}
                min={-50}
                max={50}
                step={1}
                onChange={(value) => onUpdate({ bgOffsetY: value })}
              />
            </>
          )}
        </div>
      )}

      {settings.bgType === 'video' && (
        <div className="space-y-3">
          <VideoLibrary
            videoUrl={settings.bgVideoUrl}
            currentTime={settings.bgVideoTime}
            onVideoSelect={(url) => onUpdate({ bgVideoUrl: url })}
            onTimeChange={(time) => onUpdate({ bgVideoTime: time })}
          />

          {settings.bgVideoUrl && (
            <>
              <Slider
                label="Background Scale"
                value={settings.bgScale}
                min={100}
                max={200}
                step={5}
                onChange={(value) => onUpdate({ bgScale: value })}
              />

              <Slider
                label="Position X"
                value={settings.bgOffsetX}
                min={-50}
                max={50}
                step={1}
                onChange={(value) => onUpdate({ bgOffsetX: value })}
              />

              <Slider
                label="Position Y"
                value={settings.bgOffsetY}
                min={-50}
                max={50}
                step={1}
                onChange={(value) => onUpdate({ bgOffsetY: value })}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
