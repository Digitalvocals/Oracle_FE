// US-073: GameCard Component - Phase 1 
// Conditional store buttons with proper URL props

'use client'

import { useState } from 'react'
import {
  TwitchButton,
  KinguinButton,
  SteamButton,
  EpicButton,
  BattleNetButton,
  RiotButton,
  ShareButton,
  IGDBButton,
  YouTubeButton,
  WikipediaButton,
  urls
} from '@/app/components/streamscout-ui'

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
  purchase_links?: PurchaseLinks
}

interface GameCardProps {
  game: GameOpportunity
}

export function GameCard({ game }: GameCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const getScoreColor = (score: number) => {
    if (score >= 0.80) return 'text-success'
    if (score >= 0.65) return 'text-brand-primary'
    if (score >= 0.50) return 'text-brand-warning'
    return 'text-brand-danger'
  }
  
  const cleanRecommendation = (rating: string): string => {
    return rating.replace(/^\[.*?\]\s*/, '')
  }
  
  const trackClick = (linkType: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      const score = game.discoverability_rating !== undefined
        ? game.discoverability_rating
        : (game.overall_score * 10);

      (window as any).gtag('event', `${linkType}_click`, {
        'game_name': game.game_name,
        'game_score': score,
        'game_rank': game.rank
      });
    }
  }
  
  // Check which platforms are available
  const platforms = game.purchase_links?.platforms || []
  const hasSteam = platforms.some(p => p.id === 'steam')
  const hasEpic = platforms.some(p => p.id === 'epic')
  const hasBattleNet = platforms.some(p => p.id === 'battlenet')
  const hasRiot = platforms.some(p => p.id === 'riot')
  
  const getSteamUrl = () => {
    const steamPlatform = platforms.find(p => p.id === 'steam')
    return steamPlatform?.url || urls.steam(game.game_name)
  }
  
  const getEpicUrl = () => {
    const epicPlatform = platforms.find(p => p.id === 'epic')
    return epicPlatform?.url || urls.epic(game.game_name)
  }
  
  const getBattleNetUrl = () => {
    const battlenetPlatform = platforms.find(p => p.id === 'battlenet')
    return battlenetPlatform?.url || urls.battlenet(game.game_name)
  }
  
  const getRiotUrl = () => {
    const riotPlatform = platforms.find(p => p.id === 'riot')
    return riotPlatform?.url || urls.riot(game.game_name)
  }
  
  return (
    <div
      className={`bg-bg-elevated border-2 rounded-lg p-6 cursor-pointer transition-all hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/20 ${
        game.is_filtered
          ? 'border-brand-danger/50 bg-brand-danger/5'
          : 'border-bg-hover'
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {game.is_filtered && game.warning_text && (
        <div className="bg-brand-danger/20 border border-brand-danger/40 rounded px-3 py-2 mb-3 flex items-center gap-2">
          <span className="text-brand-danger font-bold text-sm">AVOID</span>
          <span className="text-brand-danger/80 text-xs">{game.warning_text}</span>
        </div>
      )}
      
      <div className="flex gap-4">
        {game.box_art_url && (
          <div className="flex-shrink-0">
            <img
              src={game.box_art_url}
              alt={game.game_name}
              className="w-24 h-32 sm:w-28 sm:h-40 object-cover rounded border-2 border-brand-primary/50"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start gap-2 mb-2">
            <div className="text-h1 font-bold text-brand-primary flex-shrink-0">
              #{game.rank}
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-h2 font-semibold leading-tight break-words text-text-primary">
                {game.game_name}
              </h2>
              <div className="flex items-center gap-3 text-caption text-text-secondary mt-1">
                <span className="flex items-center gap-1">
                  <span className="text-brand-primary">👁</span>
                  {game.total_viewers?.toLocaleString() || 0}
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-brand-primary">📺</span>
                  {game.channels}
                </span>
              </div>
              
              {game.genres && game.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {game.genres.slice(0, 3).map(genre => (
                    <span
                      key={genre}
                      className="px-2 py-0.5 text-xs rounded bg-brand-primary/10 text-brand-primary/70 border border-brand-primary/20"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="text-right flex-shrink-0 ml-2">
              <div className={`text-display font-bold leading-none ${
                game.is_filtered ? 'text-brand-danger' : getScoreColor(game.overall_score)
              }`}>
                {game.is_filtered && game.discoverability_rating !== undefined
                  ? `${game.discoverability_rating}/10`
                  : `${(game.overall_score * 10).toFixed(1)}/10`
                }
              </div>
              <div className="text-xs text-text-tertiary mt-1">
                {game.is_filtered ? 'POOR' : (game.trend ? game.trend.toUpperCase() : '')}
              </div>
              <div className={`text-xs font-semibold ${
                game.is_filtered ? 'text-brand-danger' : 'text-brand-warning'
              }`}>
                {game.is_filtered ? 'NOT RECOMMENDED' : cleanRecommendation(game.recommendation)}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-2 flex-wrap">
            <TwitchButton 
              gameName={game.game_name}
              onClick={() => trackClick('twitch')}
            />
            
            <KinguinButton 
              gameName={game.game_name}
              onClick={() => trackClick('kinguin')}
            />
            
            {hasSteam && (
              <SteamButton 
                gameName={game.game_name}
                url={getSteamUrl()}
                isFree={game.purchase_links?.free || false}
                onClick={() => trackClick('steam')}
              />
            )}
            
            {hasEpic && (
              <EpicButton 
                gameName={game.game_name}
                url={getEpicUrl()}
                onClick={() => trackClick('epic')}
              />
            )}
            
            {hasBattleNet && (
              <BattleNetButton 
                gameName={game.game_name}
                url={getBattleNetUrl()}
                onClick={() => trackClick('battlenet')}
              />
            )}
            
            {hasRiot && (
              <RiotButton 
                gameName={game.game_name}
                url={getRiotUrl()}
                onClick={() => trackClick('riot')}
              />
            )}
            
            <ShareButton 
              gameName={game.game_name}
              score={game.discoverability_rating !== undefined ? game.discoverability_rating : game.overall_score * 10}
              channels={game.channels}
              viewers={game.total_viewers}
              onClick={() => trackClick('share')}
            />
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-text-tertiary/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-bg-primary rounded-lg p-3 text-center">
              <div className="text-text-tertiary text-xs mb-1">DISCOVERABILITY</div>
              <div className={`text-2xl font-bold ${getScoreColor(game.discoverability_score)}`}>
                {(game.discoverability_score * 10).toFixed(1)}/10
              </div>
            </div>
            
            <div className="bg-bg-primary rounded-lg p-3 text-center">
              <div className="text-text-tertiary text-xs mb-1">VIABILITY</div>
              <div className={`text-2xl font-bold ${getScoreColor(game.viability_score)}`}>
                {(game.viability_score * 10).toFixed(1)}/10
              </div>
            </div>
            
            <div className="bg-bg-primary rounded-lg p-3 text-center">
              <div className="text-text-tertiary text-xs mb-1">ENGAGEMENT</div>
              <div className={`text-2xl font-bold ${getScoreColor(game.engagement_score)}`}>
                {(game.engagement_score * 10).toFixed(1)}/10
              </div>
            </div>
            
            <div className="bg-bg-primary rounded-lg p-3 text-center">
              <div className="text-text-tertiary text-xs mb-1">AVG VIEWERS/CH</div>
              <div className="text-2xl font-bold text-brand-primary">
                {game.avg_viewers_per_channel.toFixed(1)}
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-text-tertiary/20">
            <div className="text-text-tertiary text-xs mb-2">LEARN ABOUT THIS GAME</div>
            <div className="flex flex-wrap gap-2">
              <IGDBButton 
                gameName={game.game_name}
                onClick={() => trackClick('igdb')}
              />
              
              <YouTubeButton 
                gameName={game.game_name}
                onClick={() => trackClick('youtube')}
              />
              
              <WikipediaButton 
                gameName={game.game_name}
                onClick={() => trackClick('wikipedia')}
              />
            </div>
          </div>
          
          <div className="mt-4 text-sm text-text-tertiary text-center">
            Click card again to collapse
          </div>
        </div>
      )}
    </div>
  )
}
