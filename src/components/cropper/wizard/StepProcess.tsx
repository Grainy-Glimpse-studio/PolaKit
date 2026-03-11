import type { ProcessedImage } from '@/types';
import { Button } from '@/components/ui';
import { ImageGrid } from '../ImageGrid';
import { ProcessingProgress } from '../ProcessingProgress';
import { WizardNavigation } from './WizardNavigation';

interface StepProcessProps {
  images: ProcessedImage[];
  isProcessing: boolean;
  progress: number;
  cvReady: boolean;
  exporting: boolean;
  onBack: () => void;
  onProcess: () => void;
  onDownloadSingle: (id: string) => void;
  onDownloadAll: () => void;
  onRemoveImage: (id: string) => void;
}

export function StepProcess({
  images,
  isProcessing,
  progress,
  cvReady,
  exporting,
  onBack,
  onProcess,
  onDownloadSingle,
  onDownloadAll,
  onRemoveImage,
}: StepProcessProps) {
  const pendingCount = images.filter((img) => img.status === 'pending').length;
  const processedCount = images.filter((img) => img.status === 'done').length;
  const hasProcessedImages = processedCount > 0;
  const allProcessed = pendingCount === 0 && processedCount > 0;

  return (
    <div className="space-y-6">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-1">
            Process & Download
          </h2>
          <p className="text-sm text-gray-500">
            {allProcessed
              ? 'All images processed! Download your photos below.'
              : 'Process your polaroids and download the results'}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {pendingCount > 0 && (
            <Button
              variant="primary"
              onClick={onProcess}
              disabled={!cvReady || isProcessing}
              loading={isProcessing}
              icon={
                !isProcessing && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              }
            >
              {isProcessing ? 'Processing...' : `Process ${pendingCount} ${pendingCount === 1 ? 'Image' : 'Images'}`}
            </Button>
          )}

          {hasProcessedImages && (
            <Button
              variant="secondary"
              onClick={onDownloadAll}
              loading={exporting}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              }
            >
              Download All (ZIP)
            </Button>
          )}
        </div>

        {/* Progress indicator */}
        {(isProcessing || hasProcessedImages) && (
          <div className="mb-6">
            <ProcessingProgress
              progress={progress}
              isProcessing={isProcessing}
              totalImages={images.length}
              processedCount={processedCount}
            />
          </div>
        )}

        {/* Results grid */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            {allProcessed ? 'Processed Images' : 'Images'}
          </h3>
          <ImageGrid
            images={images}
            onRemove={onRemoveImage}
            onDownload={onDownloadSingle}
          />
        </div>

        {/* Navigation */}
        <WizardNavigation
          onBack={onBack}
          backDisabled={isProcessing}
          showNext={false}
        />
      </div>

      {/* Download info */}
      {hasProcessedImages && (
        <div className="bg-green-50/50 rounded-xl p-4 border border-green-100">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-green-800">Ready to download</h4>
              <p className="text-sm text-green-700/80 mt-1">
                Click on individual images to download them separately, or use the "Download All (ZIP)" button to get all processed images in a single archive.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
