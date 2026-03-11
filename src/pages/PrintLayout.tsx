import { useEffect } from 'react';
import type { FrameType } from '@/types';
import { usePrintLayout } from '@/hooks/usePrintLayout';
import { DropZone } from '@/components/cropper';
import {
  PrintCanvas,
  ImageList,
  LayoutSettings,
  PageNavigation,
  ExportOptions,
  ImagePositionPanel,
} from '@/components/print';
import { TemplatePanel } from '@/components/template';
import {
  PixelButton,
  PixelPanel,
  PixelPageLayout,
  PixelCanvas,
} from '@/components/pixel-ui';

interface PrintLayoutProps {
  frameType?: FrameType;
}

export function PrintLayout({ frameType = 'polaroid' }: PrintLayoutProps) {
  const {
    images,
    settings,
    layout,
    currentPage,
    selectedImageId,
    customPaperSizes,
    addImages,
    removeImage,
    clearImages,
    setImageOffset,
    resetImageOffset,
    selectImage,
    updateSettings,
    setCurrentPage,
    nextPage,
    prevPage,
    exportPdf,
    exportPng,
    downloadSingle,
    addCustomPaperSize,
    removeCustomPaperSize,
    applyCustomPaperSize,
  } = usePrintLayout();

  useEffect(() => {
    if (frameType !== settings.frameType) {
      updateSettings({ frameType });
    }
  }, [frameType, settings.frameType, updateSettings]);

  const selectedImage = images.find((img) => img.id === selectedImageId);

  const headerActions = images.length > 0 ? (
    <PixelButton variant="ghost" size="sm" onClick={clearImages}>
      Clear
    </PixelButton>
  ) : null;

  return (
    <PixelCanvas>
      <PixelPageLayout
        title="Print"
        subtitle="Arrange & print your photos"
        headerActions={headerActions}
        themeColor="#00a3e2"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Images */}
          <div className="lg:col-span-3 space-y-4">
            <PixelPanel title="Photos">
              <div className="space-y-4">
                <DropZone onFilesSelect={addImages} compact />

                {images.length > 0 && (
                  <ImageList
                    images={images}
                    selectedImageId={selectedImageId}
                    onSelect={selectImage}
                    onRemove={removeImage}
                    onDownload={downloadSingle}
                  />
                )}
              </div>
            </PixelPanel>

            {/* Image Position - only show when image is selected */}
            {selectedImage && (
              <PixelPanel title="Position">
                <ImagePositionPanel
                  offset={selectedImage.offset}
                  onOffsetChange={(offset) => setImageOffset(selectedImageId!, offset)}
                  onReset={() => resetImageOffset(selectedImageId!)}
                />
              </PixelPanel>
            )}

            {images.length === 0 && (
              <div className="pixel-panel p-4">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 border-2 border-pixel-border flex items-center justify-center" style={{ backgroundColor: '#e0f4fc' }}>
                    <svg className="w-6 h-6" style={{ color: '#00a3e2' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="pixel-body font-bold" style={{ color: '#00a3e2' }}>No photos yet</p>
                  <p className="pixel-body text-gray-600 mt-1">Add photos to start creating your layout</p>
                </div>
              </div>
            )}
          </div>

          {/* Center - Canvas */}
          <div className="lg:col-span-6 space-y-4">
            {layout && images.length > 0 ? (
              <>
                <PixelPanel noPadding className="overflow-hidden">
                  <div className="p-4 bg-gray-100">
                    <PrintCanvas
                      images={images}
                      settings={settings}
                      layout={layout}
                      currentPage={currentPage}
                      selectedImageId={selectedImageId}
                      onImageSelect={selectImage}
                      onImageOffsetChange={setImageOffset}
                    />
                  </div>
                </PixelPanel>

                <PageNavigation
                  currentPage={currentPage}
                  totalPages={layout.totalPages}
                  onPrevPage={prevPage}
                  onNextPage={nextPage}
                  onGoToPage={setCurrentPage}
                />
              </>
            ) : (
              <PixelPanel noPadding>
                <div className="p-6">
                  <DropZone onFilesSelect={addImages} />
                </div>
              </PixelPanel>
            )}
          </div>

          {/* Right Sidebar - Settings */}
          <div className="lg:col-span-3 space-y-4">
            {/* Template Panel wraps all settings */}
            <TemplatePanel
              moduleName="Print"
              settings={[
                { path: 'print.paperType', value: settings.paperType },
                { path: 'print.orientation', value: settings.orientation },
                { path: 'print.frameType', value: settings.frameType },
                { path: 'print.imageMode', value: settings.imageMode },
                { path: 'print.columns', value: settings.columns },
                { path: 'print.gap', value: settings.gap },
                { path: 'print.padding', value: settings.padding },
                { path: 'print.showCutMarks', value: settings.showCutMarks },
                { path: 'print.cropAdjust', value: settings.cropAdjust },
              ]}
            >
              <PixelPanel title="Layout">
                <LayoutSettings
                  settings={settings}
                  onUpdate={updateSettings}
                  customPaperSizes={customPaperSizes}
                  onAddCustomPaper={addCustomPaperSize}
                  onRemoveCustomPaper={removeCustomPaperSize}
                  onApplyCustomPaper={applyCustomPaperSize}
                />
              </PixelPanel>
            </TemplatePanel>

            {layout && images.length > 0 && (
              <PixelPanel title="Export">
                <ExportOptions
                  onExportPdf={exportPdf}
                  onExportPng={exportPng}
                  disabled={images.length === 0}
                />
              </PixelPanel>
            )}

            {layout && (
              <div className="pixel-panel p-4">
                <h4 className="pixel-label text-pixel-text mb-3">Layout Info</h4>
                <div className="grid grid-cols-2 gap-2 pixel-body">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Columns</span>
                    <span className="font-bold text-pixel-text">{layout.columns}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rows</span>
                    <span className="font-bold text-pixel-text">{layout.rows}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Per Page</span>
                    <span className="font-bold text-pixel-text">{layout.perPage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pages</span>
                    <span className="font-bold text-pixel-text">{layout.totalPages}</span>
                  </div>
                  <div className="col-span-2 pt-2 border-t-2 border-dashed border-pixel-border mt-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Image Size</span>
                      <span className="font-bold text-pixel-text">
                        {layout.imageWidth.toFixed(1)} x {layout.imageHeight.toFixed(1)} mm
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </PixelPageLayout>
    </PixelCanvas>
  );
}
