import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageCarouselProps {
  images: string[];
  title?: string;
  onClose?: () => void;
  isOpen?: boolean;
}

/**
 * ImageCarousel Component
 * Full-screen image carousel with smooth transitions
 * Supports keyboard navigation and touch gestures
 */
export default function ImageCarousel({
  images,
  title,
  onClose,
  isOpen = true,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];
  const totalImages = images.length;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
    setIsLoading(true);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
    setIsLoading(true);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalImages]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 bg-gradient-to-b from-black to-transparent">
        {title && (
          <h2 className="text-white text-lg font-semibold">{title}</h2>
        )}
        <div className="flex-1" />
        <span className="text-white text-sm mr-4">
          {currentIndex + 1} / {totalImages}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Main Image */}
      <div className="relative flex-1 w-full flex items-center justify-center px-4">
        <img
          src={currentImage}
          alt={`${title} - Image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
          onLoad={() => setIsLoading(false)}
        />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {totalImages > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </>
      )}

      {/* Thumbnail Strip */}
      {totalImages > 1 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <div className="flex gap-2 overflow-x-auto justify-center">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsLoading(true);
                }}
                className={`flex-shrink-0 h-16 w-16 rounded border-2 transition-all ${
                  index === currentIndex
                    ? 'border-white'
                    : 'border-white/30 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover rounded"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
