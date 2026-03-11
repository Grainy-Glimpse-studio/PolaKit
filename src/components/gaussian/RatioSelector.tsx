import type { AspectRatio } from '@/store/gaussian-store';
import { ASPECT_RATIOS } from '@/lib/gaussian/presets';
import { TemplateStar } from '@/components/template';

interface RatioSelectorProps {
  value: AspectRatio;
  customW: number;
  customH: number;
  onChange: (ratio: AspectRatio) => void;
  onCustomChange: (w: number, h: number) => void;
}

// Pixel-style visual representation of aspect ratios
function PixelRatioIcon({ ratio }: { ratio: string }) {
  const [w, h] = ratio === 'custom' ? [4, 3] : ratio.split(':').map(Number);
  const maxSize = 20;
  const scale = maxSize / Math.max(w, h);
  const width = Math.round(w * scale);
  const height = Math.round(h * scale);

  return (
    <div
      className="border-2 border-current"
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
}

export function RatioSelector({
  value,
  customW,
  customH,
  onChange,
  onCustomChange,
}: RatioSelectorProps) {
  const ratios = Object.entries(ASPECT_RATIOS) as [AspectRatio, typeof ASPECT_RATIOS['1:1']][];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="pixel-body text-pixel-text">Aspect Ratio</span>
        <TemplateStar settingPath="gaussian.ratio" currentValue={value} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {ratios.map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`
              pixel-toggle
              flex flex-col items-center gap-1.5 px-2 py-2.5
              ${value === key ? 'active' : ''}
            `}
            data-active={value === key}
          >
            <PixelRatioIcon ratio={key} />
            <span className="pixel-body text-sm">{label}</span>
          </button>
        ))}
      </div>

      {value === 'custom' && (
        <div className="flex items-center gap-2 p-3 border-2 border-pixel-border bg-gray-50">
          <input
            type="number"
            value={customW}
            onChange={(e) => onCustomChange(Number(e.target.value), customH)}
            min={1}
            max={20}
            className="w-14 px-2 py-1.5 pixel-body bg-white border-2 border-pixel-border text-center pixel-input"
          />
          <span className="pixel-body text-pixel-text font-bold">:</span>
          <input
            type="number"
            value={customH}
            onChange={(e) => onCustomChange(customW, Number(e.target.value))}
            min={1}
            max={20}
            className="w-14 px-2 py-1.5 pixel-body bg-white border-2 border-pixel-border text-center pixel-input"
          />
        </div>
      )}
    </div>
  );
}
