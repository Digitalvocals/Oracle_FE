import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // Base pages
  const routes = [
    {
      url: 'https://streamscout.gg',
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 1,
    },
    {
      url: 'https://streamscout.gg/about',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: 'https://streamscout.gg/changelog',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: 'https://streamscout.gg/privacy',
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: 'https://streamscout.gg/contact',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    // SEO Landing Pages
    {
      url: 'https://streamscout.gg/twitchstrike-alternative',
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
    url: `https://streamscout.gg/best-${genre}-games-to-stream`,
    lastModified: new Date(),
    changeFrequency: 'always' as const,
    priority: 0.9,
  }))

  return [...routes, ...genrePages]
}
