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
    // New rich platform data from US-028
    platforms?: Array<{
      id: string
      name: string
      icon: string
      color: string
      url: string
    }>
    primary_url?: string | null
  }
  is_filtered?: boolean
  warning_flags?: string[]
  warning_text?: string | null
  dominance_ratio?: number
  game_id?: string  // Add game_id for analytics lookup
}

// Analytics data structure
interface GameAnalytics {
  game_id: string
  game_name: string
  sparkline: {
    dates: string[]
    scores: number[]
  }
  trend: {
    direction: 'up' | 'down' | 'stable'
    change: number
  }
  time_of_day: {
    best_block: string
    best_status: 'good' | 'ok' | 'avoid'
    blocks: {
      [key: string]: {
        avg_channels: number
        avg_ratio: number
        avg_viewers: number
        sample_count: number
      }
    }
  }
  averages: {
    channels: number
    discoverability: number
    viewers: number
  }
  meta: {
    data_points: number
    last_updated: string
  }
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

// Sparkline SVG Component
interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  className?: string
}

const Sparkline: React.FC<SparklineProps> = ({ 
  data, 
  width = 80, 
  height = 24,
  className = '' 
}) => {
  if (!data || data.length < 2) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1 // Avoid division by zero

  // Generate SVG path
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg 
      width={width} 
      height={height} 
      className={className}
      viewBox={`0 0 ${width} ${height}`}
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

// Trend Arrow Component
interface TrendArrowProps {
  direction: 'up' | 'down' | 'stable'
  change: number
}

const TrendArrow: React.FC<TrendArrowProps> = ({ direction, change }) => {
  const getArrow = () => {
    switch (direction) {
      case 'up': return '↗'
      case 'down': return '↘'
      case 'stable': return '→'
    }
  }

  const getColor = () => {
    switch (direction) {
      case 'up': return 'text-matrix-green'
      case 'down': return 'text-red-500'
      case 'stable': return 'text-gray-400'
    }
  }

  return (
    <span className={`${getColor()} text-sm ml-1`} title={`${direction} (${change > 0 ? '+' : ''}${change.toFixed(2)})`}>
      {getArrow()}
    </span>
  )
}

// Time Block Status Component
interface TimeBlocksProps {
  blocks: GameAnalytics['time_of_day']['blocks']
  bestBlock: string
}

const TimeBlocks: React.FC<TimeBlocksProps> = ({ blocks, bestBlock }) => {
  const blockOrder = ['00-04', '04-08', '08-12', '12-16', '16-20', '20-24']
  
  const getStatus = (blockKey: string): 'good' | 'ok' | 'avoid' => {
    const block = blocks[blockKey]
    if (!block) return 'avoid'
    
    // Calculate average ratio across all blocks
    const allRatios = Object.values(blocks).map(b => b.avg_ratio)
    const avgRatio = allRatios.reduce((sum, r) => sum + r, 0) / allRatios.length
    
    // Good: >= average, OK: 75-99% of average, Avoid: < 75%
    if (block.avg_ratio >= avgRatio) return 'good'
    if (block.avg_ratio >= avgRatio * 0.75) return 'ok'
    return 'avoid'
  }

  const getStatusColor = (status: 'good' | 'ok' | 'avoid') => {
    switch (status) {
      case 'good': return 'bg-green-500'
      case 'ok': return 'bg-yellow-500'
      case 'avoid': return 'bg-red-500'
    }
  }

  return (
    <div className="flex gap-1 items-center">
      {blockOrder.map(blockKey => {
        const status = getStatus(blockKey)
        const isBest = blockKey === bestBlock
        return (
          <div 
            key={blockKey}
            className={`w-3 h-3 rounded-full ${getStatusColor(status)} ${isBest ? 'ring-2 ring-matrix-green' : ''}`}
            title={`${blockKey} PST: ${status} (ratio: ${blocks[blockKey]?.avg_ratio?.toFixed(1) || 'N/A'})`}
          />
        )
      })}
    </div>
  )
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
  const [analyticsCache, setAnalyticsCache] = useState<{[gameId: string]: GameAnalytics}>({})
  const [loadingAnalytics, setLoadingAnalytics] = useState<{[gameId: string]: boolean}>({})
  
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

  // Fetch analytics for a specific game
  const fetchAnalytics = async (gameId: string) => {
    // Check cache first
    if (analyticsCache[gameId]) return analyticsCache[gameId]
    
    // Check if already loading
    if (loadingAnalytics[gameId]) return null

    try {
      setLoadingAnalytics(prev => ({ ...prev, [gameId]: true }))
      const response = await axios.get<GameAnalytics>(`${API_URL}/api/v1/analytics/${gameId}`)
      const analytics = response.data
      
      // Cache the result
      setAnalyticsCache(prev => ({ ...prev, [gameId]: analytics }))
      setLoadingAnalytics(prev => ({ ...prev, [gameId]: false }))
      
      return analytics
    } catch (err) {
      console.error(`Failed to fetch analytics for game ${gameId}:`, err)
      setLoadingAnalytics(prev => ({ ...prev, [gameId]: false }))
      return null
    }
  }

  // Fetch analytics when a game card is expanded
  useEffect(() => {
    if (selectedGame?.game_id) {
      fetchAnalytics(selectedGame.game_id)
    }
  }, [selectedGame])

  // Helper function to create Twitch search URL
  const getTwitchUrl = (gameName: string) => {
    return `https://www.twitch.tv/search?term=${encodeURIComponent(gameName)}`
  }

  // Helper functions for game info URLs
  const getIGDBUrl = (gameName: string) => {
    return `https://www.igdb.com/search?type=1&q=${encodeURIComponent(gameName)}`
  }

  const getYouTubeUrl = (gameName: string) => {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(gameName + ' gameplay trailer')}`
  }

  const getWikipediaUrl = (gameName: string) => {
    return `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(gameName + ' video game')}`
  }

  // Generate Twitter share URL
  const getTwitterShareUrl = (game: GameOpportunity) => {
    const score = game.discoverability_rating !== undefined 
      ? game.discoverability_rating 
      : (game.overall_score * 10).toFixed(1);
    
    const text = `${game.game_name} scores ${score}/10 for discoverability

${game.channels} streamers • ${game.total_viewers.toLocaleString()} viewers

Find your game → streamscout.gg`;
    
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  }

  // External click tracking for GA4
  const trackExternalClick = (linkType: 'steam' | 'epic' | 'twitch' | 'igdb' | 'youtube' | 'wikipedia' | 'share_twitter' | 'kinguin', game: GameOpportunity) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      const score = game.discoverability_rating !== undefined
        ? game.discoverability_rating
        : (game.overall_score * 10);

      (window as any).gtag('event', `${linkType}_click`, {
        'game_name': game.game_name,
        'game_score': score,
        'game_rank': game.rank,
        'event_category': linkType === 'share_twitter' ? 'share' : 'external_link',
        'event_label': game.game_name
      });

      console.log(`[TRACK] ${linkType}_click: ${game.game_name} (${score.toFixed(1)}/10)`);
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
        setWarmupStatus('Waiting for initial data...')
      }
      return false
    } catch (err) {
      console.error('Status check failed:', err)
      return false
    }
  }, [])

  // Poll for data during warmup
  const pollForData = useCallback(async () => {
    const maxAttempts = 30 // 30 seconds max
    let attempts = 0

    const poll = async (): Promise<boolean> => {
      if (attempts >= maxAttempts) {
        setError('Warmup timed out. Please refresh the page.')
        setIsWarmingUp(false)
        return false
      }

      const hasData = await checkStatus()
      if (hasData) {
        return true
      }

      attempts++
      await new Promise(resolve => setTimeout(resolve, 1000))
      return poll()
    }

    return poll()
  }, [checkStatus])

  // Fetch data from API
  const fetchData = useCallback(async () => {
    try {
      setError(null)
      
      // Check if we need to warmup first
      const hasData = await checkStatus()
      
      if (!hasData) {
        setIsWarmingUp(true)
        setWarmupStatus('No cached data. Warming up...')
        
        const warmedUp = await pollForData()
        if (!warmedUp) {
          return // Error already set
        }
      }

      // Fetch actual data
      const response = await axios.get<AnalysisData>(`${API_URL}/api/v1/analyze?limit=2000`)
      setData(response.data)
      
      // Set countdown timer using the correct field name
      const refreshSeconds = response.data.next_refresh_in_seconds || 
                            response.data.cache_expires_in_seconds || 600
      setCountdown(refreshSeconds)
      
      setIsWarmingUp(false)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message)
      } else {
        setError('Failed to fetch data')
      }
    } finally {
      setLoading(false)
    }
  }, [checkStatus, pollForData])

  // Initial data fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          fetchData() // Auto-refresh when countdown hits 0
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown, fetchData])

  // Format countdown as MM:SS
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'score-excellent'
    if (score >= 0.6) return 'score-good'
    if (score >= 0.4) return 'score-moderate'
    return 'score-poor'
  }

  // Generate contextual explanation for the overall score
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

  // Metric tooltips
  const METRIC_TOOLTIPS = {
    discoverability: {
      description: 'How easy it is for viewers to find your stream in this category. Higher = better chance of discovery.'
    },
    viability: {
      description: 'Balance of viewer count vs competition. Shows if the category has enough audience to be worth streaming.'
    },
    engagement: {
      description: 'How engaged viewers are (avg viewers per channel). Higher = more loyal, less channel-hopping.'
    },
    avgViewers: {
      description: 'Average number of viewers per stream. Shows typical stream size in this category.'
    }
  }

  // Warmup screen
  if (isWarmingUp || (loading && !data)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl sm:text-6xl mb-4 animate-glow">[ WARMING UP ]</div>
          <div className="text-matrix-green-dim mb-4">{warmupStatus}</div>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-2 border-matrix-green border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-matrix-green-dim mt-4 text-sm">
            First load takes ~30 seconds. Auto-refreshing...
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
          <button onClick={fetchData} className="matrix-button mt-6">
            RETRY
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="/streamscout-logo.jpg"
              alt="StreamScout - Find Your Audience. Grow Your Channel."
              className="w-full max-w-2xl h-auto"
            />
          </div>

          {/* What is StreamScout? */}
          <div className="max-w-2xl mx-auto text-center mb-6 px-4">
            <h2 className="text-lg sm:text-xl font-bold text-matrix-green-bright mb-2">What is StreamScout?</h2>
            <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
              Not another "just sort by viewers" tool. Our algorithm weighs discoverability, viability, and engagement metrics to find opportunities most streamers miss.
            </p>
            <p className="text-sm sm:text-base text-gray-200 leading-relaxed mt-2">
              We show you where small streamers can actually compete.
            </p>
            <p className="text-base sm:text-lg font-bold text-matrix-green-bright mt-3">
              No guesswork. Just data.
            </p>
          </div>

          {data && (
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="px-3 py-1.5 rounded border border-matrix-green/50 text-matrix-green bg-black/50">
                🎮 {data.total_games_analyzed} GAMES ANALYZED
              </div>
              <div className="px-3 py-1.5 rounded border border-matrix-green/50 text-matrix-green bg-black/50">
                ⏱️ UPDATED: {new Date(data.timestamp).toLocaleTimeString()}
              </div>
              <div className="px-3 py-1.5 rounded border border-matrix-green/50 text-matrix-green bg-black/50">
                🔄 NEXT UPDATE: {formatCountdown(countdown)}
              </div>
            </div>
          )}
        </header>

        {/* Main Content with Sidebar */}
        <div className="flex gap-8">
          {/* Main Game Grid - Full Width */}
          <main className="w-full">
            <Link href="/twitchstrike-alternative" className="text-matrix-green hover:text-matrix-green-bright transition-colors">
              TwitchStrike Alternative
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/changelog" className="text-matrix-green hover:text-matrix-green-bright transition-colors">
              What's New
            </Link>
          </div>
        </header>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search games... (e.g., 'Minecraft', 'League')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-matrix-light border-2 border-matrix-green/30 rounded-lg px-4 py-3 text-matrix-green placeholder-gray-500 focus:border-matrix-green focus:outline-none"
          />
        </div>

        {/* Genre Filters */}
        <div className="mb-8">
          <div className="text-sm text-gray-400 mb-3">Filter by Genre:</div>
          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map(genre => (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedGenres.includes(genre)
                    ? 'bg-matrix-green text-matrix-dark border-2 border-matrix-green'
                    : 'bg-matrix-light border-2 border-matrix-green/30 text-matrix-green hover:border-matrix-green/50'
                }`}
              >
                {genre}
              </button>
            ))}
            {selectedGenres.length > 0 && (
              <button
                onClick={() => setSelectedGenres([])}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-900/30 border-2 border-red-500/50 text-red-400 hover:bg-red-900/50"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-center">
          <span className="text-gray-400">
            Showing {filteredOpportunities.length} {filteredOpportunities.length === 1 ? 'game' : 'games'}
            {(selectedGenres.length > 0 || searchQuery) && (
              <span> (filtered from {data.top_opportunities.length})</span>
            )}
          </span>
        </div>

        {/* Game Cards */}
        <div className="space-y-4">
          {filteredOpportunities.map((game) => {
            const analytics = game.game_id ? analyticsCache[game.game_id] : null
            const isLoadingAnalytics = game.game_id ? loadingAnalytics[game.game_id] : false

            return (
              <div 
                key={game.rank}
                className={`matrix-card cursor-pointer ${game.is_filtered ? 'opacity-60' : ''}`}
                onClick={() => setSelectedGame(selectedGame?.rank === game.rank ? null : game)}
              >
                {/* Warning Banner */}
                {game.is_filtered && game.warning_text && (
                  <div className="mb-4 -mx-6 -mt-6 bg-red-900/30 border-b-2 border-red-500/50 px-6 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">⚠️</span>
                      <div>
                        <div className="text-red-400 font-bold text-sm">WARNING</div>
                        <div className="text-red-300 text-sm">{game.warning_text}</div>
                      </div>
                    </div>
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
                          {/* Historical: Trend Arrow + Label (Prominent, Simple) */}
                          {analytics?.trend && (
                            <span className={`inline-flex items-center gap-1.5 ml-2 px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide ${
                              analytics.trend.direction === 'up' ? 'bg-green-900/30 text-green-400' :
                              analytics.trend.direction === 'down' ? 'bg-red-900/30 text-red-400' :
                              'bg-gray-800/50 text-gray-400'
                            }`}>
                              <span className="text-lg font-bold">
                                {analytics.trend.direction === 'up' ? '↗' : 
                                 analytics.trend.direction === 'down' ? '↘' : '→'}
                              </span>
                              <span>
                                {analytics.trend.direction === 'up' ? 'Trending Up' :
                                 analytics.trend.direction === 'down' ? 'Trending Down' :
                                 'Stable'}
                              </span>
                            </span>
                          )}
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

                      {/* Score - Always Visible - With Info Tooltip */}
                      <div className="text-right flex-shrink-0 ml-2 pr-1 relative">
                        <div className="flex items-start justify-end gap-1">
                          {/* Info Icon with Tooltip */}
                          <div className="relative group/info mt-1">
                            <span className="w-5 h-5 rounded-full bg-matrix-green/50 hover:bg-matrix-green text-black flex items-center justify-center text-xs font-bold cursor-help transition-colors">?</span>

                            {/* Tooltip - Positioned Left */}
                            <div className="absolute right-full top-0 mr-2 w-56 p-3 bg-gray-900 border border-matrix-green/50 rounded-lg shadow-lg opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-200 z-50 text-left pointer-events-none">
                              <div className="text-matrix-green font-bold text-xs mb-2">Why this score?</div>
                              {game.is_filtered ? (
                                <div className="text-red-400 text-xs leading-relaxed">
                                  <p>{game.warning_text || 'This category is oversaturated.'}</p>
                                  <p className="mt-2 text-red-300">Small streamers get buried pages deep in categories this large.</p>
                                </div>
                              ) : (
                                <div className="text-xs leading-relaxed space-y-2">
                                  <p className="text-white">{getScoreContext(game).competition} ({game.channels} streamers)</p>
                                  <p className="text-white">{getScoreContext(game).audience} ({game.total_viewers.toLocaleString()} watching)</p>
                                  <p className="text-gray-300 text-[10px] mt-2">Click card for detailed breakdown →</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Score Number */}
                          <div className={`text-2xl sm:text-4xl md:text-5xl font-bold leading-none ${
                            game.is_filtered ? 'text-red-500' : getScoreColor(game.overall_score)
                          }`}>
                            {game.is_filtered && game.discoverability_rating !== undefined
                              ? `${game.discoverability_rating}/10`
                              : `${(game.overall_score * 10).toFixed(1)}/10`
                            }
                          </div>
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-400 mt-1">
                          {game.is_filtered ? 'POOR' : game.trend}
                        </div>
                        <div className={`text-[9px] sm:text-xs leading-tight max-w-[90px] sm:max-w-none font-bold tracking-wide ${
                          game.is_filtered ? 'text-red-400' : 'text-amber-400'
                        }`}>
                          {game.is_filtered ? 'NOT RECOMMENDED' : game.recommendation}
                        </div>
                      </div>
                    </div>

                    {/* Historical Features - Best Time to Stream */}
                    {analytics?.time_of_day && (
                      <div className="mb-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">BEST TIME:</span>
                          <span className="text-matrix-green font-semibold">
                            {analytics.time_of_day.best_block.replace('-', ':00-')}:00 PST
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            analytics.time_of_day.best_status === 'good' ? 'bg-green-900/50 text-green-400' :
                            analytics.time_of_day.best_status === 'ok' ? 'bg-yellow-900/50 text-yellow-400' :
                            'bg-red-900/50 text-red-400'
                          }`}>
                            {analytics.time_of_day.best_status.toUpperCase()}
                          </span>
                        </div>
                        <div className="mt-1.5">
                          <TimeBlocks 
                            blocks={analytics.time_of_day.blocks}
                            bestBlock={analytics.time_of_day.best_block}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action Links */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {/* Twitch Button */}
                      <a
                        href={getTwitchUrl(game.game_name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-purple-700 hover:bg-purple-600 text-white text-xs sm:text-sm font-semibold transition-colors leading-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          trackExternalClick('twitch', game);
                        }}
                      >
                        <span className="text-sm">📺</span> Twitch
                      </a>

                      {/* Kinguin Button - Always show */}
                      <a
                        href={`https://www.kinguin.net/listing?&query%5D=${encodeURIComponent(game.game_name)}&active=1&r=6930867eb1a6f`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-semibold transition-colors leading-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          trackExternalClick('kinguin', game);
                        }}
                      >
                        <span className="text-sm">🛒</span> Buy
                      </a>

                      {/* Steam Button */}
                      {game.purchase_links.steam && (
                        <a
                          href={game.purchase_links.steam}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="matrix-button-small"
                          onClick={(e) => {
                            e.stopPropagation();
                            trackExternalClick('steam', game);
                          }}
                        >
                          <span className="text-sm">🎮</span> Steam
                        </a>
                      )}

                      {/* Epic Button */}
                      {game.purchase_links.epic && (
                        <a
                          href={game.purchase_links.epic}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="matrix-button-small"
                          onClick={(e) => {
                            e.stopPropagation();
                            trackExternalClick('epic', game);
                          }}
                        >
                          <span className="text-sm">🎮</span> Epic
                        </a>
                      )}

                      {/* Share to Twitter/X Button */}
                      <a
                        href={getTwitterShareUrl(game)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-semibold transition-colors leading-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          trackExternalClick('share_twitter', game);
                        }}
                      >
                        Share
                      </a>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedGame?.rank === game.rank && (
                  <div className="mt-4 pt-4 border-t border-matrix-green/30">
                    {/* Loading state for analytics */}
                    {isLoadingAnalytics && (
                      <div className="text-center text-gray-400 text-sm mb-4">
                        Loading historical data...
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Discoverability */}
                      <div className="matrix-stat relative group/disc">
                        <div className="text-gray-400 text-xs flex items-center gap-1 cursor-help">
                          DISCOVERABILITY
                          <span className="w-4 h-4 rounded-full bg-matrix-green/50 group-hover/disc:bg-matrix-green text-black flex items-center justify-center text-[10px] font-bold transition-colors">?</span>
                        </div>
                        <div className={`text-2xl font-bold ${getScoreColor(game.discoverability_score)}`}>
                          {(game.discoverability_score * 10).toFixed(1)}/10
                        </div>
                        {/* Tooltip */}
                        <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 border border-matrix-green/50 rounded-lg shadow-lg opacity-0 invisible group-hover/disc:opacity-100 group-hover/disc:visible transition-all duration-200 z-50 text-left pointer-events-none">
                          <p className="text-xs text-white leading-relaxed">{METRIC_TOOLTIPS.discoverability.description}</p>
                        </div>
                      </div>

                      {/* Viability */}
                      <div className="matrix-stat relative group/viab">
                        <div className="text-gray-400 text-xs flex items-center gap-1 cursor-help">
                          VIABILITY
                          <span className="w-4 h-4 rounded-full bg-matrix-green/50 group-hover/viab:bg-matrix-green text-black flex items-center justify-center text-[10px] font-bold transition-colors">?</span>
                        </div>
                        <div className={`text-2xl font-bold ${getScoreColor(game.viability_score)}`}>
                          {(game.viability_score * 10).toFixed(1)}/10
                        </div>
                        {/* Tooltip */}
                        <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 border border-matrix-green/50 rounded-lg shadow-lg opacity-0 invisible group-hover/viab:opacity-100 group-hover/viab:visible transition-all duration-200 z-50 text-left pointer-events-none">
                          <p className="text-xs text-white leading-relaxed">{METRIC_TOOLTIPS.viability.description}</p>
                        </div>
                      </div>

                      {/* Engagement */}
                      <div className="matrix-stat relative group/eng">
                        <div className="text-gray-400 text-xs flex items-center gap-1 cursor-help">
                          ENGAGEMENT
                          <span className="w-4 h-4 rounded-full bg-matrix-green/50 group-hover/eng:bg-matrix-green text-black flex items-center justify-center text-[10px] font-bold transition-colors">?</span>
                        </div>
                        <div className={`text-2xl font-bold ${getScoreColor(game.engagement_score)}`}>
                          {(game.engagement_score * 10).toFixed(1)}/10
                        </div>
                        {/* Tooltip */}
                        <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 border border-matrix-green/50 rounded-lg shadow-lg opacity-0 invisible group-hover/eng:opacity-100 group-hover/eng:visible transition-all duration-200 z-50 text-left pointer-events-none">
                          <p className="text-xs text-white leading-relaxed">{METRIC_TOOLTIPS.engagement.description}</p>
                        </div>
                      </div>

                      {/* Avg Viewers */}
                      <div className="matrix-stat relative group/avg">
                        <div className="text-gray-400 text-xs flex items-center gap-1 cursor-help">
                          AVG VIEWERS/CH
                          <span className="w-4 h-4 rounded-full bg-matrix-green/50 group-hover/avg:bg-matrix-green text-black flex items-center justify-center text-[10px] font-bold transition-colors">?</span>
                        </div>
                        <div className="text-2xl font-bold text-matrix-green">
                          {game.avg_viewers_per_channel.toFixed(1)}
                        </div>
                        {/* Tooltip */}
                        <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 border border-matrix-green/50 rounded-lg shadow-lg opacity-0 invisible group-hover/avg:opacity-100 group-hover/avg:visible transition-all duration-200 z-50 text-left pointer-events-none">
                          <p className="text-xs text-white leading-relaxed">{METRIC_TOOLTIPS.avgViewers.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* 7-Day Trend (for data nerds) */}
                    {analytics?.sparkline && analytics.sparkline.scores.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-matrix-green/20">
                        <div className="text-gray-400 text-xs mb-2">7-DAY TREND</div>
                        <div className="flex items-center gap-4">
                          <Sparkline 
                            data={analytics.sparkline.scores}
                            width={120}
                            height={40}
                            className="text-matrix-green opacity-80"
                          />
                          <div className="text-sm text-gray-300">
                            <div>
                              {analytics.trend.direction === 'up' && `↗ Up ${Math.abs(analytics.trend.change).toFixed(1)}%`}
                              {analytics.trend.direction === 'down' && `↘ Down ${Math.abs(analytics.trend.change).toFixed(1)}%`}
                              {analytics.trend.direction === 'stable' && `→ Stable (${Math.abs(analytics.trend.change).toFixed(1)}%)`}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {analytics.meta.data_points} data points
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Learn About This Game */}
                    <div className="mt-4 pt-4 border-t border-matrix-green/20">
                      <div className="text-gray-400 text-xs mb-2">LEARN ABOUT THIS GAME</div>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={getIGDBUrl(game.game_name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium transition-colors border border-gray-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            trackExternalClick('igdb', game);
                          }}
                        >
                          📖 Game Info (IGDB)
                        </a>
                        <a
                          href={getYouTubeUrl(game.game_name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-900/50 hover:bg-red-800/50 text-gray-200 text-xs font-medium transition-colors border border-red-800/50"
                          onClick={(e) => {
                            e.stopPropagation();
                            trackExternalClick('youtube', game);
                          }}
                        >
                          ▶️ Gameplay & Trailers
                        </a>
                        <a
                          href={getWikipediaUrl(game.game_name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium transition-colors border border-gray-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            trackExternalClick('wikipedia', game);
                          }}
                        >
                          📚 Wikipedia
                        </a>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-400 text-center">
                      Click card again to collapse
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-matrix-green/30 text-center text-sm text-matrix-green-dim">
          <p>Built by <span className="text-matrix-green font-bold">DIGITALVOCALS</span> (digitalvocalstv@gmail.com)</p>
          <p className="mt-2">Data auto-updates every 10 minutes • Powered by Twitch API</p>
          <p className="mt-2">
            Affiliate Disclosure: We may earn a commission from game purchases through our links.
          </p>
          <div className="mt-4 flex justify-center gap-4 flex-wrap">
            <Link href="/about" className="hover:text-matrix-green transition-colors">About</Link>
            <span>•</span>
            <Link href="/changelog" className="hover:text-matrix-green transition-colors">Changelog</Link>
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
