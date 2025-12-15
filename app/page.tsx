'use client'

import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

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
  trend: string
  box_art_url: string | null
  genres: string[]
  purchase_links: {
    steam: string | null
    epic: string | null
    free: boolean
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
}

// HISTORICAL FEATURES - Interface matching Architect's spec
interface GameAnalytics {
  sparkline: number[]
  trend: 'up' | 'down' | 'stable'
  trendMagnitude: number
  bestTime: string
  status: 'good' | 'ok' | 'avoid' | 'unknown'
  dataDays: number
}

interface AnalysisData {
  timestamp: string
  total_games_analyzed: number
  top_opportunities: GameOpportunity[]
  cache_expires_in_seconds?: number
  next_refresh_in_seconds?: number
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

// HISTORICAL FEATURES - Sparkline Component
interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  className?: string
}

const Sparkline: React.FC<SparklineProps> = ({ 
  data, 
  width = 120, 
  height = 40,
  className = '' 
}) => {
  if (!data || data.length < 2) return null

  // ARCHITECT SPEC: Fixed 0-10 scale, not auto-scaled
  const max = 10
  const min = 0
  const range = max - min

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

// HISTORICAL FEATURES - Best Time Formatter
const formatBestTime = (block: string): string => {
  const timeMap: Record<string, string> = {
    "00-04": "12 AM - 4 AM PST",
    "04-08": "4 AM - 8 AM PST",
    "08-12": "8 AM - 12 PM PST",
    "12-16": "12 PM - 4 PM PST",
    "16-20": "4 PM - 8 PM PST",
    "20-24": "8 PM - 12 AM PST"
  }
  return timeMap[block] || block
}

// HISTORICAL FEATURES - Clean Recommendation Text
const cleanRecommendation = (rating: string): string => {
  return rating.replace(/^\[.*?\]\s*/, '')
}

// HISTORICAL FEATURES - Trend Arrow Component
interface TrendArrowProps {
  direction: 'up' | 'down' | 'stable'
  change: number
}

const TrendArrow: React.FC<TrendArrowProps> = ({ direction, change }) => {
  const getArrowAndText = () => {
    if (direction === 'up') {
      return {
        arrow: '↗',
        text: 'TRENDING UP',
        className: 'bg-green-500/20 border-green-500/40 text-green-400'
      }
    } else if (direction === 'down') {
      return {
        arrow: '↘',
        text: 'TRENDING DOWN',
        className: 'bg-red-500/20 border-red-500/40 text-red-400'
      }
    } else {
      return {
        arrow: '→',
        text: 'STABLE',
        className: 'bg-gray-500/20 border-gray-500/40 text-gray-400'
      }
    }
  }

  const { arrow, text, className } = getArrowAndText()

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-sm font-medium ${className}`}>
      <span className="text-lg leading-none">{arrow}</span>
      <span>{text}</span>
      {change !== 0 && (
        <span className="text-xs opacity-70">
          {change > 0 ? '+' : ''}{change.toFixed(1)}%
        </span>
      )}
    </div>
  )
}

// HISTORICAL FEATURES - Time Blocks Component
interface TimeBlocksProps {
  blocks: {
    [key: string]: {
      avg_ratio: number
      sample_count: number
    }
  }
  bestBlock: string
}

const TimeBlocks: React.FC<TimeBlocksProps> = ({ blocks, bestBlock }) => {
  const blockOrder = ['00-04', '04-08', '08-12', '12-16', '16-20', '20-24']
  
  const getStatus = (blockKey: string): 'good' | 'ok' | 'avoid' => {
    const block = blocks[blockKey]
    if (!block) return 'avoid'
    
    const allRatios = Object.values(blocks).map(b => b.avg_ratio)
    const avgRatio = allRatios.reduce((sum, r) => sum + r, 0) / allRatios.length
    
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

  // HISTORICAL FEATURES - Analytics state
  const [analyticsCache, setAnalyticsCache] = useState<{ [gameId: string]: GameAnalytics }>({})
  const [loadingAnalytics, setLoadingAnalytics] = useState<{ [gameId: string]: boolean }>({})

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
    if (searchQuery && !game.game_name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (selectedGenres.length === 0) return true
    return game.genres?.some(g => selectedGenres.includes(g))
  }) || []

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

  // HISTORICAL FEATURES - Fetch analytics for a game
  const fetchAnalytics = useCallback(async (gameId: string) => {
    if (analyticsCache[gameId] || loadingAnalytics[gameId]) {
      return // Already have it or loading it
    }

    setLoadingAnalytics(prev => ({ ...prev, [gameId]: true }))

    try {
      const response = await axios.get<GameAnalytics>(`${API_URL}/api/v1/analytics/${gameId}`)
      setAnalyticsCache(prev => ({ ...prev, [gameId]: response.data }))
    } catch (err) {
      console.log(`No analytics available for game ${gameId}`)
    } finally {
      setLoadingAnalytics(prev => ({ ...prev, [gameId]: false }))
    }
  }, [analyticsCache, loadingAnalytics])

  // Check status endpoint for warmup progress
  const checkStatus = useCallback(async () => {
    try {
      const response = await axios.get<StatusData>(`${API_URL}/api/v1/status`)
      const status = response.data

      if (status.worker.is_refreshing) {
        setWarmupStatus('Fetching stream data from Twitch API...')
      } else if (status.cache.has_data) {
        setWarmupStatus('Data ready!')
        return true
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
      const response = await axios.get(`${API_URL}/api/v1/analyze?limit=2000`)

      if (response.status === 202 || response.data.status === 'warming_up') {
        setIsWarmingUp(true)
        setData(null)
        return false
      }

      setIsWarmingUp(false)
      setData(response.data)
      setError(null)

      const refreshSeconds = response.data.next_refresh_in_seconds ??
                            response.data.cache_expires_in_seconds ??
                            600
      setCountdown(refreshSeconds)

      return true
    } catch (err: any) {
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

  // Warmup polling
  useEffect(() => {
    if (!isWarmingUp) return

    const pollStatus = async () => {
      const hasData = await checkStatus()
      if (hasData) {
        await fetchData()
      }
    }

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
          fetchData()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [data, countdown, fetchData])

  // Poll for updates every 60 seconds
  useEffect(() => {
    if (!data) return

    const interval = setInterval(() => {
      fetchData()
    }, 60 * 1000)

    return () => clearInterval(interval)
  }, [data, fetchData])

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

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

  const METRIC_TOOLTIPS = {
    discoverability: {
      title: 'Discoverability',
      description: 'Can viewers find you? Fewer streamers = you appear higher in the browse list. This is weighted highest (45%) because if nobody sees you, nothing else matters.'
    },
    viability: {
      title: 'Viability',
      description: 'Is there actually an audience? Sweet spot is enough viewers to matter, but not so many that giants dominate. Too few = dead category, too many = you\'re buried.'
    },
    engagement: {
      title: 'Engagement',
      description: 'Are people really watching? Higher average viewers per channel means an engaged community, not just background noise.'
    },
    avgViewers: {
      title: 'Avg Viewers/Channel',
      description: 'Total viewers divided by total streamers. Higher ratio = more eyeballs per streamer on average. This metric helps calculate your discoverability score.'
    }
  }

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
        <header className="mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="/streamscout-logo.jpg"
              alt="StreamScout - Find Your Audience. Grow Your Channel."
              className="w-full max-w-2xl h-auto"
            />
          </div>

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

        <div className="flex gap-8">
          <main className="w-full">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search for any game (e.g., Fortnite, League of Legends)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-matrix-green/30 rounded-lg text-matrix-green placeholder-matrix-green/40 focus:outline-none focus:border-matrix-green/60 focus:ring-1 focus:ring-matrix-green/30"
              />
            </div>

            <div className="mb-6">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-matrix-green/70 text-sm mr-2">Filter by genre:</span>
                {GENRE_OPTIONS.map(genre => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      selectedGenres.includes(genre)
                        ? 'bg-matrix-green text-black font-semibold'
                        : 'bg-matrix-green/10 text-matrix-green border border-matrix-green/30 hover:bg-matrix-green/20'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
                {selectedGenres.length > 0 && (
                  <button
                    onClick={() => setSelectedGenres([])}
                    className="px-3 py-1 rounded-full text-sm bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 ml-2"
                  >
                    Clear All
                  </button>
                )}
              </div>
              {selectedGenres.length > 0 && (
                <div className="text-matrix-green/50 text-sm mt-2">
                  Showing {filteredOpportunities.length} of {data?.top_opportunities?.length || 0} games
                </div>
              )}
              {searchQuery && (
                <div className="text-matrix-green/50 text-sm mt-2">
                  Search results for "{searchQuery}": {filteredOpportunities.length} games found
                </div>
              )}
            </div>

            <div className="grid gap-4">
              {filteredOpportunities.length === 0 && (selectedGenres.length > 0 || searchQuery) ? (
                <div className="text-center py-12 text-matrix-green/50">
                  {searchQuery
                    ? `No games found matching "${searchQuery}". Try a different search.`
                    : 'No games found matching selected genres. Try different filters.'
                  }
                </div>
              ) : filteredOpportunities.map((game) => {
                // HISTORICAL FEATURES - Fetch analytics when game is expanded
                const analytics = analyticsCache[game.game_id]
                if (selectedGame?.rank === game.rank && !analytics && !loadingAnalytics[game.game_id]) {
                  fetchAnalytics(game.game_id)
                }

                return (
                  <div
                    key={game.rank}
                    className={`matrix-card cursor-pointer ${
                      game.is_filtered
                        ? 'border-red-500/50 bg-red-900/10'
                        : ''
                    }`}
                    onClick={() => setSelectedGame(selectedGame?.rank === game.rank ? null : game)}
                  >
                    {game.is_filtered && game.warning_text && (
                      <div className="bg-red-500/20 border border-red-500/40 rounded px-3 py-2 mb-3 flex items-center gap-2">
                        <span className="text-red-400 font-bold text-sm">AVOID</span>
                        <span className="text-red-300/80 text-xs">{game.warning_text}</span>
                        {game.discoverability_rating !== undefined && (
                          <span className="ml-auto text-red-400 font-bold text-sm">
                            {game.discoverability_rating}/10
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex gap-4">
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

                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-start gap-2 mb-2">
                          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-matrix-green-bright flex-shrink-0">
                            #{game.rank}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h2 className="text-base sm:text-xl md:text-2xl font-bold leading-tight break-words">
                                {game.game_name}
                              </h2>
                              {/* HISTORICAL FEATURES - Trend Arrow (moved to title) */}
                              {analytics && (
                                <TrendArrow direction={analytics.trend} change={analytics.trendMagnitude} />
                              )}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-300 mt-1">
                              {game.total_viewers?.toLocaleString() || 0} viewers • {game.channels} channels
                            </div>

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

                            {/* HISTORICAL FEATURES - Best Time Display */}
                            {analytics && analytics.bestTime && (
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-xs text-gray-400">BEST TIME:</span>
                                <span className="text-xs text-matrix-green font-semibold">
                                  {formatBestTime(analytics.bestTime)}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="text-right flex-shrink-0 ml-2 pr-1 relative">
                            <div className="flex items-start justify-end gap-1">
                              <div className="relative group/info mt-1">
                                <span className="w-5 h-5 rounded-full bg-matrix-green/50 hover:bg-matrix-green text-black flex items-center justify-center text-xs font-bold cursor-help transition-colors">?</span>

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
                              {game.is_filtered ? 'NOT RECOMMENDED' : cleanRecommendation(game.recommendation)}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                          <a
                            href={getTwitchUrl(game.game_name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold transition-colors leading-none"
                            onClick={(e) => {
                              e.stopPropagation();
                              trackExternalClick('twitch', game);
                            }}
                          >
                            <span className="text-sm">📺</span> Twitch
                          </a>

                          <a
                            href={`https://www.kinguin.net/listing?&query%5D=${encodeURIComponent(game.game_name)}&active=1&r=6930867eb1a6f`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs sm:text-sm font-semibold transition-all duration-200 hover:scale-105 leading-none"
                            onClick={(e) => {
                              e.stopPropagation();
                              trackExternalClick('kinguin', game);
                            }}
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                            </svg>
                            Buy
                          </a>

                          {game.purchase_links.free && (
                            <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 text-xs sm:text-sm font-semibold leading-none">
                              <span className="text-sm">🆓</span> Free
                            </span>
                          )}

                          {game.purchase_links.steam && (
                            <a
                              href={game.purchase_links.steam}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#2a475e] hover:bg-[#3d6a8a] text-white text-xs sm:text-sm font-semibold transition-colors leading-none"
                              onClick={(e) => {
                                e.stopPropagation();
                                trackExternalClick('steam', game);
                              }}
                            >
                              <span className="text-sm">🎮</span> Steam
                            </a>
                          )}
                          {game.purchase_links.epic && (
                            <a
                              href={game.purchase_links.epic}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#313131] hover:bg-[#444444] border border-gray-600 text-white text-xs sm:text-sm font-semibold transition-colors leading-none"
                              onClick={(e) => {
                                e.stopPropagation();
                                trackExternalClick('epic', game);
                              }}
                            >
                              <span className="text-sm">🎮</span> Epic
                            </a>
                          )}

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

                    {selectedGame?.rank === game.rank && (
                      <div className="mt-4 pt-4 border-t border-matrix-green/30">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="matrix-stat relative group/disc">
                            <div className="text-gray-400 text-xs flex items-center gap-1 cursor-help">
                              DISCOVERABILITY
                              <span className="w-4 h-4 rounded-full bg-matrix-green/50 group-hover/disc:bg-matrix-green text-black flex items-center justify-center text-[10px] font-bold transition-colors">?</span>
                            </div>
                            <div className={`text-2xl font-bold ${getScoreColor(game.discoverability_score)}`}>
                              {(game.discoverability_score * 10).toFixed(1)}/10
                            </div>
                            <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 border border-matrix-green/50 rounded-lg shadow-lg opacity-0 invisible group-hover/disc:opacity-100 group-hover/disc:visible transition-all duration-200 z-50 text-left pointer-events-none">
                              <p className="text-xs text-white leading-relaxed">{METRIC_TOOLTIPS.discoverability.description}</p>
                            </div>
                          </div>

                          <div className="matrix-stat relative group/viab">
                            <div className="text-gray-400 text-xs flex items-center gap-1 cursor-help">
                              VIABILITY
                              <span className="w-4 h-4 rounded-full bg-matrix-green/50 group-hover/viab:bg-matrix-green text-black flex items-center justify-center text-[10px] font-bold transition-colors">?</span>
                            </div>
                            <div className={`text-2xl font-bold ${getScoreColor(game.viability_score)}`}>
                              {(game.viability_score * 10).toFixed(1)}/10
                            </div>
                            <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 border border-matrix-green/50 rounded-lg shadow-lg opacity-0 invisible group-hover/viab:opacity-100 group-hover/viab:visible transition-all duration-200 z-50 text-left pointer-events-none">
                              <p className="text-xs text-white leading-relaxed">{METRIC_TOOLTIPS.viability.description}</p>
                            </div>
                          </div>

                          <div className="matrix-stat relative group/eng">
                            <div className="text-gray-400 text-xs flex items-center gap-1 cursor-help">
                              ENGAGEMENT
                              <span className="w-4 h-4 rounded-full bg-matrix-green/50 group-hover/eng:bg-matrix-green text-black flex items-center justify-center text-[10px] font-bold transition-colors">?</span>
                            </div>
                            <div className={`text-2xl font-bold ${getScoreColor(game.engagement_score)}`}>
                              {(game.engagement_score * 10).toFixed(1)}/10
                            </div>
                            <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 border border-matrix-green/50 rounded-lg shadow-lg opacity-0 invisible group-hover/eng:opacity-100 group-hover/eng:visible transition-all duration-200 z-50 text-left pointer-events-none">
                              <p className="text-xs text-white leading-relaxed">{METRIC_TOOLTIPS.engagement.description}</p>
                            </div>
                          </div>

                          <div className="matrix-stat relative group/avg">
                            <div className="text-gray-400 text-xs flex items-center gap-1 cursor-help">
                              AVG VIEWERS/CH
                              <span className="w-4 h-4 rounded-full bg-matrix-green/50 group-hover/avg:bg-matrix-green text-black flex items-center justify-center text-[10px] font-bold transition-colors">?</span>
                            </div>
                            <div className="text-2xl font-bold text-matrix-green">
                              {game.avg_viewers_per_channel.toFixed(1)}
                            </div>
                            <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 border border-matrix-green/50 rounded-lg shadow-lg opacity-0 invisible group-hover/avg:opacity-100 group-hover/avg:visible transition-all duration-200 z-50 text-left pointer-events-none">
                              <p className="text-xs text-white leading-relaxed">{METRIC_TOOLTIPS.avgViewers.description}</p>
                            </div>
                          </div>
                        </div>

                        {/* HISTORICAL FEATURES - Sparkline in Expanded Section */}
                        {analytics && analytics.sparkline && analytics.sparkline.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-matrix-green/20">
                            <div className="flex items-center gap-3">
                              <div className="text-gray-400 text-xs">{analytics.dataDays}-DAY TREND</div>
                              <Sparkline 
                                data={analytics.sparkline} 
                                width={120} 
                                height={40}
                                className="text-matrix-green"
                              />
                              <div className="text-xs text-gray-400">
                                {analytics.trendMagnitude > 0 ? '+' : ''}{analytics.trendMagnitude.toFixed(1)}% change
                              </div>
                            </div>
                          </div>
                        )}

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
          </main>
        </div>

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
