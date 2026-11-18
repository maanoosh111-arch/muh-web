import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-react';
import { ZeroBrokenImage } from '../components/ZeroBrokenImage';
import { useSite } from '../context/SiteContext';
import type { SiteConfig } from '../types/site';

type AdminTab =
  | 'brand'
  | 'home'
  | 'thumbnails'
  | 'websites'
  | 'socialMedia'
  | 'wallOfWins'
  | 'seo';

const TOKEN_STORAGE_KEY = 'mh_admin_token';

interface FieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  multiline?: boolean;
  placeholder?: string;
  hint?: string;
}

function LabeledField({ label, value, onChange, multiline, placeholder, hint }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/85">
        {label}
      </label>
      {hint && <p className="text-[11px] text-white/45">{hint}</p>}
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl bg-black border border-white/15 focus:border-[#ffd400] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none transition-colors resize-y"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl bg-black border border-white/15 focus:border-[#ffd400] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none transition-colors"
        />
      )}
    </div>
  );
}

export function AdminPage() {
  const { config, setConfig, refreshSheets, navigate } = useSite();
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem(TOKEN_STORAGE_KEY)
  );
  const [verifying, setVerifying] = useState<boolean>(!!sessionStorage.getItem(TOKEN_STORAGE_KEY));
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [draft, setDraft] = useState<SiteConfig>(config);
  const [activeTab, setActiveTab] = useState<AdminTab>('brand');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [newWallImage, setNewWallImage] = useState('');
  const [refreshingSheets, setRefreshingSheets] = useState(false);

  useEffect(() => {
    setDraft(config);
  }, [config]);

  useEffect(() => {
    const savedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!savedToken) {
      setVerifying(false);
      return;
    }
    fetch('/api/admin/verify', {
      headers: { Authorization: `Bearer ${savedToken}` },
    })
      .then((res) => {
        if (!res.ok) {
          sessionStorage.removeItem(TOKEN_STORAGE_KEY);
          setToken(null);
        }
      })
      .catch(() => {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
      })
      .finally(() => setVerifying(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) {
        setAuthError(data.error || 'Invalid password.');
        return;
      }
      sessionStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      setToken(data.token);
      setPassword('');
    } catch {
      setAuthError('Network error while verifying password.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setSaveMessage(null);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(draft),
      });
      if (res.status === 401) {
        handleLogout();
        setAuthError('Session expired. Please log in again.');
        return;
      }
      if (!res.ok) {
        throw new Error('Failed to save');
      }
      const saved = (await res.json()) as SiteConfig;
      setConfig(saved);
      setDraft(saved);
      setSaveMessage('All changes saved and published live.');
      setTimeout(() => setSaveMessage(null), 3500);
    } catch {
      setErrorMessage('Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!token) return;
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    setSaving(true);
    setConfirmReset(false);
    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const resetData = (await res.json()) as SiteConfig;
        setConfig(resetData);
        setDraft(resetData);
        setSaveMessage('Configuration reset to defaults.');
        setTimeout(() => setSaveMessage(null), 3500);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRefreshSheets = async () => {
    setRefreshingSheets(true);
    await refreshSheets();
    setRefreshingSheets(false);
    setSaveMessage('Google Sheets data refreshed.');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  // Helper updaters
  const updateSection = <K extends keyof SiteConfig>(section: K, patch: Partial<SiteConfig[K]>) => {
    setDraft((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...patch,
      },
    }));
  };

  const handleAddWallImage = () => {
    const trimmed = newWallImage.trim();
    if (!trimmed) return;
    updateSection('wallOfWins', {
      images: [trimmed, ...draft.wallOfWins.images],
    });
    setNewWallImage('');
  };

  const handleRemoveWallImage = (index: number) => {
    updateSection('wallOfWins', {
      images: draft.wallOfWins.images.filter((_, idx) => idx !== index),
    });
  };

  const handleMoveWallImage = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= draft.wallOfWins.images.length) return;
    const copy = [...draft.wallOfWins.images];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    updateSection('wallOfWins', { images: copy });
  };

  if (verifying) {
    return (
      <div className="min-h-[75vh] bg-black flex items-center justify-center px-4">
        <div className="w-8 h-8 border-2 border-[#ffd400]/30 border-t-[#ffd400] rounded-full animate-spin" />
      </div>
    );
  }

  // =========================================================================
  // LOGIN GATE
  // =========================================================================
  if (!token) {
    return (
      <div className="min-h-[80vh] bg-black flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl bg-[#0d0d0f] border border-white/15 p-7 sm:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-[#ffd400]/15 border border-[#ffd400]/40 flex items-center justify-center text-[#ffd400]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-xl font-black text-white uppercase tracking-tight">
                Admin Access
              </h1>
              <p className="text-xs text-white/60">
                Enter administrator password to edit site content
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="block text-xs font-display font-bold uppercase tracking-wider text-white/85"
              >
                Administrator Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  autoFocus
                  className="w-full rounded-xl bg-black border border-white/15 focus:border-[#ffd400] pl-4 pr-11 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="rounded-xl bg-[#ff0d1b]/15 border border-[#ff0d1b]/40 px-3.5 py-2.5 text-xs text-[#ff6b74] font-medium">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3.5 rounded-xl bg-[#ffd400] hover:bg-[#ffe14d] disabled:opacity-60 text-black font-display font-extrabold text-sm uppercase tracking-wider transition-colors cursor-pointer"
            >
              {loggingIn ? 'Verifying...' : 'Unlock Admin Panel'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabs: Array<{ id: AdminTab; label: string }> = [
    { id: 'brand', label: 'Brand & Contact' },
    { id: 'home', label: 'Home Page' },
    { id: 'thumbnails', label: 'Thumbnails Page' },
    { id: 'websites', label: 'Websites Page' },
    { id: 'socialMedia', label: 'Social Media Page' },
    { id: 'wallOfWins', label: 'Wall of Wins' },
    { id: 'seo', label: 'SEO Metadata' },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Admin Top Bar */}
      <div className="border-b border-white/10 bg-[#0a0a0c]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Site Content Administrator
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mt-1">
              Every field is labeled above it. Save changes to immediately update the live website.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleRefreshSheets}
              disabled={refreshingSheets}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshingSheets ? 'animate-spin' : ''}`} />
              <span>Sync Google Sheets</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <span>View Live Site</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                confirmReset
                  ? 'bg-[#ff0d1b] border-[#ff0d1b] text-white'
                  : 'bg-white/5 hover:bg-white/10 border-white/15 text-white/80'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{confirmReset ? 'Click Again to Confirm Reset' : 'Reset Defaults'}</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-[#ff0d1b]/20 border border-white/15 hover:border-[#ff0d1b]/50 text-xs font-semibold text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ffd400] hover:bg-[#ffe14d] disabled:opacity-60 text-black font-display font-extrabold text-xs uppercase tracking-wider shadow-[0_4px_18px_rgba(255,212,0,0.3)] transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 flex items-center gap-2 overflow-x-auto pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-display font-bold uppercase tracking-wider whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#ffd400] text-black'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Banner */}
      {(saveMessage || errorMessage) && (
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 mt-5">
          {saveMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 px-4 py-3 text-sm text-emerald-300 font-medium">
              <Check className="w-4 h-4 shrink-0" />
              <span>{saveMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div className="rounded-xl bg-[#ff0d1b]/15 border border-[#ff0d1b]/40 px-4 py-3 text-sm text-[#ff8a90] font-medium">
              {errorMessage}
            </div>
          )}
        </div>
      )}

      {/* Editor Body */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 mt-8">
        {/* =================================================================
            TAB 1: BRAND, NAVIGATION & CONTACT INFO
            ================================================================= */}
        {activeTab === 'brand' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-[#0d0d0f] border border-white/10 p-6 space-y-4">
              <h2 className="font-display text-lg font-black uppercase text-[#ffd400]">
                Brand Identity &amp; Navigation Labels
              </h2>
              <LabeledField
                label="Brand / Full Name (Navbar & Footer)"
                value={draft.brand.name}
                onChange={(v) => updateSection('brand', { name: v })}
              />
              <LabeledField
                label="Professional Role Subtitle (Footer)"
                value={draft.brand.role}
                onChange={(v) => updateSection('brand', { role: v })}
              />
              <LabeledField
                label="Website Logo & Favicon Image URL"
                value={draft.brand.logoUrl}
                onChange={(v) => updateSection('brand', { logoUrl: v })}
              />
              <LabeledField
                label="Home Page Portrait Photo URL"
                value={draft.brand.profileImageUrl}
                onChange={(v) => updateSection('brand', { profileImageUrl: v })}
              />
              <LabeledField
                label="Footer Copyright Text"
                value={draft.brand.copyrightText}
                onChange={(v) => updateSection('brand', { copyrightText: v })}
              />

              <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                <LabeledField
                  label="Navbar Link: Home"
                  value={draft.nav.homeLabel}
                  onChange={(v) => updateSection('nav', { homeLabel: v })}
                />
                <LabeledField
                  label="Navbar Link: Websites"
                  value={draft.nav.websitesLabel}
                  onChange={(v) => updateSection('nav', { websitesLabel: v })}
                />
                <LabeledField
                  label="Navbar Link: Social Media"
                  value={draft.nav.socialMediaLabel}
                  onChange={(v) => updateSection('nav', { socialMediaLabel: v })}
                />
                <LabeledField
                  label="Navbar Link: Thumbnails"
                  value={draft.nav.thumbnailsLabel}
                  onChange={(v) => updateSection('nav', { thumbnailsLabel: v })}
                />
                <div className="col-span-2">
                  <LabeledField
                    label="Navbar Primary CTA Button Text"
                    value={draft.nav.ctaLabel}
                    onChange={(v) => updateSection('nav', { ctaLabel: v })}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#0d0d0f] border border-white/10 p-6 space-y-4">
              <h2 className="font-display text-lg font-black uppercase text-[#ffd400]">
                Contact Info &amp; Booking Channels
              </h2>
              <LabeledField
                label="WhatsApp Display Phone Number"
                value={draft.contact.whatsappNumber}
                onChange={(v) => {
                  const digits = v.replace(/\D/g, '');
                  const waLink = digits.startsWith('0')
                    ? `https://wa.me/2${digits}`
                    : digits
                      ? `https://wa.me/${digits}`
                      : draft.contact.whatsappLink;
                  updateSection('contact', { whatsappNumber: v, whatsappLink: waLink });
                }}
                hint="Changing this automatically updates the WhatsApp chat link too."
              />
              <LabeledField
                label="WhatsApp Direct Chat URL"
                value={draft.contact.whatsappLink}
                onChange={(v) => updateSection('contact', { whatsappLink: v })}
              />
              <LabeledField
                label="WhatsApp Button Label"
                value={draft.contact.whatsappLabel}
                onChange={(v) => updateSection('contact', { whatsappLabel: v })}
              />
              <LabeledField
                label="WhatsApp Logo Image URL"
                value={draft.contact.whatsappLogoUrl}
                onChange={(v) => updateSection('contact', { whatsappLogoUrl: v })}
              />
              <LabeledField
                label="Calendly Booking URL"
                value={draft.contact.calendlyUrl}
                onChange={(v) => updateSection('contact', { calendlyUrl: v })}
              />
              <LabeledField
                label="Calendly Button Label"
                value={draft.contact.calendlyLabel}
                onChange={(v) => updateSection('contact', { calendlyLabel: v })}
              />
              <LabeledField
                label="Calendly Logo Image URL"
                value={draft.contact.calendlyLogoUrl}
                onChange={(v) => updateSection('contact', { calendlyLogoUrl: v })}
              />
              <LabeledField
                label="Contact Email Address"
                value={draft.contact.email}
                onChange={(v) => updateSection('contact', { email: v })}
              />
              <LabeledField
                label="Email Button Label"
                value={draft.contact.emailLabel}
                onChange={(v) => updateSection('contact', { emailLabel: v })}
              />
            </div>
          </div>
        )}

        {/* =================================================================
            TAB 2: HOME PAGE
            ================================================================= */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-[#0d0d0f] border border-white/10 p-6 space-y-4">
                <h2 className="font-display text-lg font-black uppercase text-[#ffd400]">
                  Home Hero Section
                </h2>
                <LabeledField
                  label="Home Hero Kicker (Role Above Name)"
                  value={draft.home.heroKicker}
                  onChange={(v) => updateSection('home', { heroKicker: v })}
                />
                <LabeledField
                  label="Home Hero Main Headline (Your Name)"
                  value={draft.home.heroHeadline}
                  onChange={(v) => updateSection('home', { heroHeadline: v })}
                />
                <LabeledField
                  label="Home Hero Red Tagline Subheadline"
                  value={draft.home.heroSubheadline}
                  onChange={(v) => updateSection('home', { heroSubheadline: v })}
                />
                <LabeledField
                  label="Home Hero Main Bio Description"
                  value={draft.home.heroDescription}
                  multiline
                  onChange={(v) => updateSection('home', { heroDescription: v })}
                />
                <LabeledField
                  label="Home Hero Closing Statement"
                  value={draft.home.closingStatement}
                  multiline
                  onChange={(v) => updateSection('home', { closingStatement: v })}
                />

                <div className="pt-3 border-t border-white/10 space-y-3">
                  <p className="text-xs font-display font-bold uppercase tracking-wider text-white/60">
                    Home Hero Bullet Services List
                  </p>
                  {draft.home.servicesList.map((srv, idx) => (
                    <LabeledField
                      key={idx}
                      label={`Service Bullet #${idx + 1}`}
                      value={srv}
                      onChange={(v) => {
                        const copy = [...draft.home.servicesList];
                        copy[idx] = v;
                        updateSection('home', { servicesList: copy });
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl bg-[#0d0d0f] border border-white/10 p-6 space-y-4">
                  <h2 className="font-display text-lg font-black uppercase text-[#ffd400]">
                    Home KPI Stats Strip
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {draft.home.stats.map((st, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2.5">
                        <LabeledField
                          label={`KPI #${idx + 1} Value`}
                          value={st.value}
                          onChange={(v) => {
                            const copy = [...draft.home.stats];
                            copy[idx] = { ...copy[idx], value: v };
                            updateSection('home', { stats: copy });
                          }}
                        />
                        <LabeledField
                          label={`KPI #${idx + 1} Label`}
                          value={st.label}
                          onChange={(v) => {
                            const copy = [...draft.home.stats];
                            copy[idx] = { ...copy[idx], label: v };
                            updateSection('home', { stats: copy });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#0d0d0f] border border-white/10 p-6 space-y-4">
                  <h2 className="font-display text-lg font-black uppercase text-[#ffd400]">
                    Home Portfolio Showcase Cards
                  </h2>
                  <LabeledField
                    label="Portfolio Section Title"
                    value={draft.home.pillarsTitle}
                    onChange={(v) => updateSection('home', { pillarsTitle: v })}
                  />
                  <LabeledField
                    label="Portfolio Section Subtitle"
                    value={draft.home.pillarsSubtitle}
                    multiline
                    onChange={(v) => updateSection('home', { pillarsSubtitle: v })}
                  />
                  <div className="grid grid-cols-1 gap-4 pt-2 border-t border-white/10">
                    <LabeledField
                      label="Websites Card Title"
                      value={draft.home.websitesCardTitle}
                      onChange={(v) => updateSection('home', { websitesCardTitle: v })}
                    />
                    <LabeledField
                      label="Websites Card Description"
                      value={draft.home.websitesCardDescription}
                      multiline
                      onChange={(v) => updateSection('home', { websitesCardDescription: v })}
                    />
                    <LabeledField
                      label="Websites Card Button Label"
                      value={draft.home.websitesCardButton}
                      onChange={(v) => updateSection('home', { websitesCardButton: v })}
                    />
                    <LabeledField
                      label="Social Media Card Title"
                      value={draft.home.socialMediaCardTitle}
                      onChange={(v) => updateSection('home', { socialMediaCardTitle: v })}
                    />
                    <LabeledField
                      label="Social Media Card Description"
                      value={draft.home.socialMediaCardDescription}
                      multiline
                      onChange={(v) => updateSection('home', { socialMediaCardDescription: v })}
                    />
                    <LabeledField
                      label="Social Media Card Button Label"
                      value={draft.home.socialMediaCardButton}
                      onChange={(v) => updateSection('home', { socialMediaCardButton: v })}
                    />
                    <LabeledField
                      label="Thumbnails Card Title"
                      value={draft.home.thumbnailsCardTitle}
                      onChange={(v) => updateSection('home', { thumbnailsCardTitle: v })}
                    />
                    <LabeledField
                      label="Thumbnails Card Description"
                      value={draft.home.thumbnailsCardDescription}
                      multiline
                      onChange={(v) => updateSection('home', { thumbnailsCardDescription: v })}
                    />
                    <LabeledField
                      label="Thumbnails Card Button Label"
                      value={draft.home.thumbnailsCardButton}
                      onChange={(v) => updateSection('home', { thumbnailsCardButton: v })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#0d0d0f] border border-white/10 p-6 space-y-4">
              <h2 className="font-display text-lg font-black uppercase text-[#ffd400]">
                Home Methodology &amp; Final CTA Band
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LabeledField
                  label="Methodology Small Tag"
                  value={draft.home.methodologyTag}
                  onChange={(v) => updateSection('home', { methodologyTag: v })}
                />
                <LabeledField
                  label="Methodology Section Headline"
                  value={draft.home.methodologyTitle}
                  onChange={(v) => updateSection('home', { methodologyTitle: v })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {draft.home.methodologySteps.map((step, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-3">
                    <LabeledField
                      label={`Methodology Step #${idx + 1} Title`}
                      value={step.title}
                      onChange={(v) => {
                        const copy = [...draft.home.methodologySteps];
                        copy[idx] = { ...copy[idx], title: v };
                        updateSection('home', { methodologySteps: copy });
                      }}
                    />
                    <LabeledField
                      label={`Methodology Step #${idx + 1} Description`}
                      value={step.description}
                      multiline
                      onChange={(v) => {
                        const copy = [...draft.home.methodologySteps];
                        copy[idx] = { ...copy[idx], description: v };
                        updateSection('home', { methodologySteps: copy });
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/10">
                <LabeledField
                  label="Bottom CTA Band Headline"
                  value={draft.home.finalCtaTitle}
                  onChange={(v) => updateSection('home', { finalCtaTitle: v })}
                />
                <LabeledField
                  label="Bottom CTA Band Subtitle"
                  value={draft.home.finalCtaSubtitle}
                  multiline
                  onChange={(v) => updateSection('home', { finalCtaSubtitle: v })}
                />
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            TAB 3: THUMBNAILS PAGE
            ================================================================= */}
        {activeTab === 'thumbnails' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-[#0d0d0f] border border-white/10 p-6 space-y-4">
                <h2 className="font-display text-lg font-black uppercase text-[#ffd400]">
                  Thumbnails Hero &amp; Gallery Labels
                </h2>
                <LabeledField
                  label="Thumbnails Hero Top White Headline"
                  value={draft.thumbnails.heroTopHeadline}
                  onChange={(v) => updateSection('thumbnails', { heroTopHeadline: v })}
                />
                <LabeledField
                  label="Thumbnails Hero Red Italic Accent Headline"
                  value={draft.thumbnails.heroAccentHeadline}
                  onChange={(v) => updateSection('thumbnails', { heroAccentHeadline: v })}
                />
                <LabeledField
                  label="Thumbnails Hero CTA Button Text"
                  value={draft.thumbnails.heroButtonText}
                  onChange={(v) => updateSection('thumbnails', { heroButtonText: v })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {draft.thumbnails.stats.map((st, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-2">
                      <LabeledField
                        label={`Hero Stat #${idx + 1} Value`}
                        value={st.value}
                        onChange={(v) => {
                          const copy = [...draft.thumbnails.stats];
                          copy[idx] = { ...copy[idx], value: v };
                          updateSection('thumbnails', { stats: copy });
                        }}
                      />
                      <LabeledField
                        label={`Hero Stat #${idx + 1} Label`}
                        value={st.label}
                        onChange={(v) => {
                          const copy = [...draft.thumbnails.stats];
                          copy[idx] = { ...copy[idx], label: v };
                          updateSection('thumbnails', { stats: copy });
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-white/10 space-y-3">
                  <LabeledField
                    label="Thumbnails Portfolio Tag"
                    value={draft.thumbnails.galleryTag}
                    onChange={(v) => updateSection('thumbnails', { galleryTag: v })}
                  />
                  <LabeledField
                    label="Thumbnails Portfolio Section Title"
                    value={draft.thumbnails.galleryTitle}
                    onChange={(v) => updateSection('thumbnails', { galleryTitle: v })}
                  />
                  <LabeledField
                    label="Thumbnails Portfolio Subtitle"
                    value={draft.thumbnails.gallerySubtitle}
                    multiline
                    onChange={(v) => updateSection('thumbnails', { gallerySubtitle: v })}
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-[#0d0d0f] border border-white/10 p-6 space-y-4">
                <h2 className="font-display text-lg font-black uppercase text-[#ffd400]">
                  Thumbnails Process &amp; Proof Buttons
                </h2>
                <LabeledField
                  label="Process Section Tag"
                  value={draft.thumbnails.processTag}
                  onChange={(v) => updateSection('thumbnails', { processTag: v })}
                />
                <LabeledField
                  label="Process Section Title"
                  value={draft.thumbnails.processTitle}
                  onChange={(v) => updateSection('thumbnails', { processTitle: v })}
                />

                {draft.thumbnails.processSteps.map((step, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2.5">
                    <LabeledField
                      label={`Process Step #${idx + 1} Title`}
                      value={step.title}
                      onChange={(v) => {
                        const copy = [...draft.thumbnails.processSteps];
                        copy[idx] = { ...copy[idx], title: v };
                        updateSection('thumbnails', { processSteps: copy });
                      }}
                    />
                    <LabeledField
                      label={`Process Step #${idx + 1} Description`}
                      value={step.description}
                      multiline
                      onChange={(v) => {
                        const copy = [...draft.thumbnails.processSteps];
                        copy[idx] = { ...copy[idx], description: v };
                        updateSection('thumbnails', { processSteps: copy });
                      }}
                    />
                  </div>
                ))}

                <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <LabeledField
                    label="Bottom Book A Call Button Text"
                    value={draft.thumbnails.footerButtonText}
                    onChange={(v) => updateSection('thumbnails', { footerButtonText: v })}
                  />
                  <LabeledField
                    label="Reviews Button Label"
                    value={draft.thumbnails.reviewsButtonText}
                    onChange={(v) => updateSection('thumbnails', { reviewsButtonText: v })}
                  />
                  <LabeledField
                    label="Results Button Label"
                    value={draft.thumbnails.resultsButtonText}
                    onChange={(v) => updateSection('thumbnails', { resultsButtonText: v })}
                  />
                  <LabeledField
                    label="Reviews Modal Image URL"
                    value={draft.thumbnails.reviewsImageUrl}
                    onChange={(v) => updateSection('thumbnails', { reviewsImageUrl: v })}
                  />
                  <div className="sm:col-span-2">
                    <LabeledField
                      label="Results Modal Image URL"
                      value={draft.thumbnails.resultsImageUrl}
                      onChange={(v) => updateSection('thumbnails', { resultsImageUrl: v })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Expectations Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-[#0d0d0f] border border-white/10 p-6 space-y-4">
                <h2 className="font-display text-lg font-black uppercase text-emerald-400">
                  Left Box: What You&apos;ll Get
                </h2>
                <LabeledField
                  label="Positive Column Headline"
                  value={draft.thumbnails.positiveTitle}
                  onChange={(v) => updateSection('thumbnails', { positiveTitle: v })}
                />
                {draft.thumbnails.positiveItems.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2.5">
                    <LabeledField
                      label={`Positive Item #${idx + 1} Title`}
                      value={item.title}
                      onChange={(v) => {
                        const copy = [...draft.thumbnails.positiveItems];
                        copy[idx] = { ...copy[idx], title: v };
                        updateSection('thumbnails', { positiveItems: copy });
                      }}
                    />
                    <LabeledField
                      label={`Positive Item #${idx + 1} Description`}
                      value={item.description}
                      multiline
                      onChange={(v) => {
                        const copy = [...draft.thumbnails.positiveItems];
                        copy[idx] = { ...copy[idx], description: v };
                        updateSection('thumbnails', { positiveItems: copy });
                      }}
                    />
                  </div>
                ))}
                <LabeledField
                  label="Positive Box Callout Subtext"
                  value={draft.thumbnails.positiveCalloutSub}
                  onChange={(v) => updateSection('thumbnails', { positiveCalloutSub: v })}
                />
                <LabeledField
                  label="Positive Box Callout Gold Headline"
                  value={draft.thumbnails.positiveCalloutMain}
                  onChange={(v) => updateSection('thumbnails', { positiveCalloutMain: v })}
                />
              </div>

              <div className="rounded-2xl bg-[#0d0d0f] border border-white/10 p-6 space-y-4">
                <h2 className="font-display text-lg font-black uppercase text-[#ff0d1b]">
                  Right Box: What You Won&apos;t Get
                </h2>
                <LabeledField
                  label="Negative Column Headline"
                  value={draft.thumbnails.negativeTitle}
                  onChange={(v) => updateSection('thumbnails', { negativeTitle: v })}
                />
                {draft.thumbnails.negativeItems.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2.5">
                    <LabeledField
                      label={`Negative Item #${idx + 1} Title`}
                      value={item.title}
                      onChange={(v) => {
                        const copy = [...draft.thumbnails.negativeItems];
                        copy[idx] = { ...copy[idx], title: v };
                        updateSection('thumbnails', { negativeItems: copy });
                      }}
                    />
                    <LabeledField
                      label={`Negative Item #${idx + 1} Description`}
                      value={item.description}
                      multiline
                      onChange={(v) => {
                        const copy = [...draft.thumbnails.negativeItems];
                        copy[idx] = { ...copy[idx], description: v };
                        updateSection('thumbnails', { negativeItems: copy });
                      }}
                    />
                  </div>
                ))}
                <LabeledField
                  label="Negative Box Callout Subtext"
                  value={draft.thumbnails.negativeCalloutSub}
                  onChange={(v) => updateSection('thumbnails', { negativeCalloutSub: v })}
                />
                <LabeledField
                  label="Negative Box Callout Main Text"
                  value={draft.thumbnails.negativeCalloutMain}
                  onChange={(v) => updateSection('thumbnails', { negativeCalloutMain: v })}
                />
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            TAB 4: WEBSITES PAGE
            ================================================================= */}
        {activeTab === 'websites' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-[#0d0d0f] border border-white/10 p-6 space-y-4">
              <h2 className="font-display text-lg font-black uppercase text-[#ffd400]">
                Websites Hero &amp; Gallery Text
              </h2>
              <LabeledField
                label="Websites Hero Kicker"
                value={draft.websites.heroKicker}
                onChange={(v) => updateSection('websites', { heroKicker: v })}
              />
              <LabeledField
                label="Websites Hero Top Headline"
                value={draft.websites.heroHeadline}
                onChange={(v) => updateSection('websites', { heroHeadline: v })}
              />
              <LabeledField
                label="Websites Hero Red Italic Headline"
                value={draft.websites.heroAccentHeadline}
                onChange={(v) => updateSection('websites', { heroAccentHeadline: v })}
              />
              <LabeledField
                label="Websites Hero Subtitle"
                value={draft.websites.heroSubtitle}
                multiline
                onChange={(v) => updateSection('websites', { heroSubtitle: v })}
              />
              <LabeledField
                label="Websites Hero CTA Button Text"
                value={draft.websites.heroButtonText}
                onChange={(v) => updateSection('websites', { heroButtonText: v })}
              />
              <LabeledField
                label="Websites Gallery Tag"
                value={draft.websites.galleryTag}
                onChange={(v) => updateSection('websites', { galleryTag: v })}
              />
              <LabeledField
                label="Websites Gallery Title"
                value={draft.websites.galleryTitle}
                onChange={(v) => updateSection('websites', { galleryTitle: v })}
              />
              <LabeledField
                label="Websites Gallery Subtitle"
                value={draft.websites.gallerySubtitle}
                multiline
                onChange={(v) => updateSection('websites', { gallerySubtitle: v })}
              />
              <LabeledField
                label="Hover Card 'Open' Button Label"
                value={draft.websites.openButtonLabel}
                onChange={(v) => updateSection('websites', { openButtonLabel: v })}
              />
            </div>

            <div className="rounded-2xl bg-[#0d0d0f] border border-white/10 p-6 space-y-4">
              <h2 className="font-display text-lg font-black uppercase text-[#ffd400]">
                Websites Process Steps
              </h2>
              <LabeledField
                label="Websites Process Tag"
                value={draft.websites.processTag}
                onChange={(v) => updateSection('websites', { processTag: v })}
              />
              <LabeledField
                label="Websites Process Headline"
                value={draft.websites.processTitle}
                onChange={(v) => updateSection('websites', { processTitle: v })}
              />
              {draft.websites.processSteps.map((step, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2.5">
                  <LabeledField
                    label={`Website Step #${idx + 1} Title`}
                    value={step.title}
                    onChange={(v) => {
                      const copy = [...draft.websites.processSteps];
                      copy[idx] = { ...copy[idx], title: v };
                      updateSection('websites', { processSteps: copy });
                    }}
                  />
                  <LabeledField
                    label={`Website Step #${idx + 1} Description`}
                    value={step.description}
                    multiline
                    onChange={(v) => {
                      const copy = [...draft.websites.processSteps];
                      copy[idx] = { ...copy[idx], description: v };
                      updateSection('websites', { processSteps: copy });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================
            TAB 5: SOCIAL MEDIA PAGE
            ================================================================= */}
        {activeTab === 'socialMedia' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-[#0d0d0f] border border-white/10 p-6 space-y-4">
              <h2 className="font-display text-lg font-black uppercase text-[#ffd400]">
                Social Media Hero &amp; Gallery Text
              </h2>
              <LabeledField
                label="Social Media Hero Kicker"
                value={draft.socialMedia.heroKicker}
                onChange={(v) => updateSection('socialMedia', { heroKicker: v })}
              />
              <LabeledField
                label="Social Media Hero Top Headline"
                value={draft.socialMedia.heroHeadline}
                onChange={(v) => updateSection('socialMedia', { heroHeadline: v })}
              />
              <LabeledField
                label="Social Media Hero Red Italic Headline"
                value={draft.socialMedia.heroAccentHeadline}
                onChange={(v) => updateSection('socialMedia', { heroAccentHeadline: v })}
              />
              <LabeledField
                label="Social Media Hero Subtitle"
                value={draft.socialMedia.heroSubtitle}
                multiline
                onChange={(v) => updateSection('socialMedia', { heroSubtitle: v })}
              />
              <LabeledField
                label="Social Media Hero CTA Button Text"
                value={draft.socialMedia.heroButtonText}
                onChange={(v) => updateSection('socialMedia', { heroButtonText: v })}
              />
              <LabeledField
                label="Social Media Gallery Tag"
                value={draft.socialMedia.galleryTag}
                onChange={(v) => updateSection('socialMedia', { galleryTag: v })}
              />
              <LabeledField
                label="Social Media Gallery Title"
                value={draft.socialMedia.galleryTitle}
                onChange={(v) => updateSection('socialMedia', { galleryTitle: v })}
              />
              <LabeledField
                label="Social Media Gallery Subtitle"
                value={draft.socialMedia.gallerySubtitle}
                multiline
                onChange={(v) => updateSection('socialMedia', { gallerySubtitle: v })}
              />
            </div>

            <div className="rounded-2xl bg-[#0d0d0f] border border-white/10 p-6 space-y-4">
              <h2 className="font-display text-lg font-black uppercase text-[#ffd400]">
                Social Media Process Steps
              </h2>
              <LabeledField
                label="Social Media Process Tag"
                value={draft.socialMedia.processTag}
                onChange={(v) => updateSection('socialMedia', { processTag: v })}
              />
              <LabeledField
                label="Social Media Process Headline"
                value={draft.socialMedia.processTitle}
                onChange={(v) => updateSection('socialMedia', { processTitle: v })}
              />
              {draft.socialMedia.processSteps.map((step, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2.5">
                  <LabeledField
                    label={`Social Step #${idx + 1} Title`}
                    value={step.title}
                    onChange={(v) => {
                      const copy = [...draft.socialMedia.processSteps];
                      copy[idx] = { ...copy[idx], title: v };
                      updateSection('socialMedia', { processSteps: copy });
                    }}
                  />
                  <LabeledField
                    label={`Social Step #${idx + 1} Description`}
                    value={step.description}
                    multiline
                    onChange={(v) => {
                      const copy = [...draft.socialMedia.processSteps];
                      copy[idx] = { ...copy[idx], description: v };
                      updateSection('socialMedia', { processSteps: copy });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================
            TAB 6: WALL OF WINS IMAGES & TEXT
            ================================================================= */}
        {activeTab === 'wallOfWins' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-[#0d0d0f] border border-white/10 p-6 space-y-4">
              <h2 className="font-display text-lg font-black uppercase text-[#ffd400]">
                Wall of Wins Header Copy
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <LabeledField
                  label="Wall of Wins Tag"
                  value={draft.wallOfWins.tag}
                  onChange={(v) => updateSection('wallOfWins', { tag: v })}
                />
                <LabeledField
                  label="Wall of Wins Title"
                  value={draft.wallOfWins.title}
                  onChange={(v) => updateSection('wallOfWins', { title: v })}
                />
                <LabeledField
                  label="Wall of Wins Subtitle"
                  value={draft.wallOfWins.subtitle}
                  onChange={(v) => updateSection('wallOfWins', { subtitle: v })}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-[#0d0d0f] border border-white/10 p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="flex-1">
                  <LabeledField
                    label="Add New Wall of Wins Image URL"
                    value={newWallImage}
                    onChange={setNewWallImage}
                    placeholder="https://res.cloudinary.com/..."
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddWallImage}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#ffd400] hover:bg-[#ffe14d] text-black font-display font-extrabold text-xs uppercase tracking-wider cursor-pointer shrink-0 h-[42px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Image</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {draft.wallOfWins.images.map((imgUrl, idx) => (
                  <div
                    key={`${idx}-${imgUrl.slice(-12)}`}
                    className="rounded-xl bg-black/60 border border-white/10 p-4 flex gap-4 items-start"
                  >
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-[#151518] border border-white/10 shrink-0">
                      <ZeroBrokenImage
                        src={imgUrl}
                        alt={`Wall of Wins Screenshot ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2.5">
                      <LabeledField
                        label={`Receipt Image #${idx + 1} URL`}
                        value={imgUrl}
                        onChange={(v) => {
                          const copy = [...draft.wallOfWins.images];
                          copy[idx] = v;
                          updateSection('wallOfWins', { images: copy });
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleMoveWallImage(idx, -1)}
                          disabled={idx === 0}
                          aria-label="Move up"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 text-white cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveWallImage(idx, 1)}
                          disabled={idx === draft.wallOfWins.images.length - 1}
                          aria-label="Move down"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 text-white cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveWallImage(idx)}
                          className="ml-auto inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#ff0d1b]/15 hover:bg-[#ff0d1b]/30 text-[#ff6b74] text-xs font-semibold cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            TAB 7: SEO SETTINGS
            ================================================================= */}
        {activeTab === 'seo' && (
          <div className="rounded-2xl bg-[#0d0d0f] border border-white/10 p-6 space-y-4 max-w-4xl">
            <h2 className="font-display text-lg font-black uppercase text-[#ffd400]">
              Search Engine Optimization (Titles, Meta Descriptions &amp; Keywords)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LabeledField
                label="Home Page SEO Title"
                value={draft.seo.homeTitle}
                onChange={(v) => updateSection('seo', { homeTitle: v })}
              />
              <LabeledField
                label="Thumbnails Page SEO Title"
                value={draft.seo.thumbnailsTitle}
                onChange={(v) => updateSection('seo', { thumbnailsTitle: v })}
              />
              <LabeledField
                label="Home Page Meta Description"
                value={draft.seo.homeDescription}
                multiline
                onChange={(v) => updateSection('seo', { homeDescription: v })}
              />
              <LabeledField
                label="Thumbnails Page Meta Description"
                value={draft.seo.thumbnailsDescription}
                multiline
                onChange={(v) => updateSection('seo', { thumbnailsDescription: v })}
              />
              <LabeledField
                label="Websites Page SEO Title"
                value={draft.seo.websitesTitle}
                onChange={(v) => updateSection('seo', { websitesTitle: v })}
              />
              <LabeledField
                label="Social Media Page SEO Title"
                value={draft.seo.socialMediaTitle}
                onChange={(v) => updateSection('seo', { socialMediaTitle: v })}
              />
              <LabeledField
                label="Websites Page Meta Description"
                value={draft.seo.websitesDescription}
                multiline
                onChange={(v) => updateSection('seo', { websitesDescription: v })}
              />
              <LabeledField
                label="Social Media Page Meta Description"
                value={draft.seo.socialMediaDescription}
                multiline
                onChange={(v) => updateSection('seo', { socialMediaDescription: v })}
              />
              <div className="md:col-span-2">
                <LabeledField
                  label="Global Niche SEO Keywords (Comma-Separated)"
                  value={draft.seo.keywords}
                  multiline
                  onChange={(v) => updateSection('seo', { keywords: v })}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
