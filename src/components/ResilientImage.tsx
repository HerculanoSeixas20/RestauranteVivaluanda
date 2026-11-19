import { useState } from 'react';
import { Utensils } from 'lucide-react';

interface ResilientImageProps {
  src?: string;
  alt: string;
  fallbackTitle?: string;
  className?: string;
  wrapperClassName?: string;
  loading?: 'lazy' | 'eager';
}

export function ResilientImage({
  src,
  alt,
  fallbackTitle,
  className = 'w-full h-full object-cover',
  wrapperClassName = '',
  loading = 'lazy',
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#232520] via-[#171916] to-[#2e2922] text-[#F3EBDD]/70 p-6 text-center ${wrapperClassName}`}
        role="img"
        aria-label={alt}
      >
        <Utensils className="w-7 h-7 text-[#C4A46A]/80 mb-3" strokeWidth={1.3} />
        <span className="font-serif text-lg tracking-wide text-[#F3EBDD]">
          {fallbackTitle || 'Restaurante Viva Luanda'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
