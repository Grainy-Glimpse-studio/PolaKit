import { useState } from 'react';
import type { PrintSettings, FrameType, PaperType, ImageMode, CustomPaperSize, PaperOrientation } from '@/types';
import {
  TemplateSelect,
  TemplateSlider,
  TemplateCheckbox,
  TemplateButtonGroup,
} from '@/components/template';

interface LayoutSettingsProps {
  settings: PrintSettings;
  onUpdate: (settings: Partial<PrintSettings>) => void;
  customPaperSizes?: CustomPaperSize[];
  onAddCustomPaper?: (name: string, width: number, height: number) => void;
  onRemoveCustomPaper?: (id: string) => void;
  onApplyCustomPaper?: (id: string) => void;
}

export function LayoutSettings({
  settings,
  onUpdate,
  customPaperSizes = [],
  onAddCustomPaper,
  onRemoveCustomPaper,
  onApplyCustomPaper,
}: LayoutSettingsProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customWidth, setCustomWidth] = useState(210);
  const [customHeight, setCustomHeight] = useState(297);
  const [customName, setCustomName] = useState('');

  const handlePaperTypeChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomInput(true);
      onUpdate({
        paperType: 'custom',
        customPaper: { width: customWidth, height: customHeight },
      });
    } else {
      setShowCustomInput(false);
      onUpdate({ paperType: value as PaperType, customPaper: undefined });
    }
  };

  const handleSaveCustomPaper = () => {
    if (customWidth > 0 && customHeight > 0 && onAddCustomPaper) {
      const name = customName.trim() || `${customWidth}×${customHeight}mm`;
      onAddCustomPaper(name, customWidth, customHeight);
      setCustomName('');
      setShowCustomInput(false);
    }
  };

  const handleApplyCustomSize = (size: CustomPaperSize) => {
    onApplyCustomPaper?.(size.id);
    setShowCustomInput(false);
  };

  return (
    <div className="space-y-4">
      <TemplateSelect
        label="Paper Size"
        value={settings.paperType}
        onChange={handlePaperTypeChange}
        options={[
          { value: 'a4', label: 'A4 (210 × 297 mm)' },
          { value: 'a5', label: 'A5 (148 × 210 mm)' },
          { value: 'letter', label: 'Letter (8.5 × 11")' },
          { value: '4x6', label: '4 × 6"' },
          { value: '6x4', label: '6 × 4"' },
          { value: 'custom', label: 'Custom...' },
        ]}
        settingPath="print.paperType"
      />

      {/* Custom paper size input - pixel style */}
      {(showCustomInput || settings.paperType === 'custom') && (
        <div className="space-y-3 p-3 border-2 border-dashed border-pixel-border bg-gray-50">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block pixel-body text-pixel-text text-sm mb-1">
                Width (mm)
              </label>
              <input
                type="number"
                value={customWidth}
                onChange={(e) => {
                  const w = Number(e.target.value);
                  setCustomWidth(w);
                  onUpdate({ customPaper: { width: w, height: customHeight } });
                }}
                min={50}
                max={500}
                className="w-full px-2 py-1.5 pixel-body bg-white border-2 border-pixel-border focus:outline-none pixel-input"
              />
            </div>
            <div>
              <label className="block pixel-body text-pixel-text text-sm mb-1">
                Height (mm)
              </label>
              <input
                type="number"
                value={customHeight}
                onChange={(e) => {
                  const h = Number(e.target.value);
                  setCustomHeight(h);
                  onUpdate({ customPaper: { width: customWidth, height: h } });
                }}
                min={50}
                max={500}
                className="w-full px-2 py-1.5 pixel-body bg-white border-2 border-pixel-border focus:outline-none pixel-input"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Name (optional)"
              className="flex-1 px-2 py-1.5 pixel-body bg-white border-2 border-pixel-border focus:outline-none pixel-input"
            />
            <button
              onClick={handleSaveCustomPaper}
              className="px-3 py-1.5 pixel-body text-pixel-text border-2 border-pixel-border shadow-[2px_2px_0px_rgba(0,0,0,0.2)] hover:shadow-[3px_3px_0px_rgba(0,0,0,0.25)]"
              style={{ backgroundColor: 'var(--theme-color, #c0c0c0)' }}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Saved custom sizes - pixel style */}
      {customPaperSizes.length > 0 && (
        <div className="space-y-2">
          <label className="block pixel-body text-pixel-text">
            Saved Sizes
          </label>
          <div className="flex flex-wrap gap-1.5">
            {customPaperSizes.map((size) => (
              <div
                key={size.id}
                className="group flex items-center gap-1 px-2 py-1 pixel-body text-sm bg-white border-2 border-pixel-border hover:bg-gray-50 cursor-pointer"
                onClick={() => handleApplyCustomSize(size)}
              >
                <span>{size.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveCustomPaper?.(size.id);
                  }}
                  className="w-4 h-4 flex items-center justify-center hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paper Orientation - with pixel icons */}
      <TemplateButtonGroup
        label="Orientation"
        value={settings.orientation}
        onChange={(value) => onUpdate({ orientation: value as PaperOrientation })}
        options={[
          {
            value: 'portrait',
            label: 'Portrait',
            icon: (
              <svg className="w-4 h-5" viewBox="0 0 16 20" fill="currentColor">
                <rect x="2" y="1" width="12" height="18" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            ),
          },
          {
            value: 'landscape',
            label: 'Landscape',
            icon: (
              <svg className="w-5 h-4" viewBox="0 0 20 16" fill="currentColor">
                <rect x="1" y="2" width="18" height="12" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            ),
          },
        ]}
        settingPath="print.orientation"
      />

      <TemplateSelect
        label="Frame Type"
        value={settings.frameType}
        onChange={(value) => onUpdate({ frameType: value as FrameType })}
        options={[
          { value: 'polaroid', label: 'Polaroid (88 × 107 mm)' },
          { value: 'instax-mini', label: 'Instax Mini (54 × 86 mm)' },
          { value: 'super8', label: 'Super 8 (60 × 45 mm)' },
        ]}
        settingPath="print.frameType"
      />

      <TemplateSelect
        label="Image Mode"
        value={settings.imageMode}
        onChange={(value) => onUpdate({ imageMode: value as ImageMode })}
        options={[
          { value: 'frame', label: 'Keep Frame (full scan)' },
          { value: 'inner', label: 'Inner Photo Only (auto-crop)' },
        ]}
        settingPath="print.imageMode"
      />

      {/* Crop Adjust - only show for Inner mode */}
      {settings.imageMode === 'inner' && (
        <TemplateSlider
          label="Crop Adjust"
          value={settings.cropAdjust}
          min={-5}
          max={5}
          step={1}
          onChange={(value) => onUpdate({ cropAdjust: value })}
          settingPath="print.cropAdjust"
        />
      )}

      <TemplateSlider
        label="Columns"
        value={settings.columns}
        min={1}
        max={6}
        step={1}
        onChange={(value) => onUpdate({ columns: value })}
        settingPath="print.columns"
      />

      <TemplateSlider
        label="Gap (mm)"
        value={settings.gap}
        min={0}
        max={10}
        step={0.5}
        onChange={(value) => onUpdate({ gap: value })}
        settingPath="print.gap"
      />

      <TemplateSlider
        label="Padding (mm)"
        value={settings.padding}
        min={0}
        max={20}
        step={1}
        onChange={(value) => onUpdate({ padding: value })}
        settingPath="print.padding"
      />

      <TemplateCheckbox
        id="showCutMarks"
        checked={settings.showCutMarks}
        onChange={(checked) => onUpdate({ showCutMarks: checked })}
        label="Show cut marks"
        settingPath="print.showCutMarks"
      />
    </div>
  );
}
