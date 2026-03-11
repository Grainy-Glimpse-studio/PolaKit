import { useNavigate } from 'react-router-dom';
import type { TemplateColor } from '@/types/template';
import { TEMPLATE_COLORS, TEMPLATE_COLOR_ORDER } from '@/types/template';
import { useTemplateStore } from '@/store/template-store';

interface TemplateColorBarProps {
  className?: string;
}

export function TemplateColorBar({ className = '' }: TemplateColorBarProps) {
  const navigate = useNavigate();
  const { hasTemplateSettings, getActiveTemplateColors } = useTemplateStore();

  const activeColors = getActiveTemplateColors();

  // Don't show if no templates are configured
  if (activeColors.length === 0) {
    return null;
  }

  const handleColorClick = (color: TemplateColor) => {
    if (hasTemplateSettings(color)) {
      navigate(`/quick?color=${color}`);
    }
  };

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <span className="text-sm text-white/40 mr-2">Quick Process</span>
      {TEMPLATE_COLOR_ORDER.map((color) => {
        const hasSettings = hasTemplateSettings(color);
        const colorConfig = TEMPLATE_COLORS[color];

        return (
          <button
            key={color}
            onClick={() => handleColorClick(color)}
            disabled={!hasSettings}
            className={`
              w-8 h-8 rounded-full transition-all duration-200
              ${hasSettings
                ? 'cursor-pointer hover:scale-110 hover:shadow-lg'
                : 'cursor-not-allowed opacity-30'
              }
            `}
            style={{
              backgroundColor: hasSettings ? colorConfig.hex : 'transparent',
              border: hasSettings ? 'none' : `2px solid ${colorConfig.hex}`,
              boxShadow: hasSettings ? `0 0 12px ${colorConfig.hex}50` : 'none',
            }}
            title={hasSettings ? `Process with ${colorConfig.label} template` : `No ${colorConfig.label} template`}
          />
        );
      })}
    </div>
  );
}
