'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GenreBannerHeader } from '../components/GenreBannerHeader'
import { GameCard } from '@/components/GameCard'
import GENRE_INSIGHTS from '../components/genre-insights'

// ============================================================================
// CHANGE THESE TWO LINES FOR EACH GENRE PAGE
// ============================================================================
const GENRE_KEY = 'indie'
const GENRE_DISPLAY = GENRE_INSIGHTS[GENRE_KEY].display
// ============================================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-90f4a9.up.railway.app'

interface GameOpportunity {
  rank: number
  game_id: string
  game_name: string
  total_viewers: number
  channels: number
  avg_viewers_per_channel: number
  discoverability_score: number
  viability_score: number
  engagement_score: number
  overall_score: number
  discoverability_rating?: number
  recommendation: string
  trend?: 'up' | 'down' | 'stable' | null
  box_art_url: string | null
  genres: string[]
  purchase_links?: {
    platforms: Array<{
      id: string
      name: string
      url: string
      icon: string
      color: string
    }>
    primary_url: string
    free: boolean
    steam?: string
    epic?: string
  }
  is_filtered?: boolean
  warning_flags?: string[]
  warning_text?: string | null
  dominance_ratio?: number
  momentum?: string | null
  bestTime?: string | null
  viewerGrowth?: number | null
  channelGrowth?: number | null
}

interface AnalysisData {
  timestamp: string
  total_games_analyzed: number
  top_opportunities: GameOpportunity[]
  next_refresh_in_seconds?: number
  next_update: string
  is_refreshing?: boolean
}

// Genre matching logic
function matchesGenre(game: GameOpportunity): boolean {
  if (!game.genres || !Array.isArray(game.genres)) return false

  const genreKeywords: Record<string, string[]> = {
    'fps': ['FPS', 'First-Person Shooter', 'Shooter'],
    'horror': ['Horror', 'Survival Horror'],
    'rpg': ['RPG', 'Role-Playing', 'JRPG', 'MMORPG'],
    'battle-royale': ['Battle Royale', 'BR'],
    'moba': ['MOBA', 'Multiplayer Online Battle Arena'],
    'strategy': ['Strategy', 'RTS', 'Turn-Based Strategy', 'Grand Strategy', 'Turn-Based', 'Tactical'],
    'survival': ['Survival', 'Survival Craft'],
    'indie': ['Indie', 'Independent'],
    'mmo': ['MMO', 'MMORPG', 'Massively Multiplayer'],
    'simulation': ['Simulation', 'Sim', 'Life Simulation', 'Simulator'],
    'action': ['Action', 'Action-Adventure', 'Hack and Slash'],
    'sports': ['Sports', 'Racing', 'Sports Game']
  }

  const keywords = genreKeywords[GENRE_KEY] || []
  return game.genres.some((genre: string) =>
    keywords.some(keyword =>
      genre.toLowerCase().includes(keyword.toLowerCase())
    )
  )
}

export default function BestGenreGamesToStream() {
  const [data, setData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const insights = GENRE_INSIGHTS[GENRE_KEY]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/analyze?limit=500`)
        if (!response.ok) throw new Error('Failed to fetch data')
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } catch {
      return 'Recently'
    }
  }

  // Filter games by genre
  const genreGames = data?.top_opportunities.filter(matchesGenre) || []
  const goodGames = genreGames.filter(g => g.overall_score >= 0.6 && !g.is_filtered).slice(0, 10)
  const badGames = genreGames.filter(g => g.overall_score < 0.4 || g.is_filtered).slice(0, 10)

  if (loading) {
    return (
      <main className="min-h-screen bg-bg-primary p-4 md:p-8">
        <GenreBannerHeader genre={GENRE_DISPLAY} />
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <div className="text-2xl text-text-primary mb-4">Loading {GENRE_DISPLAY} Games...</div>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-bg-primary p-4 md:p-8">
        <GenreBannerHeader genre={GENRE_DISPLAY} />
        <div className="max-w-7xl mx-auto">
          <div className="bg-bg-elevated border border-brand-danger rounded-lg p-8 text-center max-w-md mx-auto">
            <div className="text-2xl text-brand-danger mb-4">Error Loading Data</div>
            <div className="text-text-secondary">{error}</div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-bg-primary p-4 md:p-8">
      {/* Banner Header */}
      <GenreBannerHeader genre={GENRE_DISPLAY} />

      <div className="max-w-7xl mx-auto">

        {/* Status Badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 border border-brand-primary/30 rounded-full">
            <span className="text-brand-primary">📊</span>
            <span className="text-brand-primary font-medium">{data?.total_games_analyzed || '450+'} GAMES ANALYZED</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 border border-brand-primary/30 rounded-full">
            <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></span>
            <span className="text-text-secondary">UPDATED: {data?.timestamp ? formatTime(data.timestamp) : 'Recently'}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 border border-brand-primary/30 rounded-full">
            <span className="text-blue-400">🔄</span>
            <span className="text-text-secondary">REFRESHES EVERY 10 MIN</span>
          </div>
        </div>

        {/* CTA to Main Analyzer */}
        <div className="max-w-2xl mx-auto mb-10 px-4">
          <div className="bg-bg-elevated border border-brand-primary/30 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-text-primary mb-3">
              Want to analyze ALL games in real-time?
            </h2>
            <p className="text-text-secondary mb-4">
              StreamScout shows live discoverability scores for {data?.total_games_analyzed || '450+'}+ games across all genres.
              Free, instant, no signup required.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-bg-primary font-bold transition-colors"
            >
              Try StreamScout Free
            </Link>
          </div>
        </div>

        {/* SEO Content: Insights Sections */}
        <div className="space-y-6 mb-12">
          {/* The Challenge */}
          <div className="max-w-3xl mx-auto px-4">
            <div className="bg-bg-elevated border border-bg-hover rounded-lg p-6">
              <h2 className="text-2xl font-bold text-brand-primary mb-4">The Challenge</h2>
              <div className="text-text-secondary whitespace-pre-line leading-relaxed">
                {insights.challenge}
              </div>
            </div>
          </div>

          {/* The Opportunity */}
          <div className="max-w-3xl mx-auto px-4">
            <div className="bg-bg-elevated border border-bg-hover rounded-lg p-6">
              <h2 className="text-2xl font-bold text-brand-primary mb-4">The Opportunity</h2>
              <div className="text-text-secondary whitespace-pre-line leading-relaxed">
                {insights.opportunity}
              </div>
            </div>
          </div>

          {/* What Actually Works */}
          <div className="max-w-3xl mx-auto px-4">
            <div className="bg-bg-elevated border border-bg-hover rounded-lg p-6">
              <h2 className="text-2xl font-bold text-brand-primary mb-4">What Actually Works</h2>
              <div className="text-text-secondary whitespace-pre-line leading-relaxed">
                {insights.advice}
              </div>
            </div>
          </div>
        </div>

        {/* Good Games Section */}
        {goodGames.length > 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Strong {GENRE_DISPLAY} Opportunities
              </h2>
              <p className="text-text-tertiary">
                Games with good discoverability for small streamers (Score 6.0+)
              </p>
            </div>

            <div className="grid gap-4">
              {goodGames.map((game) => (
                <GameCard key={game.game_id || game.rank} game={game} />
              ))}
            </div>
          </div>
        )}

        {/* Bad Games Section */}
        {badGames.length > 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-brand-danger mb-2">
                {GENRE_DISPLAY} Games to Avoid
              </h2>
              <p className="text-text-tertiary">
                Brutal competition - growth will be extremely difficult (Score below 4.0)
              </p>
            </div>

            <div className="grid gap-4">
              {badGames.map((game) => (
                <GameCard key={game.game_id || game.rank} game={game} />
              ))}
            </div>
          </div>
        )}

        {/* No Games Message */}
        {genreGames.length === 0 && (
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-bg-elevated border border-brand-primary/30 rounded-lg p-8 text-center">
              <p className="text-text-secondary text-lg mb-4">
                No {GENRE_DISPLAY} games currently streaming with enough data.
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-bg-primary font-bold transition-colors"
              >
                View All Games
              </Link>
            </div>
          </div>
        )}

        {/* Footer CTA */}
        <div className="max-w-2xl mx-auto mt-12 px-4">
          <div className="bg-bg-elevated border border-brand-primary/30 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-text-primary mb-3">Ready to Find Your Perfect Game?</h2>
            <p className="text-text-secondary mb-4">
              StreamScout analyzes {data?.total_games_analyzed || '450+'}+ games in real-time. Free forever, no signup required.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-bg-primary font-bold transition-colors"
            >
              Launch StreamScout
            </Link>
          </div>
        </div>

      </div>
    </main>
  )
}
