'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import GENRE_INSIGHTS from './genre-insights'

const GENRE_KEY = 'indie' // e.g., 'fps', 'horror', 'rpg'
const GENRE_DISPLAY = GENRE_INSIGHTS[GENRE_KEY].display
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface GameOpportunity {
  rank: number
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
  trend: string
  box_art_url: string | null
  genres: string[]
  purchase_links: {
    steam: string | null
    epic: string | null
    free: boolean
  }
  is_filtered?: boolean
  warning_flags?: string[]
  warning_text?: string | null
  dominance_ratio?: number
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
    'strategy': ['Strategy', 'RTS', 'Turn-Based Strategy', 'Grand Strategy'],
    'survival': ['Survival', 'Survival Craft'],
    'indie': ['Indie', 'Independent'],
    'mmo': ['MMO', 'MMORPG', 'Massively Multiplayer'],
    'simulation': ['Simulation', 'Sim', 'Life Simulation'],
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
  const [selectedGame, setSelectedGame] = useState<GameOpportunity | null>(null)

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

  const getScoreColor = (score: number) => {
    if (score >= 0.80) return 'score-excellent'
    if (score >= 0.65) return 'score-good'
    if (score >= 0.50) return 'score-moderate'
    return 'score-poor'
  }

  const getScoreContext = (game: GameOpportunity) => {
    const channels = game.channels
    const viewers = game.total_viewers
    
    let competition = channels < 50 ? 'Very few streamers here' 
      : channels < 150 ? 'Low streamer count' 
      : channels < 300 ? 'Moderate competition'
      : 'Crowded category'
    
    let audience = viewers < 500 ? 'Small but focused audience'
      : viewers < 2000 ? 'Solid viewer pool'
      : viewers < 10000 ? 'Healthy audience size'
      : 'Large viewer base'
    
    return { competition, audience, channels, viewers }
  }

  // Filter games by genre
  const genreGames = data?.top_opportunities.filter(matchesGenre) || []
  const goodGames = genreGames.filter(g => g.overall_score >= 0.6 && !g.is_filtered).slice(0, 10)
  const badGames = genreGames.filter(g => g.overall_score < 0.4 || g.is_filtered).slice(0, 10)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-glow">[ LOADING ]</div>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-2 border-matrix-green border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="matrix-card max-w-md text-center">
          <div className="text-3xl mb-4">❌ ERROR</div>
          <div className="text-matrix-green-dim">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-3xl font-bold tracking-wider hover:text-matrix-green transition-colors">
            StreamScout
          </Link>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
          Best {GENRE_DISPLAY} Games to Stream on Twitch
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 mb-8">
          Find {GENRE_DISPLAY} games where small streamers can actually get discovered. 
          Real-time discoverability scores and competition analysis.
        </p>

        {/* Back to Analyzer CTA */}
        <div className="bg-[#111] border border-matrix-green/30 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-matrix-green-bright mb-3">
            Want to analyze ALL games in real-time?
          </h2>
          <p className="text-gray-300 mb-4">
            StreamScout shows live discoverability scores for 500+ games across all genres. 
            Free, instant, no signup required.
          </p>
          <Link 
            href="/"
            className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-matrix-green to-green-400 text-black font-bold hover:from-green-400 hover:to-matrix-green transition-all"
          >
            Try StreamScout Free →
          </Link>
        </div>

        {/* Insights Sections */}
        <div className="space-y-6 mb-12">
          <div className="bg-[#111] border border-matrix-green/30 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-matrix-green-bright mb-4">The Challenge</h2>
            <div className="text-gray-300 whitespace-pre-line leading-relaxed">
              {insights.challenge}
            </div>
          </div>

          <div className="bg-[#111] border border-matrix-green/30 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-matrix-green-bright mb-4">The Opportunity</h2>
            <div className="text-gray-300 whitespace-pre-line leading-relaxed">
              {insights.opportunity}
            </div>
          </div>

          <div className="bg-[#111] border border-matrix-green/30 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-matrix-green-bright mb-4">What Actually Works</h2>
            <div className="text-gray-300 whitespace-pre-line leading-relaxed">
              {insights.advice}
            </div>
          </div>
        </div>
      </header>

      {/* Good Games Section */}
      {goodGames.length > 0 && (
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-matrix-green-bright mb-2">
              Strong {GENRE_DISPLAY} Opportunities (Score ≥ 6.0)
            </h2>
            <p className="text-gray-400 text-sm">
              Games with good discoverability for small streamers
            </p>
          </div>

          <div className="grid gap-4">
            {goodGames.map((game) => (
              <div 
                key={game.rank} 
                className="matrix-card cursor-pointer"
                onClick={() => setSelectedGame(selectedGame?.rank === game.rank ? null : game)}
              >
                <div className="flex gap-4">
                  {/* Box Art */}
                  {game.box_art_url && (
                    <div className="flex-shrink-0">
                      <img 
                        src={game.box_art_url} 
                        alt={game.game_name}
                        className="w-20 h-28 sm:w-28 sm:h-40 md:w-32 md:h-44 object-cover rounded border-2 border-matrix-green/50"
                      />
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-base sm:text-xl md:text-2xl font-bold leading-tight break-words">
                          {game.game_name}
                        </h2>
                        <div className="text-xs sm:text-sm text-gray-300 mt-1">
                          {game.total_viewers?.toLocaleString() || 0} viewers • {game.channels} channels
                        </div>
                        {/* Genre Tags */}
                        {game.genres && game.genres.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {game.genres.slice(0, 3).map(genre => (
                              <span 
                                key={genre}
                                className="px-2 py-0.5 text-[10px] sm:text-xs rounded bg-matrix-green/10 text-matrix-green/70 border border-matrix-green/20"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Score */}
                      <div className="text-right flex-shrink-0 ml-2 pr-1 relative">
                        <div className="flex items-start justify-end gap-1">
                          {/* Info Tooltip */}
                          <div className="relative group/info mt-1">
                            <span className="w-5 h-5 rounded-full bg-matrix-green/50 hover:bg-matrix-green text-black flex items-center justify-center text-xs font-bold cursor-help transition-colors">?</span>
                            
                            <div className="absolute right-full top-0 mr-2 w-56 p-3 bg-gray-900 border border-matrix-green/50 rounded-lg shadow-lg opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-200 z-50 text-left pointer-events-none">
                              <div className="text-matrix-green font-bold text-xs mb-2">Why this score?</div>
                              <div className="text-xs leading-relaxed space-y-2">
                                <p className="text-white">{getScoreContext(game).competition} ({game.channels} streamers)</p>
                                <p className="text-white">{getScoreContext(game).audience} ({game.total_viewers.toLocaleString()} watching)</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Score Number */}
                          <div className={`text-2xl sm:text-4xl md:text-5xl font-bold leading-none ${getScoreColor(game.overall_score)}`}>
                            {(game.overall_score * 10).toFixed(1)}/10
                          </div>
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-400 mt-1">
                          {game.trend}
                        </div>
                        <div className="text-[9px] sm:text-xs leading-tight max-w-[90px] sm:max-w-none font-bold tracking-wide text-amber-400">
                          {game.recommendation}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bad Games Section */}
      {badGames.length > 0 && (
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-red-400 mb-2">
              {GENRE_DISPLAY} Games to Avoid (Score &lt; 4.0)
            </h2>
            <p className="text-gray-400 text-sm">
              Brutal competition - growth will be extremely difficult
            </p>
          </div>

          <div className="grid gap-4">
            {badGames.map((game) => (
              <div 
                key={game.rank} 
                className="matrix-card border-red-500/50 bg-red-900/10 opacity-75"
              >
                {game.is_filtered && game.warning_text && (
                  <div className="bg-red-500/20 border border-red-500/40 rounded px-3 py-2 mb-3 flex items-center gap-2">
                    <span className="text-red-400 font-bold text-sm">AVOID</span>
                    <span className="text-red-300/80 text-xs">{game.warning_text}</span>
                  </div>
                )}
                
                <div className="flex gap-4">
                  {game.box_art_url && (
                    <div className="flex-shrink-0">
                      <img 
                        src={game.box_art_url} 
                        alt={game.game_name}
                        className="w-20 h-28 sm:w-28 sm:h-40 md:w-32 md:h-44 object-cover rounded border-2 border-red-500/50"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base sm:text-xl md:text-2xl font-bold">{game.game_name}</h2>
                    <div className="text-xs sm:text-sm text-gray-300 mt-1">
                      {game.total_viewers?.toLocaleString() || 0} viewers • {game.channels} channels
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl sm:text-4xl font-bold text-red-500">
                      {(game.overall_score * 10).toFixed(1)}/10
                    </div>
                    <div className="text-xs text-red-400 font-bold">NOT RECOMMENDED</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Games Message */}
      {genreGames.length === 0 && (
        <div className="bg-[#111] border border-matrix-green/30 rounded-lg p-8 text-center">
          <p className="text-gray-400 text-lg mb-4">
            No {GENRE_DISPLAY} games currently streaming with enough data.
          </p>
          <Link 
            href="/"
            className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-matrix-green to-green-400 text-black font-bold hover:from-green-400 hover:to-matrix-green transition-all"
          >
            View All Games
          </Link>
        </div>
      )}

      {/* Footer CTA */}
      <div className="mt-12 bg-[#111] border border-matrix-green/30 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-3">Ready to Find Your Perfect Game?</h2>
        <p className="text-gray-300 mb-4">
          StreamScout analyzes 500+ games in real-time. Free forever, no signup required.
        </p>
        <Link 
          href="/"
          className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-matrix-green to-green-400 text-black font-bold hover:from-green-400 hover:to-matrix-green transition-all"
        >
          Launch StreamScout →
        </Link>
      </div>
    </div>
  )
}
