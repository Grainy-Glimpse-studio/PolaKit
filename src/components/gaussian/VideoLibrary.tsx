import { useState, useRef, useEffect, useCallback } from 'react';
import { Slider } from '@/components/ui';

interface VideoLibraryProps {
  videoUrl: string;
  currentTime: number;
  onVideoSelect: (url: string) => void;
  onTimeChange: (time: number) => void;
}

export function VideoLibrary({
  videoUrl,
  currentTime,
  onVideoSelect,
  onTimeChange,
}: VideoLibraryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Revoke old URL if exists
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }

    const url = URL.createObjectURL(file);
    onVideoSelect(url);
    onTimeChange(0);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleVideoLoaded = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
      setIsLoaded(true);
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  const handleTimeUpdate = useCallback((value: number) => {
    onTimeChange(value);
    if (videoRef.current) {
      videoRef.current.currentTime = value;
    }
  }, [onTimeChange]);

  // Sync video time when currentTime prop changes
  useEffect(() => {
    if (videoRef.current && isLoaded) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime, isLoaded]);

  const handleClear = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    onVideoSelect('');
    onTimeChange(0);
    setIsLoaded(false);
    setDuration(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      {/* Upload button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!videoUrl ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full px-3 py-4 text-sm bg-white border border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center gap-2 text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Upload Video</span>
        </button>
      ) : (
        <>
          {/* Video preview */}
          <div className="relative rounded-lg overflow-hidden bg-black">
            <video
              ref={videoRef}
              src={videoUrl}
              onLoadedMetadata={handleVideoLoaded}
              className="w-full aspect-video object-contain"
              muted
            />

            {/* Clear button */}
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors flex items-center justify-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Time control */}
          {isLoaded && duration > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <Slider
                label="Frame"
                value={currentTime}
                min={0}
                max={duration}
                step={0.1}
                onChange={handleTimeUpdate}
              />
            </div>
          )}

          {/* Change video button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Change Video
          </button>
        </>
      )}
    </div>
  );
}
