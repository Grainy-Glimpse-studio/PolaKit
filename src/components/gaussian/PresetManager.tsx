import { useState } from 'react';
import { DEFAULT_PRESETS, type Preset } from '@/store/gaussian-store';
import { Button } from '@/components/ui';

interface PresetManagerProps {
  activePreset: string | null;
  customPresets: Record<string, Preset>;
  onApply: (key: string) => void;
  onSave: (name: string) => void;
  onDelete: (key: string) => void;
}

const presetIcons: Record<string, string> = {
  instagram: '📸',
  story: '📱',
  minimal: '✨',
  dramatic: '🎭',
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
      {/* Default presets */}
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(DEFAULT_PRESETS).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => onApply(key)}
            className={`
              relative px-3 py-2.5 text-sm rounded-xl border-2 transition-all
              ${activePreset === key
                ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white border-transparent shadow-md'
                : 'bg-white/50 text-gray-700 border-gray-200 hover:border-violet-300 hover:bg-violet-50'
              }
            `}
          >
            <span className="mr-1.5">{presetIcons[key] || '🎨'}</span>
            {preset.name}
          </button>
        ))}
      </div>

      {/* Custom presets */}
      {Object.keys(customPresets).length > 0 && (
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Custom</p>
          <div className="space-y-1.5">
            {Object.entries(customPresets).map(([key, preset]) => (
              <div
                key={key}
                className={`
                  flex items-center justify-between px-3 py-2 rounded-xl transition-all
                  ${activePreset === key
                    ? 'bg-violet-50 ring-2 ring-violet-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                  }
                `}
              >
                <button
                  onClick={() => onApply(key)}
                  className="flex-1 text-left text-sm font-medium text-gray-700"
                >
                  💾 {preset.name}
                </button>
                <button
                  onClick={() => onDelete(key)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save new preset */}
      {showSave ? (
        <div className="space-y-2">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Preset name..."
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} className="flex-1">
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowSave(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowSave(true)}
          className="w-full px-3 py-2 text-sm text-gray-500 hover:text-violet-600 border-2 border-dashed border-gray-200 hover:border-violet-300 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Save as Preset
        </button>
      )}
    </div>
  );
}
