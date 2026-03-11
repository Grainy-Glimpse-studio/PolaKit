import { useGaussianPreview } from '@/hooks/useGaussianPreview';
import { DropZone } from '@/components/cropper';
import {
  PreviewCanvas,
  RatioSelector,
  BackgroundSettings,
  PolaroidSettings,
  PresetManager,
  ImageNavigation,
  ApplyModeToggle,
  ExportSettings,
} from '@/components/gaussian';
import { Button, PageLayout, Panel } from '@/components/ui';

export function GaussianBg() {
  const {
    canvasRef,
    images,
    currentIndex,
    loadedImage,
    settings,
    applyMode,
    activePreset,
    customPresets,
    exporting,
    hasImages,
    hasVideo,
    addImages,
    clearImages,
    nextImage,
    prevImage,
    setCurrentIndex,
    updateSettings,
    setApplyMode,
    namingMode,
    setNamingMode,
    exportFormat,
    setExportFormat,
    videoDuration,
    setVideoDuration,
    applyPreset,
    saveCustomPreset,
    deleteCustomPreset,
    exportSingle,
    exportVideo,
    exportGif,
    exportAll,
  } = useGaussianPreview();

  const handleFilesSelect = (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      addImages(imageFiles);
    }
  };

  const handleExport = () => {
    switch (exportFormat) {
      case 'mp4':
        exportVideo();
        break;
      case 'gif':
        exportGif();
        break;
      default:
        exportSingle();
    }
  };

  const getExportLabel = () => {
    switch (exportFormat) {
      case 'mp4':
        return 'Export MP4';
      case 'gif':
        return 'Export GIF';
      default:
        return 'Export';
    }
  };

  const headerActions = hasImages ? (
    <>
      <Button variant="ghost" size="sm" onClick={clearImages}>
        Clear
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleExport}
        disabled={exporting || !loadedImage || (exportFormat !== 'jpg' && !hasVideo)}
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        }
        loading={exporting}
      >
        {getExportLabel()}
      </Button>
      {images.length > 1 && exportFormat === 'jpg' && (
        <Button
          variant="primary"
          size="sm"
          onClick={exportAll}
          loading={exporting}
        >
          Export All ({images.length})
        </Button>
      )}
    </>
  ) : null;

  return (
    <PageLayout
      title="Gaussian Background"
      subtitle="Create stunning blurred backgrounds"
      headerActions={headerActions}
      accentColor="violet"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <Panel title="Presets">
            <PresetManager
              activePreset={activePreset}
              customPresets={customPresets}
              onApply={applyPreset}
              onSave={saveCustomPreset}
              onDelete={deleteCustomPreset}
            />
          </Panel>

          <Panel title="Aspect Ratio">
            <RatioSelector
              value={settings.ratio}
              customW={settings.customRatioW}
              customH={settings.customRatioH}
              onChange={(ratio) => updateSettings({ ratio })}
              onCustomChange={(w, h) =>
                updateSettings({ customRatioW: w, customRatioH: h })
              }
            />
          </Panel>

          <Panel title="Export">
            <ExportSettings
              settings={settings}
              onUpdate={updateSettings}
              namingMode={namingMode}
              onNamingModeChange={setNamingMode}
              exportFormat={exportFormat}
              onExportFormatChange={setExportFormat}
              videoDuration={videoDuration}
              onVideoDurationChange={setVideoDuration}
              hasVideo={hasVideo}
            />
          </Panel>
        </div>

        {/* Center - Preview */}
        <div className="lg:col-span-6 space-y-4">
          {!hasImages ? (
            <Panel noPadding>
              <div className="p-6">
                <DropZone onFilesSelect={handleFilesSelect} />
              </div>
            </Panel>
          ) : (
            <>
              {/* Preview Canvas */}
              <Panel noPadding className="overflow-hidden">
                <PreviewCanvas
                  canvasRef={canvasRef}
                  hasImage={!!loadedImage}
                  onDrag={(dx, dy) => {
                    updateSettings({
                      polaroidOffsetX: settings.polaroidOffsetX + dx,
                      polaroidOffsetY: settings.polaroidOffsetY + dy,
                    });
                  }}
                />
              </Panel>

              {/* Image Navigation */}
              {images.length > 1 && (
                <ImageNavigation
                  currentIndex={currentIndex}
                  totalImages={images.length}
                  onPrev={prevImage}
                  onNext={nextImage}
                  onGoTo={setCurrentIndex}
                />
              )}

              {/* Add more */}
              <DropZone onFilesSelect={handleFilesSelect} compact />
            </>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          {/* Apply Mode Toggle - only show when multiple images */}
          {images.length > 1 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-3">
              <ApplyModeToggle
                mode={applyMode}
                onChange={setApplyMode}
              />
            </div>
          )}

          <Panel title="Background">
            <BackgroundSettings
              settings={settings}
              onUpdate={updateSettings}
            />
          </Panel>

          <Panel title="Polaroid">
            <PolaroidSettings
              settings={settings}
              onUpdate={updateSettings}
            />
          </Panel>

          {/* Quick info */}
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-4 border border-violet-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-violet-800">Pro tip</p>
                <p className="text-sm text-violet-600 mt-0.5">
                  Use Story preset for Instagram Stories, or save your own custom presets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
