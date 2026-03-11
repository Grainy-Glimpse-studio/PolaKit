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
        {/* Template Control Bar - pixel style */}
        <div className="flex items-center justify-end gap-3 mb-4">
          {/* Saved indicator - pixel style */}
          {moduleColor && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 pixel-body text-sm border-2"
              style={{
                borderColor: TEMPLATE_COLORS[moduleColor].hex,
                backgroundColor: `${TEMPLATE_COLORS[moduleColor].hex}15`,
                color: TEMPLATE_COLORS[moduleColor].hex
              }}
            >
              <div
                className="w-2 h-2"
                style={{ backgroundColor: TEMPLATE_COLORS[moduleColor].hex }}
              />
              Saved
            </div>
          )}

          {/* Star Button - Save All - pixel style */}
          <div className="relative">
            <button
              ref={starButtonRef}
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-8 h-8 flex items-center justify-center border-2 border-pixel-border bg-white hover:bg-gray-50 transition-all"
              title="Save to template"
            >
              {/* Pixel star */}
              <svg
                viewBox="0 0 16 16"
                className="w-5 h-5"
                fill={moduleColor ? TEMPLATE_COLORS[moduleColor].hex : 'none'}
                stroke={moduleColor ? TEMPLATE_COLORS[moduleColor].hex : '#2a2a2a'}
                strokeWidth="1"
              >
                <path d="M8 1L10 6H15L11 9L13 15L8 11L3 15L5 9L1 6H6L8 1Z" />
              </svg>
            </button>

            {/* Color Picker Dropdown - pixel style */}
            {showColorPicker && (
              <div
                ref={colorPickerRef}
                className="absolute right-0 top-full mt-2 z-[100] bg-white border-2 border-pixel-border p-3 shadow-[4px_4px_0px_rgba(0,0,0,0.3)]"
              >
                <p className="pixel-body text-gray-500 text-sm mb-2 whitespace-nowrap">
                  Save {moduleName} settings
                </p>
                <div className="flex gap-1">
                  {TEMPLATE_COLOR_ORDER.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleSaveAll(color)}
                      className={`
                        w-6 h-6 border-2 border-pixel-border transition-all
                        hover:scale-110
                        ${moduleColor === color ? 'ring-2 ring-offset-1' : ''}
                      `}
                      style={{
                        backgroundColor: TEMPLATE_COLORS[color].hex,
                        ...(moduleColor === color ? { '--tw-ring-color': 'var(--theme-color, #c0c0c0)' } as React.CSSProperties : {}),
                      }}
                      title={TEMPLATE_COLORS[color].label}
                    />
                  ))}
                  {/* Clear button */}
                  {moduleColor && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="w-6 h-6 border-2 border-pixel-border bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all hover:scale-110"
                      title="Clear"
                    >
                      <span className="text-pixel-text text-xs font-bold">X</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Details Toggle - pixel style */}
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className={`
              px-3 py-1.5 pixel-body text-sm border-2 border-pixel-border transition-all
              ${showDetails
                ? 'text-pixel-text'
                : 'bg-white text-pixel-text hover:bg-gray-50'
              }
            `}
            style={showDetails ? { backgroundColor: 'var(--theme-color, #c0c0c0)' } : undefined}
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
