import { useState } from 'react';
import { Button, Select } from '@/components/ui';

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
      {/* Format selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Format
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setFormat('pdf')}
            className={`px-3 py-2 text-sm rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
              format === 'pdf'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PDF
          </button>
          <button
            onClick={() => setFormat('png')}
            disabled={!onExportPng}
            className={`px-3 py-2 text-sm rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
              format === 'png'
                ? 'bg-blue-600 text-white border-blue-600'
                : !onExportPng
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            PNG (ZIP)
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

      <Button
        variant="primary"
        className="w-full"
        onClick={handleExport}
        disabled={disabled || exporting}
        loading={exporting}
      >
        {exporting
          ? 'Exporting...'
          : format === 'pdf'
            ? 'Export PDF'
            : 'Export PNG (ZIP)'}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        {format === 'pdf'
          ? 'All pages combined into a single PDF file'
          : 'Each page exported as PNG, bundled in a ZIP file'}
      </p>
    </div>
  );
}
