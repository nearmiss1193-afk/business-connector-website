import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderColor?: string;
  onLoad?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

/**
 * LazyImage Component
 * Implements intersection observer for lazy loading images
 * Shows loading skeleton while image loads
 */
export default function LazyImage({
  src,
  alt,
  className = '',
  placeholderColor = 'bg-gray-200',
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Unobserve after image becomes visible
            if (containerRef.current) {
              observer.unobserve(containerRef.current);
            }
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // Load image when it becomes visible
  useEffect(() => {
    if (isVisible && src) {
      setImageSrc(src);
    }
  }, [isVisible, src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onError?.(e);
  };

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className={`absolute inset-0 ${placeholderColor} flex items-center justify-center`}>
          <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
        </div>
      )}

      {/* Actual image */}
      {imageSrc && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {/* Fallback when image is not visible yet */}
      {!imageSrc && (
        <div className={`w-full h-full ${placeholderColor}`} />
      )}
    </div>
  );
}
