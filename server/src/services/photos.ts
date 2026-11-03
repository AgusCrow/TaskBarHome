import fs from 'node:fs';
import path from 'node:path';

const FALLBACK_WALLPAPERS = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80'
];

export function getPhotos(photosDir: string): string[] {
  if (!fs.existsSync(photosDir)) {
    try {
      fs.mkdirSync(photosDir, { recursive: true });
    } catch {
      return FALLBACK_WALLPAPERS;
    }
  }

  const entries = fs.readdirSync(photosDir, { withFileTypes: true });
  const validExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

  const localPhotos = entries
    .filter(e => e.isFile() && validExtensions.has(path.extname(e.name).toLowerCase()))
    .map(e => `/api/photos/view/${encodeURIComponent(e.name)}`);

  if (localPhotos.length === 0) {
    return FALLBACK_WALLPAPERS;
  }

  return localPhotos;
}

