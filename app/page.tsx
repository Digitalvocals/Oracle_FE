'use client'

import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import Link from 'next/link'

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
  cache_expires_in_seconds?: number  // Old field name (backwards compat)
  next_refresh_in_seconds?: number   // New field name
  next_update: string
  is_refreshing?: boolean
}

interface StatusData {
  cache: {
    has_data: boolean
    age_seconds: number | null
    next_refresh_seconds: number
  }
  worker: {
    is_refreshing: boolean
  }
}

export default function Home() {
  const [data, setData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGame, setSelectedGame] = useState<GameOpportunity | null>(null)
  const [countdown, setCountdown] = useState<number>(0)
  const [isWarmingUp, setIsWarmingUp] = useState(false)
  const [warmupStatus, setWarmupStatus] = useState<string>('Initializing...')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  // Available genre filters
  const GENRE_OPTIONS = [
    'Action', 'Adventure', 'Battle Royale', 'Card Game', 'FPS', 'Fighting',
    'Horror', 'Indie', 'MMO', 'MOBA', 'Party', 'Platformer', 'Puzzle',
    'RPG', 'Racing', 'Sandbox', 'Simulation', 'Sports', 'Strategy', 'Survival'
  ]

  // Toggle genre filter
  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  // Filter opportunities by selected genres AND search query
  const filteredOpportunities = data?.top_opportunities?.filter(game => {
    // Search filter
    if (searchQuery && !game.game_name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    // Genre filter
    if (selectedGenres.length === 0) return true
    return game.genres?.some(g => selectedGenres.includes(g))
  }) || []

  // Helper function to create Twitch search URL
  const getTwitchUrl = (gameName: string) => {
    return `https://www.twitch.tv/search?term=${encodeURIComponent(gameName)}`
  }

  // Track external link clicks (Steam, Epic, Twitch) - YOUR MONEY METRIC!
  const trackExternalClick = (linkType: 'steam' | 'epic' | 'twitch', game: GameOpportunity) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      const score = game.discoverability_rating !== undefined 
        ? game.discoverability_rating 
        : (game.overall_score * 10);
      
      (window as any).gtag('event', `${linkType}_click`, {
        'game_name': game.game_name,
        'game_score': score,
        'game_rank': game.rank,
        'event_category': 'external_link',
        'event_label': game.game_name
      });
      
      // Debug log (you can remove this after testing)
      console.log(`✅ [TRACK] ${linkType}_click: ${game.game_name} (${score.toFixed(1)}/10)`);
    }
  }

  // Check status endpoint for warmup progress
  const checkStatus = useCallback(async () => {
    try {
      const response = await axios.get<StatusData>(`${API_URL}/api/v1/status`)
      const status = response.data
      
      if (status.worker.is_refreshing) {
        setWarmupStatus('Fetching stream data from Twitch API...')
      } else if (status.cache.has_data) {
        setWarmupStatus('Data ready!')
        return true // Has data
      } else {
        setWarmupStatus('Waiting for initial data fetch...')
      }
      return false
    } catch (err) {
      setWarmupStatus('Connecting to server...')
      return false
    }
  }, [])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/api/v1/analyze?limit=500`)
      
      // Check if warming up (202 status or warming_up status)
      if (response.status === 202 || response.data.status === 'warming_up') {
        setIsWarmingUp(true)
        setData(null)
        return false
      }
      
      setIsWarmingUp(false)
      setData(response.data)
      setError(null)
      
      // Set countdown from whichever field exists
      const refreshSeconds = response.data.next_refresh_in_seconds ?? 
                            response.data.cache_expires_in_seconds ?? 
                            600
      setCountdown(refreshSeconds)
      
      return true
    } catch (err: any) {
      // 202 comes as an error with axios sometimes
      if (err.response?.status === 202 || err.response?.data?.status === 'warming_up') {
        setIsWarmingUp(true)
        setData(null)
        return false
      }
      setError('Failed to load data. Please try again later.')
      console.error(err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Warmup polling - check status every 3 seconds while warming up
  useEffect(() => {
    if (!isWarmingUp) return

    const pollStatus = async () => {
      const hasData = await checkStatus()
      if (hasData) {
        // Data is ready, fetch it
        await fetchData()
      }
    }

    // Start polling
    pollStatus()
    const interval = setInterval(pollStatus, 3000)
    
    return () => clearInterval(interval)
  }, [isWarmingUp, checkStatus, fetchData])

  // Countdown timer
  useEffect(() => {
    if (!data || countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Countdown hit 0 - fetch fresh data
          fetchData()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown, data, fetchData])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400'
    if (score >= 0.6) return 'text-yellow-400'
    if (score >= 0.4) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <div className="min-h-screen bg-matrix-bg text-matrix-green font-mono">
      <div className="matrix-background" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold matrix-glitch mb-4" data-text="STREAMSCOUT">
            STREAMSCOUT
          </h1>
          <p className="text-lg md:text-xl text-matrix-green-bright mb-2">
            Find Your Best Twitch Streaming Opportunities
          </p>
          <p className="text-sm md:text-base text-matrix-green-dim">
            Real-time analysis of 500+ games • Updated every 10 minutes
          </p>
        </header>

        {/* Warmup Screen */}
        {isWarmingUp && (
          <div className="max-w-2xl mx-auto">
            <div className="matrix-card text-center">
              <div className="mb-6">
                <div className="inline-block relative">
                  <div className="w-16 h-16 border-4 border-matrix-green/30 border-t-matrix-green rounded-full animate-spin"></div>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-4">Initializing StreamScout...</h2>
              <p className="text-matrix-green-dim mb-2">{warmupStatus}</p>
              <p className="text-sm text-matrix-green-dim/70">
                First load may take 30-60 seconds while we fetch fresh data from Twitch
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isWarmingUp && (
          <div className="max-w-2xl mx-auto">
            <div className="matrix-card border-red-500/50 bg-red-900/20">
              <p className="text-red-400 text-center">{error}</p>
              <button 
                onClick={fetchData}
                className="matrix-button mt-4 mx-auto block"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!isWarmingUp && data && (
          <main>
            {/* Stats Bar */}
            <div className="mb-6 flex flex-wrap gap-4 justify-center text-center">
              <div className="matrix-stat-inline">
                <span className="text-matrix-green-dim text-sm">GAMES ANALYZED:</span>
                <span className="ml-2 text-matrix-green-bright font-bold text-lg">
                  {data.total_games_analyzed}
                </span>
              </div>
              <div className="matrix-stat-inline">
                <span className="text-matrix-green-dim text-sm">NEXT UPDATE:</span>
                <span className="ml-2 text-matrix-green-bright font-bold text-lg">
                  {formatTime(countdown)}
                </span>
              </div>
              <div className="matrix-stat-inline">
                <span className="text-matrix-green-dim text-sm">SHOWING:</span>
                <span className="ml-2 text-matrix-green-bright font-bold text-lg">
                  {filteredOpportunities.length} games
                </span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6 max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border-2 border-matrix-green/50 rounded text-matrix-green placeholder-matrix-green-dim focus:outline-none focus:border-matrix-green-bright"
              />
            </div>

            {/* Genre Filter Pills */}
            <div className="mb-6 flex flex-wrap gap-2 justify-center">
              {GENRE_OPTIONS.map(genre => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-4 py-2 rounded border-2 transition-all ${
                    selectedGenres.includes(genre)
                      ? 'bg-matrix-green text-black border-matrix-green font-bold'
                      : 'bg-black/30 text-matrix-green border-matrix-green/30 hover:border-matrix-green/60'
                  }`}
                >
                  {genre}
                </button>
              ))}
              {selectedGenres.length > 0 && (
                <button
                  onClick={() => setSelectedGenres([])}
                  className="px-4 py-2 rounded border-2 bg-red-900/20 text-red-400 border-red-500/50 hover:bg-red-900/40"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Games List */}
            <div className="space-y-4">
              {filteredOpportunities.length === 0 ? (
                <div className="matrix-card text-center">
                  <p className="text-matrix-green-dim">No games match your filters.</p>
                  <button
                    onClick={() => {
                      setSelectedGenres([])
                      setSearchQuery('')
                    }}
                    className="matrix-button mt-4"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : filteredOpportunities.map((game) => (
                <div 
                  key={game.rank} 
                  className={`matrix-card cursor-pointer ${
                    game.is_filtered 
                      ? 'border-red-500/50 bg-red-900/10' 
                      : ''
                  }`}
                  onClick={() => setSelectedGame(selectedGame?.rank === game.rank ? null : game)}
                >
                  {/* Warning Banner for Filtered Games */}
                  {game.is_filtered && game.warning_text && (
                    <div className="bg-red-500/20 border border-red-500/40 rounded px-3 py-2 mb-3 flex items-center gap-2">
                      <span className="text-red-400 font-bold text-sm">⚠️ AVOID</span>
                      <span className="text-red-300/80 text-xs">{game.warning_text}</span>
                      {game.discoverability_rating !== undefined && (
                        <span className="ml-auto text-red-400 font-bold text-sm">
                          {game.discoverability_rating}/10
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Mobile and Desktop Layout */}
                  <div className="flex gap-4">
                    {/* Game Cover Image - Left Side */}
                    {game.box_art_url && (
                      <div className="flex-shrink-0">
                        <img 
                          src={game.box_art_url} 
                          alt={game.game_name}
                          className="w-20 h-28 sm:w-28 sm:h-40 md:w-32 md:h-44 object-cover rounded border-2 border-matrix-green/50"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Content - Right Side */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      {/* Header Row: Rank + Title + Score */}
                      <div className="flex items-start gap-2 mb-2">
                        {/* Rank */}
                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-matrix-green-bright flex-shrink-0">
                          #{game.rank}
                        </div>
                        
                        {/* Title (flex-grow to push score right) */}
                        <div className="flex-1 min-w-0">
                          <h2 className="text-base sm:text-xl md:text-2xl font-bold leading-tight break-words">
                            {game.game_name}
                          </h2>
                          <div className="text-xs sm:text-sm text-matrix-green-dim mt-1">
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
                        
                        {/* Score - Always Visible */}
                        <div className="text-right flex-shrink-0 ml-2 pr-1">
                          <div className={`text-2xl sm:text-4xl md:text-5xl font-bold leading-none ${
                            game.is_filtered ? 'text-red-500' : getScoreColor(game.overall_score)
                          }`}>
                            {game.is_filtered && game.discoverability_rating !== undefined
                              ? `${game.discoverability_rating}/10`
                              : `${(game.overall_score * 10).toFixed(1)}/10`
                            }
                          </div>
                          <div className="text-[10px] sm:text-xs text-matrix-green-dim mt-1">
                            {game.is_filtered ? 'POOR' : game.trend}
                          </div>
                          <div className={`text-[8px] sm:text-[10px] leading-tight max-w-[80px] sm:max-w-none ${
                            game.is_filtered ? 'text-red-400' : 'text-matrix-green-dim'
                          }`}>
                            {game.is_filtered ? 'NOT RECOMMENDED' : game.recommendation}
                          </div>
                        </div>
                      </div>

                      {/* Purchase Links */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {/* Twitch Directory Link */}
                        <a
                          href={getTwitchUrl(game.game_name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="matrix-button-small bg-purple-600 hover:bg-purple-700 border-purple-500 text-xs sm:text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            trackExternalClick('twitch', game);
                          }}
                        >
                          📺 Twitch
                        </a>
                        
                        {game.purchase_links.steam && (
                          <a
                            href={game.purchase_links.steam}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="matrix-button-small text-xs sm:text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              trackExternalClick('steam', game);
                            }}
                          >
                            🎮 Steam
                          </a>
                        )}
                        {game.purchase_links.epic && (
                          <a
                            href={game.purchase_links.epic}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="matrix-button-small text-xs sm:text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              trackExternalClick('epic', game);
                            }}
                          >
                            🎮 Epic
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedGame?.rank === game.rank && (
                    <div className="mt-4 pt-4 border-t border-matrix-green/30">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="matrix-stat">
                          <div className="text-matrix-green-dim text-xs">DISCOVERABILITY</div>
                          <div className={`text-2xl font-bold ${getScoreColor(game.discoverability_score)}`}>
                            {(game.discoverability_score * 10).toFixed(1)}/10
                          </div>
                        </div>
                        <div className="matrix-stat">
                          <div className="text-matrix-green-dim text-xs">VIABILITY</div>
                          <div className={`text-2xl font-bold ${getScoreColor(game.viability_score)}`}>
                            {(game.viability_score * 10).toFixed(1)}/10
                          </div>
                        </div>
                        <div className="matrix-stat">
                          <div className="text-matrix-green-dim text-xs">ENGAGEMENT</div>
                          <div className={`text-2xl font-bold ${getScoreColor(game.engagement_score)}`}>
                            {(game.engagement_score * 10).toFixed(1)}/10
                          </div>
                        </div>
                        <div className="matrix-stat">
                          <div className="text-matrix-green-dim text-xs">AVG VIEWERS/CHANNEL</div>
                          <div className="text-2xl font-bold text-matrix-green">
                            {game.avg_viewers_per_channel.toFixed(1)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-sm text-matrix-green-dim text-center">
                        Click card again to collapse
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </main>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-matrix-green/30 text-center text-sm text-matrix-green-dim">
          <p>Built by <span className="text-matrix-green font-bold">DIGITALVOCALS</span></p>
          <p className="mt-2">Data auto-updates every 10 minutes • Powered by Twitch API</p>
          <p className="mt-2">
            Affiliate Disclosure: We may earn a commission from game purchases through our links.
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <Link href="/about" className="hover:text-matrix-green transition-colors">About</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-matrix-green transition-colors">Contact</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-matrix-green transition-colors">Privacy Policy</Link>
          </div>
          <p className="mt-4">© {new Date().getFullYear()} StreamScout. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}
