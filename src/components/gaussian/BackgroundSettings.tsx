import type { BgType, GaussianSettings } from '@/store/gaussian-store';
import { TemplateSlider, TemplateButtonGroup, TemplateStar } from '@/components/template';
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
      <TemplateButtonGroup
        value={settings.bgType}
        onChange={(value) => onUpdate({ bgType: value })}
        options={BG_TYPES}
        settingPath="gaussian.bgType"
      />

      {settings.bgType === 'blur' && (
        <>
          <TemplateSlider
            label="Blur Intensity"
            value={settings.blurIntensity}
            min={0}
            max={100}
            step={1}
            onChange={(value) => onUpdate({ blurIntensity: value })}
            settingPath="gaussian.blurIntensity"
          />

          <TemplateSlider
            label="Brightness"
            value={settings.brightness}
            min={50}
            max={150}
            step={1}
            onChange={(value) => onUpdate({ brightness: value })}
            settingPath="gaussian.brightness"
          />

          <TemplateSlider
            label="Background Scale"
            value={settings.bgScale}
            min={100}
            max={200}
            step={5}
            onChange={(value) => onUpdate({ bgScale: value })}
            settingPath="gaussian.bgScale"
          />

          <TemplateSlider
            label="Position X"
            value={settings.bgOffsetX}
            min={-50}
            max={50}
            step={1}
            onChange={(value) => onUpdate({ bgOffsetX: value })}
            settingPath="gaussian.bgOffsetX"
          />

          <TemplateSlider
            label="Position Y"
            value={settings.bgOffsetY}
            min={-50}
            max={50}
            step={1}
            onChange={(value) => onUpdate({ bgOffsetY: value })}
            settingPath="gaussian.bgOffsetY"
          />
        </>
      )}

      {settings.bgType === 'solid' && (
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="pixel-body text-pixel-text">
                Quick Colors
              </label>
              <TemplateStar settingPath="gaussian.bgColor" currentValue={settings.bgColor} />
            </div>
            {/* Pixel-style color swatches */}
            <div className="grid grid-cols-6 gap-2">
              {SOLID_PRESETS.map((preset) => (
                <button
                  key={preset.color}
                  onClick={() => onUpdate({ bgColor: preset.color })}
                  title={preset.label}
                  className={`
                    w-8 h-8 border-2 border-pixel-border
                    transition-all hover:scale-110
                    ${settings.bgColor.toLowerCase() === preset.color.toLowerCase()
                      ? 'ring-2 ring-offset-1'
                      : ''
                    }
                  `}
                  style={{
                    backgroundColor: preset.color,
                    boxShadow: preset.color === '#ffffff' ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' : undefined,
                    ...(settings.bgColor.toLowerCase() === preset.color.toLowerCase() ? { '--tw-ring-color': 'var(--theme-color, #c0c0c0)' } as React.CSSProperties : {}),
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block pixel-body text-pixel-text mb-1">
              Custom Color
            </label>
            <div className="relative">
              <input
                type="color"
                value={settings.bgColor}
                onChange={(e) => onUpdate({ bgColor: e.target.value })}
                className="w-full h-10 border-2 border-pixel-border cursor-pointer bg-white"
              />
            </div>
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
              <TemplateSlider
                label="Background Scale"
                value={settings.bgScale}
                min={100}
                max={200}
                step={5}
                onChange={(value) => onUpdate({ bgScale: value })}
                settingPath="gaussian.bgScale"
              />

              <TemplateSlider
                label="Position X"
                value={settings.bgOffsetX}
                min={-50}
                max={50}
                step={1}
                onChange={(value) => onUpdate({ bgOffsetX: value })}
                settingPath="gaussian.bgOffsetX"
              />

              <TemplateSlider
                label="Position Y"
                value={settings.bgOffsetY}
                min={-50}
                max={50}
                step={1}
                onChange={(value) => onUpdate({ bgOffsetY: value })}
                settingPath="gaussian.bgOffsetY"
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
              <TemplateSlider
                label="Background Scale"
                value={settings.bgScale}
                min={100}
                max={200}
                step={5}
                onChange={(value) => onUpdate({ bgScale: value })}
                settingPath="gaussian.bgScale"
              />

              <TemplateSlider
                label="Position X"
                value={settings.bgOffsetX}
                min={-50}
                max={50}
                step={1}
                onChange={(value) => onUpdate({ bgOffsetX: value })}
                settingPath="gaussian.bgOffsetX"
              />

              <TemplateSlider
                label="Position Y"
                value={settings.bgOffsetY}
                min={-50}
                max={50}
                step={1}
                onChange={(value) => onUpdate({ bgOffsetY: value })}
                settingPath="gaussian.bgOffsetY"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
