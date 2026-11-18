import React, { useEffect, useMemo, useRef } from 'react';
import { Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { useSite } from '../context/SiteContext';
import { ZeroBrokenImage } from './ZeroBrokenImage';

interface WallOfWinsProps {
  onSelectImage: (src: string, index: number) => void;
}

const COLUMN_SPEEDS_PX_PER_SEC = [14, 11, 16, 12];

export function WallOfWins({ onSelectImage }: WallOfWinsProps) {
  const { config } = useSite();
  const images = config.wallOfWins.images;

  const trackRefs = useRef<Array<HTMLDivElement | null>>([null, null, null, null]);
  const offsetsRef = useRef<number[]>([0, 0, 0, 0]);
  const hoveredColsRef = useRef<boolean[]>([false, false, false, false]);

  const columns = useMemo(() => {
    if (!images || images.length === 0) return [];
    const numCols = 4;
    const cols: Array<Array<{ src: string; originalIndex: number }>> = Array.from(
      { length: numCols },
      () => []
    );
    images.forEach((src, idx) => {
      cols[idx % numCols].push({ src, originalIndex: idx });
    });
    cols.forEach((colList, i) => {
      while (colList.length < 3 && images.length > 0) {
        const fallbackIdx = (i + colList.length * 2) % images.length;
        colList.push({ src: images[fallbackIdx], originalIndex: fallbackIdx });
      }
    });
    return cols;
  }, [images]);

  useEffect(() => {
    if (columns.length === 0) return;

    let rafId = 0;
    let lastTime = performance.now();

    const step = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      for (let i = 0; i < columns.length; i++) {
        const track = trackRefs.current[i];
        if (!track) continue;

        if (!hoveredColsRef.current[i]) {
          const halfHeight = track.scrollHeight / 2;
          if (halfHeight > 0) {
            let nextOffset = offsetsRef.current[i] + COLUMN_SPEEDS_PX_PER_SEC[i] * dt;
            if (nextOffset >= halfHeight) {
              nextOffset -= halfHeight;
            }
            offsetsRef.current[i] = nextOffset;
            track.style.transform = `translate3d(0, -${nextOffset.toFixed(2)}px, 0)`;
          }
        }
      }

      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [columns]);

  if (images.length === 0) return null;

  return (
    <section
      id="wall-of-wins"
      className="relative bg-black py-16 sm:py-24 px-4 overflow-hidden border-t border-white/[0.06]"
    >
      {/* Subtle Ambient Center Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[20%] left-1/2 -translate-x-1/2 w-[min(850px,92vw)] h-[380px] blur-[80px] z-0"
        style={{
          background:
            'radial-gradient(circle, rgba(255, 212, 0, 0.06) 0%, rgba(255, 13, 27, 0.03) 50%, transparent 75%)',
        }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10 flex flex-col items-center"
        >
          <span className="inline-flex items-center gap-2 text-xs font-display font-bold tracking-[0.18em] uppercase text-[#ffd400] mb-3">
            <Trophy className="w-3.5 h-3.5" />
            <span>{config.wallOfWins.tag}</span>
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.12] mb-3 text-balance">
            {config.wallOfWins.title}
          </h2>
          <p className="text-sm sm:text-base text-white/70 max-w-[620px] leading-relaxed">
            {config.wallOfWins.subtitle}
          </p>
        </motion.div>

        <div className="relative w-full h-[460px] sm:h-[560px] overflow-hidden rounded-2xl wall-marquee-mask">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 h-full w-full">
            {columns.map((colItems, colIdx) => {
              const loopList = [...colItems, ...colItems];
              const visibilityClass =
                colIdx === 2
                  ? 'hidden md:block'
                  : colIdx === 3
                    ? 'hidden lg:block'
                    : '';
              return (
                <div
                  key={colIdx}
                  onMouseEnter={() => {
                    hoveredColsRef.current[colIdx] = true;
                  }}
                  onMouseLeave={() => {
                    hoveredColsRef.current[colIdx] = false;
                  }}
                  className={`overflow-hidden relative h-full ${visibilityClass}`}
                >
                  <div
                    ref={(el) => {
                      trackRefs.current[colIdx] = el;
                    }}
                    className="flex flex-col gap-4 pb-4 will-change-transform"
                  >
                    {loopList.map((item, itemIdx) => (
                      <button
                        type="button"
                        key={`${colIdx}-${itemIdx}`}
                        onClick={() => onSelectImage(item.src, item.originalIndex)}
                        title="Click to view full receipt"
                        className="group relative rounded-xl overflow-hidden bg-[#0d0d0e] border border-white/10 hover:border-[#ffd400]/50 shadow-[0_6px_18px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-[1.03] hover:z-20 cursor-pointer shrink-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd400]"
                      >
                        <ZeroBrokenImage
                          src={item.src}
                          alt="Client Channel Proof Receipt"
                          loading="eager"
                          decoding="async"
                          className="w-full h-auto block object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
