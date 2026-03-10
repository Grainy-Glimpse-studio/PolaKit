import type { AspectRatio } from '@/store/gaussian-store';
import { ASPECT_RATIOS } from '@/lib/gaussian/presets';

interface RatioSelectorProps {
  value: AspectRatio;
  customW: number;
  customH: number;
  onChange: (ratio: AspectRatio) => void;
  onCustomChange: (w: number, h: number) => void;
}

// Visual representation of aspect ratios
function RatioIcon({ ratio }: { ratio: string }) {
  const [w, h] = ratio === 'custom' ? [4, 3] : ratio.split(':').map(Number);
  const maxSize = 24;
  const scale = maxSize / Math.max(w, h);
  const width = w * scale;
  const height = h * scale;

  return (
    <div
      className="border-2 border-current rounded-sm"
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
      <div className="grid grid-cols-3 gap-2">
        {ratios.map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`
              flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-xl transition-all
              ${value === key
                ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }
            `}
          >
            <RatioIcon ratio={key} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>

      {value === 'custom' && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
          <input
            type="number"
            value={customW}
            onChange={(e) => onCustomChange(Number(e.target.value), customH)}
            min={1}
            max={20}
            className="w-14 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-center text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
          <span className="text-gray-400 font-medium">:</span>
          <input
            type="number"
            value={customH}
            onChange={(e) => onCustomChange(customW, Number(e.target.value))}
            min={1}
            max={20}
            className="w-14 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-center text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
        </div>
      )}
    </div>
  );
}
