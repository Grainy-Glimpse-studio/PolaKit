import { useState, useRef, useEffect } from 'react';
import type { SettingPath, TemplateColor } from '@/types/template';
import { TEMPLATE_COLORS, TEMPLATE_COLOR_ORDER } from '@/types/template';
import { useTemplateStore } from '@/store/template-store';
import { useTemplatePanelContext } from './TemplatePanel';

interface TemplateStarProps {
  settingPath: SettingPath;
  currentValue: unknown;
}

export function TemplateStar({ settingPath, currentValue }: TemplateStarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { getSettingColor, assignSetting, unassignSetting } = useTemplateStore();
  const { showIndividualStars } = useTemplatePanelContext();
  const assignedColor = getSettingColor(settingPath);

  // Close popover when clicking outside - MUST be before any conditional returns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Hide if individual stars are not shown
  if (!showIndividualStars) {
    return null;
  }

  const handleColorSelect = (color: TemplateColor) => {
    assignSetting(settingPath, color, currentValue);
    setIsOpen(false);
  };

  const handleClear = () => {
    unassignSetting(settingPath);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-flex">
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        type="button"
        className={`
          w-7 h-7 flex items-center justify-center rounded-full
          transition-all duration-150 hover:scale-110 hover:bg-gray-100
          ${assignedColor ? 'bg-gray-50' : 'bg-transparent'}
        `}
        title={assignedColor ? `Template: ${TEMPLATE_COLORS[assignedColor].label}` : 'Add to template'}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill={assignedColor ? TEMPLATE_COLORS[assignedColor].hex : 'none'}
          stroke={assignedColor ? TEMPLATE_COLORS[assignedColor].hex : '#6B7280'}
          strokeWidth="1.5"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </button>

      {/* Color picker popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2
            bg-white rounded-lg shadow-lg border border-gray-200 p-2
            animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex gap-1.5">
            {TEMPLATE_COLOR_ORDER.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorSelect(color)}
                className={`
                  w-6 h-6 rounded-full transition-all duration-150
                  hover:scale-110 hover:ring-2 hover:ring-offset-1
                  ${assignedColor === color ? 'ring-2 ring-offset-1' : ''}
                `}
                style={{
                  backgroundColor: TEMPLATE_COLORS[color].hex,
                }}
                title={TEMPLATE_COLORS[color].label}
              />
            ))}
            {assignedColor && (
              <>
                <div className="w-px bg-gray-200 mx-0.5" />
                <button
                  type="button"
                  onClick={handleClear}
                  className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200
                    flex items-center justify-center transition-colors"
                  title="Remove from template"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-3.5 h-3.5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </>
            )}
          </div>
          {/* Arrow */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-gray-200 rotate-45" />
        </div>
      )}
    </div>
  );
}
