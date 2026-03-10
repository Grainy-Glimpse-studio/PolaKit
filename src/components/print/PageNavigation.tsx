interface PageNavigationProps {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onGoToPage: (page: number) => void;
}

export function PageNavigation({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  onGoToPage,
}: PageNavigationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-3">
      {/* Previous button */}
      <button
        onClick={onPrevPage}
        disabled={currentPage === 0}
        className="w-10 h-10 rounded-full bg-white/70 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all flex items-center justify-center"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page indicators */}
      <div className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full">
        {totalPages <= 6 ? (
          Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => onGoToPage(i)}
              className={`
                w-8 h-8 rounded-full text-sm font-medium transition-all
                ${currentPage === i
                  ? 'bg-gray-800 text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }
              `}
            >
              {i + 1}
            </button>
          ))
        ) : (
          <>
            <span className="text-sm font-medium text-gray-400">Page</span>
            <span className="text-sm font-bold text-gray-800">{currentPage + 1}</span>
            <span className="text-sm text-gray-400">of</span>
            <span className="text-sm font-medium text-gray-600">{totalPages}</span>
          </>
        )}
      </div>

      {/* Next button */}
      <button
        onClick={onNextPage}
        disabled={currentPage === totalPages - 1}
        className="w-10 h-10 rounded-full bg-white/70 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all flex items-center justify-center"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
