import { useState } from 'react';
import { DEFAULT_PRESETS, type Preset } from '@/store/gaussian-store';

interface PresetManagerProps {
  activePreset: string | null;
  customPresets: Record<string, Preset>;
  onApply: (key: string) => void;
  onSave: (name: string) => void;
  onDelete: (key: string) => void;
}

// Pixel-style icons for presets
const presetPixelIcons: Record<string, React.ReactNode> = {
  instagram: (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
      <rect x="2" y="2" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="5" y="5" width="6" height="6" />
      <rect x="11" y="3" width="2" height="2" />
    </svg>
  ),
  story: (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
      <rect x="4" y="1" width="8" height="14" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="6" y="12" width="4" height="2" />
    </svg>
  ),
  minimal: (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
      <rect x="4" y="4" width="2" height="2" />
      <rect x="7" y="7" width="2" height="2" />
      <rect x="10" y="10" width="2" height="2" />
    </svg>
  ),
  dramatic: (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
      <rect x="3" y="6" width="4" height="4" />
      <rect x="9" y="6" width="4" height="4" />
      <rect x="6" y="10" width="4" height="2" />
    </svg>
  ),
};

export function PresetManager({
  activePreset,
  customPresets,
  onApply,
  onSave,
  onDelete,
}: PresetManagerProps) {
  const [showSave, setShowSave] = useState(false);
  const [presetName, setPresetName] = useState('');

  const handleSave = () => {
    if (presetName.trim()) {
      onSave(presetName.trim());
      setPresetName('');
      setShowSave(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Default presets - pixel style grid with retro effects */}
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(DEFAULT_PRESETS).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => onApply(key)}
            className={`
              pixel-toggle
              relative px-3 py-2.5 pixel-body
              flex items-center gap-2
              ${activePreset === key ? 'active' : ''}
            `}
            data-active={activePreset === key}
          >
            {presetPixelIcons[key] || (
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <rect x="3" y="3" width="10" height="10" />
              </svg>
            )}
            {preset.name}
          </button>
        ))}
      </div>

      {/* Custom presets - pixel style */}
      {Object.keys(customPresets).length > 0 && (
        <div className="pt-3 border-t-2 border-dashed border-pixel-border">
          <p className="pixel-body text-gray-500 mb-2 text-sm">CUSTOM</p>
          <div className="space-y-1.5">
            {Object.entries(customPresets).map(([key, preset]) => (
              <div
                key={key}
                className={`
                  flex items-center justify-between px-3 py-2
                  border-2 border-pixel-border
                  transition-all
                  ${activePreset === key
                    ? 'bg-red-50'
                    : 'bg-white hover:bg-gray-50'
                  }
                `}
                style={activePreset === key ? { borderColor: 'var(--theme-color, #e41b13)' } : undefined}
              >
                <button
                  onClick={() => onApply(key)}
                  className="flex-1 text-left pixel-body text-pixel-text flex items-center gap-2"
                >
                  {/* Pixel floppy disk icon */}
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="2" y="2" width="12" height="12" />
                    <rect x="4" y="2" width="6" height="4" fill="white" />
                    <rect x="4" y="9" width="8" height="4" fill="white" />
                  </svg>
                  {preset.name}
                </button>
                <button
                  onClick={() => onDelete(key)}
                  className="text-gray-400 hover:text-pixel-rose transition-colors p-1"
                >
                  {/* Pixel X icon */}
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="3" y="5" width="2" height="2" />
                    <rect x="5" y="7" width="2" height="2" />
                    <rect x="7" y="9" width="2" height="2" />
                    <rect x="9" y="7" width="2" height="2" />
                    <rect x="11" y="5" width="2" height="2" />
                    <rect x="5" y="9" width="2" height="2" />
                    <rect x="9" y="9" width="2" height="2" />
                    <rect x="3" y="11" width="2" height="2" />
                    <rect x="11" y="11" width="2" height="2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save new preset - pixel style */}
      {showSave ? (
        <div className="space-y-2">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Preset name..."
            className="pixel-input w-full"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 px-3 py-2 pixel-body text-pixel-text border-2 border-pixel-border shadow-[3px_3px_0px_rgba(0,0,0,0.2)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.25)] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_rgba(0,0,0,0.2)]"
              style={{ backgroundColor: 'var(--theme-color, #c0c0c0)' }}
            >
              Save
            </button>
            <button
              onClick={() => setShowSave(false)}
              className="px-3 py-2 pixel-body bg-white text-pixel-text border-2 border-pixel-border shadow-[3px_3px_0px_rgba(0,0,0,0.2)] hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowSave(true)}
          className="w-full px-3 py-2 pixel-body text-gray-500 hover:text-pixel-text border-2 border-dashed border-pixel-border transition-colors flex items-center justify-center gap-2"
          style={{ '--hover-border': 'var(--theme-color)' } as React.CSSProperties}
        >
          {/* Pixel plus icon */}
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <rect x="7" y="3" width="2" height="10" />
            <rect x="3" y="7" width="10" height="2" />
          </svg>
          Save as Preset
        </button>
      )}
    </div>
  );
}
