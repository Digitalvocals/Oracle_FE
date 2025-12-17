// StreamScout UI Components
// Reusable button components with onClick support for GA4 tracking
// 
// v2.0 - Dec 16, 2025
// - Added onClick to TwitchButton and YouTubeButton
// - Added: KinguinButton, ShareButton, IGDBButton, WikipediaButton

import React from 'react'

// URL Helper Functions
export const urls = {
  twitch: (gameName: string) => 
    `https://www.twitch.tv/directory/category/${encodeURIComponent(gameName)}`,
  
  steam: (gameName: string) => 
    `https://store.steampowered.com/search/?term=${encodeURIComponent(gameName)}`,
  
  epic: (gameName: string) => 
    `https://store.epicgames.com/browse?q=${encodeURIComponent(gameName)}`,
  
  battlenet: (gameName: string) =>
    `https://www.blizzard.com/en-us/games`,
  
  riot: (gameName: string) =>
    `https://www.riotgames.com/en/games`,
  
  youtube: (gameName: string, searchType: string = 'gameplay') =>
    `https://www.youtube.com/results?search_query=${encodeURIComponent(gameName)}+${searchType}`,

  // NEW
  kinguin: (gameName: string) =>
    `https://www.kinguin.net/listing?query=${encodeURIComponent(gameName)}&active=1&r=6930867eb1a6f`,
  
  igdb: (gameName: string) =>
    `https://www.igdb.com/search?type=1&q=${encodeURIComponent(gameName)}`,
  
  wikipedia: (gameName: string) =>
    `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(gameName + ' video game')}`,
  
  twitterShare: (gameName: string, score: number, channels: number, viewers: number) => {
    const text = `${gameName} scores ${score.toFixed(1)}/10 for discoverability

${channels} streamers • ${viewers.toLocaleString()} viewers

Find your game → streamscout.gg`
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
  }
}

// TwitchButton Component - UPDATED with onClick
interface TwitchButtonProps {
  gameName: string
  onClick?: () => void
}

export const TwitchButton: React.FC<TwitchButtonProps> = ({ 
  gameName,
  onClick 
}) => {
  return (
    <a
      href={urls.twitch(gameName)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold transition-colors leading-none"
    >
      <span className="text-sm">📺</span> Twitch
    </a>
  )
}

// KinguinButton Component - NEW
interface KinguinButtonProps {
  gameName: string
  onClick?: () => void
}

export const KinguinButton: React.FC<KinguinButtonProps> = ({ 
  gameName,
  onClick 
}) => {
  return (
    <a
      href={urls.kinguin(gameName)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs sm:text-sm font-semibold transition-all duration-200 hover:scale-105 leading-none"
      title="Use code STREAMSCOUT for 5% off"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
      </svg>
      Buy
    </a>
  )
}

// SteamButton Component
interface SteamButtonProps {
  gameName: string
  url?: string
  isFree?: boolean
  onClick?: () => void
}

export const SteamButton: React.FC<SteamButtonProps> = ({ 
  gameName, 
  url, 
  isFree = false,
  onClick
}) => {
  const steamUrl = url || urls.steam(gameName)
  const buttonText = isFree ? 'Play Free' : 'Buy on Steam'
  
  return (
    <a
      href={steamUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#1b2838] hover:bg-[#2a475e] text-white text-xs sm:text-sm font-semibold transition-colors leading-none"
    >
      <span className="text-sm">🎮</span> {buttonText}
    </a>
  )
}

// EpicButton Component
interface EpicButtonProps {
  gameName: string
  url?: string
  isFree?: boolean
  onClick?: () => void
}

export const EpicButton: React.FC<EpicButtonProps> = ({ 
  gameName, 
  url, 
  isFree = false,
  onClick
}) => {
  const epicUrl = url || urls.epic(gameName)
  const buttonText = isFree ? 'Play Free' : 'Buy on Epic'
  
  return (
    <a
      href={epicUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#313131] hover:bg-[#444444] border border-gray-600 text-white text-xs sm:text-sm font-semibold transition-colors leading-none"
    >
      <span className="text-sm">🎮</span> {buttonText}
    </a>
  )
}

// BattleNetButton Component
interface BattleNetButtonProps {
  gameName: string
  url: string
  isFree?: boolean
  onClick?: () => void
}

export const BattleNetButton: React.FC<BattleNetButtonProps> = ({ 
  gameName, 
  url, 
  isFree = false,
  onClick
}) => {
  const buttonText = isFree ? 'Play Free' : 'Get on Battle.net'
  
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#00AEFF] hover:bg-[#0095E0] text-white text-xs sm:text-sm font-semibold transition-colors leading-none"
    >
      <span className="text-sm">⚔️</span> {buttonText}
    </a>
  )
}

// RiotButton Component
interface RiotButtonProps {
  gameName: string
  url: string
  isFree?: boolean
  onClick?: () => void
}

export const RiotButton: React.FC<RiotButtonProps> = ({ 
  gameName, 
  url, 
  isFree = false,
  onClick
}) => {
  const buttonText = isFree ? 'Play Free' : 'Get from Riot'
  
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#D13639] hover:bg-[#B82D30] text-white text-xs sm:text-sm font-semibold transition-colors leading-none"
    >
      <span className="text-sm">🎮</span> {buttonText}
    </a>
  )
}

// OfficialButton Component
interface OfficialButtonProps {
  gameName: string
  url: string
  isFree?: boolean
  onClick?: () => void
}

export const OfficialButton: React.FC<OfficialButtonProps> = ({ 
  gameName, 
  url, 
  isFree = false,
  onClick
}) => {
  const buttonText = isFree ? 'Play Free' : 'Official Site'
  
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-slate-600 hover:bg-slate-500 text-white text-xs sm:text-sm font-semibold transition-colors leading-none"
    >
      <span className="text-sm">🌐</span> {buttonText}
    </a>
  )
}

// ShareButton Component - NEW
interface ShareButtonProps {
  gameName: string
  score: number
  channels: number
  viewers: number
  onClick?: () => void
}

export const ShareButton: React.FC<ShareButtonProps> = ({ 
  gameName,
  score,
  channels,
  viewers,
  onClick 
}) => {
  return (
    <a
      href={urls.twitterShare(gameName, score, channels, viewers)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-semibold transition-colors leading-none"
    >
      Share
    </a>
  )
}

// YouTubeButton Component - UPDATED with onClick
interface YouTubeButtonProps {
  gameName: string
  searchType?: string
  onClick?: () => void
}

export const YouTubeButton: React.FC<YouTubeButtonProps> = ({ 
  gameName, 
  searchType = 'gameplay',
  onClick 
}) => {
  return (
    <a
      href={urls.youtube(gameName, searchType)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-900/50 hover:bg-red-800/50 text-gray-200 text-xs font-medium transition-colors border border-red-800/50"
    >
      ▶️ Gameplay &amp; Trailers
    </a>
  )
}

// IGDBButton Component - NEW
interface IGDBButtonProps {
  gameName: string
  onClick?: () => void
}

export const IGDBButton: React.FC<IGDBButtonProps> = ({ 
  gameName,
  onClick 
}) => {
  return (
    <a
      href={urls.igdb(gameName)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium transition-colors border border-gray-700"
    >
      📖 Game Info (IGDB)
    </a>
  )
}

// WikipediaButton Component - NEW
interface WikipediaButtonProps {
  gameName: string
  onClick?: () => void
}

export const WikipediaButton: React.FC<WikipediaButtonProps> = ({ 
  gameName,
  onClick 
}) => {
  return (
    <a
      href={urls.wikipedia(gameName)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium transition-colors border border-gray-700"
    >
      📚 Wikipedia
    </a>
  )
}

// ============================================================================
// US-002: SAVE FAVORITES + KINGUIN ENHANCEMENT COMPONENTS
// ============================================================================

// FavoriteButton Component - Heart icon toggle
interface FavoriteButtonProps {
  isFavorited: boolean
  onClick: (e: React.MouseEvent) => void
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  isFavorited, 
  onClick 
}) => {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 p-1.5 rounded hover:bg-matrix-green/10 transition-colors"
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorited ? (
        <svg className="w-5 h-5 text-green-500 fill-current" viewBox="0 0 20 20">
          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-400 stroke-current fill-none" viewBox="0 0 20 20" strokeWidth="2">
          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
        </svg>
      )}
    </button>
  )
}

// FavoritesFilter Component - Tab toggle between All Games and Favorites
interface FavoritesFilterProps {
  showFavoritesOnly: boolean
  favoriteCount: number
  onToggle: () => void
}

export const FavoritesFilter: React.FC<FavoritesFilterProps> = ({ 
  showFavoritesOnly, 
  favoriteCount,
  onToggle 
}) => {
  return (
    <div className="flex gap-2 mb-6">
      <button
        onClick={onToggle}
        className={`px-4 py-2 rounded transition-colors ${
          !showFavoritesOnly
            ? 'bg-matrix-green text-black font-semibold'
            : 'bg-matrix-green/10 text-matrix-green border border-matrix-green/30 hover:bg-matrix-green/20'
        }`}
      >
        All Games
      </button>
      <button
        onClick={onToggle}
        className={`px-4 py-2 rounded transition-colors ${
          showFavoritesOnly
            ? 'bg-matrix-green text-black font-semibold'
            : 'bg-matrix-green/10 text-matrix-green border border-matrix-green/30 hover:bg-matrix-green/20'
        }`}
      >
        My Favorites ({favoriteCount})
      </button>
    </div>
  )
}

// EmptyFavoritesState Component - Shows when no favorites
export const EmptyFavoritesState: React.FC = () => {
  return (
    <div className="text-center py-16 text-matrix-green/50">
      <div className="mb-4">
        <svg className="w-16 h-16 mx-auto text-matrix-green/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
      <p className="text-lg mb-2">No favorites yet</p>
      <p className="text-sm">Click the heart icon on any game to save it here</p>
    </div>
  )
}

// UntrackedFavoriteCard Component - Shows favorited games no longer in tracking
interface UntrackedFavoriteCardProps {
  gameName: string
  addedAt: number
  onRemove: () => void
}

export const UntrackedFavoriteCard: React.FC<UntrackedFavoriteCardProps> = ({ 
  gameName, 
  addedAt,
  onRemove 
}) => {
  return (
    <div className="matrix-card opacity-60">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-gray-400">{gameName}</h3>
            <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded">
              Not Currently Tracked
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-3">
            This game is no longer in our top opportunities list
          </p>
          <div className="flex gap-2">
            <TwitchButton gameName={gameName} />
            <button
              onClick={onRemove}
              className="text-xs text-red-400 hover:text-red-300 underline"
            >
              Remove from favorites
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ClearFavoritesButton Component - Clear all favorites with confirmation
interface ClearFavoritesButtonProps {
  onClick: () => void
  count: number
}

export const ClearFavoritesButton: React.FC<ClearFavoritesButtonProps> = ({ 
  onClick,
  count 
}) => {
  if (count === 0) return null
  
  return (
    <button
      onClick={onClick}
      className="text-sm text-red-400 hover:text-red-300 underline mb-4"
    >
      Clear All Favorites ({count})
    </button>
  )
}

// KinguinButton Component - UPDATED with "5% OFF" and callback
interface UpdatedKinguinButtonProps {
  gameName: string
  onClick?: () => void
  onCodeShow?: () => void
}

export const UpdatedKinguinButton: React.FC<UpdatedKinguinButtonProps> = ({ 
  gameName,
  onClick,
  onCodeShow
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Open Kinguin in new tab
    window.open(urls.kinguin(gameName), '_blank', 'noopener,noreferrer')
    
    onClick?.()
    onCodeShow?.()
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs sm:text-sm font-semibold transition-all duration-200 hover:scale-105 leading-none"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
      </svg>
      5% OFF
    </button>
  )
}

// KinguinCodeToast Component - Shows discount code with copy functionality
interface KinguinCodeToastProps {
  onDismiss: () => void
  onCopy: () => void
}

export const KinguinCodeToast: React.FC<KinguinCodeToastProps> = ({ 
  onDismiss,
  onCopy 
}) => {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText('STREAMSCOUT')
      setCopied(true)
      onCopy()
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = 'STREAMSCOUT'
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        onCopy()
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
      document.body.removeChild(textArea)
    }
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-gray-900 border-2 border-orange-500 rounded-lg shadow-2xl p-4 min-w-[300px] max-w-[90vw]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              <span className="text-white font-semibold">Kinguin Discount Code</span>
            </div>
            <div className="bg-black/50 rounded px-3 py-2 mb-3 font-mono text-lg text-orange-400 text-center">
              STREAMSCOUT
            </div>
            <button
              onClick={handleCopy}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              {copied ? '✓ Copied!' : 'Copy Code'}
            </button>
          </div>
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
