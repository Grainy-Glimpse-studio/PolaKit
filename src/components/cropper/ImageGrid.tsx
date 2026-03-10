import type { ProcessedImage } from '@/types';

interface ImageGridProps {
  images: ProcessedImage[];
  onRemove: (id: string) => void;
  onDownload?: (id: string) => void;
}

export function ImageGrid({ images, onRemove, onDownload }: ImageGridProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
      {images.map((image) => (
        <div
          key={image.id}
          className="group relative"
        >
          {/* Polaroid-style card */}
          <div className="bg-white p-2 pb-8 rounded-sm shadow-md hover:shadow-lg transition-shadow">
            <div className="relative aspect-square overflow-hidden rounded-sm bg-gray-100">
              <img
                src={image.processedUrl || image.originalUrl}
                alt=""
                className="w-full h-full object-cover"
              />

              {/* Processing overlay */}
              {image.status === 'processing' && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Error overlay */}
              {image.status === 'error' && (
                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                  <div className="bg-white/90 rounded-lg px-3 py-2 text-red-600 text-xs text-center max-w-[90%]">
                    {image.error || 'Error'}
                  </div>
                </div>
              )}

              {/* Hover actions for done status */}
              {image.status === 'done' && onDownload && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <button
                    onClick={() => onDownload(image.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium shadow-lg flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Save
                  </button>
                </div>
              )}

              {/* Status indicator */}
              <div className="absolute top-2 left-2">
                <span
                  className={`
                    w-2.5 h-2.5 rounded-full block shadow-sm
                    ${image.status === 'done' ? 'bg-green-400' : ''}
                    ${image.status === 'error' ? 'bg-red-400' : ''}
                    ${image.status === 'processing' ? 'bg-yellow-400 animate-pulse' : ''}
                    ${image.status === 'pending' ? 'bg-gray-300' : ''}
                  `}
                />
              </div>
            </div>

            {/* Remove button */}
            <button
              onClick={() => onRemove(image.id)}
              className="absolute top-1 right-1 w-6 h-6 bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filename label */}
          <div className="absolute bottom-2 left-2 right-2 text-center">
            <span className="handwritten text-sm text-gray-500 truncate block px-1">
              {image.file.name.replace(/\.[^/.]+$/, '')}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
