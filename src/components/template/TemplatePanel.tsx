import { useState, useRef, useEffect, createContext, useContext, type ReactNode } from 'react';
import type { TemplateColor, SettingPath } from '@/types/template';
import { TEMPLATE_COLORS, TEMPLATE_COLOR_ORDER } from '@/types/template';
import { useTemplateStore } from '@/store/template-store';

// Context for controlling individual star visibility
interface TemplatePanelContextValue {
  showIndividualStars: boolean;
}

export const TemplatePanelContext = createContext<TemplatePanelContextValue>({ showIndividualStars: false });

export function useTemplatePanelContext() {
  return useContext(TemplatePanelContext);
}

interface TemplateSettingConfig {
  path: SettingPath;
  value: unknown;
}

interface TemplatePanelProps {
  settings: TemplateSettingConfig[];
  moduleName: string;
  children: ReactNode;
}

export function TemplatePanel({ settings, moduleName, children }: TemplatePanelProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const starButtonRef = useRef<HTMLButtonElement>(null);

  const { assignSetting, getSettingColor, unassignSetting } = useTemplateStore();

  // Close color picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showColorPicker &&
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target as Node) &&
        starButtonRef.current &&
        !starButtonRef.current.contains(event.target as Node)
      ) {
        setShowColorPicker(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColorPicker]);

  // Check if any setting in this module is assigned to a template
  const getModuleTemplateColor = (): TemplateColor | null => {
    for (const setting of settings) {
      const color = getSettingColor(setting.path);
      if (color) return color;
    }
    return null;
  };

  const moduleColor = getModuleTemplateColor();

  // Save all settings to a template color
  const handleSaveAll = (color: TemplateColor) => {
    for (const setting of settings) {
      assignSetting(setting.path, color, setting.value);
    }
    setShowColorPicker(false);
  };

  // Clear all settings from templates
  const handleClearAll = () => {
    for (const setting of settings) {
      unassignSetting(setting.path);
    }
    setShowColorPicker(false);
  };

  return (
    <TemplatePanelContext.Provider value={{ showIndividualStars: showDetails }}>
      <div>
        {/* Template Control Bar */}
        <div className="flex items-center justify-end gap-3 mb-4">
          {/* Saved indicator */}
          {moduleColor && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${TEMPLATE_COLORS[moduleColor].hex}15`,
                color: TEMPLATE_COLORS[moduleColor].hex
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: TEMPLATE_COLORS[moduleColor].hex }}
              />
              Saved
            </div>
          )}

          {/* Star Button - Save All */}
          <div className="relative">
            <button
              ref={starButtonRef}
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className={`
                w-9 h-9 flex items-center justify-center rounded-lg
                transition-all duration-150 hover:scale-105
                bg-white shadow-sm border border-gray-200 hover:border-gray-300
              `}
              title="Save to template"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5"
                fill={moduleColor ? TEMPLATE_COLORS[moduleColor].hex : 'none'}
                stroke={moduleColor ? TEMPLATE_COLORS[moduleColor].hex : '#9CA3AF'}
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
                  Save {moduleName} settings
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
                        ${moduleColor === color ? 'ring-2 ring-offset-2' : ''}
                      `}
                      style={{
                        backgroundColor: TEMPLATE_COLORS[color].hex,
                      }}
                      title={TEMPLATE_COLORS[color].label}
                    />
                  ))}
                  {/* Clear button */}
                  {moduleColor && (
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
            onClick={() => setShowDetails(!showDetails)}
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

        {/* Settings Content */}
        {children}
      </div>
    </TemplatePanelContext.Provider>
  );
}
