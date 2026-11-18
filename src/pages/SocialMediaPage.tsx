import React, { useState } from 'react';
import { Expand } from 'lucide-react';
import { motion } from 'motion/react';
import { CtaBand } from '../components/CtaBand';
import { ImageLightbox } from '../components/ImageLightbox';
import { ProcessGrid } from '../components/ProcessGrid';
import { ZeroBrokenImage } from '../components/ZeroBrokenImage';
import { useSite } from '../context/SiteContext';

export function SocialMediaPage() {
  const { config, sheets, sheetsLoading } = useSite();
  const [postLightboxIdx, setPostLightboxIdx] = useState<number | null>(null);

  const heroBg = sheets?.socialMedia.heroImage || '';
  const postItems = sheets?.socialMedia.items || [];
  const postUrls = postItems.map((i) => i.workImage);

  return (
    <div className="bg-black text-white">
      {/* =====================================================================
          HERO HEADER
          ===================================================================== */}
      <section className="relative w-full bg-black overflow-hidden flex items-center justify-center min-h-[420px] lg:aspect-[1280/540] py-14 px-4">
        {heroBg && (
          <ZeroBrokenImage
            src={heroBg}
            alt="Social Media Design & Video Content Portfolio"
            fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover object-center z-0 pointer-events-none"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at center, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.88) 85%)',
          }}
        />

        <div className="relative z-10 w-full max-w-[900px] mx-auto text-center flex flex-col items-center">
          <motion.span
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-xs sm:text-sm font-bold tracking-[0.22em] uppercase text-[#ffd400] mb-4"
          >
            {config.socialMedia.heroKicker}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase leading-[1.06] tracking-tight"
          >
            {config.socialMedia.heroHeadline}
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-3xl sm:text-5xl lg:text-6xl font-black italic text-[#ff0d1b] uppercase leading-[1.08] tracking-tight text-red-glow mb-5"
          >
            {config.socialMedia.heroAccentHeadline}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed mb-8"
          >
            {config.socialMedia.heroSubtitle}
          </motion.p>

          <motion.a
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.46, ease: [0.34, 1.56, 0.64, 1] }}
            href={config.contact.calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-[#ffd400] hover:bg-[#ffe14d] text-black font-display font-extrabold text-sm uppercase tracking-wider shadow-[0_6px_22px_rgba(255,212,0,0.4)] transition-all duration-200 hover:-translate-y-0.5 btn-shimmer"
          >
            {config.socialMedia.heroButtonText}
          </motion.a>
        </div>
      </section>

      {/* =====================================================================
          SOCIAL MEDIA POSTS GALLERY (Click opens Swipeable Lightbox)
          ===================================================================== */}
      <section className="bg-black py-16 sm:py-24 px-4 sm:px-6 border-t border-white/[0.06]">
        <div className="max-w-[1320px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-12 flex flex-col items-center"
          >
            <span className="text-xs sm:text-sm font-display font-bold tracking-[0.22em] uppercase text-[#ffd400] mb-3">
              {config.socialMedia.galleryTag}
            </span>
            <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-tight text-balance max-w-3xl mb-3">
              {config.socialMedia.galleryTitle}
            </h2>
            <p className="text-sm sm:text-base text-white/65 max-w-2xl">
              {config.socialMedia.gallerySubtitle}
            </p>
          </motion.div>

          {sheetsLoading && postItems.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[0, 1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="aspect-square rounded-2xl bg-white/5 border border-white/10 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {postItems.map((item, idx) => (
                <motion.button
                  type="button"
                  key={`${item.workImage}-${idx}`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.55,
                    delay: (idx % 4) * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  onClick={() => setPostLightboxIdx(idx)}
                  aria-label={`View Social Media Post ${idx + 1} in full screen`}
                  className="group relative aspect-square w-full rounded-2xl overflow-hidden bg-[#0d0d0f] border border-white/12 hover:border-[#ffd400]/60 shadow-[0_10px_28px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd400]"
                >
                  <ZeroBrokenImage
                    src={item.workImage}
                    alt={`Social Media Post Design ${idx + 1} by Muhammad Hassany`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-colors duration-200 flex items-center justify-center"
                  >
                    <span className="opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-200 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ffd400] text-black font-display font-extrabold text-xs uppercase tracking-wider shadow-lg">
                      <Expand className="w-3.5 h-3.5" />
                      <span>View Post</span>
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </section>

      <ProcessGrid
        tag={config.socialMedia.processTag}
        title={config.socialMedia.processTitle}
        steps={config.socialMedia.processSteps}
      />

      <CtaBand />

      {/* Swipeable Social Media Post Lightbox */}
      <ImageLightbox
        images={postUrls}
        currentIndex={postLightboxIdx}
        onClose={() => setPostLightboxIdx(null)}
        onChangeIndex={setPostLightboxIdx}
        title="Social Media Post"
      />
    </div>
  );
}
