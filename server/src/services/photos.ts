import fs from 'node:fs';
import path from 'node:path';

export function getPhotos(photosDir: string): string[] {
  if (!fs.existsSync(photosDir)) {
    try {
      fs.mkdirSync(photosDir, { recursive: true });
    } catch {
      return [];
    }
  }

  const entries = fs.readdirSync(photosDir, { withFileTypes: true });
  const validExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

  const localPhotos = entries
    .filter(e => e.isFile() && validExtensions.has(path.extname(e.name).toLowerCase()))
    .map(e => `/api/photos/view/${encodeURIComponent(e.name)}`);

  return localPhotos;
}

