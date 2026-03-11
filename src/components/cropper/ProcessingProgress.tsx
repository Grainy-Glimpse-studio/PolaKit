interface ProcessingProgressProps {
  progress: number;
  isProcessing: boolean;
  totalImages: number;
  processedCount: number;
}

export function ProcessingProgress({
  progress,
  isProcessing,
  totalImages,
  processedCount,
}: ProcessingProgressProps) {
  if (!isProcessing && processedCount === 0) {
    return null;
  }

  const isComplete = !isProcessing && processedCount === totalImages;

  return (
    <div className={`
      p-4 border-2 border-pixel-border transition-colors
      ${isComplete
        ? 'bg-green-50 shadow-[3px_3px_0px_rgba(0,0,0,0.2)]'
        : 'bg-white shadow-[3px_3px_0px_rgba(0,0,0,0.2)]'
      }
    `}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {isProcessing ? (
            <div className="w-8 h-8 bg-rose-100 border-2 border-pixel-border flex items-center justify-center">
              {/* Pixel loading animation */}
              <span className="flex gap-0.5">
                <span className="w-1.5 h-1.5 bg-pixel-rose animate-pulse" />
                <span className="w-1.5 h-1.5 bg-pixel-rose animate-pulse" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-pixel-rose animate-pulse" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-green-100 border-2 border-pixel-border flex items-center justify-center">
              {/* Pixel checkmark */}
              <svg className="w-4 h-4 text-green-600" viewBox="0 0 16 16" fill="currentColor">
                <rect x="2" y="7" width="2" height="2" />
                <rect x="4" y="9" width="2" height="2" />
                <rect x="6" y="7" width="2" height="2" />
                <rect x="8" y="5" width="2" height="2" />
                <rect x="10" y="3" width="2" height="2" />
              </svg>
            </div>
          )}
          <div>
            <p className="pixel-body font-bold text-pixel-text">
              {isProcessing ? 'Processing images...' : 'All done!'}
            </p>
            <p className="pixel-body text-gray-500">
              {processedCount} of {totalImages} completed
            </p>
          </div>
        </div>

        <div className="pixel-body text-xl text-pixel-text font-bold" style={{ color: 'var(--theme-color)' }}>
          {Math.round(progress)}%
        </div>
      </div>

      {/* Pixel-style progress bar */}
      <div className="relative h-4 bg-gray-100 border-2 border-pixel-border overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 transition-all duration-300"
          style={{
            width: `${progress}%`,
            backgroundColor: isProcessing ? 'var(--theme-color, #fdc800)' : '#4ade80'
          }}
        />
        {/* Pixel segments overlay */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 border-r border-pixel-border/20 last:border-r-0"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
