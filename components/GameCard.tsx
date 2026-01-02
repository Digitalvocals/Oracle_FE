// US-073: GameCard Component - Phase 1 Enhanced
// Integrates existing streamscout-ui components with Oracle's design system
// Uses existing buttons, adds new color palette

'use client'

import { useState } from 'react'
import {
  TwitchButton,
  SteamButton,
  EpicButton,
  ShareButton,
  InfoButton,
  YouTubeButton,
  MetricStat,
  getScoreColorClass,
  urls,
  METRIC_DESCRIPTIONS
} from '@/app/components/streamscout-ui'

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
  
  return (
    <div
      className={`bg-bg-elevated border-2 rounded-lg p-6 cursor-pointer transition-all hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/20 ${
        game.is_filtered
          ? 'border-brand-danger/50 bg-brand-danger/5'
          : 'border-bg-hover'
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Warning banner for filtered games */}
      {game.is_filtered && game.warning_text && (
        <div className="bg-brand-danger/20 border border-brand-danger/40 rounded px-3 py-2 mb-3 flex items-center gap-2">
          <span className="text-brand-danger font-bold text-sm">AVOID</span>
          <span className="text-brand-danger/80 text-xs">{game.warning_text}</span>
        </div>
      )}
      
      <div className="flex gap-4">
        {/* Box art */}
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
          {/* Header: Rank + Title + Score */}
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
              
              {/* Genres */}
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
            
            {/* Score */}
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
          
          {/* Action buttons - using existing components */}
          <div className="flex gap-2 mt-2 flex-wrap">
            <TwitchButton 
              href={`https://www.twitch.tv/directory/game/${encodeURIComponent(game.game_name)}`}
              onClick={(e) => {
                e.stopPropagation()
                trackClick('twitch')
              }}
            >
              View on Twitch
            </TwitchButton>
            
            <SteamButton 
              href={urls.steam(game.game_name)}
              onClick={(e) => {
                e.stopPropagation()
                trackClick('steam')
              }}
            >
              Steam
            </SteamButton>
            
            <ShareButton 
              href={urls.twitterShare(
                game.game_name,
                game.discoverability_rating !== undefined ? game.discoverability_rating : game.overall_score * 10,
                game.channels,
                game.total_viewers
              )}
              onClick={(e) => {
                e.stopPropagation()
                trackClick('share')
              }}
            >
              Share
            </ShareButton>
          </div>
        </div>
      </div>
      
      {/* Expanded details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-text-tertiary/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <MetricStat
              label="DISCOVERABILITY"
              value={`${(game.discoverability_score * 10).toFixed(1)}/10`}
              valueClass={getScoreColor(game.discoverability_score)}
              tooltip={METRIC_DESCRIPTIONS.discoverability}
              groupName="disc"
            />
            
            <MetricStat
              label="VIABILITY"
              value={`${(game.viability_score * 10).toFixed(1)}/10`}
              valueClass={getScoreColor(game.viability_score)}
              tooltip={METRIC_DESCRIPTIONS.viability}
              groupName="viab"
            />
            
            <MetricStat
              label="ENGAGEMENT"
              value={`${(game.engagement_score * 10).toFixed(1)}/10`}
              valueClass={getScoreColor(game.engagement_score)}
              tooltip={METRIC_DESCRIPTIONS.engagement}
              groupName="eng"
            />
            
            <MetricStat
              label="AVG VIEWERS/CH"
              value={game.avg_viewers_per_channel.toFixed(1)}
              valueClass="text-brand-primary"
              tooltip={METRIC_DESCRIPTIONS.avgViewers}
              groupName="avg"
            />
          </div>
          
          {/* Learn more section */}
          <div className="mt-4 pt-4 border-t border-text-tertiary/20">
            <div className="text-text-tertiary text-xs mb-2">LEARN ABOUT THIS GAME</div>
            <div className="flex flex-wrap gap-2">
              <InfoButton 
                href={urls.igdb(game.game_name)}
                onClick={(e) => {
                  e.stopPropagation()
                  trackClick('igdb')
                }}
              >
                IGDB
              </InfoButton>
              
              <YouTubeButton 
                href={urls.youtube(game.game_name)}
                onClick={(e) => {
                  e.stopPropagation()
                  trackClick('youtube')
                }}
              >
                YouTube
              </YouTubeButton>
              
              <InfoButton 
                href={urls.wikipedia(game.game_name)}
                onClick={(e) => {
                  e.stopPropagation()
                  trackClick('wikipedia')
                }}
              >
                Wikipedia
              </InfoButton>
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
