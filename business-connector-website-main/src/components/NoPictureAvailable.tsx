import { ImageOff } from 'lucide-react';

interface NoPictureAvailableProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * NoPictureAvailable Component
 * Displays a professional "No Picture Available" placeholder
 * for properties without images
 */
export default function NoPictureAvailable({
  className = '',
  size = 'md',
}: NoPictureAvailableProps) {
  const sizeClasses = {
    sm: 'h-24',
    md: 'h-48',
    lg: 'h-96',
  };

  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div
      className={`${sizeClasses[size]} bg-gray-900 flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <ImageOff className={`${iconSizes[size]} text-gray-400`} />
      <div className={`text-center ${textSizes[size]}`}>
        <p className="text-gray-300 font-medium">No Picture Available</p>
        <p className="text-gray-500 text-xs mt-1">Image coming soon</p>
      </div>
    </div>
  );
}
