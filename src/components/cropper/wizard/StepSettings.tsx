import type { CropperSettings } from '@/types';
import { Toggle, Slider } from '@/components/ui';
import { WizardNavigation } from './WizardNavigation';

interface StepSettingsProps {
  settings: CropperSettings;
  onUpdateSettings: (settings: Partial<CropperSettings>) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepSettings({
  settings,
  onUpdateSettings,
  onBack,
  onNext,
}: StepSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-1">
            Processing Settings
          </h2>
          <p className="text-sm text-gray-500">
            Configure how your polaroids will be processed
          </p>
        </div>

        {/* All toggles in one compact section */}
        <div className="p-4 bg-gray-50 rounded-xl space-y-4">
          <Toggle
            checked={settings.enablePerspective}
            onChange={(checked) => onUpdateSettings({ enablePerspective: checked })}
            label="Perspective Correction"
            description="Automatically straighten tilted photos"
          />

          <div className="border-t border-gray-200 pt-4">
            <Toggle
              checked={settings.cropBlackBorder}
              onChange={(checked) => onUpdateSettings({ cropBlackBorder: checked })}
              label="Crop Black Border"
              description="Remove the scanner's dark background"
            />

            {/* Border Sensitivity slider - only show when crop is enabled */}
            {settings.cropBlackBorder && (
              <div className="mt-3 ml-14">
                <Slider
                  label="Border Sensitivity"
                  value={settings.threshold}
                  min={10}
                  max={100}
                  step={5}
                  onChange={(value) => onUpdateSettings({ threshold: value })}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Lower values detect darker borders more aggressively
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <Toggle
              checked={settings.extractInnerImage}
              onChange={(checked) => onUpdateSettings({ extractInnerImage: checked })}
              label="Extract Inner Image (white border only)"
              description="Remove the white Polaroid border, keep only the photo"
            />
          </div>
        </div>

        {/* Navigation */}
        <WizardNavigation
          onBack={onBack}
          onNext={onNext}
          nextLabel="Continue to Rename"
        />
      </div>

      {/* Info panel */}
      <div className="bg-rose-50/50 rounded-xl p-4 border border-rose-100">
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-rose-800">How it works</h4>
            <p className="text-sm text-rose-700/80 mt-1">
              The cropper detects the white border of your polaroid photos and removes the surrounding dark background from the scanner. Perspective correction straightens any tilted photos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
