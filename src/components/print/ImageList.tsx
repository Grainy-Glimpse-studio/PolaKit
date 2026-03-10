import type { PrintImage } from '@/types';

interface ImageListProps {
  images: PrintImage[];
  selectedImageId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

export function ImageList({
  images,
  selectedImageId,
  onSelect,
  onRemove,
}: ImageListProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin pr-1">
      {images.map((image, index) => (
        <div
          key={image.id}
          onClick={() => onSelect(image.id)}
          className={`
            group flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all
            ${selectedImageId === image.id
              ? 'bg-cyan-50 ring-2 ring-cyan-200'
              : 'hover:bg-gray-50'
            }
          `}
        >
          {/* Thumbnail with polaroid style */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-14 bg-white p-0.5 pb-2 rounded-sm shadow-sm">
              <img
                src={image.url}
                alt=""
                className="w-full h-full object-cover rounded-[1px]"
              />
            </div>
            {/* Index badge */}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-800 text-white text-[10px] font-medium rounded-full flex items-center justify-center shadow-sm">
              {index + 1}
            </div>
          </div>

          {/* File info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">
              {image.file.name.replace(/\.[^/.]+$/, '')}
            </p>
            <p className="text-xs text-gray-400">
              {(image.file.size / 1024).toFixed(0)} KB
            </p>
          </div>

          {/* Remove button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(image.id);
            }}
            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
