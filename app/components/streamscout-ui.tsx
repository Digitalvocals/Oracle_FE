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

/** BattleNet blue button */
export function BattleNetButton({ href, onClick, children }: ButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#148eff] hover:bg-[#1a9fff] text-white text-xs sm:text-sm font-semibold transition-colors leading-none"
      onClick={onClick}
    >
      <span className="text-sm">⚔️</span> {children}
    </a>
  )
}

/** Riot red button */
export function RiotButton({ href, onClick, children }: ButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#d13639] hover:bg-[#e04447] text-white text-xs sm:text-sm font-semibold transition-colors leading-none"
      onClick={onClick}
    >
      <span className="text-sm">🔥</span> {children}
    </a>
  )
}

/** IGDB gray info button */
export function IGDBButton({ href, onClick, children }: ButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium transition-colors border border-gray-700"
      onClick={onClick}
    >
      <span className="text-sm">🎮</span> {children}
    </a>
  )
}

/** Wikipedia gray info button */
export function WikipediaButton({ href, onClick, children }: ButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium transition-colors border border-gray-700"
      onClick={onClick}
    >
      <span className="text-sm">📖</span> {children}
    </a>
  )
}

/** Kinguin affiliate button with discount badge - Opens modal first, modal handles navigation */
export function UpdatedKinguinButton({ gameName, onClick }: { gameName: string; onClick?: (e: React.MouseEvent) => void }) {
  return (
    <button
      type="button"
      className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-semibold transition-colors leading-none"
      onClick={onClick}
    >
      <span className="text-sm">🎮</span> Buy
      {/* Discount badge */}
      <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
        5% OFF
      </span>
    </button>
  )
}

/** Favorite button - heart icon toggle */
export function FavoriteButton({ isFavorited, onClick }: { isFavorited: boolean; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-xl transition-all ${
        isFavorited 
          ? 'text-red-500 scale-110' 
          : 'text-gray-500 hover:text-red-400 hover:scale-110'
      }`}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorited ? '❤️' : '🤍'}
    </button>
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
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium transition-colors border border-gray-700"
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
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-900/50 hover:bg-red-800/50 text-gray-200 text-xs font-medium transition-colors border border-red-800/50"
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
// FAVORITES FILTER - Toggle between All Games and My Favorites
// =============================================================================

interface FavoritesFilterProps {
  showFavoritesOnly: boolean
  favoriteCount: number
  onToggle: () => void
}

/** Two-button toggle: All Games / My Favorites - matches genre filter styling */
export function FavoritesFilter({ showFavoritesOnly, favoriteCount, onToggle }: FavoritesFilterProps) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <button
        onClick={onToggle}
        className={
          !showFavoritesOnly
            ? 'px-6 py-3 rounded-lg bg-brand-primary text-background font-semibold border border-brand-primary transition-colors'
            : 'px-6 py-3 rounded-lg bg-transparent text-text-secondary border border-border hover:border-brand-primary hover:text-text-primary transition-colors'
        }
      >
        All Games
      </button>
      
      <button
        onClick={onToggle}
        className={
          showFavoritesOnly
            ? 'px-6 py-3 rounded-lg bg-brand-primary text-background font-semibold border border-brand-primary transition-colors'
            : 'px-6 py-3 rounded-lg bg-transparent text-text-secondary border border-border hover:border-brand-primary hover:text-text-primary transition-colors'
        }
      >
        My Favorites ({favoriteCount})
      </button>
    </div>
  )
}

/** Clear all favorites button - red danger styling */
export function ClearFavoritesButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-lg bg-transparent text-brand-danger border border-brand-danger/50 hover:bg-brand-danger/10 transition-colors text-sm font-medium"
    >
      Clear All Favorites
    </button>
  )
}

/** Empty state when no favorites */
export function EmptyFavoritesState() {
  return (
    <div className="text-center py-12 px-4">
      <div className="text-6xl mb-4">💚</div>
      <h3 className="text-xl font-semibold text-text-primary mb-2">No favorites yet</h3>
      <p className="text-text-secondary">
        Click the heart icon on any game to add it to your favorites
      </p>
    </div>
  )
}

/** Card for favorited games not in current top 2000 */
export function UntrackedFavoriteCard({ gameName, onRemove }: { gameName: string, onRemove: () => void }) {
  return (
    <div className="p-4 bg-bg-elevated border border-border rounded-lg flex items-center justify-between">
      <div>
        <h3 className="text-text-primary font-semibold">{gameName}</h3>
        <p className="text-text-tertiary text-sm">Not currently in top 2000 games</p>
      </div>
      <button
        onClick={onRemove}
        className="px-3 py-1.5 text-brand-danger hover:bg-brand-danger/10 rounded transition-colors text-sm"
      >
        Remove
      </button>
    </div>
  )
}

// =============================================================================
// MOMENTUM BADGES - Game trend indicators
// =============================================================================

interface MomentumBadgeProps {
  momentum: string | null
  viewerGrowth?: number
  channelGrowth?: number
}

/** Rising/Declining/Stable/Hidden Gem badge with tooltips */
export function MomentumBadge({ momentum, viewerGrowth, channelGrowth }: MomentumBadgeProps) {
  const [showModal, setShowModal] = React.useState(false)

  if (!momentum || momentum === 'insufficient_data') return null

  const badges = {
    rising: {
      text: '📈 Rising',
      color: 'text-green-400 border-green-400/50 bg-green-400/10',
      tooltip: 'Viewers and streamers both increasing. Game is gaining popularity fast.'
    },
    declining: {
      text: '📉 Declining',
      color: 'text-red-400 border-red-400/50 bg-red-400/10',
      tooltip: 'Viewers dropping while streamer count stays steady. Interest is cooling off.'
    },
    stable: {
      text: '➡️ Stable',
      color: 'text-blue-400 border-blue-400/50 bg-blue-400/10',
      tooltip: 'Viewers and streamers holding steady. Consistent audience over time.'
    },
    hidden_gem: {
      text: '💎 Hidden Gem',
      color: 'text-purple-400 border-purple-400/50 bg-purple-400/10',
      tooltip: 'Viewers growing but streamer count stable. Great discoverability opportunity.'
    },
    crowding: {
      text: '⚠️ Crowding',
      color: 'text-yellow-400 border-yellow-400/50 bg-yellow-400/10',
      tooltip: 'Streamers flooding in while viewer count stays flat. Getting harder to stand out.'
    },
    dying: {
      text: '💀 Dying',
      color: 'text-gray-400 border-gray-400/50 bg-gray-400/10',
      tooltip: 'Both viewers and streamers dropping. Game losing momentum rapidly.'
    }
  }

  const badge = badges[momentum as keyof typeof badges]
  if (!badge) return null

  return (
    <>
      <div className="relative group/momentum inline-block">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowModal(true)
          }}
          className={`px-2 py-1 rounded text-xs font-semibold border ${badge.color} whitespace-nowrap cursor-help`}
        >
          {badge.text}
        </button>

        {/* Desktop tooltip - hidden on mobile */}
        <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-3 bg-gray-900 border border-brand-primary/50 rounded-lg shadow-lg opacity-0 invisible group-hover/momentum:opacity-100 group-hover/momentum:visible transition-all duration-200 z-50 text-left pointer-events-none">
          <p className="text-sm text-white leading-relaxed">{badge.tooltip}</p>
          {viewerGrowth !== undefined && (
            <p className="text-xs text-gray-400 mt-2">
              Viewers: {viewerGrowth > 0 ? '+' : ''}{viewerGrowth.toFixed(1)}%
              {channelGrowth !== undefined && ` | Streamers: ${channelGrowth > 0 ? '+' : ''}${channelGrowth.toFixed(1)}%`}
            </p>
          )}
        </div>
      </div>

      {/* Mobile modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] px-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-gray-900 border-2 border-brand-primary rounded-lg p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1.5 rounded text-sm font-semibold border ${badge.color}`}>
                {badge.text}
              </span>
              <button
                onClick={() => setShowModal(false)}
                className="text-text-tertiary hover:text-text-primary text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            <p className="text-white text-base leading-relaxed mb-4">
              {badge.tooltip}
            </p>

            {viewerGrowth !== undefined && (
              <div className="text-sm text-gray-400 bg-gray-800/50 rounded p-3">
                <div>Viewers: {viewerGrowth > 0 ? '+' : ''}{viewerGrowth.toFixed(1)}%</div>
                {channelGrowth !== undefined && (
                  <div>Streamers: {channelGrowth > 0 ? '+' : ''}{channelGrowth.toFixed(1)}%</div>
                )}
              </div>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full px-4 py-2 bg-brand-primary text-black font-semibold rounded-lg hover:bg-brand-primary/90 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// =============================================================================
// MODALS - Kinguin and Alternatives
// =============================================================================

interface KinguinConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  gameName: string
}

/** Kinguin affiliate confirmation modal - with STREAMSCOUT discount code */
export function KinguinConfirmModal({ isOpen, onClose, onConfirm, gameName }: KinguinConfirmModalProps) {
  if (!isOpen) return null
  
  const kinguinUrl = `https://www.kinguin.net/listing?production_products_bestsellers_desc[query]=${encodeURIComponent(gameName)}&r=6930867eb1a6f`
  
  const handleConfirm = () => {
    window.open(kinguinUrl, '_blank')
    onClose()
  }
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText('STREAMSCOUT')
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-bg-elevated border border-border rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-text-primary mb-4">Buy {gameName}?</h3>
        
        {/* Discount Code Box */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
          <p className="text-green-400 font-semibold text-sm mb-2">💰 Save 5% with code:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-black/30 px-3 py-2 rounded text-green-400 font-mono text-lg tracking-wider">
              STREAMSCOUT
            </code>
            <button
              onClick={handleCopyCode}
              className="px-3 py-2 bg-green-500 hover:bg-green-400 text-black font-semibold rounded transition-colors text-sm"
            >
              Copy
            </button>
          </div>
        </div>
        
        <p className="text-text-secondary text-sm mb-6">
          You'll be redirected to Kinguin to purchase this game. StreamScout earns a small commission (at no extra cost to you) which helps keep the site free.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-3 bg-brand-primary hover:bg-brand-primary/90 text-black font-semibold rounded-lg transition-colors"
          >
            Continue to Kinguin
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-transparent border border-border hover:border-brand-primary text-text-secondary hover:text-text-primary rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

interface AlternativesModalProps {
  isOpen: boolean
  onClose: () => void
  currentGame: string
  alternatives: Array<{ name: string; score: number }>
  loading?: boolean
  onViewGame?: (gameName: string) => void
}

/** Find alternatives modal */
export function AlternativesModal({ isOpen, onClose, currentGame, alternatives, loading = false, onViewGame }: AlternativesModalProps) {
  if (!isOpen) return null

  const handleViewGame = (gameName: string) => {
    // Update URL hash for shareability
    if (typeof window !== 'undefined') {
      window.location.hash = encodeURIComponent(gameName)
    }
    // Trigger the callback if provided
    if (onViewGame) {
      onViewGame(gameName)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-bg-elevated border border-border rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-text-primary">Alternatives to {currentGame}</h3>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            x
          </button>
        </div>

        {loading ? (
          <p className="text-text-secondary text-center py-8">
            Finding similar games...
          </p>
        ) : alternatives.length === 0 ? (
          <p className="text-text-secondary text-center py-8">
            No alternatives found. Try searching for similar games!
          </p>
        ) : (
          <div className="space-y-3">
            {alternatives.map((alt, idx) => (
              <div key={idx} className="p-4 bg-bg-primary border border-border rounded-lg flex items-center justify-between hover:border-brand-primary/30 transition-colors">
                <div>
                  <h4 className="font-semibold text-text-primary">{alt.name}</h4>
                  <p className="text-sm text-text-tertiary">Score: {alt.score}/10</p>
                </div>
                <button
                  onClick={() => handleViewGame(alt.name)}
                  className="px-4 py-2 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary hover:bg-brand-primary/20 rounded-lg transition-colors text-sm font-medium"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
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

// =============================================================================
// URL HELPERS - CRITICAL: Kinguin affiliate ID required for commission!
// =============================================================================

const KINGUIN_AFFILIATE_ID = '6930867eb1a6f'

export const urls = {
  twitch: (gameName: string) => 
    `https://www.twitch.tv/search?term=${encodeURIComponent(gameName)}`,
  
  steam: (gameName: string) => 
    `https://store.steampowered.com/search/?term=${gameName.replace(' ', '+')}`,
  
  epic: (gameName: string) => 
    `https://store.epicgames.com/en-US/browse?q=${gameName.replace(' ', '%20')}`,
  
  battlenet: (gameName: string) =>
    `https://www.blizzard.com/en-us/search?q=${encodeURIComponent(gameName)}`,
  
  riot: (gameName: string) =>
    `https://www.riotgames.com/en/search?q=${encodeURIComponent(gameName)}`,
  
  igdb: (gameName: string) => 
    `https://www.igdb.com/search?type=1&q=${encodeURIComponent(gameName)}`,
  
  youtube: (gameName: string) => 
    `https://www.youtube.com/results?search_query=${encodeURIComponent(gameName + ' gameplay trailer')}`,
  
  wikipedia: (gameName: string) => 
    `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(gameName + ' video game')}`,
  
  // KINGUIN - CRITICAL: Must include r= param for affiliate tracking!
  // Without r=6930867eb1a6f = NO commission
  kinguin: (gameName: string) =>
    `https://www.kinguin.net/listing?production_products_bestsellers_desc[query]=${encodeURIComponent(gameName)}&r=${KINGUIN_AFFILIATE_ID}`,
  
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
  - TwitchButton         (purple)
  - SteamButton          (steam blue)
  - EpicButton           (dark gray + border)
  - BattleNetButton      (battle.net blue)
  - RiotButton           (riot red)
  - ShareButton          (sky blue)
  - InfoButton           (gray)
  - IGDBButton           (gray info)
  - WikipediaButton      (gray info)
  - YouTubeButton        (red)
  - UpdatedKinguinButton (orange with 5% OFF badge)
  - MatrixButton         (green CTA)

Interactive:
  - FavoriteButton       (heart toggle ❤️/🤍)

Favorites:
  - FavoritesFilter       (All Games / My Favorites toggle)
  - ClearFavoritesButton  (red danger button)
  - EmptyFavoritesState   (empty state message)
  - UntrackedFavoriteCard (for games not in top 2000)

Badges:
  - MomentumBadge    (Rising/Falling/Stable/Hidden Gem)
  - MatrixBadge      (header stat badges)

Modals:
  - KinguinConfirmModal   (affiliate purchase confirmation)
  - AlternativesModal     (find similar games)

Tooltips:
  - InfoTooltip      (? icon with hover content)
  - MetricTooltip    (bottom-positioned for stats)

Display:
  - MetricStat       (expanded view stat boxes)

Text:
  - Heading1, Heading2, BodyText, MutedText, Tagline

Utilities:
  - getScoreColorClass(score)
  - urls.twitch(), urls.steam(), urls.kinguin(), etc.
  - METRIC_DESCRIPTIONS
  - KINGUIN_AFFILIATE_ID

Usage Example:
  <TwitchButton href={urls.twitch(game.game_name)} onClick={handleClick}>
    Twitch
  </TwitchButton>
  
  <FavoriteButton 
    isFavorited={isFavorited(game.game_id)}
    onClick={handleFavoriteToggle}
  />
  
  <UpdatedKinguinButton 
    gameName="The Bazaar"
    onClick={handleKinguinClick}
  />
  
  <FavoritesFilter 
    showFavoritesOnly={showFavorites}
    favoriteCount={5}
    onToggle={handleToggle}
  />
  
  <MomentumBadge 
    momentum="rising"
    viewerGrowth={15.5}
    channelGrowth={8.2}
  />
  
  <KinguinConfirmModal
    isOpen={showModal}
    onClose={() => setShowModal(false)}
    onConfirm={handlePurchase}
    gameName="The Bazaar"
  />
*/
