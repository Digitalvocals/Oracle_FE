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

  // External click tracking for GA4
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
  }, [data, countdown, fetchData])

  // Also poll for updates every 60 seconds (in case countdown drifts)
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

  // Metric definitions for tooltips
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
      description: 'Total viewers divided by total streamers. Higher = each streamer gets more eyeballs on average. Below 10 is rough, above 50 is healthy.'
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
            <h2 className="text-lg sm:text-xl font-bold text-matrix-green mb-2">What is StreamScout?</h2>
            <p className="text-sm sm:text-base text-matrix-green-dim leading-relaxed">
              Not another "just sort by viewers" tool. Our algorithm weighs discoverability, viability, and engagement metrics to find opportunities most streamers miss.
            </p>
            <p className="text-sm sm:text-base text-matrix-green-dim leading-relaxed mt-2">
              We show you where small streamers can actually compete.
            </p>
            <p className="text-base sm:text-lg font-bold text-matrix-green mt-3">
              No guesswork. Just data.
            </p>
          </div>
          
          {data && (
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="matrix-badge">
                🎮 {data.total_games_analyzed} GAMES ANALYZED
              </div>
              <div className="matrix-badge">
                ⏱️ UPDATED: {new Date(data.timestamp).toLocaleTimeString()}
              </div>
              <div className="matrix-badge">
                🔄 NEXT UPDATE: {formatCountdown(countdown)}
              </div>
            </div>
          )}
        </header>

        {/* Main Content with Sidebar */}
        <div className="flex gap-8">
          {/* Main Game Grid - Full Width */}
          <main className="w-full">
            {/* Search Box */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search for any game (e.g., Fortnite, League of Legends)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-matrix-green/30 rounded-lg text-matrix-green placeholder-matrix-green/40 focus:outline-none focus:border-matrix-green/60 focus:ring-1 focus:ring-matrix-green/30"
              />
            </div>
            
            {/* Genre Filter Chips */}
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
                      <span className="text-red-400 font-bold text-sm">AVOID</span>
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
                          <div className={`text-[8px] sm:text-[10px] leading-tight max-w-[80px] sm:max-w-none font-bold ${
                            game.is_filtered ? 'text-red-400' : 'text-white'
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
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold transition-colors"
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
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#2a475e] hover:bg-[#3d6a8a] text-white text-xs sm:text-sm font-semibold transition-colors"
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
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#313131] hover:bg-[#444444] border border-gray-600 text-white text-xs sm:text-sm font-semibold transition-colors"
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
                      
                      <div className="mt-4 text-sm text-gray-400 text-center">
                        Click card again to collapse
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </main>
        </div>

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
