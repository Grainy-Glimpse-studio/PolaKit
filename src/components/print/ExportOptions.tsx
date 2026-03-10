import { useState } from 'react';
import { Button, Select } from '@/components/ui';

interface ExportOptionsProps {
  onExportPdf: (dpi: 150 | 300 | 600) => Promise<void>;
  disabled?: boolean;
}

export function ExportOptions({ onExportPdf, disabled }: ExportOptionsProps) {
  const [dpi, setDpi] = useState<'150' | '300' | '600'>('300');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await onExportPdf(Number(dpi) as 150 | 300 | 600);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
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
      >
        {exporting ? 'Exporting...' : 'Export PDF'}
      </Button>
    </div>
  );
}
