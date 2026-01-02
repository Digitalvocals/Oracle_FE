// US-073: Frontend Performance - Zero Loading State
// Phase 1: Next.js ISR (Incremental Static Regeneration)
// Oracle's Spec Implementation - Seraph

import { Suspense } from 'react'
import GameList from '@/components/GameList'
import { GameListSkeleton } from '@/components/Skeletons'

// Enable ISR - regenerate every 10 minutes (per Oracle spec)
export const revalidate = 600

// API endpoint configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-bcd88.up.railway.app'

// Pre-fetch initial data server-side (per Oracle spec: top 100 games)
async function getInitialGames() {
  try {
    const res = await fetch(
      `${API_URL}/api/v1/analyze?limit=100`,
      { 
        next: { revalidate: 600 },
        headers: { 'Content-Type': 'application/json' }
      }
    )
    
    if (!res.ok) {
      console.error(`API returned ${res.status}`)
      return { games: [], error: true }
    }
    
    const data = await res.json()
    return { games: data.top_opportunities || [], error: false }
  } catch (error) {
    console.error('Failed to fetch initial games:', error)
    return { games: [], error: true }
  }
}

export default async function Home() {
  // This runs on the server - data available at page load (per Oracle spec)
  const { games: initialGames, error } = await getInitialGames()
  
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero Section - Oracle's new onboarding design */}
      <header className="px-4 py-12 text-center max-w-4xl mx-auto">
        <h1 className="text-display font-bold text-text-primary mb-3">
          StreamScout
        </h1>
        <p className="text-body text-text-secondary mb-4 leading-relaxed">
          Find games where you can actually get discovered. 
          Ranked by real data, updated every 10 minutes.
        </p>
        
        {/* Score explainer - inline help (per Oracle spec) */}
        <div className="text-caption text-text-tertiary max-w-2xl mx-auto">
          Our algorithm weighs <span className="text-brand-primary font-semibold">discoverability</span> (45%), 
          <span className="text-brand-primary font-semibold"> viability</span> (35%), and 
          <span className="text-brand-primary font-semibold"> engagement</span> (20%) 
          to find opportunities most streamers miss.
        </div>
      </header>
      
      {/* Game List with Streaming - Suspense boundary for progressive loading */}
      <Suspense fallback={<GameListSkeleton count={10} />}>
        <GameList 
          initialGames={initialGames} 
          hasError={error}
        />
      </Suspense>
      
      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-text-tertiary/20 text-center text-caption text-text-tertiary max-w-7xl mx-auto px-4">
        <p>Built by <span className="text-brand-primary font-bold">DIGITALVOCALS</span> (digitalvocalstv@gmail.com)</p>
        <p className="mt-2">Data auto-updates every 10 minutes • Powered by Twitch API</p>
        <p className="mt-2">
          Affiliate Disclosure: We may earn a commission from game purchases through our links.
        </p>
        <p className="mt-4">© {new Date().getFullYear()} StreamScout. All rights reserved.</p>
      </footer>
    </div>
  )
}
