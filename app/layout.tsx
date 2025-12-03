import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Twitch Streaming Opportunity Analyzer | Find the Best Games to Stream',
  description: 'Real-time analysis of the best games to stream on Twitch. Find streaming opportunities with less competition and better discoverability. Updated every 15 minutes.',
  keywords: 'twitch, streaming, games, opportunities, streamer tools, best games to stream',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
