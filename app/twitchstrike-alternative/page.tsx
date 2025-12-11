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

export default function TwitchStrikeAlternative() {
  const [data, setData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGame, setSelectedGame] = useState<GameOpportunity | null>(null)
  const [countdown, setCountdown] = useState<number>(0)
  const [isWarmingUp, setIsWarmingUp] = useState(false)
  const [warmupStatus, setWarmupStatus] = useState<string>('Initializing...')

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
  const trackExternalClick = (linkType: 'steam' | 'epic' | 'twitch' | 'igdb' | 'youtube' | 'wikipedia' | 'share_twitter', game: GameOpportunity) => {
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
      const response = await axios.get(`${API_URL}/api/v1/analyze?limit=500`)
      
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

  useEffect(() => {
    fetchData()
  }, [fetchData])

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

  // Get top 10 opportunities (excluding filtered games)
  const topOpportunities = data?.top_opportunities
    ?.filter(game => !game.is_filtered)
    ?.slice(0, 10) || []

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* SEO Header - TwitchStrike Alternative Focus */}
        <header className="mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/streamscout-logo.jpg" 
              alt="StreamScout - The Best TwitchStrike Alternative for Finding Streaming Opportunities"
              className="w-full max-w-2xl h-auto"
            />
          </div>
          
          {/* SEO-focused intro - with solid background */}
          <div className="max-w-3xl mx-auto mb-6 px-4">
            <div className="bg-[#111] border border-matrix-green/30 rounded-lg p-6 text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-matrix-green-bright mb-4">
                Looking for a TwitchStrike Alternative?
              </h1>
              <p className="text-sm sm:text-base text-gray-200 leading-relaxed mb-4">
                TwitchStrike was a popular tool for finding the best games to stream on Twitch. 
                Unfortunately, it's no longer maintained and shows outdated data.
              </p>
              <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                <strong className="text-matrix-green">StreamScout</strong> is the modern replacement — 
                analyzing <strong>{data?.total_games_analyzed || 500}+ games</strong> in real-time 
                to find where small streamers can actually get discovered.
              </p>
            </div>
          </div>

          {/* What is StreamScout? - with solid background */}
          <div className="max-w-2xl mx-auto mb-6 px-4">
            <div className="bg-[#111] border border-matrix-green/30 rounded-lg p-6 text-center">
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
          </div>

          {/* Comparison Table */}
          <div className="max-w-2xl mx-auto mb-8 px-4">
            <h2 className="text-lg font-bold text-matrix-green-bright mb-4 text-center">
              StreamScout vs TwitchStrike
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-matrix-green/30 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-matrix-green/20">
                    <th className="text-left p-3 text-matrix-green">Feature</th>
                    <th className="text-center p-3 text-matrix-green">StreamScout</th>
                    <th className="text-center p-3 text-gray-400">TwitchStrike</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-matrix-green/20">
                  <tr className="bg-black/30">
                    <td className="p-3 text-gray-300">Real-time Data</td>
                    <td className="p-3 text-center text-green-400">✓ Every 10 min</td>
                    <td className="p-3 text-center text-red-400">✗ Broken</td>
                  </tr>
                  <tr className="bg-black/20">
                    <td className="p-3 text-gray-300">Games Analyzed</td>
                    <td className="p-3 text-center text-green-400">{data?.total_games_analyzed || 500}+</td>
                    <td className="p-3 text-center text-gray-500">Unknown</td>
                  </tr>
                  <tr className="bg-black/30">
                    <td className="p-3 text-gray-300">Discoverability Score</td>
                    <td className="p-3 text-center text-green-400">✓ Multi-factor</td>
                    <td className="p-3 text-center text-gray-500">Basic ratio</td>
                  </tr>
                  <tr className="bg-black/20">
                    <td className="p-3 text-gray-300">Saturation Warnings</td>
                    <td className="p-3 text-center text-green-400">✓ Yes</td>
                    <td className="p-3 text-center text-red-400">✗ No</td>
                  </tr>
                  <tr className="bg-black/30">
                    <td className="p-3 text-gray-300">Genre Filters</td>
                    <td className="p-3 text-center text-green-400">✓ 20 genres</td>
                    <td className="p-3 text-center text-red-400">✗ No</td>
                  </tr>
                  <tr className="bg-black/20">
                    <td className="p-3 text-gray-300">Free to Use</td>
                    <td className="p-3 text-center text-green-400">✓ 100% Free</td>
                    <td className="p-3 text-center text-green-400">✓ Free</td>
                  </tr>
                  <tr className="bg-black/30">
                    <td className="p-3 text-gray-300">Still Maintained</td>
                    <td className="p-3 text-center text-green-400">✓ Active</td>
                    <td className="p-3 text-center text-red-400">✗ Abandoned</td>
                  </tr>
                </tbody>
              </table>
            </div>
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

        {/* Main Content */}
        <div className="flex gap-8">
          <main className="w-full">
            {/* Section Header */}
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-matrix-green-bright mb-2">
                Top 10 Streaming Opportunities Right Now
              </h2>
              <p className="text-gray-400 text-sm">
                Games with the best discoverability for small streamers • Updated every 10 minutes
              </p>
            </div>

            <div className="grid gap-4">
              {topOpportunities.map((game) => (
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
                          <div className={`text-[9px] sm:text-xs leading-tight max-w-[90px] sm:max-w-none font-bold tracking-wide ${
                            game.is_filtered ? 'text-red-400' : 'text-amber-400'
                          }`}>
                            {game.is_filtered ? 'NOT RECOMMENDED' : game.recommendation}
                          </div>
                        </div>
                      </div>

                      {/* Action Links */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {/* Twitch Directory Link */}
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
              ))}
            </div>

            {/* See All Games CTA - Bottom */}
            <div className="mt-8 text-center">
              <Link
                href="/"
                className="inline-block bg-matrix-green text-matrix-dark font-bold text-lg px-8 py-3 rounded-lg transition-all duration-200 hover:bg-matrix-green-bright hover:shadow-lg hover:shadow-matrix-green/50"
              >
                Search All {data?.total_games_analyzed || 500} Games →
              </Link>
              <p className="text-gray-500 text-sm mt-3">
                Full search, genre filters, and 500+ games analyzed
              </p>
            </div>
          </main>
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
