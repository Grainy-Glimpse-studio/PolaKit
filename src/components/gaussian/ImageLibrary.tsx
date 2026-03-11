import { useState, useEffect, useRef } from 'react';
import {
  getStoredImages,
  saveImage,
  deleteStoredImage,
  fileToDataUrl,
  type StoredImage,
} from '@/lib/gaussian/storage';

interface ImageLibraryProps {
  onSelect: (dataUrl: string) => void;
  selectedUrl?: string;
}

export function ImageLibrary({ onSelect, selectedUrl }: ImageLibraryProps) {
  const [images, setImages] = useState<StoredImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImages(getStoredImages());
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      const newImage = saveImage(file.name, dataUrl);
      setImages((prev) => [newImage, ...prev].slice(0, 10));
      onSelect(dataUrl);
    } catch (error) {
      console.error('Failed to load image:', error);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteStoredImage(id);
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <div className="space-y-3">
      {/* Upload button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full px-3 py-2 text-sm bg-white border border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-gray-600"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Upload Image
      </button>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img) => (
            <div
              key={img.id}
              onClick={() => onSelect(img.dataUrl)}
              className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group transition-all ${
                selectedUrl === img.dataUrl
                  ? 'ring-2 ring-blue-500 ring-offset-2'
                  : 'hover:ring-2 hover:ring-gray-300'
              }`}
            >
              <img
                src={img.dataUrl}
                alt={img.name}
                className="w-full h-full object-cover"
              />

              {/* Delete button */}
              <button
                onClick={(e) => handleDelete(img.id, e)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Selected indicator */}
              {selectedUrl === img.dataUrl && (
                <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-2">
          No saved images. Upload an image to use as background.
        </p>
      )}
    </div>
  );
}
