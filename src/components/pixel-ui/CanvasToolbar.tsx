import { useState } from 'react';
import { PixelIconButton } from './PixelButton';

// Pixel-style color palette (coordinated with cream theme)
const PALETTE_COLORS = [
  '#2a2a2a', // black
  '#ffffff', // white
  '#8b5cf6', // violet
  '#f43f5e', // rose
  '#06b6d4', // cyan
  '#fbbf24', // amber
  '#22c55e', // green
  '#f97316', // orange
  '#ec4899', // pink
  '#6366f1', // indigo
];

const BRUSH_SIZES = [1, 2, 4];

interface CanvasToolbarProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  isEraser: boolean;
  onEraserToggle: () => void;
  onClear: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
}

export function CanvasToolbar({
  selectedColor,
  onColorChange,
  brushSize,
  onBrushSizeChange,
  isEraser,
  onEraserToggle,
  onClear,
  soundEnabled,
  onSoundToggle,
}: CanvasToolbarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-40">
      {/* Collapse/Expand button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="
          absolute -top-3 -right-3 w-8 h-8
          bg-pixel-gray text-pixel-text
          border-2 border-pixel-border
          flex items-center justify-center
          cursor-pointer z-10
          hover:brightness-110
          transition-all
        "
        title={isCollapsed ? 'Expand toolbar' : 'Collapse toolbar'}
      >
        <svg
          className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isCollapsed ? 'M19 9l-7 7-7-7' : 'M5 15l7-7 7 7'}
          />
        </svg>
      </button>

      {/* Toolbar panel */}
      <div
        className={`
          pixel-panel p-3 transition-all duration-200
          ${isCollapsed ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}
        `}
      >
        <div className="space-y-3">
          {/* Color palette */}
          <div>
            <div className="pixel-body text-pixel-text text-sm mb-2">Color</div>
            <div className="grid grid-cols-5 gap-1.5">
              {PALETTE_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => onColorChange(color)}
                  className={`
                    pixel-swatch w-6 h-6
                    ${selectedColor === color && !isEraser ? 'active' : ''}
                  `}
                  style={{ backgroundColor: color }}
                  title={color}
                  data-active={selectedColor === color && !isEraser}
                />
              ))}
            </div>
          </div>

          {/* Brush size */}
          <div>
            <div className="pixel-body text-pixel-text text-sm mb-2">Brush</div>
            <div className="flex gap-1.5">
              {BRUSH_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => onBrushSizeChange(size)}
                  className={`
                    pixel-toggle w-8 h-8
                    flex items-center justify-center
                    ${brushSize === size ? 'active' : ''}
                  `}
                  title={`${size}px brush`}
                  data-active={brushSize === size}
                >
                  <div
                    className={`${brushSize === size ? 'bg-pixel-text' : 'bg-pixel-text'}`}
                    style={{
                      width: `${size * 2 + 2}px`,
                      height: `${size * 2 + 2}px`,
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div className="flex gap-1">
            {/* Eraser */}
            <PixelIconButton
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              }
              label="Eraser"
              size="sm"
              active={isEraser}
              onClick={onEraserToggle}
            />

            {/* Clear */}
            <PixelIconButton
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              }
              label="Clear canvas"
              size="sm"
              onClick={onClear}
            />

            {/* Sound toggle */}
            <PixelIconButton
              icon={
                soundEnabled ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                    />
                  </svg>
                )
              }
              label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
              size="sm"
              active={soundEnabled}
              onClick={onSoundToggle}
            />
          </div>
        </div>
      </div>

      {/* Collapsed indicator */}
      {isCollapsed && (
        <div className="pixel-panel p-2">
          <svg className="w-5 h-5 text-pixel-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
