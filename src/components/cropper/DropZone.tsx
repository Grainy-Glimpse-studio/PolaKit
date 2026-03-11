import { useCallback, useState, type DragEvent } from 'react';

interface DropZoneProps {
  onFilesSelect: (files: File[]) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function DropZone({ onFilesSelect, disabled, compact }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter((f) => f.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        onFilesSelect(imageFiles);
      }
    },
    [disabled, onFilesSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFilesSelect(Array.from(files));
      }
      e.target.value = '';
    },
    [onFilesSelect]
  );

  if (compact) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative p-3 text-center transition-all
          border-2 border-dashed border-pixel-border
          ${isDragging
            ? 'bg-gray-100'
            : 'bg-white hover:bg-gray-50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        style={isDragging ? { backgroundColor: 'color-mix(in srgb, var(--theme-color, #c0c0c0) 15%, white)' } : undefined}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="flex items-center justify-center gap-2 text-pixel-text">
          {/* Pixel plus icon */}
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <rect x="7" y="2" width="2" height="12" />
            <rect x="2" y="7" width="12" height="2" />
          </svg>
          <span className="pixel-body">Add more</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative transition-all
        ${isDragging ? 'scale-[1.01]' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group'}
      `}
    >
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
      />

      {/* Pixel-style Polaroid drop area */}
      <div
        className={`
          bg-white p-3 pb-10 border-3 border-pixel-border
          shadow-[4px_4px_0px_rgba(0,0,0,0.2)]
          transition-all
          ${isDragging ? 'shadow-[6px_6px_0px_rgba(0,0,0,0.3)]' : 'group-hover:shadow-[6px_6px_0px_rgba(0,0,0,0.25)]'}
        `}
      >
        {/* Image area */}
        <div
          className={`
            aspect-[4/3] flex flex-col items-center justify-center
            border-2 border-dashed border-pixel-border
            transition-all
            ${isDragging
              ? ''
              : 'bg-gray-50 group-hover:bg-gray-100'}
          `}
          style={isDragging ? {
            backgroundColor: 'color-mix(in srgb, var(--theme-color, #c0c0c0) 15%, white)',
            borderColor: 'var(--theme-color, #c0c0c0)'
          } : undefined}
        >
          {/* Pixel camera icon */}
          <div
            className={`
              w-14 h-14 flex items-center justify-center mb-3
              border-2 border-pixel-border
              transition-all
              ${isDragging
                ? 'text-pixel-text'
                : 'bg-gray-100 text-pixel-text'}
            `}
            style={isDragging ? { backgroundColor: 'var(--theme-color, #c0c0c0)' } : undefined}
          >
            {/* 8-bit camera icon */}
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="7" width="18" height="13" />
              <rect x="8" y="4" width="8" height="3" />
              <rect x="9" y="10" width="6" height="6" fill="white" />
              <rect x="10" y="11" width="4" height="4" fill="currentColor" />
            </svg>
          </div>

          <p className="pixel-body font-bold transition-colors text-pixel-text">
            {isDragging ? 'Drop photos here' : 'Drop photos here'}
          </p>

          <p className="pixel-body text-gray-500 mt-1">
            or click to browse
          </p>

          {/* Pixel loading dots when dragging */}
          {isDragging && (
            <div className="flex gap-1 mt-3">
              <span className="w-2 h-2 animate-pulse" style={{ backgroundColor: 'var(--theme-color, #c0c0c0)', animationDelay: '0ms' }} />
              <span className="w-2 h-2 animate-pulse" style={{ backgroundColor: 'var(--theme-color, #c0c0c0)', animationDelay: '150ms' }} />
              <span className="w-2 h-2 animate-pulse" style={{ backgroundColor: 'var(--theme-color, #c0c0c0)', animationDelay: '300ms' }} />
            </div>
          )}
        </div>
      </div>

      {/* Pixel label */}
      <div className="absolute bottom-2 left-0 right-0 text-center">
        <span className="pixel-body text-gray-400 text-sm">
          JPG, PNG, WebP
        </span>
      </div>
    </div>
  );
}
