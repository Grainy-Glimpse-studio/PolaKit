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
      rounded-2xl p-4 transition-colors
      ${isComplete
        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100'
        : 'bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm'
      }
    `}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {isProcessing ? (
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          <div>
            <p className="font-medium text-gray-800">
              {isProcessing ? 'Processing images...' : 'All done!'}
            </p>
            <p className="text-sm text-gray-500">
              {processedCount} of {totalImages} completed
            </p>
          </div>
        </div>

        <div className="handwritten text-2xl text-gray-400">
          {Math.round(progress)}%
        </div>
      </div>

      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`
            absolute inset-y-0 left-0 rounded-full transition-all duration-300
            ${isProcessing
              ? 'bg-gradient-to-r from-rose-400 to-orange-400'
              : 'bg-gradient-to-r from-green-400 to-emerald-400'
            }
          `}
          style={{ width: `${progress}%` }}
        />
        {isProcessing && (
          <div
            className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1.5s_infinite]"
            style={{
              left: `${Math.max(0, progress - 10)}%`,
            }}
          />
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
