import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TwitchStrike Alternative - Find Games Where Small Streamers Can Compete | StreamScout',
  description: 'Looking for a TwitchStrike alternative? StreamScout analyzes 500 games every 10 minutes to show you which games give small streamers the best shot at discovery. Live data, transparent algorithm, no signup required.',
  keywords: [
    'twitchstrike alternative',
    'twitch game recommendations',
    'streaming opportunity analyzer',
    'small streamer tools',
    'twitch discovery tool',
    'best games to stream',
    'streaming analytics',
    'twitch game finder',
    'streamer growth tool',
    'low competition twitch games'
  ],
  openGraph: {
    title: 'TwitchStrike Alternative - Find Games Where Small Streamers Can Compete',
    description: 'Live analysis of 500 games every 10 minutes. See which games give small streamers the best shot at discovery.',
    type: 'website',
    url: 'https://streamscout.gg/twitchstrike-alternative',
    siteName: 'StreamScout',
    images: [
      {
        url: '/streamscout-logo.jpg',
        width: 1200,
        height: 630,
        alt: 'StreamScout - Find Your Audience',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TwitchStrike Alternative - Find Games Where Small Streamers Can Compete',
    description: 'Live analysis of 500 games every 10 minutes. See which games give small streamers the best shot at discovery.',
    images: ['/streamscout-logo.jpg'],
  },
  alternates: {
    canonical: 'https://streamscout.gg/twitchstrike-alternative',
  },
}
