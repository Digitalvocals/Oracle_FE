import { MetadataRoute } from 'next'

const BASE_URL = 'https://www.streamscout.gg'

export default function sitemap(): MetadataRoute.Sitemap {
  // Base pages
  const routes = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/changelog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    // SEO Landing Pages
    {
      url: `${BASE_URL}/twitchstrike-alternative`,
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 0.9,
    },
  ]

  // Genre pages
  const genres = [
    'fps',
    'horror',
    'rpg',
    'battle-royale',
    'moba',
    'strategy',
    'survival',
    'indie',
    'mmo',
    'simulation',
    'action',
    'sports',
  ]

  const genrePages = genres.map(genre => ({
    url: `${BASE_URL}/best-${genre}-games-to-stream`,
    lastModified: new Date(),
    changeFrequency: 'always' as const,
    priority: 0.9,
  }))

  return [...routes, ...genrePages]
}
