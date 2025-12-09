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

  // 🎯 EXTERNAL CLICK TRACKING - Added Dec 9, 2025
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
      
      console.log(`✅ [TRACK] ${linkType}_click: ${game.game_name} (${score.toFixed(1)}/10)`);
    }
  }

  // Check status endpoint for warmup progress
  const checkStatus = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/status`)
      const statusData: StatusData = response.data

      if (statusData.worker.is_refreshing) {
        setIsWarmingUp(true)
        setWarmupStatus('Analyzing games...')
      } else if (statusData.cache.has_data) {
        setIsWarmingUp(false)
        setCountdown(statusData.cache.next_refresh_seconds)
      }
    } catch (err) {
      console.error('Status check error:', err)
    }
  }, [])

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // First check if we need warmup
      const statusResponse = await axios.get(`${API_URL}/api/v1/status`)
      const statusData: StatusData = statusResponse.data

      if (!statusData.cache.has_data) {
        // No cache, need warmup
        setIsWarmingUp(true)
        setWarmupStatus('First-time setup: Warming up analysis engine...')
        
        // Poll status every 2 seconds
        const pollInterval = setInterval(async () => {
          try {
            const pollResponse = await axios.get(`${API_URL}/api/v1/status`)
            const pollData: StatusData = pollResponse.data
            
            if (pollData.cache.has_data && !pollData.worker.is_refreshing) {
              clearInterval(pollInterval)
              setIsWarmingUp(false)
              // Now fetch the actual data
              const dataResponse = await axios.get(`${API_URL}/api/v1/analyze?limit=500`)
              setData(dataResponse.data)
              setLoading(false)
              setCountdown(dataResponse.data.next_refresh_in_seconds || 
                          dataResponse.data.cache_expires_in_seconds || 
                          600)
            } else if (pollData.worker.is_refreshing) {
              setWarmupStatus('Analyzing 500+ games... This takes about 2 minutes.')
            }
          } catch (err) {
            console.error('Poll error:', err)
          }
        }, 2000)

        // Safety timeout after 3 minutes
        setTimeout(() => {
          clearInterval(pollInterval)
          if (isWarmingUp) {
            setError('Warmup took too long. Please refresh the page.')
            setIsWarmingUp(false)
            setLoading(false)
          }
        }, 180000)
        
        return
      }

      // Cache exists, load normally
      const response = await axios.get(`${API_URL}/api/v1/analyze?limit=500`)
      setData(response.data)
      setLoading(false)

      // Set countdown
      const secondsToRefresh = response.data.next_refresh_in_seconds || 
                              response.data.cache_expires_in_seconds || 
                              600
      setCountdown(secondsToRefresh)

    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to load data')
      setLoading(false)
      setIsWarmingUp(false)
    }
  }, [isWarmingUp])

  // Effect for initial load
  useEffect(() => {
    loadData()
  }, [loadData])

  // Effect for countdown timer
  useEffect(() => {
    if (countdown <= 0 && !loading && !isWarmingUp) return

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Time to refresh - reload data
          if (!isWarmingUp) {
            loadData()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown, loading, isWarmingUp, loadData])

  // Effect for periodic status checks
  useEffect(() => {
    const statusInterval = setInterval(checkStatus, 5000)
    return () => clearInterval(statusInterval)
  }, [checkStatus])

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading && !isWarmingUp) {
    return (
      <main className="min-h-screen bg-black text-matrix-green p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="matrix-loading mb-4"></div>
          <p className="text-xl font-mono">Analyzing opportunities...</p>
        </div>
      </main>
    )
  }

  if (isWarmingUp) {
    return (
      <main className="min-h-screen bg-black text-matrix-green p-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="matrix-loading mb-6"></div>
          <h2 className="text-2xl font-bold mb-4 font-mono">StreamScout Initializing</h2>
          <p className="text-lg mb-2 font-mono">{warmupStatus}</p>
          <p className="text-sm text-gray-400 font-mono">Please wait...</p>
          <div className="mt-6 text-xs text-gray-500 font-mono">
            <p>⏱️ First-time setup takes ~2 minutes</p>
            <p>📊 Analyzing 500+ games for best opportunities</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black text-red-500 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-mono mb-4">⚠️ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="matrix-button font-mono"
          >
            Retry
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-matrix-green">
      {/* Header */}
      <header className="border-b border-matrix-green/30 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-5xl font-bold matrix-text mb-2">
                <Link href="/" className="hover:text-matrix-green-bright transition-colors">
                  STREAMSCOUT
                </Link>
              </h1>
              <p className="text-sm sm:text-base text-matrix-green/80 font-mono">
                Find Your Best Twitch Streaming Opportunities
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs sm:text-sm font-mono text-matrix-green/60">
                <span className="hidden sm:inline">Real-time analysis of </span>
                <span className="text-matrix-green-bright font-bold">
                  {data?.total_games_analyzed || 500}+ games
                </span>
                <span className="hidden sm:inline"> • Updated every 10 minutes</span>
              </div>
              {countdown > 0 && (
                <div className="text-xs font-mono text-matrix-green/60">
                  GAMES ANALYZED: <span className="text-matrix-green-bright font-bold">{data?.total_games_analyzed || 0}</span>
                  {' • '}
                  NEXT UPDATE: <span className="text-matrix-green-bright font-bold">{formatTime(countdown)}</span>
                  {' • '}
                  SHOWING: <span className="text-matrix-green-bright font-bold">{filteredOpportunities.length} games</span>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-matrix-green/30 text-matrix-green px-4 py-2 rounded-lg focus:outline-none focus:border-matrix-green font-mono"
            />
          </div>

          {/* Genre Filters */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {GENRE_OPTIONS.map(genre => (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-mono transition-all ${
                  selectedGenres.includes(genre)
                    ? 'bg-matrix-green text-black font-bold'
                    : 'bg-black border border-matrix-green/30 text-matrix-green hover:border-matrix-green'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Game Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {filteredOpportunities.map((game) => {
            const score = game.discoverability_rating !== undefined 
              ? game.discoverability_rating 
              : (game.overall_score * 10)
            
            const isExpanded = selectedGame?.rank === game.rank

            return (
              <div
                key={game.rank}
                className={`matrix-card cursor-pointer transition-all ${
                  isExpanded ? 'ring-2 ring-matrix-green' : ''
                } ${game.is_filtered ? 'border-red-500/50 bg-red-900/10' : ''}`}
                onClick={() => setSelectedGame(isExpanded ? null : game)}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0 flex sm:flex-col items-center sm:items-start gap-2">
                    <div className="text-4xl sm:text-6xl font-bold text-matrix-green-bright font-mono">
                      #{game.rank}
                    </div>
                    {game.box_art_url && (
                      <img
                        src={game.box_art_url}
                        alt={game.game_name}
                        className="w-20 h-28 object-cover rounded border border-matrix-green/30"
                      />
                    )}
                  </div>

                  {/* Game Info */}
                  <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-matrix-green-bright mb-1">
                          {game.game_name}
                        </h2>
                        {game.genres && game.genres.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {game.genres.map(genre => (
                              <span
                                key={genre}
                                className="px-2 py-0.5 bg-matrix-green/10 border border-matrix-green/30 rounded text-xs font-mono"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-3xl sm:text-4xl font-bold text-matrix-green-bright font-mono">
                          {score.toFixed(1)}/10
                        </div>
                        <div className="text-xs text-matrix-green/60 font-mono mt-1">
                          {game.recommendation}
                        </div>
                      </div>
                    </div>

                    {/* Warning Banner */}
                    {game.is_filtered && game.warning_text && (
                      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 mb-3">
                        <p className="text-red-400 text-sm font-mono flex items-start gap-2">
                          <span className="text-lg">⚠️</span>
                          <span>{game.warning_text}</span>
                        </p>
                      </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm font-mono mb-3">
                      <div>
                        <div className="text-matrix-green/60">Viewers</div>
                        <div className="text-matrix-green-bright font-bold">
                          {game.total_viewers.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-matrix-green/60">Streamers</div>
                        <div className="text-matrix-green-bright font-bold">
                          {game.channels}
                        </div>
                      </div>
                      <div>
                        <div className="text-matrix-green/60">Avg/Channel</div>
                        <div className="text-matrix-green-bright font-bold">
                          {game.avg_viewers_per_channel.toFixed(1)}
                        </div>
                      </div>
                      {game.dominance_ratio !== undefined && game.dominance_ratio > 0.3 && (
                        <div>
                          <div className="text-matrix-green/60">⚠️ Top Heavy</div>
                          <div className="text-yellow-400 font-bold">
                            {(game.dominance_ratio * 100).toFixed(0)}%
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                </div>

                {/* Expanded Details */}
                {selectedGame?.rank === game.rank && (
                  <div className="mt-4 pt-4 border-t border-matrix-green/30">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-mono">
                      <div>
                        <div className="text-matrix-green/60 mb-1">Discoverability</div>
                        <div className="text-lg text-matrix-green-bright font-bold">
                          {game.discoverability_score.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-matrix-green/60 mb-1">Viability</div>
                        <div className="text-lg text-matrix-green-bright font-bold">
                          {game.viability_score.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-matrix-green/60 mb-1">Engagement</div>
                        <div className="text-lg text-matrix-green-bright font-bold">
                          {game.engagement_score.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-xs text-matrix-green/60 font-mono">
                      <p className="mb-2">
                        <span className="text-matrix-green-bright">Discoverability:</span> How easy it is to be found (viewer-to-streamer ratio)
                      </p>
                      <p className="mb-2">
                        <span className="text-matrix-green-bright">Viability:</span> Sufficient viewership to make streaming worthwhile
                      </p>
                      <p>
                        <span className="text-matrix-green-bright">Engagement:</span> Active viewership and community interaction
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-matrix-green/30 mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-matrix-green/60 font-mono">
          <p>Data updates every 10 minutes • {data?.timestamp}</p>
          <p className="mt-2">Built with 💚 for small streamers</p>
        </div>
      </footer>
    </main>
  )
}
