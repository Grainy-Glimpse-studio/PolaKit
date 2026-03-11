import { useState, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { TemplateColor } from '@/types/template';
import { TEMPLATE_COLORS, TEMPLATE_COLOR_ORDER } from '@/types/template';
import { useTemplateStore } from '@/store/template-store';
import {
  processWithTemplate,
  createTemplateZip,
  type ProcessingProgress,
} from '@/lib/template/processor';
import { downloadBlob } from '@/lib/export/zip';
import {
  PixelButton,
  PixelPanel,
  PixelPageLayout,
  PixelCanvas,
} from '@/components/pixel-ui';

type ProcessState = 'idle' | 'processing' | 'done' | 'error';

// Rainbow gradient colors for the theme
const RAINBOW_COLORS = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd'];

export function QuickProcess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const colorParam = searchParams.get('color') as TemplateColor | null;

  const { templates, getTemplateSettings, hasTemplateSettings } = useTemplateStore();

  // Validate color
  const color = colorParam && TEMPLATE_COLOR_ORDER.includes(colorParam) ? colorParam : null;
  const template = color ? templates[color] : null;
  const colorConfig = color ? TEMPLATE_COLORS[color] : null;

  const [files, setFiles] = useState<File[]>([]);
  const [processState, setProcessState] = useState<ProcessState>('idle');
  const [progress, setProgress] = useState<Record<string, ProcessingProgress>>({});
  const [resultZip, setResultZip] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const imageFiles = selectedFiles.filter((f) => f.type.startsWith('image/'));
    setFiles((prev) => [...prev, ...imageFiles]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter((f) => f.type.startsWith('image/'));
    setFiles((prev) => [...prev, ...imageFiles]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setResultZip(null);
    setProcessState('idle');
    setProgress({});
  }, []);

  const handleProcess = useCallback(async () => {
    if (!color || !template || files.length === 0) return;

    setProcessState('processing');
    setProgress({});
    setError(null);

    try {
      const templateSettings = getTemplateSettings(color);

      const result = await processWithTemplate(
        files,
        template,
        templateSettings,
        (prog) => {
          setProgress((prev) => ({
            ...prev,
            [prog.module]: prog,
          }));
        }
      );

      const zipBlob = await createTemplateZip(result);
      setResultZip(zipBlob);
      setProcessState('done');
    } catch (err) {
      console.error('Processing error:', err);
      setError(err instanceof Error ? err.message : 'Processing failed');
      setProcessState('error');
    }
  }, [color, template, files, getTemplateSettings]);

  const handleDownload = useCallback(() => {
    if (resultZip) {
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadBlob(resultZip, `polakit-${color}-${timestamp}.zip`);
    }
  }, [resultZip, color]);

  // Invalid color or no template
  if (!color || !template || !colorConfig) {
    return (
      <PixelCanvas>
        <PixelPageLayout
          title="Quick Process"
          subtitle="Template-based batch processing"
          themeColor={RAINBOW_COLORS[0]}
        >
          <div className="max-w-md mx-auto">
            <PixelPanel className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-4 border-2 border-pixel-border flex items-center justify-center bg-red-100">
                <span className="text-2xl">?</span>
              </div>
              <h2 className="font-['Press_Start_2P'] text-sm text-pixel-text mb-4">
                Invalid Template
              </h2>
              <p className="pixel-body text-gray-600 mb-6">
                {!color
                  ? 'No template color specified.'
                  : 'No template configured for this color.'}
              </p>
              <PixelButton onClick={() => navigate('/')}>Back to Home</PixelButton>
            </PixelPanel>
          </div>
        </PixelPageLayout>
      </PixelCanvas>
    );
  }

  // No settings in template
  if (!hasTemplateSettings(color)) {
    return (
      <PixelCanvas>
        <PixelPageLayout
          title="Quick Process"
          subtitle="Template-based batch processing"
          themeColor={colorConfig.hex}
        >
          <div className="max-w-md mx-auto">
            <PixelPanel className="text-center p-8">
              <div
                className="w-16 h-16 mx-auto mb-4 border-2 border-pixel-border"
                style={{ backgroundColor: colorConfig.hex }}
              />
              <h2 className="font-['Press_Start_2P'] text-sm text-pixel-text mb-4">
                Empty Template
              </h2>
              <p className="pixel-body text-gray-600 mb-6">
                This template has no settings configured yet.
                <br />
                Add settings by clicking stars in the module settings pages.
              </p>
              <PixelButton onClick={() => navigate('/')}>Back to Home</PixelButton>
            </PixelPanel>
          </div>
        </PixelPageLayout>
      </PixelCanvas>
    );
  }

  const enabledModules = Object.entries(template.enabledModules)
    .filter(([, enabled]) => enabled)
    .map(([module]) => module);

  return (
    <PixelCanvas themeColor={colorConfig.hex}>
      <PixelPageLayout
        title="Quick Process"
        subtitle={`${colorConfig.label} Template`}
        themeColor={colorConfig.hex}
        headerActions={
          files.length > 0 && processState === 'idle' ? (
            <PixelButton variant="ghost" size="sm" onClick={clearFiles}>
              Clear
            </PixelButton>
          ) : null
        }
      >
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Template Info Bar */}
          <div className="flex items-center gap-3 p-3 pixel-panel">
            <div
              className="w-8 h-8 border-2 border-pixel-border flex-shrink-0"
              style={{ backgroundColor: colorConfig.hex }}
            />
            <div className="flex-1">
              <div className="pixel-body font-bold text-pixel-text">
                {colorConfig.label} Template
              </div>
              <div className="pixel-body text-xs text-gray-500">
                Modules: {enabledModules.join(', ')}
              </div>
            </div>
            {/* Rainbow decoration */}
            <div className="flex gap-0.5">
              {RAINBOW_COLORS.map((c, i) => (
                <div
                  key={i}
                  className="w-2 h-6"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Upload Area */}
          {processState === 'idle' && (
            <PixelPanel noPadding>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="p-12 text-center cursor-pointer hover:bg-gray-50 transition-colors border-2 border-dashed border-pixel-border m-4"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="w-16 h-16 mx-auto mb-4 border-2 border-pixel-border flex items-center justify-center bg-gray-100">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="pixel-body font-bold text-pixel-text mb-2">
                  Drop photos here
                </p>
                <p className="pixel-body text-gray-500 text-sm">
                  or click to browse
                </p>
              </div>
            </PixelPanel>
          )}

          {/* File List */}
          {files.length > 0 && processState === 'idle' && (
            <PixelPanel title={`${files.length} images selected`}>
              <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                {files.map((file, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full aspect-square object-cover border-2 border-pixel-border"
                    />
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border border-pixel-border text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            </PixelPanel>
          )}

          {/* Processing Progress */}
          {processState === 'processing' && (
            <PixelPanel title="Processing...">
              <div className="space-y-4">
                {enabledModules.map((module) => {
                  const prog = progress[module];
                  const percentage = prog
                    ? Math.round((prog.current / prog.total) * 100)
                    : 0;

                  return (
                    <div key={module}>
                      <div className="flex justify-between pixel-body text-sm mb-1">
                        <span className="text-pixel-text capitalize">{module}</span>
                        <span className="text-gray-500">
                          {prog ? `${prog.current}/${prog.total}` : 'Waiting...'}
                        </span>
                      </div>
                      <div className="h-4 bg-gray-200 border-2 border-pixel-border overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: colorConfig.hex,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </PixelPanel>
          )}

          {/* Done State */}
          {processState === 'done' && resultZip && (
            <PixelPanel className="text-center p-8">
              <div
                className="w-16 h-16 mx-auto mb-4 border-2 border-pixel-border flex items-center justify-center"
                style={{ backgroundColor: colorConfig.hex }}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-['Press_Start_2P'] text-sm text-pixel-text mb-2">
                Complete!
              </h3>
              <p className="pixel-body text-gray-600 mb-6">
                {files.length} images processed
              </p>
              <div className="flex gap-3 justify-center">
                <PixelButton variant="primary" onClick={handleDownload}>
                  Download ZIP
                </PixelButton>
                <PixelButton variant="secondary" onClick={clearFiles}>
                  Process More
                </PixelButton>
              </div>
            </PixelPanel>
          )}

          {/* Error State */}
          {processState === 'error' && (
            <PixelPanel className="border-red-400">
              <div className="text-center p-4">
                <div className="w-12 h-12 mx-auto mb-3 border-2 border-pixel-border bg-red-100 flex items-center justify-center">
                  <span className="text-red-500 text-xl">!</span>
                </div>
                <h3 className="pixel-body font-bold text-red-500 mb-2">Processing Failed</h3>
                <p className="pixel-body text-gray-600 mb-4">{error}</p>
                <PixelButton variant="secondary" onClick={clearFiles}>
                  Try Again
                </PixelButton>
              </div>
            </PixelPanel>
          )}

          {/* Process Button */}
          {files.length > 0 && processState === 'idle' && (
            <div className="flex justify-center">
              <PixelButton
                variant="primary"
                size="lg"
                onClick={handleProcess}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
              >
                Process {files.length} Images
              </PixelButton>
            </div>
          )}

          {/* Template Settings Info */}
          <PixelPanel title="Template Settings">
            <div className="pixel-body text-sm space-y-2">
              {enabledModules.map((module) => {
                const moduleSettings = Object.entries(template.settings)
                  .filter(([key]) => key.startsWith(module))
                  .map(([key, value]) => `${key.split('.')[1]}: ${JSON.stringify(value)}`);

                return (
                  <div key={module} className="flex gap-2">
                    <span
                      className="w-3 h-3 border border-pixel-border flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: colorConfig.hex }}
                    />
                    <div>
                      <span className="font-bold text-pixel-text capitalize">{module}</span>
                      <span className="text-gray-500 ml-2">
                        {moduleSettings.join(', ') || 'Default settings'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </PixelPanel>

          {/* Rainbow tip */}
          <div className="pixel-panel p-4">
            <div className="flex items-start gap-3">
              {/* Rainbow icon */}
              <div className="w-8 h-8 border-2 border-pixel-border flex items-center justify-center flex-shrink-0 overflow-hidden">
                {RAINBOW_COLORS.slice(0, 4).map((c, i) => (
                  <div
                    key={i}
                    className="w-2 h-full"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div>
                <p className="pixel-body font-bold" style={{ color: colorConfig.hex }}>
                  Pro tip
                </p>
                <p className="pixel-body text-gray-600 mt-0.5">
                  Templates remember your settings across all modules. Edit them in each module's page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </PixelPageLayout>
    </PixelCanvas>
  );
}
