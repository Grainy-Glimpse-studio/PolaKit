interface ImageNavigationProps {
  currentIndex: number;
  totalImages: number;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
}

export function ImageNavigation({
  currentIndex,
  totalImages,
  onPrev,
  onNext,
  onGoTo,
}: ImageNavigationProps) {
  if (totalImages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-3">
      {/* Previous button - pixel style */}
      <button
        onClick={onPrev}
        disabled={currentIndex === 0}
        className="w-10 h-10 border-2 border-pixel-border bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-[3px_3px_0px_rgba(0,0,0,0.2)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.25)] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_rgba(0,0,0,0.2)] flex items-center justify-center transition-all"
      >
        {/* Pixel left arrow */}
        <svg className="w-5 h-5 text-pixel-text" viewBox="0 0 16 16" fill="currentColor">
          <rect x="8" y="3" width="2" height="2" />
          <rect x="6" y="5" width="2" height="2" />
          <rect x="4" y="7" width="2" height="2" />
          <rect x="6" y="9" width="2" height="2" />
          <rect x="8" y="11" width="2" height="2" />
        </svg>
      </button>

      {/* Pagination - pixel style */}
      <div className="flex items-center gap-1 px-3 py-2 border-2 border-pixel-border bg-white">
        {totalImages <= 8 ? (
          Array.from({ length: totalImages }, (_, i) => (
            <button
              key={i}
              onClick={() => onGoTo(i)}
              className={`
                transition-all
                ${currentIndex === i
                  ? 'w-4 h-4'
                  : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                }
                border border-pixel-border
              `}
              style={currentIndex === i ? { backgroundColor: 'var(--theme-color, #c0c0c0)' } : undefined}
              aria-label={`Go to image ${i + 1}`}
            />
          ))
        ) : (
          <span className="pixel-body text-pixel-text px-2">
            <span className="font-bold">{currentIndex + 1}</span>
            <span className="mx-1">/</span>
            <span>{totalImages}</span>
          </span>
        )}
      </div>

      {/* Next button - pixel style */}
      <button
        onClick={onNext}
        disabled={currentIndex === totalImages - 1}
        className="w-10 h-10 border-2 border-pixel-border bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-[3px_3px_0px_rgba(0,0,0,0.2)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.25)] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_rgba(0,0,0,0.2)] flex items-center justify-center transition-all"
      >
        {/* Pixel right arrow */}
        <svg className="w-5 h-5 text-pixel-text" viewBox="0 0 16 16" fill="currentColor">
          <rect x="6" y="3" width="2" height="2" />
          <rect x="8" y="5" width="2" height="2" />
          <rect x="10" y="7" width="2" height="2" />
          <rect x="8" y="9" width="2" height="2" />
          <rect x="6" y="11" width="2" height="2" />
        </svg>
      </button>
    </div>
  );
}
