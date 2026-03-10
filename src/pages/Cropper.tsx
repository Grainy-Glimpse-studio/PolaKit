import { useImageProcessor } from '@/hooks/useImageProcessor';
import { useExport } from '@/hooks/useExport';
import {
  DropZone,
  ImageGrid,
  ProcessingProgress,
  NamingOptions,
} from '@/components/cropper';
import { Button, PageLayout, Panel } from '@/components/ui';

export function Cropper() {
  const {
    cvReady,
    cvLoading,
    cvError,
    images,
    settings,
    isProcessing,
    progress,
    addImages,
    removeImage,
    clearImages,
    updateSettings,
    processAllImages,
  } = useImageProcessor();

  const { exportAsZip, downloadSingle, hasProcessedImages, exporting } = useExport();

  const pendingCount = images.filter((img) => img.status === 'pending').length;
  const processedCount = images.filter((img) => img.status === 'done').length;

  const headerActions = (
    <>
      {images.length > 0 && (
        <Button variant="ghost" size="sm" onClick={clearImages}>
          Clear All
        </Button>
      )}
      {pendingCount > 0 && (
        <Button
          variant="primary"
          size="sm"
          onClick={processAllImages}
          disabled={!cvReady || isProcessing}
          loading={isProcessing}
        >
          {isProcessing ? 'Processing...' : `Process ${pendingCount} Images`}
        </Button>
      )}
      {hasProcessedImages && (
        <Button
          variant="secondary"
          size="sm"
          onClick={exportAsZip}
          loading={exporting}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          }
        >
          Download ZIP
        </Button>
      )}
    </>
  );

  return (
    <PageLayout
      title="Polaroid Cropper"
      subtitle="Remove borders & fix perspective"
      headerActions={headerActions}
      accentColor="rose"
    >
      {/* OpenCV Loading State */}
      {cvLoading && (
        <div className="mb-6">
          <Panel>
            <div className="flex items-center justify-center gap-3 py-4">
              <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-600">Loading image processor...</span>
            </div>
          </Panel>
        </div>
      )}

      {cvError && (
        <div className="mb-6">
          <Panel>
            <div className="flex items-center gap-3 text-red-600 py-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Failed to load: {cvError}</span>
            </div>
          </Panel>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-9 space-y-6">
          {/* Drop Zone - Show when no images */}
          {images.length === 0 && (
            <Panel noPadding>
              <div className="p-6">
                <DropZone onFilesSelect={addImages} disabled={!cvReady} />
              </div>
            </Panel>
          )}

          {/* Processing Progress */}
          {images.length > 0 && (
            <ProcessingProgress
              progress={progress}
              isProcessing={isProcessing}
              totalImages={images.length}
              processedCount={processedCount}
            />
          )}

          {/* Image Grid */}
          {images.length > 0 && (
            <ImageGrid
              images={images}
              onRemove={removeImage}
              onDownload={downloadSingle}
            />
          )}

          {/* Add more images */}
          {images.length > 0 && (
            <DropZone onFilesSelect={addImages} disabled={!cvReady} compact />
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <Panel title="Output Settings">
            <NamingOptions settings={settings} onUpdate={updateSettings} />
          </Panel>

          {/* Tips */}
          <Panel>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Tips
              </h4>
              <ul className="text-sm text-gray-500 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 mt-0.5">•</span>
                  <span>Works best with scanned Polaroids on dark backgrounds</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 mt-0.5">•</span>
                  <span>Auto-detects white borders and fixes perspective</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 mt-0.5">•</span>
                  <span>Original files are never modified</span>
                </li>
              </ul>
            </div>
          </Panel>
        </div>
      </div>
    </PageLayout>
  );
}
