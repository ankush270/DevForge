import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'InterviewOS — Personal SDE Knowledge & Revision Engine',
    short_name: 'InterviewOS',
    description: 'Developer-first spaced repetition, active recall, and note-taking platform for SDE interview preparation.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#6366f1',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
