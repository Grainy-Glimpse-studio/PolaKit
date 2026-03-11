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
import { TemplatePanel } from '@/components/template';
import {
  PixelButton,
  PixelPanel,
  PixelPageLayout,
  PixelCanvas,
} from '@/components/pixel-ui';

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
        return 'MP4';
      case 'gif':
        return 'GIF';
      default:
        return 'Export';
    }
  };

  const headerActions = hasImages ? (
    <>
      <PixelButton variant="ghost" size="sm" onClick={clearImages}>
        Clear
      </PixelButton>
      <PixelButton
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
      </PixelButton>
      {images.length > 1 && exportFormat === 'jpg' && (
        <PixelButton
          variant="primary"
          size="sm"
          onClick={exportAll}
          loading={exporting}
        >
          All ({images.length})
        </PixelButton>
      )}
    </>
  ) : null;

  return (
    <PixelCanvas>
      <PixelPageLayout
        title="Blur BG"
        subtitle="Create stunning blurred backgrounds"
        headerActions={headerActions}
        themeColor="#f97316"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            <PixelPanel title="Presets">
              <PresetManager
                activePreset={activePreset}
                customPresets={customPresets}
                onApply={applyPreset}
                onSave={saveCustomPreset}
                onDelete={deleteCustomPreset}
              />
            </PixelPanel>

            <PixelPanel title="Ratio">
              <RatioSelector
                value={settings.ratio}
                customW={settings.customRatioW}
                customH={settings.customRatioH}
                onChange={(ratio) => updateSettings({ ratio })}
                onCustomChange={(w, h) =>
                  updateSettings({ customRatioW: w, customRatioH: h })
                }
              />
            </PixelPanel>

            <PixelPanel title="Export">
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
            </PixelPanel>
          </div>

          {/* Center - Preview */}
          <div className="lg:col-span-6 space-y-4">
            {!hasImages ? (
              <PixelPanel noPadding>
                <div className="p-6">
                  <DropZone onFilesSelect={handleFilesSelect} />
                </div>
              </PixelPanel>
            ) : (
              <>
                {/* Preview Canvas */}
                <PixelPanel noPadding className="overflow-hidden">
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
                </PixelPanel>

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
              <div className="pixel-panel p-3">
                <ApplyModeToggle
                  mode={applyMode}
                  onChange={setApplyMode}
                />
              </div>
            )}

            {/* Template Panel wraps all settings */}
            <TemplatePanel
              moduleName="Blur"
              settings={[
                { path: 'gaussian.ratio', value: settings.ratio },
                { path: 'gaussian.polaroidSize', value: settings.polaroidSize },
                { path: 'gaussian.polaroidOffsetX', value: settings.polaroidOffsetX },
                { path: 'gaussian.polaroidOffsetY', value: settings.polaroidOffsetY },
                { path: 'gaussian.bgType', value: settings.bgType },
                { path: 'gaussian.blurIntensity', value: settings.blurIntensity },
                { path: 'gaussian.brightness', value: settings.brightness },
                { path: 'gaussian.bgScale', value: settings.bgScale },
                { path: 'gaussian.bgOffsetX', value: settings.bgOffsetX },
                { path: 'gaussian.bgOffsetY', value: settings.bgOffsetY },
                { path: 'gaussian.bgColor', value: settings.bgColor },
                { path: 'gaussian.shadow', value: settings.shadow },
                { path: 'gaussian.shadowBlur', value: settings.shadowBlur },
                { path: 'gaussian.shadowOpacity', value: settings.shadowOpacity },
              ]}
            >
              <div className="space-y-4">
                <PixelPanel title="Background">
                  <BackgroundSettings
                    settings={settings}
                    onUpdate={updateSettings}
                  />
                </PixelPanel>

                <PixelPanel title="Polaroid">
                  <PolaroidSettings
                    settings={settings}
                    onUpdate={updateSettings}
                  />
                </PixelPanel>
              </div>
            </TemplatePanel>

            {/* Quick info - pixel style */}
            <div className="pixel-panel p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 border-2 border-pixel-border bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="pixel-body font-bold text-orange-500">Pro tip</p>
                  <p className="pixel-body text-gray-600 mt-0.5">
                    Use Story preset for Instagram Stories, or save your own custom presets.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PixelPageLayout>
    </PixelCanvas>
  );
}
