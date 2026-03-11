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
      {/* Saved indicator - pixel style */}
      {templateColor && (
        <div
          className="flex items-center gap-1.5 px-2 py-1 pixel-body border-2 border-pixel-border"
          style={{
            backgroundColor: `${TEMPLATE_COLORS[templateColor].hex}20`,
            color: TEMPLATE_COLORS[templateColor].hex
          }}
        >
          <div
            className="w-2 h-2 border border-pixel-border"
            style={{ backgroundColor: TEMPLATE_COLORS[templateColor].hex }}
          />
          Saved
        </div>
      )}

      {/* Star Button - pixel style */}
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setShowColorPicker(!showColorPicker)}
          className={`
            w-9 h-9 flex items-center justify-center
            border-2 border-pixel-border bg-white
            transition-all shadow-[2px_2px_0px_rgba(0,0,0,0.2)]
            hover:shadow-[3px_3px_0px_rgba(0,0,0,0.25)]
            hover:translate-x-[-1px] hover:translate-y-[-1px]
          `}
          title="Save Cropper settings to template"
        >
          {/* Pixel star icon */}
          <svg
            viewBox="0 0 16 16"
            className="w-5 h-5"
            fill={templateColor ? TEMPLATE_COLORS[templateColor].hex : 'none'}
            stroke={templateColor ? TEMPLATE_COLORS[templateColor].hex : '#9CA3AF'}
            strokeWidth="1"
          >
            <rect x="7" y="1" width="2" height="2" />
            <rect x="5" y="3" width="2" height="2" />
            <rect x="9" y="3" width="2" height="2" />
            <rect x="1" y="5" width="2" height="2" />
            <rect x="3" y="5" width="2" height="2" />
            <rect x="5" y="5" width="2" height="2" />
            <rect x="9" y="5" width="2" height="2" />
            <rect x="11" y="5" width="2" height="2" />
            <rect x="13" y="5" width="2" height="2" />
            <rect x="3" y="7" width="2" height="2" />
            <rect x="5" y="7" width="2" height="2" />
            <rect x="7" y="7" width="2" height="2" />
            <rect x="9" y="7" width="2" height="2" />
            <rect x="11" y="7" width="2" height="2" />
            <rect x="5" y="9" width="2" height="2" />
            <rect x="9" y="9" width="2" height="2" />
            <rect x="3" y="11" width="2" height="2" />
            <rect x="11" y="11" width="2" height="2" />
            <rect x="1" y="13" width="2" height="2" />
            <rect x="13" y="13" width="2" height="2" />
          </svg>
        </button>

        {/* Color Picker Dropdown - pixel style */}
        {showColorPicker && (
          <div
            ref={colorPickerRef}
            className="absolute right-0 top-full mt-2 z-[100] bg-white border-2 border-pixel-border shadow-[4px_4px_0px_rgba(0,0,0,0.3)] p-4"
          >
            <p className="pixel-body text-gray-500 mb-3 whitespace-nowrap">
              Save Cropper settings
            </p>
            <div className="flex gap-2">
              {TEMPLATE_COLOR_ORDER.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleSaveAll(color)}
                  className={`
                    w-8 h-8 transition-all
                    border-2 border-pixel-border
                    hover:shadow-[2px_2px_0px_rgba(0,0,0,0.3)]
                    hover:translate-x-[-1px] hover:translate-y-[-1px]
                    ${templateColor === color ? 'ring-2 ring-offset-1 ring-pixel-border' : ''}
                  `}
                  style={{
                    backgroundColor: TEMPLATE_COLORS[color].hex,
                  }}
                  title={TEMPLATE_COLORS[color].label}
                />
              ))}
              {/* Clear button - pixel style */}
              {templateColor && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200
                    flex items-center justify-center transition-all
                    border-2 border-pixel-border
                    hover:shadow-[2px_2px_0px_rgba(0,0,0,0.2)]"
                  title="Clear"
                >
                  {/* Pixel X icon */}
                  <svg className="w-3 h-3 text-gray-500" viewBox="0 0 12 12" fill="currentColor">
                    <rect x="2" y="3" width="2" height="2" />
                    <rect x="4" y="5" width="2" height="2" />
                    <rect x="6" y="5" width="2" height="2" />
                    <rect x="8" y="3" width="2" height="2" />
                    <rect x="2" y="7" width="2" height="2" />
                    <rect x="4" y="5" width="2" height="2" />
                    <rect x="8" y="7" width="2" height="2" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Details Toggle - pixel style */}
      <button
        type="button"
        onClick={onToggleDetails}
        className={`
          px-3 py-1.5 pixel-body transition-all
          border-2 border-pixel-border
          ${showDetails
            ? 'text-pixel-text shadow-[2px_2px_0px_rgba(0,0,0,0.3)]'
            : 'bg-white text-gray-500 hover:bg-gray-50 shadow-[2px_2px_0px_rgba(0,0,0,0.2)]'
          }
        `}
        style={showDetails ? { backgroundColor: 'var(--theme-color, #c0c0c0)' } : undefined}
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
