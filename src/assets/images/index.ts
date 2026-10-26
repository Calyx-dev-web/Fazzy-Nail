import heroImg from './fazzynails_hero_1792990686791.jpg';
import acrylicImg from './fazzynails_acrylic_set_1792990688666.jpg';
import gelImg from './fazzynails_gel_polish_1792990687753.jpg';
import studioImg from './fazzynails_studio_1792990689173.jpg';
import logoImg from './image_d0ec8d5e.png';

export const IMAGES = {
  hero: heroImg,
  acrylic: acrylicImg,
  gel: gelImg,
  studio: studioImg,
  logo: logoImg,
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

  // Match known asset keys or filenames
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
