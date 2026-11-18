/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { MotionConfig } from 'motion/react';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { SiteProvider, useSite } from './context/SiteContext';
import { AdminPage } from './pages/AdminPage';
import { HomePage } from './pages/HomePage';
import { SocialMediaPage } from './pages/SocialMediaPage';
import { ThumbnailsPage } from './pages/ThumbnailsPage';
import { WebsitesPage } from './pages/WebsitesPage';

function AppShell() {
  const { currentPath, navigate } = useSite();

  // Protect portfolio imagery from accidental drag while preserving normal text/form interactions
  useEffect(() => {
    const onDragStart = (e: DragEvent) => {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
      }
    };
    document.addEventListener('dragstart', onDragStart);
    return () => document.removeEventListener('dragstart', onDragStart);
  }, []);

  const renderPage = () => {
    if (currentPath === '/') return <HomePage />;
    if (currentPath === '/websites') return <WebsitesPage />;
    if (currentPath === '/social-media') return <SocialMediaPage />;
    if (currentPath === '/thumbnails') return <ThumbnailsPage />;
    if (currentPath === '/muh-admin') return <AdminPage />;

    // Clean 404 fallback routing back home
    return (
      <div className="min-h-[70vh] bg-black flex flex-col items-center justify-center text-center px-4 py-20 space-y-5">
        <p className="font-mono text-sm text-[#ff0d1b] uppercase tracking-widest font-bold">404</p>
        <h1 className="font-display text-3xl sm:text-5xl font-black uppercase text-white">
          Page Not Found
        </h1>
        <p className="text-sm text-white/65 max-w-md">
          The page you are looking for does not exist. Return to the main portfolio to explore Websites, Social Media, and YouTube Thumbnails.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-xl bg-[#ffd400] hover:bg-[#ffe14d] text-black font-display font-extrabold text-xs uppercase tracking-wider cursor-pointer"
        >
          Back to Home
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-1">{renderPage()}</main>
      {currentPath !== '/muh-admin' && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <SiteProvider>
        <AppShell />
      </SiteProvider>
    </MotionConfig>
  );
}
