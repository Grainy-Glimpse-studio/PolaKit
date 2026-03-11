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

  // Close popover when clicking outside
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
          w-6 h-6 flex items-center justify-center
          border-2 border-pixel-border
          transition-all hover:bg-gray-100
          ${assignedColor ? 'bg-gray-50' : 'bg-white'}
        `}
        title={assignedColor ? `Template: ${TEMPLATE_COLORS[assignedColor].label}` : 'Add to template'}
      >
        {/* Pixel star icon */}
        <svg
          viewBox="0 0 16 16"
          className="w-4 h-4"
          fill={assignedColor ? TEMPLATE_COLORS[assignedColor].hex : 'none'}
          stroke={assignedColor ? TEMPLATE_COLORS[assignedColor].hex : '#2a2a2a'}
          strokeWidth="1"
        >
          <path d="M8 1L10 6H15L11 9L13 15L8 11L3 15L5 9L1 6H6L8 1Z" />
        </svg>
      </button>

      {/* Color picker popover - pixel style */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2
            bg-white border-2 border-pixel-border p-2
            shadow-[4px_4px_0px_rgba(0,0,0,0.3)]"
        >
          <div className="flex gap-1">
            {TEMPLATE_COLOR_ORDER.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorSelect(color)}
                className={`
                  w-5 h-5 border-2 border-pixel-border
                  transition-all hover:scale-110
                  ${assignedColor === color ? 'ring-2 ring-offset-1' : ''}
                `}
                style={{
                  backgroundColor: TEMPLATE_COLORS[color].hex,
                  ...(assignedColor === color ? { '--tw-ring-color': 'var(--theme-color, #c0c0c0)' } as React.CSSProperties : {}),
                }}
                title={TEMPLATE_COLORS[color].label}
              />
            ))}
            {assignedColor && (
              <>
                <div className="w-px bg-pixel-border mx-0.5" />
                <button
                  type="button"
                  onClick={handleClear}
                  className="w-5 h-5 border-2 border-pixel-border bg-gray-100 hover:bg-gray-200
                    flex items-center justify-center"
                  title="Remove from template"
                >
                  <span className="text-pixel-text text-xs font-bold">X</span>
                </button>
              </>
            )}
          </div>
          {/* Pixel arrow */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-l-2 border-t-2 border-pixel-border rotate-45" />
        </div>
      )}
    </div>
  );
}
