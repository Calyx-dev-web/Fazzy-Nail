// Realistic high-resolution photography assets for Fazzynails luxury salon
const REAL_HERO_IMG = 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80';
const REAL_ACRYLIC_IMG = 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80';
const REAL_GEL_IMG = 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80';
const REAL_STUDIO_IMG = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80';
const UPLOADED_FAZZY_LOGO = '/assets/aistudio/IMG_20261111_015106_390_dbe186d0.jpg';

export const IMAGES = {
  hero: REAL_HERO_IMG,
  acrylic: REAL_ACRYLIC_IMG,
  gel: REAL_GEL_IMG,
  studio: REAL_STUDIO_IMG,
  logo: UPLOADED_FAZZY_LOGO,
};

/**
 * Resolves any image URL or legacy path to a robust, working URL that works in production,
 * GitHub Pages subpaths, and Hostinger root domains.
 */
export function resolveImageUrl(url: string | undefined): string {
  if (!url) return IMAGES.hero;

  // Data URLs and remote HTTP/HTTPS links
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Match known asset keys or legacy filenames
  if (url.includes('fazzynails_hero') || url === 'hero') return IMAGES.hero;
  if (url.includes('fazzynails_acrylic') || url === 'acrylic') return IMAGES.acrylic;
  if (url.includes('fazzynails_gel') || url === 'gel') return IMAGES.gel;
  if (url.includes('fazzynails_studio') || url === 'studio') return IMAGES.studio;
  if (url.includes('image_d0ec8d5e') || url.includes('logo')) return IMAGES.logo;

  // Clean relative path with base url
  const clean = url.startsWith('/') ? url.slice(1) : url;
  const baseUrl = import.meta.env.BASE_URL || './';
  const separator = baseUrl.endsWith('/') ? '' : '/';
  return `${baseUrl}${separator}${clean}`;
}
