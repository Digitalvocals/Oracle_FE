'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import GENRE_INSIGHTS from './genre-insights'

// ============================================================================
// CHANGE THESE TWO LINES FOR EACH GENRE PAGE
// ============================================================================
const GENRE_KEY = 'mmo' // e.g., 'fps', 'horror', 'rpg', 'battle-royale', 'moba', 'strategy', 'survival', 'indie', 'mmo', 'simulation', 'action', 'sports'
const GENRE_DISPLAY = GENRE_INSIGHTS[GENRE_KEY].display
// ============================================================================

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
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* ============================================================ */}
        {/* HERO SECTION - Matching TwitchStrike Alternative */}
        {/* ============================================================ */}
        <header className="mb-12">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/">
              <Image 
                src="/images/streamscout-logo.png" 
                alt="StreamScout - Find Your Audience. Grow Your Channel."
                width={600}
                height={150}
                className="max-w-full h-auto"
                priority
              />
            </Link>
          </div>

          {/* Hero Box */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-[#0a0a0a] border border-matrix-green/40 rounded-lg p-8 text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-matrix-green-bright mb-4">
                Best {GENRE_DISPLAY} Games to Stream on Twitch
              </h1>
              <p className="text-gray-300 mb-2">
                Find {GENRE_DISPLAY} games where small streamers can actually get discovered.
              </p>
              <p className="text-gray-300">
                <Link href="/" className="text-matrix-green hover:text-matrix-green-bright font-semibold">
                  StreamScout
                </Link>
                {' '}analyzes <span className="font-bold text-white">{data?.total_games_analyzed || '450+'}+ games</span> in real-time to find
                where small streamers can actually compete.
              </p>
            </div>
          </div>

          {/* Status Badges - Matching TwitchStrike */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <div className="flex items-center gap-2 px-4 py-2 bg-matrix-green/10 border border-matrix-green/30 rounded-full">
              <span className="text-matrix-green">📊</span>
              <span className="text-matrix-green font-medium">{data?.total_games_analyzed || '450+'} GAMES ANALYZED</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-matrix-green/10 border border-matrix-green/30 rounded-full">
              <span className="w-2 h-2 bg-matrix-green rounded-full animate-pulse"></span>
              <span className="text-gray-300">UPDATED: {data?.timestamp ? formatTime(data.timestamp) : 'Recently'}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-matrix-green/10 border border-matrix-green/30 rounded-full">
              <span className="text-blue-400">🔄</span>
              <span className="text-gray-300">REFRESHES EVERY 10 MIN</span>
            </div>
          </div>

          {/* Back to Analyzer CTA */}
          <div className="max-w-2xl mx-auto mb-10 px-4">
            <div className="bg-[#111] border border-matrix-green/30 rounded-lg p-6 text-center">
              <h2 className="text-xl font-bold text-matrix-green-bright mb-3">
                Want to analyze ALL games in real-time?
              </h2>
              <p className="text-gray-200 mb-4">
                StreamScout shows live discoverability scores for {data?.total_games_analyzed || '450+'}+ games across all genres. 
                Free, instant, no signup required.
              </p>
              <Link 
                href="/"
                className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-matrix-green to-green-400 text-black font-bold hover:from-green-400 hover:to-matrix-green transition-all"
              >
                Try StreamScout Free →
              </Link>
            </div>
          </div>

          {/* ============================================================ */}
          {/* INSIGHTS SECTIONS - All 3 boxes */}
          {/* ============================================================ */}
          <div className="space-y-6 mb-12">
            {/* The Challenge */}
            <div className="max-w-2xl mx-auto px-4">
              <div className="bg-[#111] border border-matrix-green/30 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-matrix-green-bright mb-4">The Challenge</h2>
                <div className="text-gray-200 whitespace-pre-line leading-relaxed">
                  {insights.challenge}
                </div>
              </div>
            </div>

            {/* The Opportunity - THIS WAS MISSING */}
            <div className="max-w-2xl mx-auto px-4">
              <div className="bg-[#111] border border-matrix-green/30 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-matrix-green-bright mb-4">The Opportunity</h2>
                <div className="text-gray-200 whitespace-pre-line leading-relaxed">
                  {insights.opportunity}
                </div>
              </div>
            </div>

            {/* What Actually Works */}
            <div className="max-w-2xl mx-auto px-4">
              <div className="bg-[#111] border border-matrix-green/30 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-matrix-green-bright mb-4">What Actually Works</h2>
                <div className="text-gray-200 whitespace-pre-line leading-relaxed">
                  {insights.advice}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ============================================================ */}
        {/* GOOD GAMES SECTION */}
        {/* ============================================================ */}
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
                  className="matrix-card"
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
                          <h3 className="text-base sm:text-xl md:text-2xl font-bold leading-tight break-words">
                            {game.game_name}
                          </h3>
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

        {/* ============================================================ */}
        {/* BAD GAMES SECTION */}
        {/* ============================================================ */}
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
                      <span className="text-red-400 font-bold text-sm">⚠ AVOID</span>
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
                      <h3 className="text-base sm:text-xl md:text-2xl font-bold">{game.game_name}</h3>
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

        {/* ============================================================ */}
        {/* NO GAMES MESSAGE */}
        {/* ============================================================ */}
        {genreGames.length === 0 && (
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-[#111] border border-matrix-green/30 rounded-lg p-8 text-center">
              <p className="text-gray-200 text-lg mb-4">
                No {GENRE_DISPLAY} games currently streaming with enough data.
              </p>
              <Link 
                href="/"
                className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-matrix-green to-green-400 text-black font-bold hover:from-green-400 hover:to-matrix-green transition-all"
              >
                View All Games →
              </Link>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* FOOTER CTA */}
        {/* ============================================================ */}
        <div className="max-w-2xl mx-auto mt-12 px-4">
          <div className="bg-[#111] border border-matrix-green/30 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-matrix-green-bright mb-3">Ready to Find Your Perfect Game?</h2>
            <p className="text-gray-200 mb-4">
              StreamScout analyzes {data?.total_games_analyzed || '450+'}+ games in real-time. Free forever, no signup required.
            </p>
            <Link 
              href="/"
              className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-matrix-green to-green-400 text-black font-bold hover:from-green-400 hover:to-matrix-green transition-all"
            >
              Launch StreamScout →
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
