/**
 * StreamScout Component Library
 * =============================
 * Reusable components with production-locked styling.
 * Import these instead of writing inline Tailwind everywhere.
 *
 * Location: /app/components/streamscout-ui.tsx
 *
 * Usage:
 *   import { TwitchButton, SteamButton, GameCard, InfoTooltip } from '@/components/streamscout-ui'
 */

import React, { ReactNode } from 'react'

// =============================================================================
// BUTTONS - All action buttons with locked-in brand colors
// =============================================================================

interface ButtonProps {
  href: string
  onClick?: (e: React.MouseEvent) => void
  children: ReactNode
  className?: string
}

/** Purple Twitch button */
export function TwitchButton({ href, onClick, children }: ButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold transition-colors leading-none"
      onClick={onClick}
    >
      <span className="text-sm">📺</span> {children}
    </a>
  )
}

/** Steam blue button */
export function SteamButton({ href, onClick, children }: ButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#2a475e] hover:bg-[#3d6a8a] text-white text-xs sm:text-sm font-semibold transition-colors leading-none"
      onClick={onClick}
    >
      <span className="text-sm">🎮</span> {children}
    </a>
  )
}

/** Epic dark gray button with border */
export function EpicButton({ href, onClick, children }: ButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#313131] hover:bg-[#444444] border border-gray-600 text-white text-xs sm:text-sm font-semibold transition-colors leading-none"
      onClick={onClick}
    >
      <span className="text-sm">🎮</span> {children}
    </a>
  )
}

/** Kinguin orange "Buy Game" button with cart icon */
export function KinguinButton({ 
  gameName, 
  onClick 
}: { 
  gameName: string
  onClick?: () => void 
}) {
  const kinguinUrl = `https://kinguin.net/?r=69308&7eb1a6f&search=${encodeURIComponent(gameName)}`
  
  const handleClick = () => {
    // GA4 tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'kinguin_click', {
        game_name: gameName,
        affiliate_link: kinguinUrl
      })
    }
    onClick?.()
  }

  return (
    <a
      href={kinguinUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs sm:text-sm font-semibold rounded transition-all duration-200 hover:scale-105 leading-none"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
      </svg>
      Buy Game
    </a>
  )
}

/** Sky blue share button */
export function ShareButton({ href, onClick, children }: ButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-semibold transition-colors leading-none"
      onClick={onClick}
    >
      {children}
    </a>
  )
}

/** Gray info/learn button */
export function InfoButton({ href, onClick, children }: ButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium transition-colors border border-gray-700"
      onClick={onClick}
    >
      {children}
    </a>
  )
}

/** Red YouTube button */
export function YouTubeButton({ href, onClick, children }: ButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-red-900/50 hover:bg-red-800/50 text-gray-200 text-xs font-medium transition-colors border border-red-800/50"
      onClick={onClick}
    >
      {children}
    </a>
  )
}

/** Main Matrix green CTA button */
export function MatrixButton({ href, onClick, children, className = '' }: ButtonProps) {
  return (
    <a
      href={href}
      className={`matrix-button ${className}`}
      onClick={onClick}
    >
      {children}
    </a>
  )
}

// =============================================================================
// INFO TOOLTIPS - Consistent ? icons with hover tooltips
// =============================================================================

interface TooltipProps {
  children: ReactNode
  size?: 'sm' | 'md'  // sm = metrics (w-4), md = main score (w-5)
  groupName: string   // For hover targeting: group/info, group/disc, etc.
}

/** Info tooltip with ? icon - use size="md" for main score, "sm" for metrics */
export function InfoTooltip({ children, size = 'sm', groupName }: TooltipProps) {
  const sizeClasses = size === 'md'
    ? 'w-5 h-5 text-xs'
    : 'w-4 h-4 text-[10px]'

  return (
    <div className={`relative group/${groupName}`}>
      <span className={`${sizeClasses} rounded-full bg-matrix-green/50 hover:bg-matrix-green text-black flex items-center justify-center font-bold cursor-help transition-colors`}>
        ?
      </span>

      {/* Tooltip */}
      <div className={`absolute right-full top-0 mr-2 w-56 p-3 bg-gray-900 border border-matrix-green/50 rounded-lg shadow-lg opacity-0 invisible group-hover/${groupName}:opacity-100 group-hover/${groupName}:visible transition-all duration-200 z-50 text-left pointer-events-none`}>
        {children}
      </div>
    </div>
  )
}

/** Bottom-positioned tooltip for metric stats */
export function MetricTooltip({ children, groupName }: { children: ReactNode, groupName: string }) {
  return (
    <div className={`absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 border border-matrix-green/50 rounded-lg shadow-lg opacity-0 invisible group-hover/${groupName}:opacity-100 group-hover/${groupName}:visible transition-all duration-200 z-50 text-left pointer-events-none`}>
      <p className="text-xs text-white leading-relaxed">{children}</p>
    </div>
  )
}

// =============================================================================
// BADGES - Header stat badges
// =============================================================================

interface BadgeProps {
  children: ReactNode
}

/** Bordered badge for header stats */
export function MatrixBadge({ children }: BadgeProps) {
  return (
    <div className="px-3 py-1.5 rounded border border-matrix-green/50 text-matrix-green bg-black/50">
      {children}
    </div>
  )
}

// =============================================================================
// STAT BOXES - Metric display boxes in expanded view
// =============================================================================

interface MetricStatProps {
  label: string
  value: string | number
  valueClass?: string
  tooltip: string
  groupName: string
}

/** Metric stat box with tooltip */
export function MetricStat({ label, value, valueClass = 'text-matrix-green', tooltip, groupName }: MetricStatProps) {
  return (
    <div className={`matrix-stat relative group/${groupName}`}>
      <div className="text-gray-400 text-xs flex items-center gap-1 cursor-help">
        {label}
        <span className={`w-4 h-4 rounded-full bg-matrix-green/50 group-hover/${groupName}:bg-matrix-green text-black flex items-center justify-center text-[10px] font-bold transition-colors`}>
          ?
        </span>
      </div>
      <div className={`text-2xl font-bold ${valueClass}`}>
        {value}
      </div>
      {/* Tooltip */}
      <div className={`absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-900 border border-matrix-green/50 rounded-lg shadow-lg opacity-0 invisible group-hover/${groupName}:opacity-100 group-hover/${groupName}:visible transition-all duration-200 z-50 text-left pointer-events-none`}>
        <p className="text-xs text-white leading-relaxed">{tooltip}</p>
      </div>
    </div>
  )
}

// =============================================================================
// TEXT STYLES - Consistent text styling
// =============================================================================

/** Primary heading - bright green */
export function Heading1({ children, className = '' }: { children: ReactNode, className?: string }) {
  return <h1 className={`text-2xl sm:text-3xl font-bold text-matrix-green-bright ${className}`}>{children}</h1>
}

/** Secondary heading - bright green */
export function Heading2({ children, className = '' }: { children: ReactNode, className?: string }) {
  return <h2 className={`text-lg sm:text-xl font-bold text-matrix-green-bright ${className}`}>{children}</h2>
}

/** Body text - gray-200 */
export function BodyText({ children, className = '' }: { children: ReactNode, className?: string }) {
  return <p className={`text-sm sm:text-base text-gray-200 leading-relaxed ${className}`}>{children}</p>
}

/** Muted text - gray-400 */
export function MutedText({ children, className = '' }: { children: ReactNode, className?: string }) {
  return <p className={`text-sm text-gray-400 ${className}`}>{children}</p>
}

/** Tagline - bright green bold */
export function Tagline({ children, className = '' }: { children: ReactNode, className?: string }) {
  return <p className={`text-base sm:text-lg font-bold text-matrix-green-bright ${className}`}>{children}</p>
}

// =============================================================================
// UTILITY - Score colors, URL helpers
// =============================================================================

/** Get Tailwind class for score color */
export function getScoreColorClass(score: number): string {
  if (score >= 0.80) return 'score-excellent'
  if (score >= 0.65) return 'score-good'
  if (score >= 0.50) return 'score-moderate'
  return 'score-poor'
}

/** URL Helpers */
export const urls = {
  twitch: (gameName: string) =>
    `https://www.twitch.tv/search?term=${encodeURIComponent(gameName)}`,

  steam: (gameName: string) =>
    `https://store.steampowered.com/search/?term=${gameName.replace(' ', '+')}`,

  epic: (gameName: string) =>
    `https://store.epicgames.com/en-US/browse?q=${gameName.replace(' ', '%20')}`,

  kinguin: (gameName: string) =>
    `https://kinguin.net/?r=69308&7eb1a6f&search=${encodeURIComponent(gameName)}`,

  igdb: (gameName: string) =>
    `https://www.igdb.com/search?type=1&q=${encodeURIComponent(gameName)}`,

  youtube: (gameName: string) =>
    `https://www.youtube.com/results?search_query=${encodeURIComponent(gameName + ' gameplay trailer')}`,

  wikipedia: (gameName: string) =>
    `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(gameName + ' video game')}`,

  twitterShare: (gameName: string, score: number, channels: number, viewers: number) => {
    const text = `${gameName} scores ${score}/10 for discoverability

${channels} streamers • ${viewers.toLocaleString()} viewers

Find your game → streamscout.gg`
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
  }
}

// =============================================================================
// METRIC TOOLTIP CONTENT - Reusable descriptions
// =============================================================================

export const METRIC_DESCRIPTIONS = {
  discoverability: 'Can viewers find you? Fewer streamers = you appear higher in the browse list. This is weighted highest (45%) because if nobody sees you, nothing else matters.',
  viability: "Is there actually an audience? Sweet spot is enough viewers to matter, but not so many that giants dominate. Too few = dead category, too many = you're buried.",
  engagement: 'Are people really watching? Higher average viewers per channel means an engaged community, not just background noise.',
  avgViewers: 'Total viewers divided by total streamers. Higher = each streamer gets more eyeballs on average. Below 10 is rough, above 50 is healthy.'
}

// =============================================================================
// EXPORTS SUMMARY
// =============================================================================
/*
Buttons:
  - TwitchButton     (purple)
  - SteamButton      (steam blue)
  - EpicButton       (dark gray + border)
  - KinguinButton    (orange + cart icon)
  - ShareButton      (sky blue)
  - InfoButton       (gray)
  - YouTubeButton    (red)
  - MatrixButton     (green CTA)

Tooltips:
  - InfoTooltip      (? icon with hover content)
  - MetricTooltip    (bottom-positioned for stats)

Display:
  - MatrixBadge      (header stat badges)
  - MetricStat       (expanded view stat boxes)

Text:
  - Heading1, Heading2, BodyText, MutedText, Tagline

Utilities:
  - getScoreColorClass(score)
  - urls.twitch(), urls.steam(), urls.kinguin(), etc.
  - METRIC_DESCRIPTIONS

Usage Example:
  <TwitchButton href={urls.twitch(game.game_name)} onClick={handleClick}>
    Twitch
  </TwitchButton>

  <KinguinButton gameName={game.game_name} />
*/
