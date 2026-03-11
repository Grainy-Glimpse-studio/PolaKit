import type { GaussianSettings, NamingMode, ExportFormat } from '@/store/gaussian-store';
import { Slider } from '@/components/ui';

interface ExportSettingsProps {
  settings: GaussianSettings;
  onUpdate: (settings: Partial<GaussianSettings>) => void;
  namingMode: NamingMode;
  onNamingModeChange: (mode: NamingMode) => void;
  exportFormat: ExportFormat;
  onExportFormatChange: (format: ExportFormat) => void;
  videoDuration: number;
  onVideoDurationChange: (duration: number) => void;
  hasVideo: boolean;
}

const RESOLUTIONS = [
  { value: 1080, label: '1080px' },
  { value: 1440, label: '1440px' },
  { value: 2160, label: '4K' },
];

const NAMING_MODES: { value: NamingMode; label: string; description: string }[] = [
  { value: 'suffix', label: 'Original + _gaussian', description: 'photo_gaussian' },
  { value: 'numbered', label: 'Numbered', description: '001, 002...' },
  { value: 'original', label: 'Keep Original', description: 'photo' },
];

const EXPORT_FORMATS: { value: ExportFormat; label: string }[] = [
  { value: 'jpg', label: 'JPG' },
  { value: 'mp4', label: 'MP4' },
  { value: 'gif', label: 'GIF' },
];

export function ExportSettings({
  settings,
  onUpdate,
  namingMode,
  onNamingModeChange,
  exportFormat,
  onExportFormatChange,
  videoDuration,
  onVideoDurationChange,
  hasVideo,
}: ExportSettingsProps) {
  const showVideoOptions = exportFormat !== 'jpg' && hasVideo;

  return (
    <div className="space-y-4">
      {/* Export Format - pixel style button group */}
      <div>
        <label className="block pixel-body text-pixel-text mb-2">
          Format
        </label>
        <div className="flex border-2 border-pixel-border">
          {EXPORT_FORMATS.map((format, index) => {
            const isDisabled = format.value !== 'jpg' && !hasVideo;
            return (
              <button
                key={format.value}
                onClick={() => !isDisabled && onExportFormatChange(format.value)}
                disabled={isDisabled}
                className={`
                  flex-1 px-3 py-2 pixel-body
                  flex items-center justify-center gap-1.5
                  transition-colors
                  ${exportFormat === format.value
                    ? 'text-pixel-text'
                    : isDisabled
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-pixel-text hover:bg-gray-50'
                  }
                  ${index > 0 ? 'border-l-2 border-pixel-border' : ''}
                `}
                style={exportFormat === format.value ? { backgroundColor: 'var(--theme-color, #c0c0c0)' } : undefined}
                title={isDisabled ? 'Requires video background' : undefined}
              >
                {/* Pixel icons */}
                {format.value === 'jpg' && (
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="2" y="2" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" />
                    <rect x="5" y="5" width="2" height="2" />
                    <rect x="3" y="10" width="3" height="3" />
                    <rect x="7" y="8" width="3" height="3" />
                  </svg>
                )}
                {format.value === 'mp4' && (
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="1" y="4" width="10" height="8" fill="none" stroke="currentColor" strokeWidth="2" />
                    <rect x="12" y="5" width="3" height="2" />
                    <rect x="12" y="9" width="3" height="2" />
                  </svg>
                )}
                {format.value === 'gif' && (
                  <span className="text-xs font-bold">GIF</span>
                )}
                {format.label}
              </button>
            );
          })}
        </div>
        {!hasVideo && (
          <p className="pixel-body text-gray-400 text-sm mt-1">
            Video/GIF export requires video background
          </p>
        )}
      </div>

      {/* Video Duration (only for video/gif export) */}
      {showVideoOptions && (
        <Slider
          label="Duration"
          value={videoDuration}
          min={1}
          max={10}
          step={0.5}
          unit="s"
          onChange={onVideoDurationChange}
        />
      )}

      {/* Resolution - pixel style button group */}
      <div>
        <label className="block pixel-body text-pixel-text mb-2">
          Resolution
        </label>
        <div className="flex border-2 border-pixel-border">
          {RESOLUTIONS.map((res, index) => (
            <button
              key={res.value}
              onClick={() => onUpdate({ resolution: res.value })}
              className={`
                flex-1 px-3 py-2 pixel-body transition-colors
                ${settings.resolution === res.value
                  ? 'text-pixel-text'
                  : 'bg-white text-pixel-text hover:bg-gray-50'
                }
                ${index > 0 ? 'border-l-2 border-pixel-border' : ''}
              `}
              style={settings.resolution === res.value ? { backgroundColor: 'var(--theme-color, #c0c0c0)' } : undefined}
            >
              {res.label}
            </button>
          ))}
        </div>
      </div>

      {/* File Naming - pixel style list */}
      <div>
        <label className="block pixel-body text-pixel-text mb-2">
          File Naming
        </label>
        <div className="space-y-1">
          {NAMING_MODES.map((mode) => (
            <button
              key={mode.value}
              onClick={() => onNamingModeChange(mode.value)}
              className={`
                w-full text-left px-3 py-2
                border-2 border-pixel-border
                transition-all
                ${namingMode === mode.value
                  ? 'bg-orange-50'
                  : 'bg-white hover:bg-gray-50'
                }
              `}
              style={namingMode === mode.value ? { borderColor: 'var(--theme-color, #e41b13)' } : undefined}
            >
              <div className="flex items-center justify-between">
                <span className="pixel-body text-pixel-text">
                  {mode.label}
                </span>
                <span className={`pixel-body text-sm ${namingMode === mode.value ? 'text-pixel-text' : 'text-gray-400'}`}>
                  {mode.description}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
