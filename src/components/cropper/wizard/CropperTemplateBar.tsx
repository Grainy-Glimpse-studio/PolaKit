import { useState, useRef, useEffect, type ReactNode } from 'react';
import type { CropperSettings } from '@/types';
import type { TemplateColor, SettingPath } from '@/types/template';
import { TEMPLATE_COLORS, TEMPLATE_COLOR_ORDER } from '@/types/template';
import { useTemplateStore } from '@/store/template-store';
import { TemplatePanelContext } from '@/components/template/TemplatePanel';

interface CropperTemplateBarProps {
  settings: CropperSettings;
  showDetails: boolean;
  onToggleDetails: () => void;
}

// All cropper setting paths
const CROPPER_SETTINGS: { path: SettingPath; getValue: (s: CropperSettings) => unknown }[] = [
  { path: 'cropper.enablePerspective', getValue: (s) => s.enablePerspective },
  { path: 'cropper.cropBlackBorder', getValue: (s) => s.cropBlackBorder },
  { path: 'cropper.threshold', getValue: (s) => s.threshold },
  { path: 'cropper.extractInnerImage', getValue: (s) => s.extractInnerImage },
  { path: 'cropper.useGlobalPrefix', getValue: (s) => s.useGlobalPrefix },
  { path: 'cropper.globalPrefix', getValue: (s) => s.globalPrefix },
  { path: 'cropper.useDatePrefix', getValue: (s) => s.useDatePrefix },
  { path: 'cropper.useNumeric', getValue: (s) => s.useNumeric },
  { path: 'cropper.padding', getValue: (s) => s.padding },
  { path: 'cropper.startNumber', getValue: (s) => s.startNumber },
];

export function CropperTemplateBar({ settings, showDetails, onToggleDetails }: CropperTemplateBarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { assignSetting, getSettingColor, unassignSetting } = useTemplateStore();

  // Close color picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showColorPicker &&
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowColorPicker(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColorPicker]);

  // Check if any cropper setting is assigned to a template
  const getTemplateColor = (): TemplateColor | null => {
    for (const setting of CROPPER_SETTINGS) {
      const color = getSettingColor(setting.path);
      if (color) return color;
    }
    return null;
  };

  const templateColor = getTemplateColor();

  // Save all settings to a template color
  const handleSaveAll = (color: TemplateColor) => {
    for (const setting of CROPPER_SETTINGS) {
      assignSetting(setting.path, color, setting.getValue(settings));
    }
    setShowColorPicker(false);
  };

  // Clear all settings from templates
  const handleClearAll = () => {
    for (const setting of CROPPER_SETTINGS) {
      unassignSetting(setting.path);
    }
    setShowColorPicker(false);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Saved indicator */}
      {templateColor && (
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `${TEMPLATE_COLORS[templateColor].hex}15`,
            color: TEMPLATE_COLORS[templateColor].hex
          }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: TEMPLATE_COLORS[templateColor].hex }}
          />
          Saved
        </div>
      )}

      {/* Star Button */}
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setShowColorPicker(!showColorPicker)}
          className={`
            w-9 h-9 flex items-center justify-center rounded-lg
            transition-all duration-150 hover:scale-105
            bg-white shadow-sm border border-gray-200 hover:border-gray-300
          `}
          title="Save Cropper settings to template"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill={templateColor ? TEMPLATE_COLORS[templateColor].hex : 'none'}
            stroke={templateColor ? TEMPLATE_COLORS[templateColor].hex : '#9CA3AF'}
            strokeWidth="1.5"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>

        {/* Color Picker Dropdown */}
        {showColorPicker && (
          <div
            ref={colorPickerRef}
            className="absolute right-0 top-full mt-2 z-[100] bg-white rounded-xl shadow-xl border border-gray-200 p-4"
          >
            <p className="text-xs text-gray-500 mb-3 whitespace-nowrap">
              Save Cropper settings
            </p>
            <div className="flex gap-2">
              {TEMPLATE_COLOR_ORDER.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleSaveAll(color)}
                  className={`
                    w-8 h-8 rounded-full transition-all duration-150
                    hover:scale-110 shadow-sm hover:shadow-md
                    ${templateColor === color ? 'ring-2 ring-offset-2' : ''}
                  `}
                  style={{
                    backgroundColor: TEMPLATE_COLORS[color].hex,
                  }}
                  title={TEMPLATE_COLORS[color].label}
                />
              ))}
              {/* Clear button */}
              {templateColor && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200
                    flex items-center justify-center transition-all duration-150
                    hover:scale-110 border border-gray-200"
                  title="Clear"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Details Toggle */}
      <button
        type="button"
        onClick={onToggleDetails}
        className={`
          px-3 py-2 text-sm rounded-lg transition-all duration-150
          ${showDetails
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }
        `}
      >
        Details
      </button>
    </div>
  );
}

// Provider component that wraps the wizard content
interface CropperTemplateProviderProps {
  children: ReactNode;
  showDetails: boolean;
}

export function CropperTemplateProvider({ children, showDetails }: CropperTemplateProviderProps) {
  return (
    <TemplatePanelContext.Provider value={{ showIndividualStars: showDetails }}>
      {children}
    </TemplatePanelContext.Provider>
  );
}
