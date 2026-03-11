import type { CropperSettings, ProcessedImage } from '@/types';
import { TemplateToggle } from '@/components/template';
import { FilenamePreview } from '../FilenamePreview';
import { WizardNavigation } from './WizardNavigation';

interface StepRenameProps {
  images: ProcessedImage[];
  settings: CropperSettings;
  onUpdateSettings: (settings: Partial<CropperSettings>) => void;
  onUpdateImageName: (id: string, customName: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepRename({
  images,
  settings,
  onUpdateSettings,
  onUpdateImageName,
  onBack,
  onNext,
}: StepRenameProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-1">
            Rename Files
          </h2>
          <p className="text-sm text-gray-500">
            Configure how your processed photos will be named. Options can be combined.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 命名选项 */}
          <div className="space-y-4">
            {/* 全局前缀 */}
            <div className="p-4 bg-gray-50 rounded-xl space-y-3">
              <TemplateToggle
                checked={settings.useGlobalPrefix}
                onChange={(checked) => onUpdateSettings({ useGlobalPrefix: checked })}
                label="Global Prefix"
                description="Add a custom prefix to all files"
                settingPath="cropper.useGlobalPrefix"
              />
              {settings.useGlobalPrefix && (
                <input
                  type="text"
                  value={settings.globalPrefix}
                  onChange={(e) => onUpdateSettings({ globalPrefix: e.target.value })}
                  className="block w-full px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 transition-colors"
                  placeholder="Polaroid_"
                />
              )}
            </div>

            {/* 日期前缀 */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <TemplateToggle
                checked={settings.useDatePrefix}
                onChange={(checked) => onUpdateSettings({ useDatePrefix: checked })}
                label="Date Prefix"
                description="Add processing date/time (e.g., 2026-03-10_17-30_)"
                settingPath="cropper.useDatePrefix"
              />
            </div>

            {/* 数字序号 */}
            <div className="p-4 bg-gray-50 rounded-xl space-y-3">
              <TemplateToggle
                checked={settings.useNumeric}
                onChange={(checked) => onUpdateSettings({ useNumeric: checked })}
                label="Numeric Sequence"
                description="Add sequential numbers (001, 002...)"
                settingPath="cropper.useNumeric"
              />
              {settings.useNumeric && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Start from
                    </label>
                    <input
                      type="number"
                      value={settings.startNumber}
                      onChange={(e) => onUpdateSettings({ startNumber: Math.max(0, Number(e.target.value)) })}
                      min={0}
                      className="block w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Digits
                    </label>
                    <select
                      value={settings.padding}
                      onChange={(e) => onUpdateSettings({ padding: Number(e.target.value) })}
                      className="block w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300"
                    >
                      <option value={2}>2 (01, 02...)</option>
                      <option value={3}>3 (001, 002...)</option>
                      <option value={4}>4 (0001, 0002...)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：预览 + 单张命名 */}
          <div className="space-y-4">
            {/* 预览 */}
            <div className="bg-gray-50 rounded-xl p-4">
              <FilenamePreview images={images} settings={settings} />
            </div>

            {/* 单张命名 */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Individual Names (Optional)
              </h4>
              <p className="text-xs text-gray-500 mb-3">
                Override global settings for specific images
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {images.slice(0, 10).map((image, index) => (
                  <div key={image.id} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={image.customName || ''}
                      onChange={(e) => onUpdateImageName(image.id, e.target.value)}
                      className="flex-1 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300"
                      placeholder={image.file.name.replace(/\.[^.]+$/, '')}
                    />
                  </div>
                ))}
                {images.length > 10 && (
                  <p className="text-xs text-gray-400 italic pt-1">
                    Showing first 10 of {images.length} images
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <WizardNavigation
          onBack={onBack}
          onNext={onNext}
          nextLabel="Continue to Process"
        />
      </div>
    </div>
  );
}
