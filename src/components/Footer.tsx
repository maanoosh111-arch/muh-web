import React, { useState } from 'react';
import { Check, Copy, Mail } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { ZeroBrokenImage } from './ZeroBrokenImage';

export function Footer() {
  const { config, navigate } = useSite();
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

  return (
    <footer className="bg-black border-t border-white/10 pt-14 pb-8 px-4 sm:px-6">
      <div className="max-w-[1260px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-white/10 items-start">
          {/* Brand Column */}
          <div className="space-y-4">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
              className="inline-flex items-center gap-3 group"
            >
              <ZeroBrokenImage
                src={config.brand.logoUrl}
                alt={config.brand.name}
                className="w-9 h-9 object-contain rounded-md"
              />
              <div>
                <div className="font-display font-extrabold text-lg text-white leading-tight">
                  {config.brand.name}
                </div>
                <div className="text-xs text-white/60 font-medium">{config.brand.role}</div>
              </div>
            </a>
            <p className="text-sm text-white/60 leading-relaxed max-w-sm">
              {config.home.closingStatement}
            </p>
          </div>

          {/* Navigation Column */}
          <div className="space-y-3">
            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-white/50">
              Portfolio Pages
            </h3>
            <ul className="space-y-2.5 text-sm font-medium">
              {[
                { path: '/', label: config.nav.homeLabel },
                { path: '/websites', label: config.nav.websitesLabel },
                { path: '/social-media', label: config.nav.socialMediaLabel },
                { path: '/thumbnails', label: config.nav.thumbnailsLabel },
              ].map((item) => (
                <li key={item.path}>
                  <a
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.path);
                    }}
                    className="text-white/75 hover:text-[#ffd400] transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Direct Contact Column */}
          <div className="space-y-3">
            <h3 className="font-display text-xs font-bold uppercase tracking-widest text-white/50">
              Direct Contact
            </h3>
            <div className="flex flex-col gap-3">
              <a
                href={config.contact.calendlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-[#ffd400] hover:bg-[#ffe14d] text-black font-display font-extrabold text-sm transition-all duration-200 hover:-translate-y-0.5 btn-shimmer"
              >
                <ZeroBrokenImage
                  src={config.contact.calendlyLogoUrl}
                  alt="Calendly"
                  className="w-5 h-5 object-contain rounded-sm"
                />
                <span>{config.contact.calendlyLabel} (30 Min)</span>
              </a>

              <a
                href={config.contact.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 hover:border-[#25D366]/60 text-white text-sm font-semibold transition-all duration-200"
              >
                <ZeroBrokenImage
                  src={config.contact.whatsappLogoUrl}
                  alt="WhatsApp"
                  className="w-5 h-5 object-contain"
                />
                <span>
                  {config.contact.whatsappLabel} · {config.contact.whatsappNumber}
                </span>
              </a>

              <div className="flex items-stretch gap-2">
                <a
                  href={`mailto:${config.contact.email}`}
                  className="flex-1 min-w-0 inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-white/85 text-sm font-medium transition-colors"
                >
                  <Mail className="w-4 h-4 text-white/60 shrink-0" />
                  <span className="truncate">{config.contact.email}</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  aria-label="Copy email address"
                  title="Copy email address"
                  className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-3 rounded-xl bg-white/[0.06] hover:bg-[#ffd400] border border-white/15 hover:border-[#ffd400] text-white/85 hover:text-black text-xs font-semibold transition-colors cursor-pointer"
                >
                  {emailCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 text-center">
          <p className="text-xs tracking-wider uppercase text-white/40 font-medium">
            {config.brand.copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
}
