import { useState, type ReactNode } from 'react';

interface PixelPanelProps {
  children: ReactNode;
  title?: string;
  className?: string;
  noPadding?: boolean;
}

export function PixelPanel({
  children,
  title,
  className = '',
  noPadding = false,
}: PixelPanelProps) {
  return (
    <div className={`pixel-panel ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b-3 border-pixel-border bg-gray-50">
          <h3 className="pixel-label text-pixel-text m-0 border-0 pb-0">
            {title}
          </h3>
        </div>
      )}
      <div className={noPadding ? '' : 'p-4'}>
        {children}
      </div>
    </div>
  );
}

// Collapsible pixel panel
interface CollapsiblePixelPanelProps extends PixelPanelProps {
  defaultOpen?: boolean;
}

export function CollapsiblePixelPanel({
  children,
  title,
  className = '',
  noPadding = false,
  defaultOpen = true,
}: CollapsiblePixelPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`pixel-panel ${className}`}>
      {title && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 border-b-3 border-pixel-border bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <h3 className="pixel-label text-pixel-text m-0 border-0 pb-0">
            {title}
          </h3>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      )}
      {isOpen && (
        <div className={noPadding ? '' : 'p-4'}>
          {children}
        </div>
      )}
    </div>
  );
}

