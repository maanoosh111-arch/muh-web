import React, { useEffect, useState } from 'react';
import { ExternalLink, Globe, RotateCw, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface WebsitePreviewModalProps {
  url: string | null;
  onClose: () => void;
}

export function WebsitePreviewModal({ url, onClose }: WebsitePreviewModalProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!url) return;
    setIframeLoaded(false);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [url, onClose]);

  return (
    <AnimatePresence>
      {url && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Live Website Preview"
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[1320px] h-[90vh] bg-[#0d0d0f] border border-white/15 rounded-2xl overflow-hidden flex flex-col shadow-[0_24px_70px_rgba(0,0,0,0.9)]"
          >
            {/* Browser Top Chrome */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[#141418] border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="hidden sm:flex items-center gap-1.5 mr-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 min-w-0 flex-1 max-w-xl">
                  <Globe className="w-3.5 h-3.5 text-[#ffd400] shrink-0" />
                  <span className="text-xs font-mono text-white/80 truncate">{url}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIframeLoaded(false);
                    setReloadKey((k) => k + 1);
                  }}
                  title="Reload preview"
                  aria-label="Reload preview"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border border-white/10 transition-colors cursor-pointer"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  <span>New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#ffd400] hover:bg-[#ffe14d] text-black font-display font-extrabold text-xs uppercase tracking-wide transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Close</span>
                </button>
              </div>
            </div>

            {/* Live Embedded Website Iframe */}
            <div className="relative flex-1 bg-white">
              {!iframeLoaded && (
                <div className="absolute inset-0 bg-[#0a0a0c] flex flex-col items-center justify-center gap-3 z-10 pointer-events-none">
                  <div className="w-8 h-8 border-2 border-[#ffd400]/30 border-t-[#ffd400] rounded-full animate-spin" />
                  <p className="text-xs font-medium text-white/60">Loading live website...</p>
                </div>
              )}
              <iframe
                key={`${url}-${reloadKey}`}
                src={url}
                title={`Live website preview: ${url}`}
                onLoad={() => setIframeLoaded(true)}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
