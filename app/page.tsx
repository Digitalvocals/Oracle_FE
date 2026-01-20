// US-073: Home Page with ISR + Banner Header
import { Suspense } from 'react'
import GameList from '@/components/GameList'
import { GameListSkeleton } from '@/components/Skeletons'
import { BannerHeader } from '@/app/components/BannerHeader'

export const revalidate = 600 // ISR: Regenerate every 10 minutes

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-90f4a9.up.railway.app'

async function getInitialGames() {
  try {
    const res = await fetch(`${API_URL}/api/v1/analyze?limit=100`, {
      next: { revalidate: 600 }
    })
    
    if (!res.ok) throw new Error('Failed to fetch')
    
    const data = await res.json()
    return {
      games: data.top_opportunities || [],
      hasError: false
    }
  } catch (error) {
    console.error('Error fetching games:', error)
    return {
      games: [],
      hasError: true
    }
  }
}

export default async function Home() {
  const { games, hasError } = await getInitialGames()
  
  return (
    <main className="min-h-screen bg-bg-primary p-4 md:p-8">
      {/* Banner Header */}
      <BannerHeader />
      
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <p className="text-body text-text-secondary mb-2">
            Find games where you can actually get discovered. Ranked by real data, updated every 10 minutes.
          </p>
          <p className="text-caption text-text-tertiary">
            Our algorithm weighs <span className="text-brand-primary font-semibold">discoverability</span> (45%), <span className="text-brand-primary font-semibold">viability</span> (35%), and <span className="text-brand-primary font-semibold">engagement</span> (20%) to find opportunities most streamers miss.
          </p>
          <p className="text-caption text-text-tertiary mt-2">
            Scores <span className="text-brand-primary font-semibold">7+</span> are strong picks. Look for <span className="text-brand-primary font-semibold">Hidden Gem</span> badges - high-potential games most streamers overlook.
          </p>
        </div>
        
        {/* Game List */}
        <Suspense fallback={<GameListSkeleton />}>
          <GameList initialGames={games} hasError={hasError} />
        </Suspense>
      </div>
    </main>
  )
}
