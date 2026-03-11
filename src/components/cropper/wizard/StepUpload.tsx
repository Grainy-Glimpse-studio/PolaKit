import type { ProcessedImage } from '@/types';
import { DropZone } from '../DropZone';
import { ImageGrid } from '../ImageGrid';
import { WizardNavigation } from './WizardNavigation';

interface StepUploadProps {
  images: ProcessedImage[];
  onFilesSelect: (files: File[]) => void;
  onRemoveImage: (id: string) => void;
  onNext: () => void;
  disabled?: boolean;
}

export function StepUpload({
  images,
  onFilesSelect,
  onRemoveImage,
  onNext,
  disabled = false,
}: StepUploadProps) {
  const hasImages = images.length > 0;

  return (
    <div className="space-y-6">
      {/* Main upload area */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-1">
            Upload Scanned Polaroids
          </h2>
          <p className="text-sm text-gray-500">
            Drag and drop your scanned polaroid photos or click to browse
          </p>
        </div>

        {/* Drop zone - full width when no images */}
        {!hasImages && (
          <DropZone onFilesSelect={onFilesSelect} disabled={disabled} />
        )}

        {/* Image preview grid */}
        {hasImages && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {images.length} {images.length === 1 ? 'image' : 'images'} selected
              </span>
            </div>
            <ImageGrid images={images} onRemove={onRemoveImage} />
            <DropZone onFilesSelect={onFilesSelect} disabled={disabled} compact />
          </div>
        )}

        {/* Navigation */}
        <WizardNavigation
          onNext={onNext}
          nextLabel="Continue to Settings"
          nextDisabled={!hasImages}
          showBack={false}
        />
      </div>

      {/* Tips */}
      <div className="bg-white/50 rounded-xl p-4">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Tips for best results
        </h4>
        <ul className="text-sm text-gray-500 space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-rose-400 mt-0.5">•</span>
            <span>Scan on a dark/black background for automatic border detection</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-rose-400 mt-0.5">•</span>
            <span>Works best with JPG, PNG, or TIFF files</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-rose-400 mt-0.5">•</span>
            <span>Higher resolution scans produce better results</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
