export type RoutePath = '/' | '/websites' | '/social-media' | '/thumbnails' | '/muh-admin';

export interface StatItem {
  value: string;
  label: string;
}

export interface ProcessStep {
  title: string;
  description: string;
}

export interface ExpectationItem {
  title: string;
  description: string;
}

export interface WebsiteWorkItem {
  workImage: string;
  linkedTo: string;
}

export interface MediaWorkItem {
  workImage: string;
}

export interface SheetTabData<T> {
  sheetName: string;
  heroImage: string | null;
  items: T[];
}

export interface AllSheetsData {
  websites: SheetTabData<WebsiteWorkItem>;
  socialMedia: SheetTabData<MediaWorkItem>;
  thumbnails: SheetTabData<MediaWorkItem>;
  extraSheets: Record<string, SheetTabData<{ workImage: string; linkedTo?: string }>>;
  fetchedAt: string;
}

export interface SiteConfig {
  brand: {
    name: string;
    role: string;
    logoUrl: string;
    profileImageUrl: string;
    copyrightText: string;
  };
  contact: {
    whatsappNumber: string;
    whatsappLink: string;
    whatsappLabel: string;
    whatsappLogoUrl: string;
    calendlyUrl: string;
    calendlyLabel: string;
    calendlyLogoUrl: string;
    email: string;
    emailLabel: string;
  };
  nav: {
    homeLabel: string;
    websitesLabel: string;
    socialMediaLabel: string;
    thumbnailsLabel: string;
    ctaLabel: string;
  };
  home: {
    heroKicker: string;
    heroHeadline: string;
    heroSubheadline: string;
    heroDescription: string;
    servicesList: string[];
    closingStatement: string;
    stats: StatItem[];
    pillarsTitle: string;
    pillarsSubtitle: string;
    websitesCardTitle: string;
    websitesCardDescription: string;
    websitesCardButton: string;
    socialMediaCardTitle: string;
    socialMediaCardDescription: string;
    socialMediaCardButton: string;
    thumbnailsCardTitle: string;
    thumbnailsCardDescription: string;
    thumbnailsCardButton: string;
    methodologyTag: string;
    methodologyTitle: string;
    methodologySteps: ProcessStep[];
    finalCtaTitle: string;
    finalCtaSubtitle: string;
  };
  thumbnails: {
    heroTopHeadline: string;
    heroAccentHeadline: string;
    stats: StatItem[];
    heroButtonText: string;
    galleryTag: string;
    galleryTitle: string;
    gallerySubtitle: string;
    processTag: string;
    processTitle: string;
    processSteps: ProcessStep[];
    positiveTitle: string;
    positiveItems: ExpectationItem[];
    positiveCalloutSub: string;
    positiveCalloutMain: string;
    negativeTitle: string;
    negativeItems: ExpectationItem[];
    negativeCalloutSub: string;
    negativeCalloutMain: string;
    footerButtonText: string;
    reviewsButtonText: string;
    resultsButtonText: string;
    reviewsImageUrl: string;
    resultsImageUrl: string;
  };
  websites: {
    heroKicker: string;
    heroHeadline: string;
    heroAccentHeadline: string;
    heroSubtitle: string;
    heroButtonText: string;
    galleryTag: string;
    galleryTitle: string;
    gallerySubtitle: string;
    openButtonLabel: string;
    processTag: string;
    processTitle: string;
    processSteps: ProcessStep[];
  };
  socialMedia: {
    heroKicker: string;
    heroHeadline: string;
    heroAccentHeadline: string;
    heroSubtitle: string;
    heroButtonText: string;
    galleryTag: string;
    galleryTitle: string;
    gallerySubtitle: string;
    processTag: string;
    processTitle: string;
    processSteps: ProcessStep[];
  };
  wallOfWins: {
    tag: string;
    title: string;
    subtitle: string;
    images: string[];
  };
  seo: {
    homeTitle: string;
    homeDescription: string;
    websitesTitle: string;
    websitesDescription: string;
    socialMediaTitle: string;
    socialMediaDescription: string;
    thumbnailsTitle: string;
    thumbnailsDescription: string;
    keywords: string;
  };
}
