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
      {/* Previous button */}
      <button
        onClick={onPrev}
        disabled={currentIndex === 0}
        className="w-10 h-10 rounded-full bg-white/70 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all flex items-center justify-center"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Pagination dots/numbers */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-white/50 backdrop-blur-sm rounded-full">
        {totalImages <= 8 ? (
          Array.from({ length: totalImages }, (_, i) => (
            <button
              key={i}
              onClick={() => onGoTo(i)}
              className={`
                transition-all duration-200
                ${currentIndex === i
                  ? 'w-6 h-2 bg-gray-800 rounded-full'
                  : 'w-2 h-2 bg-gray-300 hover:bg-gray-400 rounded-full'
                }
              `}
              aria-label={`Go to image ${i + 1}`}
            />
          ))
        ) : (
          <span className="text-sm font-medium text-gray-600 px-2">
            <span className="text-gray-800">{currentIndex + 1}</span>
            <span className="mx-1">/</span>
            <span>{totalImages}</span>
          </span>
        )}
      </div>

      {/* Next button */}
      <button
        onClick={onNext}
        disabled={currentIndex === totalImages - 1}
        className="w-10 h-10 rounded-full bg-white/70 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all flex items-center justify-center"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
