import React, { useState } from 'react';
import { Check, CheckCircle2, Copy, Expand, LineChart, Mail, Star, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageLightbox } from '../components/ImageLightbox';
import { ProcessGrid } from '../components/ProcessGrid';
import { WallOfWins } from '../components/WallOfWins';
import { ZeroBrokenImage } from '../components/ZeroBrokenImage';
import { useSite } from '../context/SiteContext';

export function ThumbnailsPage() {
  const { config, sheets, sheetsLoading } = useSite();
  const [thumbnailLightboxIdx, setThumbnailLightboxIdx] = useState<number | null>(null);
  const [wallLightboxIdx, setWallLightboxIdx] = useState<number | null>(null);
  const [proofModal, setProofModal] = useState<{ src: string; title: string } | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);

  const handleCopyEmail = async () => {
    const email = config.contact.email;
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = email;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const heroBg =
    sheets?.thumbnails.heroImage ||
    'https://res.cloudinary.com/h74mxqsb/image/upload/f_auto,q_auto/v1792496111/Artboard_1_n14d0d.jpg';

  const thumbnailItems = sheets?.thumbnails.items || [];
  const thumbnailUrls = thumbnailItems.map((i) => i.workImage);

  return (
    <div className="bg-black text-white">
      {/* =====================================================================
          1. TOP HERO HEADER (Faithful to attached .html reference)
          ===================================================================== */}
      <section className="relative w-full bg-black overflow-hidden flex items-center justify-center min-h-[460px] lg:aspect-[1280/610] py-12 px-4">
        <ZeroBrokenImage
          src={heroBg}
          alt="Stop The Scroll - Win The Click"
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover object-center z-0 pointer-events-none select-none"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at center, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.72) 85%)',
          }}
        />

        <div className="relative z-10 w-full max-w-[860px] mx-auto px-4 flex flex-col items-center justify-center text-center">
          <div className="flex flex-col items-center gap-1 mb-5">
            <motion.h1
              initial={{ opacity: 0, y: -22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-3xl sm:text-5xl lg:text-[64px] font-black text-white uppercase leading-[1.05] tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]"
            >
              {config.thumbnails.heroTopHeadline}
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.75, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-4xl sm:text-6xl lg:text-[78px] font-black italic text-[#ff0d1b] uppercase leading-[1.05] tracking-tight text-red-glow"
            >
              {config.thumbnails.heroAccentHeadline}
            </motion.h2>
          </div>

          {/* 3-Column Hero Stats */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 mb-7 w-full"
          >
            {config.thumbnails.stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center gap-0.5">
                <span className="font-mono tabular-nums text-base sm:text-xl lg:text-2xl font-bold text-white whitespace-nowrap drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                  {stat.value}
                </span>
                <span className="font-display text-xs sm:text-sm font-extrabold text-[#ff0d1b] uppercase tracking-wider whitespace-nowrap drop-shadow-[0_0_12px_rgba(255,13,27,0.45)]">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>

          <motion.a
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
            href={config.contact.calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 bg-[#ffd400] hover:bg-[#ffe14d] text-black font-display font-extrabold text-sm sm:text-base uppercase tracking-wider px-8 py-4 rounded-xl shadow-[0_6px_22px_rgba(255,212,0,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] btn-shimmer"
          >
            <span>{config.thumbnails.heroButtonText}</span>
          </motion.a>
        </div>
      </section>

      {/* =====================================================================
          2. THUMBNAILS PORTFOLIO DISPLAY (Replaces mainn.jpg with Google Sheets)
          ===================================================================== */}
      <section className="bg-black py-16 sm:py-24 px-4 sm:px-6 border-t border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-12 flex flex-col items-center"
          >
            <span className="text-xs sm:text-sm font-display font-bold tracking-[0.22em] uppercase text-[#ffd400] mb-3">
              {config.thumbnails.galleryTag}
            </span>
            <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-tight text-balance max-w-3xl mb-3">
              {config.thumbnails.galleryTitle}
            </h2>
            <p className="text-sm sm:text-base text-white/65 max-w-xl">
              {config.thumbnails.gallerySubtitle}
            </p>
          </motion.div>

          {sheetsLoading && thumbnailItems.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className="aspect-video rounded-xl bg-white/5 border border-white/10 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {thumbnailItems.map((item, idx) => (
                <motion.button
                  type="button"
                  key={`${item.workImage}-${idx}`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.55,
                    delay: (idx % 3) * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  onClick={() => setThumbnailLightboxIdx(idx)}
                  aria-label={`View YouTube Thumbnail ${idx + 1} in full screen`}
                  className="group relative aspect-video w-full rounded-xl overflow-hidden bg-[#0d0d0f] border border-white/10 hover:border-[#ffd400]/60 shadow-[0_8px_24px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd400]"
                >
                  <ZeroBrokenImage
                    src={item.workImage}
                    alt={`YouTube Thumbnail Design ${idx + 1} by Muhammad Hassany`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors duration-300 flex items-center justify-center"
                  >
                    <span className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ffd400] text-black font-display font-extrabold text-xs uppercase tracking-wider shadow-lg">
                      <Expand className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          3. WALL OF WINS
          ===================================================================== */}
      <WallOfWins onSelectImage={(_src, idx) => setWallLightboxIdx(idx)} />

      {/* =====================================================================
          4. MY PROCESS
          ===================================================================== */}
      <ProcessGrid
        tag={config.thumbnails.processTag}
        title={config.thumbnails.processTitle}
        steps={config.thumbnails.processSteps}
      />

      {/* =====================================================================
          5. WHAT YOU'LL GET VS WHAT YOU WON'T GET
          ===================================================================== */}
      <section
        id="expectations"
        className="relative bg-black py-16 sm:py-24 px-4 sm:px-6 overflow-hidden border-t border-white/[0.06]"
      >
        <div className="max-w-[1260px] mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            {/* LEFT COLUMN: WHAT YOU'LL GET */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col"
            >
              <h2 className="font-display text-2xl sm:text-4xl font-black uppercase tracking-tight text-center text-white mb-6">
                {config.thumbnails.positiveTitle}
              </h2>

              <div className="rounded-[20px] p-6 sm:p-9 flex flex-col gap-6 h-full bg-[#080809] border-[1.5px] border-white/70 hover:border-white shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1">
                {config.thumbnails.positiveItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-[#22c55e] shrink-0 mt-0.5 drop-shadow-[0_0_10px_rgba(34,197,94,0.35)]" />
                    <div className="flex flex-col gap-1.5">
                      <h3 className="font-display text-white text-sm sm:text-base font-extrabold uppercase tracking-wide leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-white/65 text-xs leading-relaxed font-medium uppercase">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="mt-auto pt-5 border-t border-white/10 text-center flex flex-col gap-1.5">
                  <p className="font-display text-white text-sm sm:text-base font-extrabold italic uppercase tracking-wide">
                    {config.thumbnails.positiveCalloutSub}
                  </p>
                  <p className="font-display text-lg sm:text-2xl font-black uppercase text-[#ffd400] text-gold-glow">
                    {config.thumbnails.positiveCalloutMain}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: WHAT YOU WON'T GET */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col"
            >
              <h2 className="font-display text-2xl sm:text-4xl font-black italic uppercase tracking-tight text-center text-[#ff0d1b] text-red-glow mb-6">
                {config.thumbnails.negativeTitle}
              </h2>

              <div className="rounded-[20px] p-6 sm:p-9 flex flex-col gap-6 h-full bg-[#080809] border-[1.5px] border-[#ff0d1b] hover:border-[#ff2a37] shadow-[0_10px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(255,13,27,0.35)] transition-all duration-300 hover:-translate-y-1">
                {config.thumbnails.negativeItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <XCircle className="w-6 h-6 text-[#ff0d1b] shrink-0 mt-0.5 drop-shadow-[0_0_10px_rgba(255,13,27,0.35)]" />
                    <div className="flex flex-col gap-1.5">
                      <h3 className="font-display text-white text-sm sm:text-base font-extrabold uppercase tracking-wide leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-white/65 text-xs leading-relaxed font-medium uppercase">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="mt-auto pt-5 border-t border-white/10 text-center flex flex-col gap-1.5">
                  <p className="font-display text-white text-sm sm:text-base font-extrabold italic uppercase tracking-wide">
                    {config.thumbnails.negativeCalloutSub}
                  </p>
                  <p className="font-display text-lg sm:text-2xl font-black uppercase text-white">
                    {config.thumbnails.negativeCalloutMain}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. FOOTER HERO WITH BUTTON ARRANGEMENT (Matching Reference)
          ===================================================================== */}
      <section className="w-full bg-black py-14 sm:py-20 px-4 border-t border-white/[0.06] flex flex-col items-center justify-center">
        <div className="w-full max-w-[440px] mx-auto flex flex-col items-center gap-3.5">
          <a
            href={config.contact.calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2.5 bg-[#ffd400] hover:bg-[#ffe14d] text-black font-display font-extrabold text-base uppercase tracking-wider px-6 py-4 rounded-xl shadow-[0_6px_24px_rgba(255,212,0,0.4)] transition-all duration-200 hover:-translate-y-0.5 btn-shimmer"
          >
            <ZeroBrokenImage
              src={config.contact.calendlyLogoUrl}
              alt="Calendly"
              className="w-5 h-5 object-contain rounded-sm"
            />
            <span>{config.thumbnails.footerButtonText}</span>
          </a>

          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              type="button"
              onClick={() =>
                setProofModal({
                  src: config.thumbnails.reviewsImageUrl,
                  title: config.thumbnails.reviewsButtonText,
                })
              }
              className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl bg-white/[0.12] hover:bg-white/[0.2] border border-white/25 text-white text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              <Star className="w-4 h-4 text-[#ffd400]" />
              <span>{config.thumbnails.reviewsButtonText}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setProofModal({
                  src: config.thumbnails.resultsImageUrl,
                  title: config.thumbnails.resultsButtonText,
                })
              }
              className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl bg-white/[0.12] hover:bg-white/[0.2] border border-white/25 text-white text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              <LineChart className="w-4 h-4 text-[#ffd400]" />
              <span>{config.thumbnails.resultsButtonText}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <a
              href={config.contact.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.16] border border-white/20 hover:border-[#25D366]/60 text-white text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
            >
              <ZeroBrokenImage
                src={config.contact.whatsappLogoUrl}
                alt="WhatsApp"
                className="w-4 h-4 object-contain"
              />
              <span>{config.contact.whatsappLabel}</span>
            </a>

            <div className="flex items-stretch gap-1.5">
              <a
                href={`mailto:${config.contact.email}`}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-3.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.16] border border-white/20 hover:border-white/50 text-white text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
              >
                <Mail className="w-4 h-4 text-white/85 shrink-0" />
                <span>{config.contact.emailLabel}</span>
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                aria-label="Copy email address"
                title={`Copy ${config.contact.email}`}
                className="shrink-0 inline-flex items-center justify-center px-3 rounded-xl bg-white/[0.08] hover:bg-[#ffd400] border border-white/20 hover:border-[#ffd400] text-white hover:text-black transition-all duration-200 cursor-pointer"
              >
                {emailCopied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Swipeable Thumbnail Lightbox */}
      <ImageLightbox
        images={thumbnailUrls}
        currentIndex={thumbnailLightboxIdx}
        onClose={() => setThumbnailLightboxIdx(null)}
        onChangeIndex={setThumbnailLightboxIdx}
        title="YouTube Thumbnail"
      />

      {/* Swipeable Wall of Wins Lightbox */}
      <ImageLightbox
        images={config.wallOfWins.images}
        currentIndex={wallLightboxIdx}
        onClose={() => setWallLightboxIdx(null)}
        onChangeIndex={setWallLightboxIdx}
        title="Client Proof Receipt"
      />

      {/* Full-Screen Scrollable Proof Modal (Reviews / Results) */}
      <ImageLightbox
        images={proofModal ? [proofModal.src] : []}
        currentIndex={proofModal ? 0 : null}
        onClose={() => setProofModal(null)}
        onChangeIndex={() => {}}
        title={proofModal?.title || 'Proof Screenshot'}
        fullScreenScroll
      />
    </div>
  );
}
