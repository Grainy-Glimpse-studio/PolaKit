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
          relative rounded-xl p-4 text-center transition-all duration-200
          border-2 border-dashed
          ${isDragging
            ? 'border-gray-400 bg-gray-50'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm">Add more photos</span>
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
        relative rounded-2xl transition-all duration-300 overflow-hidden
        ${isDragging ? 'scale-[1.02]' : ''}
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

      {/* Polaroid-style drop area */}
      <div
        className={`
          bg-white p-3 pb-12 shadow-lg transition-all duration-300
          ${isDragging ? 'shadow-xl' : 'group-hover:shadow-xl'}
        `}
      >
        {/* Image area with gradient */}
        <div
          className={`
            aspect-[4/3] rounded-sm flex flex-col items-center justify-center
            transition-all duration-300
            ${isDragging
              ? 'bg-gradient-to-br from-violet-100 to-purple-100'
              : 'bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-violet-50 group-hover:to-purple-50'}
          `}
        >
          {/* Camera icon */}
          <div
            className={`
              w-16 h-16 rounded-full flex items-center justify-center mb-4
              transition-all duration-300
              ${isDragging
                ? 'bg-violet-200 text-violet-600'
                : 'bg-gray-200 text-gray-400 group-hover:bg-violet-100 group-hover:text-violet-500'}
            `}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>

          <p className={`
            text-base font-medium transition-colors duration-300
            ${isDragging ? 'text-violet-600' : 'text-gray-500 group-hover:text-violet-600'}
          `}>
            {isDragging ? 'Drop your photos here' : 'Drop photos here'}
          </p>

          <p className="text-sm text-gray-400 mt-1">
            or click to browse
          </p>

          {/* Animated dots when dragging */}
          {isDragging && (
            <div className="flex gap-1 mt-4">
              <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>
      </div>

      {/* Handwritten label */}
      <div className="absolute bottom-3 left-0 right-0 text-center">
        <span className="handwritten text-lg text-gray-400">
          JPG, PNG, WebP
        </span>
      </div>
    </div>
  );
}
