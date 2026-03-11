import { useState } from 'react';
import { Select } from '@/components/ui';

type ExportFormat = 'pdf' | 'png';
type DPI = 150 | 300 | 600;

interface ExportOptionsProps {
  onExportPdf: (dpi: DPI) => Promise<void>;
  onExportPng?: (dpi: DPI) => Promise<void>;
  disabled?: boolean;
}

export function ExportOptions({ onExportPdf, onExportPng, disabled }: ExportOptionsProps) {
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [dpi, setDpi] = useState<'150' | '300' | '600'>('300');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const dpiNum = Number(dpi) as DPI;
      if (format === 'pdf') {
        await onExportPdf(dpiNum);
      } else if (onExportPng) {
        await onExportPng(dpiNum);
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Format selection - pixel style with retro effects */}
      <div>
        <label className="block pixel-body text-pixel-text mb-2">
          Format
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setFormat('pdf')}
            className={`
              pixel-toggle flex-1 px-3 py-2 pixel-body
              flex items-center justify-center gap-1.5
              ${format === 'pdf' ? 'active' : ''}
            `}
            data-active={format === 'pdf'}
          >
            {/* Pixel document icon */}
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <rect x="2" y="1" width="10" height="14" fill="none" stroke="currentColor" strokeWidth="2" />
              <rect x="10" y="1" width="4" height="4" />
              <rect x="4" y="7" width="6" height="2" />
              <rect x="4" y="10" width="4" height="2" />
            </svg>
            PDF
          </button>
          <button
            onClick={() => setFormat('png')}
            disabled={!onExportPng}
            className={`
              pixel-toggle flex-1 px-3 py-2 pixel-body
              flex items-center justify-center gap-1.5
              ${format === 'png' ? 'active' : ''}
              ${!onExportPng ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            data-active={format === 'png'}
          >
            {/* Pixel image icon */}
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="2" width="14" height="12" fill="none" stroke="currentColor" strokeWidth="2" />
              <rect x="4" y="5" width="2" height="2" />
              <rect x="3" y="10" width="3" height="2" />
              <rect x="7" y="8" width="3" height="2" />
            </svg>
            PNG
          </button>
        </div>
      </div>

      <Select
        label="Export Quality"
        value={dpi}
        onChange={(value) => setDpi(value as '150' | '300' | '600')}
        options={[
          { value: '150', label: '150 DPI (Draft)' },
          { value: '300', label: '300 DPI (Standard)' },
          { value: '600', label: '600 DPI (High Quality)' },
        ]}
      />

      {/* Export button - pixel style */}
      <button
        onClick={handleExport}
        disabled={disabled || exporting}
        className={`
          w-full px-4 py-3 pixel-body
          border-2 border-pixel-border
          transition-all
          flex items-center justify-center gap-2
          ${disabled || exporting
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'text-pixel-text shadow-[4px_4px_0px_rgba(0,0,0,0.3)] hover:shadow-[5px_5px_0px_rgba(0,0,0,0.35)] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_rgba(0,0,0,0.2)]'
          }
        `}
        style={!(disabled || exporting) ? { backgroundColor: 'var(--theme-color, #c0c0c0)' } : undefined}
      >
        {exporting ? (
          <>
            {/* Pixel loading animation */}
            <span className="flex gap-1">
              <span className="w-2 h-2 bg-white animate-pulse" />
              <span className="w-2 h-2 bg-white animate-pulse" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-white animate-pulse" style={{ animationDelay: '300ms' }} />
            </span>
            Exporting...
          </>
        ) : (
          <>
            {/* Pixel download icon */}
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <rect x="7" y="2" width="2" height="8" />
              <rect x="5" y="8" width="2" height="2" />
              <rect x="9" y="8" width="2" height="2" />
              <rect x="3" y="12" width="10" height="2" />
            </svg>
            {format === 'pdf' ? 'Export PDF' : 'Export PNG (ZIP)'}
          </>
        )}
      </button>

      <p className="pixel-body text-gray-500 text-sm text-center">
        {format === 'pdf'
          ? 'All pages in one PDF'
          : 'Each page as PNG in ZIP'}
      </p>
    </div>
  );
}
