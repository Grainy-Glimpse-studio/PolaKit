import type { Position } from '@/types';
import { Slider, Button } from '@/components/ui';

interface ImagePositionPanelProps {
  offset: Position;
  onOffsetChange: (offset: Position) => void;
  onReset: () => void;
}

export function ImagePositionPanel({
  offset,
  onOffsetChange,
  onReset,
}: ImagePositionPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          Drag on canvas or use sliders
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={offset.x === 0 && offset.y === 0}
        >
          Reset
        </Button>
      </div>

      <Slider
        label="X Offset"
        value={offset.x}
        min={-100}
        max={100}
        step={1}
        onChange={(value) => onOffsetChange({ ...offset, x: value })}
      />

      <Slider
        label="Y Offset"
        value={offset.y}
        min={-100}
        max={100}
        step={1}
        onChange={(value) => onOffsetChange({ ...offset, y: value })}
      />
    </div>
  );
}
