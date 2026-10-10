import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DevForge — Engineering Knowledge & Spaced Repetition OS',
    short_name: 'DevForge',
    description: 'Developer-first active recall, multi-perspective study modes, and spaced repetition platform for technical interview mastery.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0d14',
    theme_color: '#0ea5e9',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
