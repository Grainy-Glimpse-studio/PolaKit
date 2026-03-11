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
  { value: 2160, label: '2160px (4K)' },
];

const NAMING_MODES: { value: NamingMode; label: string; description: string }[] = [
  { value: 'suffix', label: 'Original + _gaussian', description: 'photo_gaussian' },
  { value: 'numbered', label: 'Numbered', description: '001, 002...' },
  { value: 'original', label: 'Keep Original', description: 'photo' },
];

const EXPORT_FORMATS: { value: ExportFormat; label: string; icon: string }[] = [
  { value: 'jpg', label: 'JPG', icon: 'image' },
  { value: 'mp4', label: 'MP4', icon: 'video' },
  { value: 'gif', label: 'GIF', icon: 'gif' },
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
      {/* Export Format */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Format
        </label>
        <div className="grid grid-cols-3 gap-2">
          {EXPORT_FORMATS.map((format) => {
            const isDisabled = format.value !== 'jpg' && !hasVideo;
            return (
              <button
                key={format.value}
                onClick={() => !isDisabled && onExportFormatChange(format.value)}
                disabled={isDisabled}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
                  exportFormat === format.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : isDisabled
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
                title={isDisabled ? 'Requires video background' : undefined}
              >
                {format.value === 'jpg' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
                {format.value === 'mp4' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
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
          <p className="text-xs text-gray-400 mt-1">
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

      {/* Resolution */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Resolution
        </label>
        <div className="grid grid-cols-3 gap-2">
          {RESOLUTIONS.map((res) => (
            <button
              key={res.value}
              onClick={() => onUpdate({ resolution: res.value })}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                settings.resolution === res.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              {res.label}
            </button>
          ))}
        </div>
      </div>

      {/* File Naming */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          File Naming
        </label>
        <div className="space-y-1.5">
          {NAMING_MODES.map((mode) => (
            <button
              key={mode.value}
              onClick={() => onNamingModeChange(mode.value)}
              className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                namingMode === mode.value
                  ? 'bg-blue-50 border-blue-500'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${namingMode === mode.value ? 'text-blue-700' : 'text-gray-700'}`}>
                  {mode.label}
                </span>
                <span className={`text-xs ${namingMode === mode.value ? 'text-blue-500' : 'text-gray-400'}`}>
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
