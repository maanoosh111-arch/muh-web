import React from 'react';
import { motion } from 'motion/react';
import { useSite } from '../context/SiteContext';
import { ZeroBrokenImage } from './ZeroBrokenImage';

interface CtaBandProps {
  title?: string;
  subtitle?: string;
}

export function CtaBand({ title, subtitle }: CtaBandProps) {
  const { config } = useSite();

  return (
    <section className="relative bg-black py-16 sm:py-24 px-4 sm:px-6 border-t border-white/[0.06] overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(255, 212, 0, 0.12) 0%, transparent 60%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-[780px] mx-auto text-center space-y-6"
      >
        <h2 className="font-display text-2xl sm:text-4xl font-black text-white uppercase tracking-tight leading-tight text-balance">
          {title || config.home.finalCtaTitle}
        </h2>
        <p className="text-sm sm:text-base text-white/70 max-w-xl mx-auto leading-relaxed">
          {subtitle || config.home.finalCtaSubtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <a
            href={config.contact.calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-4 rounded-xl bg-[#ffd400] hover:bg-[#ffe14d] text-black font-display font-extrabold text-sm uppercase tracking-wider shadow-[0_8px_24px_rgba(255,212,0,0.35)] transition-all duration-200 hover:-translate-y-0.5 btn-shimmer"
          >
            <ZeroBrokenImage
              src={config.contact.calendlyLogoUrl}
              alt="Calendly"
              className="w-5 h-5 object-contain rounded-sm"
            />
            <span>{config.contact.calendlyLabel}</span>
          </a>

          <a
            href={config.contact.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/20 hover:border-[#25D366]/60 text-white font-display font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5"
          >
            <ZeroBrokenImage
              src={config.contact.whatsappLogoUrl}
              alt="WhatsApp"
              className="w-5 h-5 object-contain"
            />
            <span>
              {config.contact.whatsappLabel} ({config.contact.whatsappNumber})
            </span>
          </a>
        </div>
      </motion.div>
    </section>
  );
}
