import React, { useState } from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { CtaBand } from '../components/CtaBand';
import { ProcessGrid } from '../components/ProcessGrid';
import { WebsitePreviewModal } from '../components/WebsitePreviewModal';
import { ZeroBrokenImage } from '../components/ZeroBrokenImage';
import { useSite } from '../context/SiteContext';

export function WebsitesPage() {
  const { config, sheets, sheetsLoading } = useSite();
  const [activeWebsiteUrl, setActiveWebsiteUrl] = useState<string | null>(null);

  const heroBg = sheets?.websites.heroImage || '';
  const websiteItems = sheets?.websites.items || [];

  return (
    <div className="bg-black text-white">
      {/* =====================================================================
          HERO HEADER
          ===================================================================== */}
      <section className="relative w-full bg-black overflow-hidden flex items-center justify-center min-h-[420px] lg:aspect-[1280/540] py-14 px-4">
        {heroBg && (
          <ZeroBrokenImage
            src={heroBg}
            alt="Websites & E-commerce Development Portfolio"
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
            {config.websites.heroKicker}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase leading-[1.06] tracking-tight"
          >
            {config.websites.heroHeadline}
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-3xl sm:text-5xl lg:text-6xl font-black italic text-[#ff0d1b] uppercase leading-[1.08] tracking-tight text-red-glow mb-5"
          >
            {config.websites.heroAccentHeadline}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed mb-8"
          >
            {config.websites.heroSubtitle}
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
            {config.websites.heroButtonText}
          </motion.a>
        </div>
      </section>

      {/* =====================================================================
          WEBSITES SHOWCASE GRID (Hover reveals "Open" -> Opens Iframe Modal)
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
              {config.websites.galleryTag}
            </span>
            <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-tight text-balance max-w-3xl mb-3">
              {config.websites.galleryTitle}
            </h2>
            <p className="text-sm sm:text-base text-white/65 max-w-2xl">
              {config.websites.gallerySubtitle}
            </p>
          </motion.div>

          {sheetsLoading && websiteItems.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2].map((n) => (
                <div
                  key={n}
                  className="aspect-[4/3] rounded-2xl bg-white/5 border border-white/10 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
              {websiteItems.map((item, idx) => {
                const domainLabel = item.linkedTo
                  ? item.linkedTo.replace(/^https?:\/\//, '').replace(/\/$/, '')
                  : `Project ${idx + 1}`;
                return (
                  <motion.div
                    key={`${item.workImage}-${idx}`}
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{
                      duration: 0.6,
                      delay: (idx % 3) * 0.1,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="group relative rounded-2xl overflow-hidden bg-[#0d0d0f] border border-white/12 hover:border-[#ffd400]/60 shadow-[0_12px_32px_rgba(0,0,0,0.65)] transition-all duration-300 hover:-translate-y-1.5"
                  >
                    <div className="relative w-full overflow-hidden bg-[#121216]">
                      <ZeroBrokenImage
                        src={item.workImage}
                        alt={`Website Project — ${domainLabel}`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.03]"
                      />

                      {/* Hover Scrim + Prominent "Open" Button */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors duration-200 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.linkedTo) setActiveWebsiteUrl(item.linkedTo);
                          }}
                          className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 scale-90 group-hover:scale-100 transition-all duration-200 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#ffd400] hover:bg-[#ffe14d] text-black font-display font-extrabold text-sm uppercase tracking-wider shadow-[0_8px_24px_rgba(255,212,0,0.45)] cursor-pointer"
                        >
                          <span>{config.websites.openButtonLabel}</span>
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Clean Footer Strip (also touch-friendly Open trigger on mobile) */}
                    <div className="px-5 py-4 flex items-center justify-between gap-3 border-t border-white/10">
                      <div className="flex items-center gap-2 min-w-0">
                        <Globe className="w-4 h-4 text-[#ffd400] shrink-0" />
                        <span className="text-xs sm:text-sm font-mono text-white/80 truncate">
                          {domainLabel}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (item.linkedTo) setActiveWebsiteUrl(item.linkedTo);
                        }}
                        className="shrink-0 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-[#ffd400] text-white hover:text-black font-display font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        {config.websites.openButtonLabel}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <ProcessGrid
        tag={config.websites.processTag}
        title={config.websites.processTitle}
        steps={config.websites.processSteps}
      />

      <CtaBand />

      {/* Embedded Live Website Window */}
      <WebsitePreviewModal
        url={activeWebsiteUrl}
        onClose={() => setActiveWebsiteUrl(null)}
      />
    </div>
  );
}
