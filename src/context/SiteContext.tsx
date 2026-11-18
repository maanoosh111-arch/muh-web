import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { DEFAULT_SITE_CONFIG } from '../data/defaultConfig';
import type { AllSheetsData, RoutePath, SiteConfig } from '../types/site';

interface SiteContextValue {
  config: SiteConfig;
  setConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  sheets: AllSheetsData | null;
  sheetsLoading: boolean;
  sheetsError: string | null;
  refreshSheets: () => Promise<void>;
  refreshConfig: () => Promise<void>;
  currentPath: string;
  navigate: (to: RoutePath | string) => void;
}

const SiteContext = createContext<SiteContextValue | null>(null);

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
}

function updateMetaTag(selector: string, attribute: string, content: string) {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    if (selector.includes('name=')) {
      const match = selector.match(/name="([^"]+)"/);
      if (match) el.setAttribute('name', match[1]);
    } else if (selector.includes('property=')) {
      const match = selector.match(/property="([^"]+)"/);
      if (match) el.setAttribute('property', match[1]);
    }
    document.head.appendChild(el);
  }
  el.setAttribute(attribute, content);
}

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [sheets, setSheets] = useState<AllSheetsData | null>(null);
  const [sheetsLoading, setSheetsLoading] = useState<boolean>(true);
  const [sheetsError, setSheetsError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>(() =>
    normalizePath(window.location.pathname)
  );

  const refreshConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = (await res.json()) as SiteConfig;
        setConfig(data);
      }
    } catch (err) {
      console.error('Failed to fetch config:', err);
    }
  }, []);

  const refreshSheets = useCallback(async (force = false) => {
    setSheetsLoading(true);
    setSheetsError(null);
    try {
      const res = await fetch(force ? '/api/sheets?refresh=1' : '/api/sheets');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = (await res.json()) as AllSheetsData;
      setSheets(data);
    } catch (err) {
      console.error('Failed to fetch sheets:', err);
      setSheetsError('Unable to load portfolio items right now.');
    } finally {
      setSheetsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshConfig();
    refreshSheets();
  }, [refreshConfig, refreshSheets]);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(normalizePath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback(
    (to: RoutePath | string) => {
      const normalized = normalizePath(to);
      if (normalized !== currentPath) {
        window.history.pushState({}, '', normalized);
        setCurrentPath(normalized);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [currentPath]
  );

  // Sync SEO meta tags and favicon dynamically per route & config
  useEffect(() => {
    let title = config.seo.homeTitle;
    let description = config.seo.homeDescription;

    if (currentPath === '/websites') {
      title = config.seo.websitesTitle;
      description = config.seo.websitesDescription;
    } else if (currentPath === '/social-media') {
      title = config.seo.socialMediaTitle;
      description = config.seo.socialMediaDescription;
    } else if (currentPath === '/thumbnails') {
      title = config.seo.thumbnailsTitle;
      description = config.seo.thumbnailsDescription;
    } else if (currentPath === '/muh-admin') {
      title = `Admin Console | ${config.brand.name}`;
      description = 'Administrator panel for Muhammad Hassany portfolio.';
    }

    document.title = title;
    updateMetaTag('meta[name="description"]', 'content', description);
    updateMetaTag('meta[name="keywords"]', 'content', config.seo.keywords);
    updateMetaTag('meta[property="og:title"]', 'content', title);
    updateMetaTag('meta[property="og:description"]', 'content', description);
    updateMetaTag('meta[name="twitter:title"]', 'content', title);
    updateMetaTag('meta[name="twitter:description"]', 'content', description);

    const canonicalUrl = `${window.location.origin}${currentPath === '/' ? '/' : currentPath}`;
    updateMetaTag('meta[property="og:url"]', 'content', canonicalUrl);

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    if (config.brand.logoUrl) {
      const iconLink = document.querySelector('link[rel="icon"]');
      if (iconLink) iconLink.setAttribute('href', config.brand.logoUrl);
    }
  }, [currentPath, config]);

  return (
    <SiteContext.Provider
      value={{
        config,
        setConfig,
        sheets,
        sheetsLoading,
        sheetsError,
        refreshSheets: () => refreshSheets(true),
        refreshConfig,
        currentPath,
        navigate,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) {
    throw new Error('useSite must be used inside SiteProvider');
  }
  return ctx;
}
