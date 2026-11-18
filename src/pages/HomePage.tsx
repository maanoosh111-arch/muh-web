import React from 'react';
import { ArrowRight, Check, Layers, LayoutGrid, PlaySquare } from 'lucide-react';
import { motion } from 'motion/react';
import { CtaBand } from '../components/CtaBand';
import { ProcessGrid } from '../components/ProcessGrid';
import { ZeroBrokenImage } from '../components/ZeroBrokenImage';
import { useSite } from '../context/SiteContext';

export function HomePage() {
  const { config, sheets, navigate } = useSite();

  const pillars = [
    {
      key: 'websites',
      path: '/websites',
      title: config.home.websitesCardTitle,
      description: config.home.websitesCardDescription,
      buttonLabel: config.home.websitesCardButton,
      previewImage:
        sheets?.websites.items[0]?.workImage || sheets?.websites.heroImage || '',
      count: sheets?.websites.items.length || 0,
      icon: LayoutGrid,
    },
    {
      key: 'social-media',
      path: '/social-media',
      title: config.home.socialMediaCardTitle,
      description: config.home.socialMediaCardDescription,
      buttonLabel: config.home.socialMediaCardButton,
      previewImage:
        sheets?.socialMedia.items[0]?.workImage || sheets?.socialMedia.heroImage || '',
      count: sheets?.socialMedia.items.length || 0,
      icon: Layers,
    },
    {
      key: 'thumbnails',
      path: '/thumbnails',
      title: config.home.thumbnailsCardTitle,
      description: config.home.thumbnailsCardDescription,
      buttonLabel: config.home.thumbnailsCardButton,
      previewImage:
        sheets?.thumbnails.items[0]?.workImage || sheets?.thumbnails.heroImage || '',
      count: sheets?.thumbnails.items.length || 0,
      icon: PlaySquare,
    },
  ];

  return (
    <div className="bg-black text-white">
      {/* =====================================================================
          HERO SPLIT: Portrait + Description + Portfolio Page Buttons
          ===================================================================== */}
      <section className="relative pt-10 pb-14 sm:pt-16 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 right-0 w-[620px] h-[620px] rounded-full blur-[120px] opacity-25"
          style={{
            background:
              'radial-gradient(circle, rgba(255, 212, 0, 0.25) 0%, rgba(255, 13, 27, 0.16) 50%, transparent 75%)',
          }}
        />

        <div className="relative z-10 max-w-[1260px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left Column: Strategic Bio & Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 flex flex-col justify-center space-y-6"
            >
              <div className="space-y-3">
                <p className="font-display text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#ffd400]">
                  {config.home.heroKicker}
                </p>
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.03] text-white text-balance">
                  {config.home.heroHeadline}
                </h1>
                <p className="font-display text-lg sm:text-2xl font-extrabold italic text-[#ff0d1b] text-red-glow leading-snug text-balance">
                  {config.home.heroSubheadline}
                </p>
              </div>

              <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl">
                {config.home.heroDescription}
              </p>

              {/* Strategic Solutions List */}
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 pt-1">
                {config.home.servicesList.map((service, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-white/85">
                    <Check className="w-4 h-4 text-[#ffd400] shrink-0 mt-0.5" />
                    <span>{service}</span>
                  </li>
                ))}
              </ul>

              <p className="text-sm font-semibold text-white/95 border-t border-white/10 pt-4 max-w-2xl">
                {config.home.closingStatement}
              </p>

              {/* Underneath: Portfolio Page Navigation Buttons + Direct Contact */}
              <div className="space-y-4 pt-1">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/websites')}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#ffd400] hover:bg-[#ffe14d] text-black font-display font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-[0_6px_20px_rgba(255,212,0,0.3)] transition-all duration-200 hover:-translate-y-0.5 cursor-pointer btn-shimmer"
                  >
                    <span>{config.nav.websitesLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/social-media')}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 hover:border-[#ffd400]/60 text-white font-display font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>{config.nav.socialMediaLabel}</span>
                    <ArrowRight className="w-4 h-4 text-[#ffd400]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/thumbnails')}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 hover:border-[#ff0d1b]/70 text-white font-display font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>{config.nav.thumbnailsLabel}</span>
                    <ArrowRight className="w-4 h-4 text-[#ff0d1b]" />
                  </button>
                </div>

                {/* Direct Contact Action Strip with Brand Logos */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href={config.contact.calendlyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#0d0d0f] hover:bg-[#16161a] border border-white/15 hover:border-[#ffd400]/50 text-xs font-semibold text-white/90 transition-colors"
                  >
                    <ZeroBrokenImage
                      src={config.contact.calendlyLogoUrl}
                      alt="Calendly"
                      className="w-4 h-4 object-contain rounded-sm"
                    />
                    <span>{config.contact.calendlyLabel}</span>
                  </a>

                  <a
                    href={config.contact.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#0d0d0f] hover:bg-[#16161a] border border-white/15 hover:border-[#25D366]/60 text-xs font-semibold text-white/90 transition-colors"
                  >
                    <ZeroBrokenImage
                      src={config.contact.whatsappLogoUrl}
                      alt="WhatsApp"
                      className="w-4 h-4 object-contain"
                    />
                    <span>
                      {config.contact.whatsappLabel} · {config.contact.whatsappNumber}
                    </span>
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Muhammad Hassany Portrait */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 flex items-stretch"
            >
              <div className="relative w-full min-h-[380px] sm:min-h-[460px] lg:min-h-full rounded-2xl overflow-hidden bg-[#0a0a0d] border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle at 50% 35%, rgba(255, 212, 0, 0.14) 0%, rgba(255, 13, 27, 0.08) 45%, transparent 75%)',
                  }}
                />
                <ZeroBrokenImage
                  src={config.brand.profileImageUrl}
                  alt={`${config.brand.name} — ${config.brand.role}`}
                  fetchPriority="high"
                  className="relative z-10 w-full h-full object-cover object-top"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-20 pointer-events-none"
                />
              </div>
            </motion.div>
          </div>

          {/* Full-width KPI / Proof Strip Below Hero Split */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 sm:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            {config.home.stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-[#0d0d0f] border border-white/10 rounded-xl px-5 py-4 sm:py-5 flex flex-col gap-1"
              >
                <span className="font-mono tabular-nums text-lg sm:text-2xl font-bold text-white tracking-tight">
                  {stat.value}
                </span>
                <span className="font-display text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#ff0d1b]">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* =====================================================================
          PORTFOLIO PILLARS: Interactive Cards to Websites, Social Media, Thumbnails
          ===================================================================== */}
      <section className="bg-black py-16 sm:py-24 px-4 sm:px-6 border-t border-white/[0.06]">
        <div className="max-w-[1260px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-2xl mx-auto mb-12 space-y-3"
          >
            <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white text-balance">
              {config.home.pillarsTitle}
            </h2>
            <p className="text-sm sm:text-base text-white/70 leading-relaxed">
              {config.home.pillarsSubtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <motion.article
                  key={pillar.key}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.6,
                    delay: idx * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  onClick={() => navigate(pillar.path)}
                  className="group cursor-pointer rounded-2xl bg-[#0d0d0f] border border-white/10 hover:border-[#ffd400]/50 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#141418]">
                    <ZeroBrokenImage
                      src={pillar.previewImage}
                      alt={pillar.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f] via-black/20 to-transparent"
                    />
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-white/55 font-medium">
                        <span className="inline-flex items-center gap-1.5 uppercase tracking-wider font-display font-bold text-[#ffd400]">
                          <Icon className="w-3.5 h-3.5" />
                          <span>{pillar.title}</span>
                        </span>
                        {pillar.count > 0 && (
                          <span className="font-mono tabular-nums">
                            {pillar.count} {pillar.count === 1 ? 'Project' : 'Works'}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-xl font-black text-white uppercase tracking-tight">
                        {pillar.title}
                      </h3>
                      <p className="text-sm text-white/65 leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 text-xs font-display font-extrabold uppercase tracking-wider text-[#ffd400] group-hover:gap-3 transition-all">
                      <span>{pillar.buttonLabel}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          STRATEGIC METHODOLOGY
          ===================================================================== */}
      <ProcessGrid
        tag={config.home.methodologyTag}
        title={config.home.methodologyTitle}
        steps={config.home.methodologySteps}
      />

      {/* =====================================================================
          FINAL CONVERSION BAND
          ===================================================================== */}
      <CtaBand />
    </div>
  );
}
