// US-073: GameCard - ALL 8 MISSING FEATURES RESTORED
// 1. Favorite Button, 2. Momentum Badge, 3. Best Time, 4. Find Alternatives
// 5. UpdatedKinguinButton (discounts), 6. Sparkline, 7. TimeBlocks, 8. Analytics API

'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  MomentumBadge,
  TwitchButton,
  SteamButton,
  EpicButton,
  BattleNetButton,
  RiotButton,
  ShareButton,
  IGDBButton,
  YouTubeButton,
  WikipediaButton,
  FavoriteButton,
  UpdatedKinguinButton,
  KinguinConfirmModal,
  AlternativesModal,
  urls
} from '@/app/components/streamscout-ui'
import { useFavorites } from '@/app/hooks/useFavorites'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-bcd88.up.railway.app'

interface GameAnalytics {
  viewerSparkline: number[]
  viewerTrend: 'up' | 'down' | 'stable'
  viewerTrendPercent: number
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

const Sparkline: React.FC<SparklineProps> = ({ data, width = 120, height = 40, className = '' }) => {
  if (!data || data.length < 2) return null
  const dataMin = Math.min(...data)
  const dataMax = Math.max(...data)
  const min = dataMin * 0.9
  const max = dataMax * 1.1
  const range = max - min || 1
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const normalized = ((value - min) / range) * 100
    const y = height - (normalized / 100) * height
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={width} height={height} className={className} viewBox={`0 0 ${width} ${height}`}>
      <polyline fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  )
}

interface TimeBlocksProps {
  blocks: { [key: string]: { avg_ratio: number; sample_count: number } }
  bestBlock: string
}

const getLocalizedBlockLabel = (pstBlock: string): string => {
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const pstStart = parseInt(pstBlock.split('-')[0])
  const pstTz = 'America/Los_Angeles'
  const date = new Date()
  const pstDateStr = date.toLocaleDateString('en-US', { timeZone: pstTz })
  const localDate = new Date(pstDateStr)
  localDate.setHours(pstStart, 0, 0, 0)
  const localHour = new Intl.DateTimeFormat('en-US', { hour: 'numeric', timeZone: userTz }).format(localDate)
  return localHour.toLowerCase().replace(' ', '')
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
            <div className={`w-5 h-5 rounded-full ${getStatusColor(status)} ${isBest ? 'ring-2 ring-brand-primary ring-offset-1 ring-offset-bg-primary' : ''}`} title={`${blockKey} PST: ${status} (ratio: ${blocks[blockKey]?.avg_ratio?.toFixed(1) || 'N/A'})`} />
            <span className={`text-[10px] ${isBest ? 'text-brand-primary font-bold' : 'text-text-tertiary'}`}>{blockLabels[index]}</span>
          </div>
        )
      })}
    </div>
  )
}

interface Platform {
  id: string
  name: string
  url: string
  icon: string
  color: string
}

interface PurchaseLinks {
  platforms: Platform[]
  primary_url: string
  free: boolean
  steam?: string
  epic?: string
}

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
  is_filtered?: boolean
  warning_text?: string | null
  trend?: 'up' | 'down' | 'stable' | null
  momentum?: string | null
  bestTime?: string | null
  viewerGrowth?: number | null
  channelGrowth?: number | null
  purchase_links?: PurchaseLinks
}

interface GameCardProps {
  game: GameOpportunity
}

export function GameCard({ game }: GameCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [analytics, setAnalytics] = useState<GameAnalytics | null>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)
  const [failedAnalytics, setFailedAnalytics] = useState(false)
  const [showKinguinModal, setShowKinguinModal] = useState(false)
  const [kinguinGameName, setKinguinGameName] = useState('')
  const [showAlternativesModal, setShowAlternativesModal] = useState(false)
  
  // Favorites hook
  const { isFavorited, toggleFavorite } = useFavorites()
  
  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    const wasFavorited = isFavorited(game.game_id)
    toggleFavorite(game.game_id, game.game_name)
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', wasFavorited ? 'remove_favorite' : 'add_favorite', {
        game_name: game.game_name,
        game_id: game.game_id
      })
    }
  }
  
  const trackExternalClick = (
    linkType: 'steam' | 'epic' | 'battlenet' | 'riot' | 'official' | 'twitch' | 'igdb' | 'youtube' | 'wikipedia' | 'share' | 'kinguin'
  ) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      const score = game.discoverability_rating !== undefined
        ? game.discoverability_rating
        : (game.overall_score * 10);

      (window as any).gtag('event', `${linkType}_click`, {
        'game_name': game.game_name,
        'game_score': score,
        'game_rank': game.rank,
        'event_category': linkType === 'share' ? 'share' : 'external_link',
        'event_label': game.game_name
      });

      console.log(`[TRACK] ${linkType}_click: ${game.game_name} (${score.toFixed(1)}/10)`);
    }
  }
  
  const handleKinguinClick = () => {
    setKinguinGameName(game.game_name)
    setShowKinguinModal(true)
    trackExternalClick('kinguin')
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'kinguin_click', {
        game_name: game.game_name,
        game_id: game.game_id
      })
    }
  }
  
  useEffect(() => {
    if (isExpanded && !analytics && !loadingAnalytics && !failedAnalytics) {
      fetchAnalytics()
    }
  }, [isExpanded])
  
  const fetchAnalytics = async () => {
    setLoadingAnalytics(true)
    try {
      const response = await axios.get(`${API_URL}/api/v1/analytics/${game.game_id}`)
      setAnalytics(response.data)
    } catch (error) {
      console.error(`Failed to fetch analytics for ${game.game_id}:`, error)
      setFailedAnalytics(true)
    } finally {
      setLoadingAnalytics(false)
    }
  }
  
  const getScoreColor = (score: number) => {
    if (score >= 0.80) return 'text-success'
    if (score >= 0.65) return 'text-brand-primary'
    if (score >= 0.50) return 'text-brand-warning'
    return 'text-brand-danger'
  }
  
  const cleanRecommendation = (rating: string): string => {
    return rating.replace(/^\[.*?\]\s*/, '')
  }
  
  const handleFindAlternatives = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowAlternativesModal(true)
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'alternatives_button_click', {
        game_name: game.game_name,
        game_id: game.game_id
      })
      console.log(`[TRACK] alternatives_button_click: ${game.game_name}`)
    }
  }
  
  const platforms = game.purchase_links?.platforms || []
  const hasSteam = platforms.some(p => p.id === 'steam')
  const hasEpic = platforms.some(p => p.id === 'epic')
  const hasBattleNet = platforms.some(p => p.id === 'battlenet')
  const hasRiot = platforms.some(p => p.id === 'riot')
  
  const getSteamUrl = () => platforms.find(p => p.id === 'steam')?.url || urls.steam(game.game_name)
  const getEpicUrl = () => platforms.find(p => p.id === 'epic')?.url || urls.epic(game.game_name)
  const getBattleNetUrl = () => platforms.find(p => p.id === 'battlenet')?.url || urls.battlenet(game.game_name)
  const getRiotUrl = () => platforms.find(p => p.id === 'riot')?.url || urls.riot(game.game_name)
  
  return (
    <>
      <div className={`bg-bg-elevated border-2 rounded-lg p-6 cursor-pointer transition-all hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/20 relative ${game.is_filtered ? 'border-brand-danger/50 bg-brand-danger/5' : 'border-bg-hover'}`} onClick={() => setIsExpanded(!isExpanded)}>
        
        {game.is_filtered && game.warning_text && (
          <div className="bg-brand-danger/20 border border-brand-danger/40 rounded px-3 py-2 mb-3 flex items-center gap-2">
            <span className="text-brand-danger font-bold text-sm">AVOID</span>
            <span className="text-brand-danger/80 text-xs">{game.warning_text}</span>
          </div>
        )}
        
        <div className="flex gap-4">
          {game.box_art_url && (
            <div className="flex-shrink-0">
              <img src={game.box_art_url} alt={game.game_name} className="w-24 h-32 sm:w-28 sm:h-40 object-cover rounded border-2 border-brand-primary/50" onError={(e) => { e.currentTarget.style.display = 'none' }} />
            </div>
          )}
          
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-start gap-2 mb-2">
              <div className="text-h1 font-bold text-brand-primary flex-shrink-0">#{game.rank}</div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-h2 font-semibold leading-tight break-words text-text-primary">{game.game_name}</h2>
                  <FavoriteButton 
                    isFavorited={isFavorited(game.game_id)}
                    onClick={handleFavoriteToggle}
                  />
                  {game.momentum && game.momentum !== 'insufficient_data' && (
                    <MomentumBadge 
                      momentum={game.momentum}
                      viewerGrowth={game.viewerGrowth}
                      channelGrowth={game.channelGrowth}
                    />
                  )}
                </div>
                <div className="flex items-center gap-3 text-caption text-text-secondary mt-1">
                  <span className="flex items-center gap-1"><span className="text-brand-primary">👁</span>{game.total_viewers?.toLocaleString() || 0}</span>
                  <span className="flex items-center gap-1"><span className="text-brand-primary">📺</span>{game.channels}</span>
                </div>
                
                {game.genres && game.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {game.genres.slice(0, 3).map(genre => (
                      <span key={genre} className="px-2 py-0.5 text-xs rounded bg-brand-primary/10 text-brand-primary/70 border border-brand-primary/20">{genre}</span>
                    ))}
                  </div>
                )}
                
                {/* FEATURE 3: Best Time */}
                {game.bestTime && (
                  <div className="mt-2 text-xs text-text-tertiary">
                    <span className="font-semibold text-text-secondary">BEST TIME:</span> {game.bestTime}
                  </div>
                )}
              </div>
              
              <div className="text-right flex-shrink-0 ml-2">
                <div className={`text-display font-bold leading-none ${game.is_filtered ? 'text-brand-danger' : getScoreColor(game.overall_score)}`}>
                  {game.is_filtered && game.discoverability_rating !== undefined ? `${game.discoverability_rating}/10` : `${(game.overall_score * 10).toFixed(1)}/10`}
                </div>
                <div className="text-xs text-text-tertiary mt-1">{game.is_filtered ? 'POOR' : (game.trend ? game.trend.toUpperCase() : '')}</div>
                <div className={`text-xs font-semibold ${game.is_filtered ? 'text-brand-danger' : 'text-brand-warning'}`}>
                  {game.is_filtered ? 'NOT RECOMMENDED' : cleanRecommendation(game.recommendation)}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-2 flex-wrap">
              <TwitchButton gameName={game.game_name} onClick={() => trackExternalClick('twitch')} />
              
              {/* FEATURE 5: UpdatedKinguinButton */}
              {game.purchase_links && !game.purchase_links.free && (
                <div onClick={(e) => e.stopPropagation()}>
                  <UpdatedKinguinButton 
                    gameName={game.game_name}
                    onClick={handleKinguinClick}
                  />
                </div>
              )}
              
              {hasSteam && <SteamButton gameName={game.game_name} url={getSteamUrl()} isFree={game.purchase_links?.free || false} onClick={() => trackExternalClick('steam')} />}
              {hasEpic && <EpicButton gameName={game.game_name} url={getEpicUrl()} onClick={() => trackExternalClick('epic')} />}
              {hasBattleNet && <BattleNetButton gameName={game.game_name} url={getBattleNetUrl()} onClick={() => trackExternalClick('battlenet')} />}
              {hasRiot && <RiotButton gameName={game.game_name} url={getRiotUrl()} onClick={() => trackExternalClick('riot')} />}
              
              <ShareButton gameName={game.game_name} score={game.discoverability_rating !== undefined ? game.discoverability_rating : game.overall_score * 10} channels={game.channels} viewers={game.total_viewers} onClick={() => trackExternalClick('share')} />
              
              {/* FEATURE 4: Find Alternatives */}
              <button onClick={handleFindAlternatives} className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-bg-primary text-sm font-semibold rounded-lg transition-colors">
                Find Alternatives
              </button>
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-text-tertiary/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-bg-primary rounded-lg p-3 text-center">
                <div className="text-text-tertiary text-xs mb-1">DISCOVERABILITY</div>
                <div className={`text-2xl font-bold ${getScoreColor(game.discoverability_score)}`}>{(game.discoverability_score * 10).toFixed(1)}/10</div>
              </div>
              <div className="bg-bg-primary rounded-lg p-3 text-center">
                <div className="text-text-tertiary text-xs mb-1">VIABILITY</div>
                <div className={`text-2xl font-bold ${getScoreColor(game.viability_score)}`}>{(game.viability_score * 10).toFixed(1)}/10</div>
              </div>
              <div className="bg-bg-primary rounded-lg p-3 text-center">
                <div className="text-text-tertiary text-xs mb-1">ENGAGEMENT</div>
                <div className={`text-2xl font-bold ${getScoreColor(game.engagement_score)}`}>{(game.engagement_score * 10).toFixed(1)}/10</div>
              </div>
              <div className="bg-bg-primary rounded-lg p-3 text-center">
                <div className="text-text-tertiary text-xs mb-1">AVG VIEWERS/CH</div>
                <div className="text-2xl font-bold text-brand-primary">{game.avg_viewers_per_channel.toFixed(1)}</div>
              </div>
            </div>
            
            {/* FEATURES 6, 7, 8: Analytics */}
            {(() => {
              if (loadingAnalytics) return <div className="mt-4 pt-4 border-t border-text-tertiary/20 text-center text-text-tertiary text-sm">Loading trend data...</div>
              if (analytics && analytics.viewerSparkline && analytics.viewerSparkline.length >= 2) {
                const percentText = analytics.viewerTrendPercent >= 0 ? `+${analytics.viewerTrendPercent.toFixed(1)}%` : `${analytics.viewerTrendPercent.toFixed(1)}%`
                const percentColor = analytics.viewerTrend === 'up' ? 'text-green-400' : analytics.viewerTrend === 'down' ? 'text-red-400' : 'text-gray-400'
                return (
                  <div className="mt-4 pt-4 border-t border-text-tertiary/20">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                      <div className="flex items-center gap-3">
                        <div className="text-text-tertiary text-xs whitespace-nowrap">VIEWER TREND</div>
                        <Sparkline data={analytics.viewerSparkline} width={120} height={40} className="text-brand-primary" />
                        <div className={`text-xs whitespace-nowrap ${percentColor}`}>{percentText}</div>
                      </div>
                      {analytics.timeBlocks && Object.keys(analytics.timeBlocks).length > 0 && (
                        <div className="flex items-center gap-3">
                          <div className="text-text-tertiary text-xs whitespace-nowrap">BEST TIMES</div>
                          <div className="flex flex-col gap-1">
                            <TimeBlocks blocks={analytics.timeBlocks} bestBlock={analytics.bestTime} />
                            <div className="text-[10px] text-text-tertiary flex gap-2">
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
            
            <div className="mt-4 pt-4 border-t border-text-tertiary/20">
              <div className="text-text-tertiary text-xs mb-2">LEARN ABOUT THIS GAME</div>
              <div className="flex flex-wrap gap-2">
                <IGDBButton gameName={game.game_name} onClick={() => trackExternalClick('igdb')} />
                <YouTubeButton gameName={game.game_name} onClick={() => trackExternalClick('youtube')} />
                <WikipediaButton gameName={game.game_name} onClick={() => trackExternalClick('wikipedia')} />
              </div>
            </div>
            
            <div className="mt-4 text-sm text-text-tertiary text-center">Click card again to collapse</div>
          </div>
        )}
      </div>
      
      {showKinguinModal && <KinguinConfirmModal gameName={kinguinGameName} onClose={() => setShowKinguinModal(false)} />}
      {showAlternativesModal && <AlternativesModal sourceGameName={game.game_name} sourceGameId={game.game_id} onClose={() => setShowAlternativesModal(false)} />}
    </>
  )
}
