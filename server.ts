import crypto from 'crypto';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { DEFAULT_SITE_CONFIG } from './src/data/defaultConfig.ts';
import type { AllSheetsData, MediaWorkItem, SheetTabData, SiteConfig, WebsiteWorkItem } from './src/types/site.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const SPREADSHEET_ID = '1wS_-uFa9gJJEZE9Hrl2fMRGAlQX0fVxOLWI0wzewgfs';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'R&O2hAd!62GtyXsT';
const DATA_DIR = path.resolve(__dirname, 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'site-config.json');

const adminSessions = new Map<string, number>();
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMerge<T>(base: T, override: unknown): T {
  if (!isRecord(base) || !isRecord(override)) {
    return (override !== undefined ? override : base) as T;
  }
  const result: Record<string, unknown> = { ...base };
  for (const key of Object.keys(override)) {
    const baseVal = (base as Record<string, unknown>)[key];
    const overVal = override[key];
    if (Array.isArray(overVal)) {
      result[key] = overVal;
    } else if (isRecord(baseVal) && isRecord(overVal)) {
      result[key] = deepMerge(baseVal, overVal);
    } else if (overVal !== undefined) {
      result[key] = overVal;
    }
  }
  return result as T;
}

function loadSiteConfig(): SiteConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return deepMerge(DEFAULT_SITE_CONFIG, parsed);
    }
  } catch (err) {
    console.error('Failed to read site-config.json, using defaults:', err);
  }
  return DEFAULT_SITE_CONFIG;
}

function saveSiteConfig(config: SiteConfig): SiteConfig {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const merged = deepMerge(DEFAULT_SITE_CONFIG, config);
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  return merged;
}

function verifyPassword(input: string): boolean {
  const expectedBuf = Buffer.from(ADMIN_PASSWORD, 'utf-8');
  const inputBuf = Buffer.from(input, 'utf-8');
  if (expectedBuf.length !== inputBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuf, inputBuf);
}

function extractToken(req: express.Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
}

function isAuthenticated(req: express.Request): boolean {
  const token = extractToken(req);
  if (!token) return false;
  const expiresAt = adminSessions.get(token);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    adminSessions.delete(token);
    return false;
  }
  return true;
}

// ============================================================================
// GOOGLE SHEETS LIVE PARSER (Strictly ignores "prev" columns)
// ============================================================================
interface GvizCell {
  v?: string | number | null;
}

interface GvizRow {
  c?: Array<GvizCell | null>;
}

interface GvizResponse {
  table?: {
    cols?: Array<{ label?: string }>;
    rows?: GvizRow[];
  };
}

function parseGvizJson(rawText: string): GvizResponse {
  const start = rawText.indexOf('{');
  const end = rawText.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Invalid gviz response format');
  }
  return JSON.parse(rawText.slice(start, end + 1)) as GvizResponse;
}

async function fetchSheetTab(sheetName: string): Promise<{
  heroImage: string | null;
  rows: Array<{ workImage: string; linkedTo?: string }>;
}> {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  if (!res.ok) {
    throw new Error(`Google Sheets returned ${res.status} for ${sheetName}`);
  }
  const text = await res.text();
  const parsed = parseGvizJson(text);
  const tableRows = parsed.table?.rows || [];
  if (tableRows.length === 0) {
    return { heroImage: null, rows: [] };
  }

  // Detect headers either from table.cols[].label or from row 0
  const colLabels = (parsed.table?.cols || []).map((c) => (c.label || '').trim().toLowerCase());
  const firstRowVals = (tableRows[0]?.c || []).map((cell) =>
    cell && cell.v != null ? String(cell.v).trim().toLowerCase() : ''
  );

  const hasHeaderInFirstRow = firstRowVals.some(
    (v) => v === 'work image' || v === 'linked to' || v === 'hero image' || v === 'prev'
  );

  const headers = hasHeaderInFirstRow ? firstRowVals : colLabels;
  const dataStartIndex = hasHeaderInFirstRow ? 1 : 0;

  let workImageIdx = -1;
  let linkedToIdx = -1;
  let heroImageIdx = -1;

  headers.forEach((h, idx) => {
    if (h === 'prev') return; // Strictly ignore "prev" columns
    if (h === 'work image' && workImageIdx === -1) workImageIdx = idx;
    if (h === 'linked to' && linkedToIdx === -1) linkedToIdx = idx;
    if (h === 'hero image' && heroImageIdx === -1) heroImageIdx = idx;
  });

  if (workImageIdx === -1) workImageIdx = 0;

  let heroImage: string | null = null;
  const items: Array<{ workImage: string; linkedTo?: string }> = [];

  for (let i = dataStartIndex; i < tableRows.length; i++) {
    const cells = tableRows[i]?.c || [];
    const getCell = (idx: number): string => {
      if (idx < 0 || idx >= cells.length) return '';
      const cell = cells[idx];
      return cell && cell.v != null ? String(cell.v).trim() : '';
    };

    const heroCandidate = heroImageIdx !== -1 ? getCell(heroImageIdx) : '';
    if (!heroImage && heroCandidate && heroCandidate.startsWith('http')) {
      heroImage = heroCandidate;
    }

    const workImage = getCell(workImageIdx);
    const linkedTo = linkedToIdx !== -1 ? getCell(linkedToIdx) : '';

    if (workImage && workImage.startsWith('http')) {
      items.push({
        workImage,
        ...(linkedTo ? { linkedTo } : {}),
      });
    }
  }

  return { heroImage, rows: items };
}

async function discoverSheetNames(): Promise<string[]> {
  try {
    const html = await fetch(`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/htmlview`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    }).then((r) => r.text());
    const matches = [...html.matchAll(/items\.push\(\{name:\s*"([^"]+)"/g)].map((m) => m[1]);
    if (matches.length > 0) return matches;
  } catch {
    // Fallback to known tabs
  }
  return ['Websites', 'Social Media', 'Thumbnails'];
}

const FALLBACK_SHEETS: AllSheetsData = {
  websites: {
    sheetName: 'Websites',
    heroImage: 'https://res.cloudinary.com/h74mxqsb/image/upload/v1794930651/WEB-PST-FTR_gdiwum.jpg',
    items: [
      {
        workImage: 'https://res.cloudinary.com/h74mxqsb/image/upload/v1794930662/ZKS-WEB-MKP_kqtix5.jpg',
        linkedTo: 'https://zoks-socks.cloud.run/',
      },
      {
        workImage: 'https://res.cloudinary.com/h74mxqsb/image/upload/v1794930661/KKZ-WEB-MKP_p0zqo3.jpg',
        linkedTo: 'https://kickers.cloud.run/',
      },
      {
        workImage: 'https://res.cloudinary.com/h74mxqsb/image/upload/v1794930661/SWT-WEB-MKP_oxr1pl.jpg',
        linkedTo: 'https://aiisha.cloud.run/',
      },
    ],
  },
  socialMedia: {
    sheetName: 'Social Media',
    heroImage: 'https://res.cloudinary.com/h74mxqsb/image/upload/v1794930652/PST-FTR_zaxfti.jpg',
    items: [
      {
        workImage:
          'https://res.cloudinary.com/h74mxqsb/image/upload/v1794931180/SnapInsta.to_186355712_511596086650083_8928046579417768496_n_ii7zeu.jpg',
      },
      {
        workImage:
          'https://res.cloudinary.com/h74mxqsb/image/upload/v1794931179/SnapInsta.to_184939618_3970429853033197_1028108860663202742_n_uwn1l2.jpg',
      },
      {
        workImage:
          'https://res.cloudinary.com/h74mxqsb/image/upload/v1794931180/SnapInsta.to_185188355_1443730252647118_686639806449012761_n_maoe84.jpg',
      },
      {
        workImage:
          'https://res.cloudinary.com/h74mxqsb/image/upload/v1794931179/SnapInsta.to_345677520_763795478566885_4016328152844449861_n_kbcgmh.jpg',
      },
    ],
  },
  thumbnails: {
    sheetName: 'Thumbnails',
    heroImage: 'https://res.cloudinary.com/h74mxqsb/image/upload/v1794930651/THU-FTR_wnvzce.jpg',
    items: [
      { workImage: 'https://res.cloudinary.com/h74mxqsb/image/upload/v1794931110/PP8JGxgW2_ndl2pb.jpg' },
      { workImage: 'https://res.cloudinary.com/h74mxqsb/image/upload/v1794931132/PPwEJGFn_utz8ri.jpg' },
      { workImage: 'https://res.cloudinary.com/h74mxqsb/image/upload/v1794931134/PPk0xrwM_o1sqdx.jpg' },
      { workImage: 'https://res.cloudinary.com/h74mxqsb/image/upload/v1794931138/PPpjO4Po_zkzbx1.jpg' },
      {
        workImage:
          'https://res.cloudinary.com/h74mxqsb/image/upload/v1794931143/Every_Reason_South_Park_Now_Hates_Family_Guy2_z8nnth.jpg',
      },
      { workImage: 'https://res.cloudinary.com/h74mxqsb/image/upload/v1794931144/T1L8R9SW_pdx04l.jpg' },
      { workImage: 'https://res.cloudinary.com/h74mxqsb/image/upload/v1794931146/PPY4G4gR_mmvzbr.jpg' },
      {
        workImage:
          'https://res.cloudinary.com/h74mxqsb/image/upload/v1794931148/Every_Reason_South_Park_Now_Hates_Family_Guy_nwh404.jpg',
      },
    ],
  },
  extraSheets: {},
  fetchedAt: new Date().toISOString(),
};

let sheetsCache: { data: AllSheetsData; expiresAt: number } | null = null;
const SHEETS_CACHE_TTL_MS = 60 * 1000;

async function getAllSheetsData(forceRefresh = false): Promise<AllSheetsData> {
  if (!forceRefresh && sheetsCache && Date.now() < sheetsCache.expiresAt) {
    return sheetsCache.data;
  }

  try {
    const tabNames = await discoverSheetNames();
    const results = await Promise.all(
      tabNames.map(async (name) => ({
        name,
        data: await fetchSheetTab(name),
      }))
    );

    const data: AllSheetsData = {
      websites: { ...FALLBACK_SHEETS.websites },
      socialMedia: { ...FALLBACK_SHEETS.socialMedia },
      thumbnails: { ...FALLBACK_SHEETS.thumbnails },
      extraSheets: {},
      fetchedAt: new Date().toISOString(),
    };

    for (const entry of results) {
      const normalized = entry.name.trim().toLowerCase();
      if (normalized === 'websites') {
        data.websites = {
          sheetName: entry.name,
          heroImage: entry.data.heroImage || FALLBACK_SHEETS.websites.heroImage,
          items: entry.data.rows.map((r) => ({
            workImage: r.workImage,
            linkedTo: r.linkedTo || '',
          })) as WebsiteWorkItem[],
        };
      } else if (normalized === 'social media') {
        data.socialMedia = {
          sheetName: entry.name,
          heroImage: entry.data.heroImage || FALLBACK_SHEETS.socialMedia.heroImage,
          items: entry.data.rows.map((r) => ({ workImage: r.workImage })) as MediaWorkItem[],
        };
      } else if (normalized === 'thumbnails') {
        data.thumbnails = {
          sheetName: entry.name,
          heroImage: entry.data.heroImage || FALLBACK_SHEETS.thumbnails.heroImage,
          items: entry.data.rows.map((r) => ({ workImage: r.workImage })) as MediaWorkItem[],
        };
      } else {
        const slug = normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        data.extraSheets[slug] = {
          sheetName: entry.name,
          heroImage: entry.data.heroImage,
          items: entry.data.rows,
        } as SheetTabData<{ workImage: string; linkedTo?: string }>;
      }
    }

    sheetsCache = { data, expiresAt: Date.now() + SHEETS_CACHE_TTL_MS };
    return data;
  } catch (err) {
    console.error('Error fetching Google Sheets, serving fallback:', err);
    return sheetsCache ? sheetsCache.data : FALLBACK_SHEETS;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function injectRouteSeo(html: string, routePath: string, config: SiteConfig, origin: string): string {
  let title = config.seo.homeTitle;
  let description = config.seo.homeDescription;

  if (routePath === '/websites') {
    title = config.seo.websitesTitle;
    description = config.seo.websitesDescription;
  } else if (routePath === '/social-media') {
    title = config.seo.socialMediaTitle;
    description = config.seo.socialMediaDescription;
  } else if (routePath === '/thumbnails') {
    title = config.seo.thumbnailsTitle;
    description = config.seo.thumbnailsDescription;
  } else if (routePath === '/muh-admin') {
    title = `Admin Console | ${config.brand.name}`;
    description = 'Site administration panel.';
  }

  const canonical = `${origin}${routePath === '/' ? '/' : routePath}`;
  let out = html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${escapeHtml(description)}" />`
    )
    .replace(
      /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="keywords" content="${escapeHtml(config.seo.keywords)}" />`
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:title" content="${escapeHtml(title)}" />`
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:description" content="${escapeHtml(description)}" />`
    )
    .replace(
      /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:title" content="${escapeHtml(title)}" />`
    )
    .replace(
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:description" content="${escapeHtml(description)}" />`
    );

  const robotsTag = routePath === '/muh-admin' ? '<meta name="robots" content="noindex, nofollow" />' : '';
  const canonicalTag = `<link rel="canonical" href="${escapeHtml(canonical)}" />`;
  out = out.replace('</head>', `  ${canonicalTag}\n  ${robotsTag}\n  </head>`);
  return out;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // Public API: Get live Google Sheets data
  app.get('/api/sheets', async (req, res) => {
    const force = req.query.refresh === '1';
    const data = await getAllSheetsData(force);
    res.json(data);
  });

  // Public API: Get current Site Config
  app.get('/api/config', (_req, res) => {
    res.json(loadSiteConfig());
  });

  // Admin API: Login
  app.post('/api/admin/login', (req, res) => {
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!verifyPassword(password)) {
      res.status(401).json({ error: 'Incorrect password. Please verify and try again.' });
      return;
    }
    const token = crypto.randomBytes(32).toString('hex');
    adminSessions.set(token, Date.now() + SESSION_TTL_MS);
    res.json({ token });
  });

  // Admin API: Verify token
  app.get('/api/admin/verify', (req, res) => {
    if (!isAuthenticated(req)) {
      res.status(401).json({ valid: false });
      return;
    }
    res.json({ valid: true });
  });

  // Admin API: Update Site Config
  app.put('/api/admin/config', (req, res) => {
    if (!isAuthenticated(req)) {
      res.status(401).json({ error: 'Unauthorized. Please log in again.' });
      return;
    }
    if (!isRecord(req.body)) {
      res.status(400).json({ error: 'Invalid configuration payload.' });
      return;
    }
    const saved = saveSiteConfig(req.body as unknown as SiteConfig);
    res.json(saved);
  });

  // Admin API: Reset to Default Config
  app.post('/api/admin/reset', (req, res) => {
    if (!isAuthenticated(req)) {
      res.status(401).json({ error: 'Unauthorized. Please log in again.' });
      return;
    }
    const saved = saveSiteConfig(DEFAULT_SITE_CONFIG);
    res.json(saved);
  });

  // SEO: robots.txt
  app.get('/robots.txt', (req, res) => {
    const origin = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    res.type('text/plain').send(
      `User-agent: *\nAllow: /\nDisallow: /muh-admin\nDisallow: /api/\n\nSitemap: ${origin.replace(/\/$/, '')}/sitemap.xml\n`
    );
  });

  // SEO: sitemap.xml
  app.get('/sitemap.xml', (req, res) => {
    const origin = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const routes = [
      { path: '/', priority: '1.0' },
      { path: '/websites', priority: '0.9' },
      { path: '/social-media', priority: '0.9' },
      { path: '/thumbnails', priority: '0.9' },
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (r) => `  <url>
    <loc>${origin}${r.path}</loc>
    <changefreq>weekly</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
    res.type('application/xml').send(xml);
  });

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use(async (req, res, next) => {
      if (req.originalUrl.startsWith('/api/')) {
        next();
        return;
      }
      try {
        const rawHtml = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        const transformed = await vite.transformIndexHtml(req.originalUrl, rawHtml);
        const config = loadSiteConfig();
        const origin = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
        const cleanPath = req.path.replace(/\/$/, '') || '/';
        const finalHtml = injectRouteSeo(transformed, cleanPath, config, origin);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir, { index: false }));

    app.use((req, res) => {
      const indexPath = path.join(distDir, 'index.html');
      const rawHtml = fs.readFileSync(indexPath, 'utf-8');
      const config = loadSiteConfig();
      const origin = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
      const cleanPath = req.path.replace(/\/$/, '') || '/';
      const finalHtml = injectRouteSeo(rawHtml, cleanPath, config, origin);
      res.status(200).set({ 'Content-Type': 'text/html' }).send(finalHtml);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
