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
import { Button } from '@/components/ui';

type ProcessState = 'idle' | 'processing' | 'done' | 'error';

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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Template</h1>
          <p className="text-gray-400 mb-6">
            {!color
              ? 'No template color specified.'
              : 'No template configured for this color.'}
          </p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  // No settings in template
  if (!hasTemplateSettings(color)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4"
            style={{ backgroundColor: colorConfig.hex }}
          />
          <h1 className="text-2xl font-bold text-white mb-4">Empty Template</h1>
          <p className="text-gray-400 mb-6">
            This template has no settings configured yet.
            <br />
            Add settings by clicking stars in the module settings pages.
          </p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const enabledModules = Object.entries(template.enabledModules)
    .filter(([, enabled]) => enabled)
    .map(([module]) => module);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div
            className="w-8 h-8 rounded-full"
            style={{ backgroundColor: colorConfig.hex }}
          />
          <div>
            <h1 className="text-xl font-bold text-white">Quick Process</h1>
            <p className="text-sm text-gray-400">
              {colorConfig.label} Template - {enabledModules.join(', ')}
            </p>
          </div>
        </div>

        {/* Upload Area */}
        {processState === 'idle' && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-600 rounded-2xl p-12 text-center cursor-pointer hover:border-gray-500 transition-colors mb-6"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <svg
              className="w-12 h-12 mx-auto mb-4 text-gray-500"
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
            <p className="text-gray-400 mb-2">
              Drag and drop images here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Supports JPG, PNG, WebP
            </p>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && processState === 'idle' && (
          <div className="bg-gray-800 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">{files.length} images selected</span>
              <button
                onClick={clearFiles}
                className="text-sm text-red-400 hover:text-red-300"
              >
                Clear all
              </button>
            </div>
            <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
              {files.map((file, i) => (
                <div key={i} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processing Progress */}
        {processState === 'processing' && (
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-medium text-white mb-4">Processing...</h3>
            <div className="space-y-4">
              {enabledModules.map((module) => {
                const prog = progress[module];
                const percentage = prog
                  ? Math.round((prog.current / prog.total) * 100)
                  : 0;

                return (
                  <div key={module}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400 capitalize">{module}</span>
                      <span className="text-gray-400">
                        {prog ? `${prog.current}/${prog.total}` : 'Waiting...'}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
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
          </div>
        )}

        {/* Done State */}
        {processState === 'done' && resultZip && (
          <div className="bg-gray-800 rounded-xl p-6 mb-6 text-center">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: colorConfig.hex }}
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Processing Complete!</h3>
            <p className="text-gray-400 mb-4">
              {files.length} images processed through {enabledModules.join(', ')}
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleDownload}>
                Download ZIP
              </Button>
              <Button variant="secondary" onClick={clearFiles}>
                Process More
              </Button>
            </div>
          </div>
        )}

        {/* Error State */}
        {processState === 'error' && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-medium text-red-400 mb-2">Processing Failed</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button variant="secondary" onClick={clearFiles}>
              Try Again
            </Button>
          </div>
        )}

        {/* Process Button */}
        {files.length > 0 && processState === 'idle' && (
          <div className="flex justify-center">
            <Button size="lg" onClick={handleProcess}>
              Process {files.length} Images
            </Button>
          </div>
        )}

        {/* Template Info */}
        <div className="mt-8 p-4 bg-gray-800/50 rounded-xl">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Template Settings</h4>
          <div className="text-sm text-gray-500 space-y-1">
            {enabledModules.map((module) => {
              const moduleSettings = Object.entries(template.settings)
                .filter(([key]) => key.startsWith(module))
                .map(([key, value]) => `${key.split('.')[1]}: ${JSON.stringify(value)}`);

              return (
                <div key={module}>
                  <span className="capitalize font-medium text-gray-400">{module}:</span>{' '}
                  {moduleSettings.join(', ') || 'Default settings'}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
