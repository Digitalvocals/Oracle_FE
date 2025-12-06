import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://streamscout.gg',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
  ]
}
