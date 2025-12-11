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
  const trackExternalClick = (linkType: 'steam' | 'epic' | 'twitch' | 'share_twitter', game: GameOpportunity) => {
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
      const response = await axios.get(`${API_URL}/api/v1/analyze?limit=20`)
      
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

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-center mb-4">
            <Link href="/">
              <img 
                src="/streamscout-logo.jpg" 
                alt="StreamScout - Find Your Audience. Grow Your Channel."
                className="w-full max-w-2xl h-auto cursor-pointer"
              />
            </Link>
          </div>
          
          {/* TwitchStrike Alternative Content */}
          <div className="max-w-3xl mx-auto mb-8 px-4">
            {/* SEO-targeted pre-header */}
            <p className="text-center text-gray-400 text-sm mb-2">
              The Modern, Working Alternative to TwitchStrike
            </p>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-matrix-green text-center mb-6">
              Find Games Where Small Streamers Can Actually Compete
            </h1>
            
            <div className="text-gray-300 leading-relaxed space-y-4 mb-6">
              <p>
                Looking for a tool that tells you which games give small streamers a real shot at discovery?
              </p>
              <p>
                TwitchStrike used to do this. Good UI, solid recommendations. Then it went down. Been months. Still broken.
              </p>
              <p>
                If you&apos;re here, you already know that.
              </p>
            </div>

            {/* What Streamers Need */}
            <div className="matrix-card mb-6">
              <h2 className="text-lg font-bold text-matrix-green mb-3">What small streamers actually need:</h2>
              <ul className="text-gray-300 space-y-2">
                <li>• Which games have space for new faces</li>
                <li>• Where you won&apos;t get buried 10 pages deep</li>
                <li>• Real-time data, not yesterday&apos;s numbers</li>
                <li>• The &quot;why&quot; behind the scores</li>
              </ul>
            </div>

            {/* StreamScout Features */}
            <div className="matrix-card mb-6">
              <h2 className="text-lg font-bold text-matrix-green mb-3">That&apos;s StreamScout.</h2>
              <ul className="text-gray-300 space-y-2">
                <li>• <span className="text-matrix-green">Live data every 10 minutes.</span> Not daily snapshots.</li>
                <li>• <span className="text-matrix-green">500 games analyzed.</span> Not just the top 100.</li>
                <li>• <span className="text-matrix-green">Transparent algorithm.</span> You see why a game scores well: Discoverability (45%), Viability (35%), Engagement (20%).</li>
                <li>• <span className="text-matrix-green">Warning system.</span> We show oversaturated games with clear &quot;AVOID&quot; warnings. No hiding the truth.</li>
              </ul>
              
              {/* Primary CTA - Right after features */}
              <div className="mt-6 text-center">
                <Link
                  href="/"
                  className="matrix-button text-lg px-8 py-3 inline-block"
                >
                  Search All {data?.total_games_analyzed || 500} Games →
                </Link>
              </div>
            </div>

            {/* Competitor Comparison - Fixed text hierarchy */}
            <div className="matrix-card mb-8">
              <h2 className="text-lg font-bold text-matrix-green mb-3">vs Other Tools:</h2>
              <div className="space-y-3">
                <p><span className="text-matrix-green font-semibold">SullyGnome:</span> <span className="text-gray-400">Great for historical data. Overwhelming when you just need &quot;what should I stream today?&quot;</span></p>
                <p><span className="text-matrix-green font-semibold">TwitchTracker:</span> <span className="text-gray-400">Channel-focused analytics. Not built for game discovery.</span></p>
                <p><span className="text-matrix-green font-semibold">StreamElements/Streamlabs:</span> <span className="text-gray-400">Overlays and alerts. Different problem.</span></p>
                <p className="text-gray-500 text-sm mt-4">No hate to any of them. They solve different problems.</p>
                {/* Punchline - Bold and white to stand out */}
                <p className="text-white font-bold mt-3 text-lg">StreamScout answers one question: &quot;Which games give small streamers the best shot?&quot;</p>
              </div>
            </div>

            {/* Transition to game grid - More breathing room */}
            <div className="text-center mt-10 mb-8">
              <p className="text-xl font-bold text-matrix-green mb-2">Here&apos;s today&apos;s top opportunities:</p>
              <p className="text-gray-400 text-sm">
                <Link href="/" className="text-matrix-green hover:underline">View all {data?.total_games_analyzed || 500} analyzed games →</Link>
              </p>
            </div>
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

        {/* Main Content */}
        <div className="flex gap-8">
          <main className="w-full">
            <div className="grid gap-4">
              {data?.top_opportunities?.map((game) => (
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
                        
                        {/* Score - Always Visible - With Info Tooltip */}
                        <div className="text-right flex-shrink-0 ml-2 pr-1 relative">
                          <div className="flex items-start justify-end gap-1">
                            {/* Info Icon with Tooltip */}
                            <div className="relative group/info mt-1">
                              <span className="text-matrix-green/40 hover:text-matrix-green cursor-help text-sm">ⓘ</span>
                              
                              {/* Tooltip - Positioned Left */}
                              <div className="absolute right-full top-0 mr-2 w-56 p-3 bg-black/95 border border-matrix-green/50 rounded-lg shadow-lg opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-200 z-50 text-left pointer-events-none">
                                <div className="text-matrix-green font-bold text-xs mb-2">Why this score?</div>
                                {game.is_filtered ? (
                                  <div className="text-red-400 text-xs leading-relaxed">
                                    <p>{game.warning_text || 'This category is oversaturated.'}</p>
                                    <p className="mt-2 text-red-300/70">Small streamers get buried pages deep in categories this large.</p>
                                  </div>
                                ) : (
                                  <div className="text-xs leading-relaxed space-y-2">
                                    <p className="text-matrix-green-dim">{getScoreContext(game).competition} ({game.channels} streamers)</p>
                                    <p className="text-matrix-green-dim">{getScoreContext(game).audience} ({game.total_viewers.toLocaleString()} watching)</p>
                                    <p className="text-matrix-green/60 text-[10px] mt-2">Click card for detailed breakdown →</p>
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

                      {/* Action Links */}
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
                        
                        {/* Share to Twitter Button */}
                        <a
                          href={getTwitterShareUrl(game)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="matrix-button-small bg-sky-600 hover:bg-sky-700 border-sky-500 text-xs sm:text-sm"
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
                          <div className="text-matrix-green-dim text-xs flex items-center gap-1 cursor-help">
                            DISCOVERABILITY
                            <span className="text-matrix-green/40 group-hover/disc:text-matrix-green">ⓘ</span>
                          </div>
                          <div className={`text-2xl font-bold ${getScoreColor(game.discoverability_score)}`}>
                            {(game.discoverability_score * 10).toFixed(1)}/10
                          </div>
                          {/* Tooltip */}
                          <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-black/95 border border-matrix-green/50 rounded-lg shadow-lg opacity-0 invisible group-hover/disc:opacity-100 group-hover/disc:visible transition-all duration-200 z-50 text-left pointer-events-none">
                            <p className="text-xs text-matrix-green-dim leading-relaxed">{METRIC_TOOLTIPS.discoverability.description}</p>
                          </div>
                        </div>
                        
                        {/* Viability */}
                        <div className="matrix-stat relative group/viab">
                          <div className="text-matrix-green-dim text-xs flex items-center gap-1 cursor-help">
                            VIABILITY
                            <span className="text-matrix-green/40 group-hover/viab:text-matrix-green">ⓘ</span>
                          </div>
                          <div className={`text-2xl font-bold ${getScoreColor(game.viability_score)}`}>
                            {(game.viability_score * 10).toFixed(1)}/10
                          </div>
                          {/* Tooltip */}
                          <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-black/95 border border-matrix-green/50 rounded-lg shadow-lg opacity-0 invisible group-hover/viab:opacity-100 group-hover/viab:visible transition-all duration-200 z-50 text-left pointer-events-none">
                            <p className="text-xs text-matrix-green-dim leading-relaxed">{METRIC_TOOLTIPS.viability.description}</p>
                          </div>
                        </div>
                        
                        {/* Engagement */}
                        <div className="matrix-stat relative group/eng">
                          <div className="text-matrix-green-dim text-xs flex items-center gap-1 cursor-help">
                            ENGAGEMENT
                            <span className="text-matrix-green/40 group-hover/eng:text-matrix-green">ⓘ</span>
                          </div>
                          <div className={`text-2xl font-bold ${getScoreColor(game.engagement_score)}`}>
                            {(game.engagement_score * 10).toFixed(1)}/10
                          </div>
                          {/* Tooltip */}
                          <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-black/95 border border-matrix-green/50 rounded-lg shadow-lg opacity-0 invisible group-hover/eng:opacity-100 group-hover/eng:visible transition-all duration-200 z-50 text-left pointer-events-none">
                            <p className="text-xs text-matrix-green-dim leading-relaxed">{METRIC_TOOLTIPS.engagement.description}</p>
                          </div>
                        </div>
                        
                        {/* Avg Viewers */}
                        <div className="matrix-stat relative group/avg">
                          <div className="text-matrix-green-dim text-xs flex items-center gap-1 cursor-help">
                            AVG VIEWERS/CH
                            <span className="text-matrix-green/40 group-hover/avg:text-matrix-green">ⓘ</span>
                          </div>
                          <div className="text-2xl font-bold text-matrix-green">
                            {game.avg_viewers_per_channel.toFixed(1)}
                          </div>
                          {/* Tooltip */}
                          <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-black/95 border border-matrix-green/50 rounded-lg shadow-lg opacity-0 invisible group-hover/avg:opacity-100 group-hover/avg:visible transition-all duration-200 z-50 text-left pointer-events-none">
                            <p className="text-xs text-matrix-green-dim leading-relaxed">{METRIC_TOOLTIPS.avgViewers.description}</p>
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

            {/* See All Games CTA - Bottom */}
            <div className="mt-8 text-center">
              <Link
                href="/"
                className="matrix-button text-lg px-8 py-3 inline-block"
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
