import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface ZeroBrokenImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackLabel?: string;
  containerClassName?: string;
}

export function ZeroBrokenImage({
  src,
  alt,
  className = '',
  fallbackLabel,
  containerClassName = '',
  ...rest
}: ZeroBrokenImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#121215] to-[#08080a] text-white/45 p-6 text-center ${containerClassName || className}`}
        role="img"
        aria-label={alt || fallbackLabel || 'Media preview'}
      >
        <ImageOff className="w-7 h-7 mb-2 text-white/30" />
        <span className="text-xs font-medium tracking-wide text-white/50 max-w-[200px] truncate">
          {fallbackLabel || alt || 'Preview Unavailable'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      draggable={false}
      onError={() => setFailed(true)}
      className={className}
      {...rest}
    />
  );
}
