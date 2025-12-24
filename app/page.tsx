'use client'

import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import Link from 'next/link'
import mappingsData from './data/game_store_mappings.json'
import { 
  MomentumBadge,
  TwitchButton, 
  YouTubeButton, 
  SteamButton, 
  EpicButton, 
  BattleNetButton, 
  RiotButton, 
  OfficialButton,
  KinguinButton,
  ShareButton,
  IGDBButton,
  WikipediaButton,
  FavoriteButton,
  FavoritesFilter,
  EmptyFavoritesState,
  UntrackedFavoriteCard,
  ClearFavoritesButton,
  UpdatedKinguinButton,
  KinguinConfirmModal,
  AlternativesModal,
  AlternativeCard,
  MatchReasonBadge
} from './components/streamscout-ui'
import { useFavorites } from './hooks/useFavorites'

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
  bestTime?: string | null
  trend?: 'up' | 'down' | 'stable' | null
  trendMagnitude?: number | null
  viewerGrowth?: number | null
  channelGrowth?: number | null
  momentum?: string | null
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

interface GameAnalytics {
  sparkline: number[]
  trend: 'up' | 'down' | 'stable'
  trendMagnitude: number
  bestTime: string
  status: 'good' | 'ok' | 'avoid' | 'unknown'
  dataDays: number
  timeBlocks?: {
    [key: string]: {
      avg_ratio: number
      sample_count: number
    }
  }
}

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

const TIMEZONE_NAMES: Record<string, string> = {
  'America/Los_Angeles': 'PST',
  'America/Denver': 'MST',
  'America/Chicago': 'CST',
  'America/New_York': 'EST',
  'America/Anchorage': 'AKST',
  'Pacific/Honolulu': 'HST',
  'Europe/London': 'GMT',
  'Europe/Paris': 'CET',
  'Europe/Berlin': 'CET',
  'Europe/Rome': 'CET',
  'Europe/Madrid': 'CET',
  'Europe/Amsterdam': 'CET',
  'Europe/Brussels': 'CET',
  'Europe/Vienna': 'CET',
  'Europe/Stockholm': 'CET',
  'Europe/Copenhagen': 'CET',
  'Europe/Warsaw': 'CET',
  'Europe/Prague': 'CET',
  'Europe/Budapest': 'CET',
  'Europe/Athens': 'EET',
  'Europe/Helsinki': 'EET',
  'Europe/Bucharest': 'EET',
  'Europe/Moscow': 'MSK',
  'Asia/Tokyo': 'JST',
  'Asia/Seoul': 'KST',
  'Asia/Shanghai': 'CST',
  'Asia/Hong_Kong': 'HKT',
  'Asia/Singapore': 'SGT',
  'Asia/Bangkok': 'ICT',
  'Asia/Jakarta': 'WIB',
  'Asia/Manila': 'PHT',
  'Asia/Kolkata': 'IST',
  'Asia/Dubai': 'GST',
  'Asia/Karachi': 'PKT',
  'Australia/Sydney': 'AEDT',
  'Australia/Melbourne': 'AEDT',
  'Australia/Brisbane': 'AEST',
  'Australia/Perth': 'AWST',
  'Pacific/Auckland': 'NZDT',
  'America/Toronto': 'EST',
  'America/Vancouver': 'PST',
  'America/Mexico_City': 'CST',
  'America/Sao_Paulo': 'BRT',
  'America/Argentina/Buenos_Aires': 'ART',
  'Asia/Jerusalem': 'IST',
  'Asia/Riyadh': 'AST',
}

const formatBestTime = (pstBlock: string): string => {
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const [pstStart, pstEnd] = pstBlock.split('-').map(Number)
  const pstTz = 'America/Los_Angeles'
  const now = new Date()
  
  const startDate = new Date(now.toLocaleDateString('en-US', { timeZone: pstTz }))
  startDate.setHours(pstStart, 0, 0, 0)
  
  const endDate = new Date(now.toLocaleDateString('en-US', { timeZone: pstTz }))
  endDate.setHours(pstEnd, 0, 0, 0)
  
  const hourFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    timeZone: userTz
  })
  
  const startHour = hourFormatter.format(startDate)
  const endHour = hourFormatter.format(endDate)
  
  const timezoneName = TIMEZONE_NAMES[userTz] || (() => {
    const offsetFormatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      timeZone: userTz,
      timeZoneName: 'shortOffset'
    })
    const formatted = offsetFormatter.format(startDate)
    const offsetMatch = formatted.match(/GMT[+-]\d+:?\d*/)
    return offsetMatch ? offsetMatch[0] : 'Local'
  })()
  
  return `${startHour} - ${endHour} ${timezoneName}`
}

const cleanRecommendation = (rating: string): string => {
  return rating.replace(/^\[.*?\]\s*/, '')
}

interface TrendArrowProps {
  direction: 'up' | 'down' | 'stable'
  change: number | null
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
      {direction !== 'stable' && change != null && change !== 0 && (
        <span className="text-xs opacity-70">
          {change > 0 ? '+' : ''}{change.toFixed(1)}%
        </span>
      )}
    </div>
  )
}

const getLocalizedBlockLabel = (pstBlock: string): string => {
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const pstStart = parseInt(pstBlock.split('-')[0])
  
  const pstTz = 'America/Los_Angeles'
  const date = new Date()
  const pstDateStr = date.toLocaleDateString('en-US', { timeZone: pstTz })
  const localDate = new Date(pstDateStr)
  localDate.setHours(pstStart, 0, 0, 0)
  
  const localHour = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    timeZone: userTz
  }).format(localDate)
  
  return localHour.toLowerCase().replace(' ', '')
}

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
  
  const blockLabels = blockOrder.map(block => getLocalizedBlockLabel(block))
  
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
    <div className="flex gap-2 sm:gap-3">
      {blockOrder.map((blockKey, index) => {
        const status = getStatus(blockKey)
        const isBest = blockKey === bestBlock
        return (
          <div key={blockKey} className="flex flex-col items-center gap-1">
            <div 
              className={`w-5 h-5 rounded-full ${getStatusColor(status)} ${isBest ? 'ring-2 ring-matrix-green ring-offset-1 ring-offset-gray-900' : ''}`}
              title={`${blockKey} PST: ${status} (ratio: ${blocks[blockKey]?.avg_ratio?.toFixed(1) || 'N/A'})`}
            />
            <span className={`text-[10px] ${isBest ? 'text-matrix-green font-bold' : 'text-gray-500'}`}>
              {blockLabels[index]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

interface StoreButtons {
  steam: string | null
  epic: string | null
  battlenet: string | null
  riot: string | null
  official: string | null
  isFree: boolean
}

function getStoreButtons(gameId: string, gameName: string): StoreButtons {
  const mapping = mappingsData.find(m => m.game_id === gameId)
  
  if (mapping) {
    return {
      steam: mapping.steam === false ? null : (
        typeof mapping.steam === 'string' ? mapping.steam : 
        `https://store.steampowered.com/search/?term=${encodeURIComponent(gameName)}`
      ),
      epic: mapping.epic === false ? null : (
        typeof mapping.epic === 'string' ? mapping.epic :
        `https://store.epicgames.com/browse?q=${encodeURIComponent(gameName)}`
      ),
      battlenet: mapping.battlenet || null,
      riot: mapping.riot || null,
      official: mapping.official || null,
      isFree: mapping.free,
    }
  } else {
    return {
      steam: `https://store.steampowered.com/search/?term=${encodeURIComponent(gameName)}`,
      epic: `https://store.epicgames.com/browse?q=${encodeURIComponent(gameName)}`,
      battlenet: null,
      riot: null,
      official: null,
      isFree: false,
    }
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
  
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false)
  
  const [showKinguinModal, setShowKinguinModal] = useState<boolean>(false)
  const [kinguinGameName, setKinguinGameName] = useState<string>('')
  
  const [showAlternativesModal, setShowAlternativesModal] = useState<boolean>(false)
  const [alternativesSourceGame, setAlternativesSourceGame] = useState<{
    game_id: string
    game_name: string
  } | null>(null)
  
  const { favorites, isFavorited, addFavorite, removeFavorite, toggleFavorite, clearAllFavorites } = useFavorites()

  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  const [analyticsCache, setAnalyticsCache] = useState<{ [gameId: string]: GameAnalytics }>({})
  const [loadingAnalytics, setLoadingAnalytics] = useState<{ [gameId: string]: boolean }>({})
  const [failedAnalytics, setFailedAnalytics] = useState<{ [gameId: string]: boolean }>({})

  const [moreOptionsOpen, setMoreOptionsOpen] = useState<{ [gameRank: number]: boolean }>({})

  const toggleMoreOptions = (gameRank: number) => {
    setMoreOptionsOpen(prev => ({
      ...prev,
      [gameRank]: !prev[gameRank]
    }))
  }

  const GENRE_OPTIONS = [
    'Action', 'Adventure', 'Battle Royale', 'Card Game', 'FPS', 'Fighting',
    'Horror', 'Indie', 'MMO', 'MOBA', 'Party', 'Platformer', 'Puzzle',
    'RPG', 'Racing', 'Sandbox', 'Simulation', 'Sports', 'Strategy', 'Survival'
  ]

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  const filteredOpportunities = data?.top_opportunities?.filter(game => {
    if (searchQuery && !game.game_name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (selectedGenres.length === 0) return true
    return game.genres?.some(g => selectedGenres.includes(g))
  }) || []
  
  const displayedGames = showFavoritesOnly
    ? filteredOpportunities.filter(game => isFavorited(game.game_id))
    : filteredOpportunities
  
  const untrackedFavorites = favorites.filter(fav => 
    !data?.top_opportunities?.some(game => game.game_id === fav.game_id)
  )

  const handleFavoriteToggle = (game: GameOpportunity) => {
    const wasFavorited = isFavorited(game.game_id)
    toggleFavorite(game.game_id, game.game_name)
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', wasFavorited ? 'remove_favorite' : 'add_favorite', {
        game_name: game.game_name,
        game_id: game.game_id
      })
    }
  }
  
  const handleViewFavorites = () => {
    setShowFavoritesOnly(!showFavoritesOnly)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'view_favorites', {
        showing_favorites: !showFavoritesOnly
      })
    }
  }
  
  const handleClearAllFavorites = () => {
    if (confirm(`Clear all ${favorites.length} favorites?`)) {
      clearAllFavorites()
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'clear_all_favorites', {
          count: favorites.length
        })
      }
    }
  }
  
  const handleKinguinClick = (game: GameOpportunity) => {
    setKinguinGameName(game.game_name)
    setShowKinguinModal(true)
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'kinguin_click', {
        game_name: game.game_name,
        game_id: game.game_id
      })
    }
  }
  
  const handleFindAlternatives = (game: GameOpportunity) => {
    setAlternativesSourceGame({
      game_id: game.game_id,
      game_name: game.game_name
    })
    setShowAlternativesModal(true)
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'alternatives_button_click', {
        game_name: game.game_name,
        game_id: game.game_id
      })
    }
  }
  
  const getShareScore = (game: GameOpportunity): number => {
    return game.discoverability_rating !== undefined 
      ? game.discoverability_rating 
      : game.overall_score * 10
  }

  const fetchAnalytics = useCallback(async (gameId: string) => {
    if (analyticsCache[gameId] || loadingAnalytics[gameId] || failedAnalytics[gameId]) {
      return
    }

    setLoadingAnalytics(prev => ({ ...prev, [gameId]: true }))

    try {
      const response = await axios.get<GameAnalytics>(`${API_URL}/api/v1/analytics/${gameId}`)
      setAnalyticsCache(prev => ({ ...prev, [gameId]: response.data }))
    } catch (err) {
      setFailedAnalytics(prev => ({ ...prev, [gameId]: true }))
    } finally {
      setLoadingAnalytics(prev => ({ ...prev, [gameId]: false }))
    }
  }, [analyticsCache, loadingAnalytics, failedAnalytics])

  const trackExternalClick = (linkType: 'steam' | 'epic' | 'battlenet' | 'riot' | 'official' | 'twitch' | 'igdb' | 'youtube' | 'wikipedia' | 'share_twitter' | 'kinguin', game: GameOpportunity) => {
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
          <div className="text-3xl mb-4">ERROR</div>
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
              className="w-full max-w-md sm:max-w-xl md:max-w-2xl h-auto"
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
            <div className="flex overflow-x-auto gap-4 text-sm py-2 -mx-4 px-4 sm:flex-wrap sm:justify-center sm:overflow-visible">
              <div className="px-3 py-1.5 rounded border border-matrix-green/50 text-matrix-green bg-black/50 whitespace-nowrap flex-shrink-0 sm:flex-shrink">
                {data.total_games_analyzed} GAMES ANALYZED
              </div>
              <div className="px-3 py-1.5 rounded border border-matrix-green/50 text-matrix-green bg-black/50 whitespace-nowrap flex-shrink-0 sm:flex-shrink">
                UPDATED: {new Date(data.timestamp).toLocaleTimeString()}
              </div>
              <div className="px-3 py-1.5 rounded border border-matrix-green/50 text-matrix-green bg-black/50 whitespace-nowrap flex-shrink-0 sm:flex-shrink">
                NEXT UPDATE: {formatCountdown(countdown)}
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
                    className={`px-3 py-2 rounded-full text-sm transition-all ${
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
                    className="px-3 py-2 rounded-full text-sm bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 ml-2"
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

            <FavoritesFilter 
              showFavoritesOnly={showFavoritesOnly}
              favoriteCount={favorites.length}
              onToggle={handleViewFavorites}
            />
            
            {showFavoritesOnly && favorites.length > 0 && (
              <ClearFavoritesButton 
                onClick={handleClearAllFavorites}
                count={favorites.length}
              />
            )}

            {showFavoritesOnly && favorites.length === 0 ? (
              <EmptyFavoritesState />
            ) : showFavoritesOnly && displayedGames.length === 0 && untrackedFavorites.length === 0 ? (
              <div className="text-center py-12 text-matrix-green/50">
                None of your favorites match the current filters
              </div>
            ) : null}
            
            {showFavoritesOnly && untrackedFavorites.length > 0 && (
              <div className="space-y-4 mb-6">
                {untrackedFavorites.map(fav => (
                  <UntrackedFavoriteCard 
                    key={fav.game_id}
                    gameName={fav.game_name}
                    addedAt={fav.added_at}
                    onRemove={() => {
                      removeFavorite(fav.game_id)
                      if (typeof window !== 'undefined' && (window as any).gtag) {
                        (window as any).gtag('event', 'remove_favorite', {
                          game_name: fav.game_name,
                          game_id: fav.game_id,
                          source: 'untracked_card'
                        })
                      }
                    }}
                  />
                ))}
              </div>
            )}

            <div className="grid gap-4">
              {filteredOpportunities.length === 0 && (selectedGenres.length > 0 || searchQuery) ? (
                <div className="text-center py-12 text-matrix-green/50">
                  {searchQuery
                    ? `No games found matching "${searchQuery}". Try a different search.`
                    : 'No games found matching selected genres. Try different filters.'
                  }
                </div>
              ) : displayedGames.map((game) => {
                const hasTrendData = game.trend != null
                const hasBestTime = game.bestTime != null

                return (
                  <div
                    key={game.rank}
                    className={`matrix-card cursor-pointer ${
                      game.is_filtered
                        ? 'border-red-500/50 bg-red-900/10'
                        : ''
                    }`}
                    onClick={() => setSelectedGame(selectedGame?.rank === game.rank ? null : game)}
                    onMouseEnter={() => fetchAnalytics(game.game_id)}
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
                            className="w-24 h-32 sm:w-28 sm:h-40 md:w-32 md:h-44 object-cover rounded border-2 border-matrix-green/50"
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
                              <FavoriteButton 
                                isFavorited={isFavorited(game.game_id)}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleFavoriteToggle(game)
                                }}
                              />
                              {game.momentum && game.momentum !== 'insufficient_data' && (
                                <MomentumBadge 
                                  momentum={game.momentum}
                                  viewerGrowth={game.viewerGrowth}
                                  channelGrowth={game.channelGrowth}
                                />
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-300 mt-1">
                              <span className="flex items-center gap-1">
                                <span className="text-matrix-green">👁</span>
                                {game.total_viewers?.toLocaleString() || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="text-matrix-green">📺</span>
                                {game.channels}
                              </span>
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

                          </div>

                          <div className="text-right flex-shrink-0 ml-2 pr-1 relative">
                            <div className="flex items-start justify-end gap-1">
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setActiveTooltip(activeTooltip === `whyScore-${game.rank}` ? null : `whyScore-${game.rank}`)
                                  }}
                                  className="w-5 h-5 rounded-full bg-matrix-green/50 hover:bg-matrix-green text-black flex items-center justify-center text-xs font-bold cursor-help transition-colors flex-shrink-0"
                                >
                                  ?
                                </button>

                                <div 
                                  className={`absolute right-full top-0 mr-2 w-56 p-3 bg-gray-900 border border-matrix-green/50 rounded-lg shadow-lg z-50 text-left transition-all duration-200 ${
                                    activeTooltip === `whyScore-${game.rank}`
                                      ? 'opacity-100 visible pointer-events-auto'
                                      : 'opacity-0 invisible pointer-events-none group-hover/info:opacity-100 group-hover/info:visible group-hover/info:pointer-events-auto'
                                  }`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="text-matrix-green font-bold text-xs mb-2 flex justify-between items-center">
                                    <span>Why this score?</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setActiveTooltip(null)
                                      }}
                                      className="sm:hidden text-gray-400 hover:text-white text-sm"
                                    >
                                      X
                                    </button>
                                  </div>
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
                              {game.is_filtered ? 'POOR' : (game.trend ? game.trend.toUpperCase() : '')}
                            </div>
                            <div className={`text-[9px] sm:text-xs leading-tight max-w-[90px] sm:max-w-none font-bold tracking-wide ${
                              game.is_filtered ? 'text-red-400' : 'text-amber-400'
                            }`}>
                              {game.is_filtered ? 'NOT RECOMMENDED' : cleanRecommendation(game.recommendation)}
                            </div>
                          </div>
                        </div>

                        {hasBestTime && game.bestTime && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-gray-400">BEST TIME:</span>
                            <span className="text-xs text-matrix-green font-semibold">
                              {formatBestTime(game.bestTime)}
                            </span>
                          </div>
                        )}

                        <div className="flex gap-2 mt-2">
                          <TwitchButton 
                            gameName={game.game_name}
                            onClick={() => trackExternalClick('twitch', game)}
                          />

                          <UpdatedKinguinButton 
                            gameName={game.game_name}
                            onClick={() => {
                              trackExternalClick('kinguin', game)
                              handleKinguinClick(game)
                            }}
                          />
                        </div>

                        <div className="hidden sm:flex gap-2 mt-2 flex-wrap">
                          {(() => {
                            const buttons = getStoreButtons(game.game_id, game.game_name)
                            
                            return (
                              <>
                                {buttons.steam && (
                                  <SteamButton 
                                    gameName={game.game_name} 
                                    url={buttons.steam}
                                    isFree={buttons.isFree}
                                    onClick={() => trackExternalClick('steam', game)}
                                  />
                                )}
                                
                                {buttons.epic && (
                                  <EpicButton 
                                    gameName={game.game_name}
                                    url={buttons.epic}
                                    isFree={buttons.isFree}
                                    onClick={() => trackExternalClick('epic', game)}
                                  />
                                )}
                                
                                {buttons.battlenet && (
                                  <BattleNetButton 
                                    gameName={game.game_name}
                                    url={buttons.battlenet}
                                    isFree={buttons.isFree}
                                    onClick={() => trackExternalClick('battlenet', game)}
                                  />
                                )}
                                
                                {buttons.riot && (
                                  <RiotButton 
                                    gameName={game.game_name}
                                    url={buttons.riot}
                                    isFree={buttons.isFree}
                                    onClick={() => trackExternalClick('riot', game)}
                                  />
                                )}
                                
                                {buttons.official && (
                                  <OfficialButton 
                                    gameName={game.game_name}
                                    url={buttons.official}
                                    isFree={buttons.isFree}
                                    onClick={() => trackExternalClick('official', game)}
                                  />
                                )}
                              </>
                            )
                          })()}

                          <ShareButton 
                            gameName={game.game_name}
                            score={getShareScore(game)}
                            channels={game.channels}
                            viewers={game.total_viewers}
                            onClick={() => trackExternalClick('share_twitter', game)}
                          />

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleFindAlternatives(game)
                            }}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-matrix-green/20 hover:bg-matrix-green/30 text-matrix-green text-xs font-semibold transition-colors border border-matrix-green/30"
                          >
                            Find Alternatives
                          </button>
                        </div>

                        <div className="sm:hidden mt-2">
                          <button
                            onClick={() => toggleMoreOptions(game.rank)}
                            className="w-full py-3 text-sm text-matrix-green/70 border border-matrix-green/20 rounded-lg hover:bg-matrix-green/10 transition-colors flex items-center justify-center gap-2"
                          >
                            {moreOptionsOpen[game.rank] ? 'Less options' : 'More options'}
                            <span className={`transition-transform ${moreOptionsOpen[game.rank] ? 'rotate-180' : ''}`}>V</span>
                          </button>

                          {moreOptionsOpen[game.rank] && (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {(() => {
                                const buttons = getStoreButtons(game.game_id, game.game_name)
                                
                                return (
                                  <>
                                    {buttons.steam && (
                                      <SteamButton 
                                        gameName={game.game_name} 
                                        url={buttons.steam}
                                        isFree={buttons.isFree}
                                        onClick={() => trackExternalClick('steam', game)}
                                      />
                                    )}
                                    
                                    {buttons.epic && (
                                      <EpicButton 
                                        gameName={game.game_name}
                                        url={buttons.epic}
                                        isFree={buttons.isFree}
                                        onClick={() => trackExternalClick('epic', game)}
                                      />
                                    )}
                                    
                                    {buttons.battlenet && (
                                      <BattleNetButton 
                                        gameName={game.game_name}
                                        url={buttons.battlenet}
                                        isFree={buttons.isFree}
                                        onClick={() => trackExternalClick('battlenet', game)}
                                      />
                                    )}
                                    
                                    {buttons.riot && (
                                      <RiotButton 
                                        gameName={game.game_name}
                                        url={buttons.riot}
                                        isFree={buttons.isFree}
                                        onClick={() => trackExternalClick('riot', game)}
                                      />
                                    )}
                                    
                                    {buttons.official && (
                                      <OfficialButton 
                                        gameName={game.game_name}
                                        url={buttons.official}
                                        isFree={buttons.isFree}
                                        onClick={() => trackExternalClick('official', game)}
                                      />
                                    )}
                                  </>
                                )
                              })()}

                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleFindAlternatives(game)
                                }}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-matrix-green/20 hover:bg-matrix-green/30 text-matrix-green text-xs font-semibold transition-colors border border-matrix-green/30"
                              >
                                Find Alternatives
                              </button>

                              <ShareButton 
                                gameName={game.game_name}
                                score={getShareScore(game)}
                                channels={game.channels}
                                viewers={game.total_viewers}
                                onClick={() => trackExternalClick('share_twitter', game)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {selectedGame?.rank === game.rank && (
                      <div className="mt-4 pt-4 border-t border-matrix-green/30">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="matrix-stat relative">
                            <div className="text-gray-400 text-xs flex items-center gap-1 cursor-help">
                              DISCOVERABILITY
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setActiveTooltip(activeTooltip === `disc-${game.rank}` ? null : `disc-${game.rank}`)
                                }}
                                className="w-4 h-4 rounded-full bg-matrix-green/50 hover:bg-matrix-green text-black flex items-center justify-center text-[10px] font-bold transition-colors flex-shrink-0"
                              >
                                ?
                              </button>
                            </div>
                            <div className={`text-2xl font-bold ${getScoreColor(game.discoverability_score)}`}>
                              {(game.discoverability_score * 10).toFixed(1)}/10
                            </div>
                            <div 
                              className={`absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 border border-matrix-green/50 rounded-lg shadow-lg z-50 text-left transition-all duration-200 ${
                                activeTooltip === `disc-${game.rank}`
                                  ? 'opacity-100 visible pointer-events-auto'
                                  : 'opacity-0 invisible pointer-events-none group-hover/disc:opacity-100 group-hover/disc:visible group-hover/disc:pointer-events-auto'
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <p className="text-xs text-white leading-relaxed">{METRIC_TOOLTIPS.discoverability.description}</p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setActiveTooltip(null)
                                  }}
                                  className="sm:hidden text-gray-400 hover:text-white text-xs ml-2 flex-shrink-0"
                                >
                                  X
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="matrix-stat relative">
                            <div className="text-gray-400 text-xs flex items-center gap-1 cursor-help">
                              VIABILITY
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setActiveTooltip(activeTooltip === `viab-${game.rank}` ? null : `viab-${game.rank}`)
                                }}
                                className="w-4 h-4 rounded-full bg-matrix-green/50 hover:bg-matrix-green text-black flex items-center justify-center text-[10px] font-bold transition-colors flex-shrink-0"
                              >
                                ?
                              </button>
                            </div>
                            <div className={`text-2xl font-bold ${getScoreColor(game.viability_score)}`}>
                              {(game.viability_score * 10).toFixed(1)}/10
                            </div>
                            <div 
                              className={`absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 border border-matrix-green/50 rounded-lg shadow-lg z-50 text-left transition-all duration-200 ${
                                activeTooltip === `viab-${game.rank}`
                                  ? 'opacity-100 visible pointer-events-auto'
                                  : 'opacity-0 invisible pointer-events-none group-hover/viab:opacity-100 group-hover/viab:visible group-hover/viab:pointer-events-auto'
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <p className="text-xs text-white leading-relaxed">{METRIC_TOOLTIPS.viability.description}</p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setActiveTooltip(null)
                                  }}
                                  className="sm:hidden text-gray-400 hover:text-white text-xs ml-2 flex-shrink-0"
                                >
                                  X
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="matrix-stat relative">
                            <div className="text-gray-400 text-xs flex items-center gap-1 cursor-help">
                              ENGAGEMENT
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setActiveTooltip(activeTooltip === `eng-${game.rank}` ? null : `eng-${game.rank}`)
                                }}
                                className="w-4 h-4 rounded-full bg-matrix-green/50 hover:bg-matrix-green text-black flex items-center justify-center text-[10px] font-bold transition-colors flex-shrink-0"
                              >
                                ?
                              </button>
                            </div>
                            <div className={`text-2xl font-bold ${getScoreColor(game.engagement_score)}`}>
                              {(game.engagement_score * 10).toFixed(1)}/10
                            </div>
                            <div 
                              className={`absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 border border-matrix-green/50 rounded-lg shadow-lg z-50 text-left transition-all duration-200 ${
                                activeTooltip === `eng-${game.rank}`
                                  ? 'opacity-100 visible pointer-events-auto'
                                  : 'opacity-0 invisible pointer-events-none group-hover/eng:opacity-100 group-hover/eng:visible group-hover/eng:pointer-events-auto'
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <p className="text-xs text-white leading-relaxed">{METRIC_TOOLTIPS.engagement.description}</p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setActiveTooltip(null)
                                  }}
                                  className="sm:hidden text-gray-400 hover:text-white text-xs ml-2 flex-shrink-0"
                                >
                                  X
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="matrix-stat relative">
                            <div className="text-gray-400 text-xs flex items-center gap-1 cursor-help">
                              AVG VIEWERS/CH
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setActiveTooltip(activeTooltip === `avg-${game.rank}` ? null : `avg-${game.rank}`)
                                }}
                                className="w-4 h-4 rounded-full bg-matrix-green/50 hover:bg-matrix-green text-black flex items-center justify-center text-[10px] font-bold transition-colors flex-shrink-0"
                              >
                                ?
                              </button>
                            </div>
                            <div className="text-2xl font-bold text-matrix-green">
                              {game.avg_viewers_per_channel.toFixed(1)}
                            </div>
                            <div 
                              className={`absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 border border-matrix-green/50 rounded-lg shadow-lg z-50 text-left transition-all duration-200 ${
                                activeTooltip === `avg-${game.rank}`
                                  ? 'opacity-100 visible pointer-events-auto'
                                  : 'opacity-0 invisible pointer-events-none group-hover/avg:opacity-100 group-hover/avg:visible group-hover/avg:pointer-events-auto'
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <p className="text-xs text-white leading-relaxed">{METRIC_TOOLTIPS.avgViewers.description}</p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setActiveTooltip(null)
                                  }}
                                  className="sm:hidden text-gray-400 hover:text-white text-xs ml-2 flex-shrink-0"
                                >
                                  X
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {(() => {
                          const analytics = analyticsCache[game.game_id]
                          if (!analytics && !loadingAnalytics[game.game_id] && !failedAnalytics[game.game_id]) {
                            fetchAnalytics(game.game_id)
                          }
                          
                          if (loadingAnalytics[game.game_id]) {
                            return (
                              <div className="mt-4 pt-4 border-t border-matrix-green/20">
                                <div className="text-gray-400 text-xs">Loading trend data...</div>
                              </div>
                            )
                          }
                          
                          if (analytics && analytics.sparkline && analytics.sparkline.length > 0) {
                            return (
                              <div className="mt-4 pt-4 border-t border-matrix-green/20">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                                  <div className="flex items-center gap-3">
                                    <div className="text-gray-400 text-xs whitespace-nowrap">{analytics.dataDays}-DAY TREND</div>
                                    <Sparkline 
                                      data={analytics.sparkline} 
                                      width={120} 
                                      height={40}
                                      className="text-matrix-green"
                                    />
                                    <div className="text-xs text-gray-400 whitespace-nowrap">
                                      {analytics.trendMagnitude > 0 ? '+' : ''}{analytics.trendMagnitude.toFixed(1)}% change
                                    </div>
                                  </div>

                                  {analytics.timeBlocks && Object.keys(analytics.timeBlocks).length > 0 && (
                                    <div className="flex items-center gap-3">
                                      <div className="text-gray-400 text-xs whitespace-nowrap">BEST TIMES</div>
                                      <div className="flex flex-col gap-1">
                                        <TimeBlocks blocks={analytics.timeBlocks} bestBlock={analytics.bestTime} />
                                        <div className="text-[10px] text-gray-500 flex gap-2">
                                          <span><span className="text-green-400">●</span> good</span>
                                          <span><span className="text-yellow-400">●</span> ok</span>
                                          <span><span className="text-red-400">●</span> avoid</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          }
                          
                          return null
                        })()}

                        <div className="mt-4 pt-4 border-t border-matrix-green/20">
                          <div className="text-gray-400 text-xs mb-2">LEARN ABOUT THIS GAME</div>
                          <div className="flex flex-wrap gap-2">
                            <IGDBButton 
                              gameName={game.game_name}
                              onClick={() => trackExternalClick('igdb', game)}
                            />
                            <YouTubeButton 
                              gameName={game.game_name}
                              onClick={() => trackExternalClick('youtube', game)}
                            />
                            <WikipediaButton 
                              gameName={game.game_name}
                              onClick={() => trackExternalClick('wikipedia', game)}
                            />
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

        {showKinguinModal && (
          <KinguinConfirmModal 
            gameName={kinguinGameName}
            onClose={() => setShowKinguinModal(false)}
          />
        )}

        {showAlternativesModal && alternativesSourceGame && (
          <AlternativesModal 
            sourceGameName={alternativesSourceGame.game_name}
            sourceGameId={alternativesSourceGame.game_id}
            onClose={() => {
              setShowAlternativesModal(false)
              setAlternativesSourceGame(null)
            }}
          />
        )}

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
