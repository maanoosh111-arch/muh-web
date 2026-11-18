import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, useScroll, useSpring } from 'motion/react';
import { useSite } from '../context/SiteContext';
import { ZeroBrokenImage } from './ZeroBrokenImage';

export function Navbar() {
  const { config, currentPath, navigate } = useSite();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 32, restDelta: 0.001 });

  useEffect(() => {
    setMobileOpen(false);
  }, [currentPath]);

  const navLinks = [
    { path: '/', label: config.nav.homeLabel },
    { path: '/websites', label: config.nav.websitesLabel },
    { path: '/social-media', label: config.nav.socialMediaLabel },
    { path: '/thumbnails', label: config.nav.thumbnailsLabel },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-black/85 backdrop-blur-md border-b border-white/10">
      <motion.div
        style={{ scaleX, transformOrigin: '0% 50%' }}
        className="h-[2px] w-full bg-gradient-to-r from-[#ff0d1b] via-[#ffd400] to-[#ffd400]"
      />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark + Logo */}
        <a
          href="/"
          onClick={(e) => handleLinkClick(e, '/')}
          className="flex items-center gap-3 whitespace-nowrap shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd400] rounded-lg"
        >
          <ZeroBrokenImage
            src={config.brand.logoUrl}
            alt={config.brand.name}
            className="w-8 h-8 object-contain rounded-md transition-transform duration-200 group-hover:scale-105"
          />
          <span className="font-display font-extrabold text-base sm:text-lg tracking-tight text-white">
            {config.brand.name}
          </span>
        </a>

        {/* Zone 2: 4 Clean Single-Line Nav Links */}
        <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <a
                key={link.path}
                href={link.path}
                onClick={(e) => handleLinkClick(e, link.path)}
                className={`relative py-1 text-sm font-semibold whitespace-nowrap shrink-0 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd400] rounded ${
                  isActive ? 'text-[#ffd400]' : 'text-white/75 hover:text-white'
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-active-underline"
                    className="absolute left-0 right-0 -bottom-0.5 h-[2px] bg-[#ffd400] rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={config.contact.calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#ffd400] hover:bg-[#ffe14d] text-black font-display font-extrabold text-xs tracking-wide uppercase whitespace-nowrap shrink-0 transition-all duration-200 hover:-translate-y-0.5 shadow-[0_4px_16px_rgba(255,212,0,0.3)] btn-shimmer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {config.nav.ctaLabel}
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl border border-white/15 bg-white/5 text-white hover:bg-white/10 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#08080a] px-4 py-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <a
                key={link.path}
                href={link.path}
                onClick={(e) => handleLinkClick(e, link.path)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#ffd400]/10 text-[#ffd400] border border-[#ffd400]/30'
                    : 'text-white/80 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{link.label}</span>
              </a>
            );
          })}
          <a
            href={config.contact.calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center justify-center w-full px-4 py-3 rounded-xl bg-[#ffd400] text-black font-display font-extrabold text-sm uppercase tracking-wide"
          >
            {config.nav.ctaLabel}
          </a>
        </div>
      )}
    </header>
  );
}
