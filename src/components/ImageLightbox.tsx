import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ZeroBrokenImage } from './ZeroBrokenImage';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number | null;
  onClose: () => void;
  onChangeIndex: (newIndex: number) => void;
  title?: string;
  fullScreenScroll?: boolean;
}

export function ImageLightbox({
  images,
  currentIndex,
  onClose,
  onChangeIndex,
  title = 'Portfolio Preview',
  fullScreenScroll = false,
}: ImageLightboxProps) {
  const touchStartX = useRef<number | null>(null);
  const isOpen = currentIndex !== null && images.length > 0;
  const safeIndex =
    currentIndex !== null && images.length > 0
      ? ((currentIndex % images.length) + images.length) % images.length
      : 0;

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (images.length <= 1) return;
    onChangeIndex((safeIndex - 1 + images.length) % images.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (images.length <= 1) return;
    onChangeIndex((safeIndex + 1) % images.length);
  };

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        onChangeIndex((safeIndex - 1 + images.length) % images.length);
      } else if (e.key === 'ArrowRight' && images.length > 1) {
        onChangeIndex((safeIndex + 1) % images.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, safeIndex, images.length, onClose, onChangeIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || images.length <= 1) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 45) {
      if (deltaX > 0) {
        onChangeIndex((safeIndex - 1 + images.length) % images.length);
      } else {
        onChangeIndex((safeIndex + 1) % images.length);
      }
    }
    touchStartX.current = null;
  };

  return (
    <AnimatePresence>
      {isOpen && fullScreenScroll && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-[9999] bg-black/95 overflow-y-auto"
        >
          {/* Floating Top Controls */}
          <div className="sticky top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3.5 bg-gradient-to-b from-black/90 via-black/70 to-transparent pointer-events-none">
            <div className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-black/80 border border-white/15 text-xs font-display font-bold uppercase tracking-wider text-white/85">
              {title}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Close full screen preview"
              className="pointer-events-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ffd400] hover:bg-[#ffe14d] text-black font-display font-extrabold text-xs uppercase tracking-wide shadow-lg transition-transform hover:scale-105 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>

          {/* Full-Screen Width Scrollable Image */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full min-h-[calc(100vh-64px)] px-2 sm:px-6 pb-10"
          >
            <ZeroBrokenImage
              src={images[safeIndex]}
              alt={title}
              className="w-full h-auto block rounded-xl shadow-2xl mx-auto"
            />
          </motion.div>
        </motion.div>
      )}

      {isOpen && !fullScreenScroll && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
        >
          {/* Top Controls */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="fixed top-4 left-4 right-4 sm:top-6 sm:left-8 sm:right-8 flex items-center justify-between pointer-events-none z-20"
          >
            <div className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-black/70 border border-white/15 text-xs font-mono tabular-nums text-white/80">
              {images.length > 1 ? `${safeIndex + 1} / ${images.length}` : title}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close lightbox"
              className="pointer-events-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ffd400] hover:bg-[#ffe14d] text-black font-display font-extrabold text-xs uppercase tracking-wide shadow-lg transition-transform hover:scale-105 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>

          {/* Left Arrow */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/80 hover:bg-[#ffd400] text-white hover:text-black border border-white/20 hover:border-[#ffd400] flex items-center justify-center shadow-xl transition-all duration-200 cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Main Media Container */}
          <motion.div
            key={images[safeIndex]}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-[95vw] max-h-[92vh] w-full flex items-center justify-center"
          >
            <div className="bg-[#0d0d0f] border border-white/15 rounded-2xl p-2 sm:p-3 shadow-2xl max-h-[92vh] overflow-auto">
              <ZeroBrokenImage
                src={images[safeIndex]}
                alt={`${title} ${safeIndex + 1}`}
                className="max-h-[85vh] w-auto max-w-full object-contain rounded-xl mx-auto block"
              />
            </div>
          </motion.div>

          {/* Right Arrow */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/80 hover:bg-[#ffd400] text-white hover:text-black border border-white/20 hover:border-[#ffd400] flex items-center justify-center shadow-xl transition-all duration-200 cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
