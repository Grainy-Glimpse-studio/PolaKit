import type { RefObject } from 'react';

interface PreviewCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  hasImage: boolean;
}

export function PreviewCanvas({ canvasRef, hasImage }: PreviewCanvasProps) {
  if (!hasImage) {
    return (
      <div className="aspect-square flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">No image loaded</p>
        <p className="text-sm text-gray-400 mt-1">Upload an image to preview</p>
      </div>
    );
  }

  return (
    <div className="relative bg-[#1a1a1a] flex items-center justify-center p-4 min-h-[400px]">
      {/* Checkered background pattern for transparency */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #333 25%, transparent 25%),
            linear-gradient(-45deg, #333 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #333 75%),
            linear-gradient(-45deg, transparent 75%, #333 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        }}
      />

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="relative max-w-full max-h-[60vh] object-contain shadow-2xl"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.1)',
        }}
      />

      {/* Zoom indicator (decorative) */}
      <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-xs text-white/70">
        Preview
      </div>
    </div>
  );
}
