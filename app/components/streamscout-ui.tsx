// StreamScout UI Components
// Reusable button components with onClick support for GA4 tracking
// 
// v3.10.0 - Dec 25, 2025
// - Badge Clarity: Removed percentage from momentum badges, added tooltips
// - US-060 Alternatives components (MatchReasonBadge, AlternativeCard, AlternativesModal)

import React from 'react'

// URL Helper Functions
export const urls = {
  twitch: (gameName: string) => 
    `https://www.twitch.tv/search?term=${encodeURIComponent(gameName)}&type=categories`,
  
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

// KinguinConfirmModal Component - Confirmation after clicking Kinguin button
interface KinguinConfirmModalProps {
  gameName: string
  onClose: () => void
}

export const KinguinConfirmModal: React.FC<KinguinConfirmModalProps> = ({ 
  gameName,
  onClose
}) => {
  const [countdown, setCountdown] = React.useState(3)

  React.useEffect(() => {
    // Countdown display
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Time's up - open Kinguin
          window.open(urls.kinguin(gameName), '_blank', 'noopener,noreferrer')
          onClose()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(countdownInterval)
    }
  }, [gameName, onClose])

  const handleGoNow = () => {
    window.open(urls.kinguin(gameName), '_blank', 'noopener,noreferrer')
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-50 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-scale-in">
        <div className="bg-slate-900 border-2 border-green-500 rounded-lg p-8 shadow-2xl max-w-md w-full mx-4 relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Success icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Headline */}
          <h3 className="text-2xl font-bold text-green-400 mb-3 text-center">
            Code Copied!
          </h3>

          {/* Discount code */}
          <div className="bg-slate-800 border border-green-500/30 rounded-lg p-4 mb-4">
            <p className="text-3xl text-center text-green-400 font-mono font-bold tracking-wider">
              STREAMSCOUT
            </p>
          </div>

          {/* Value proposition */}
          <div className="text-center mb-6">
            <p className="text-white text-lg mb-1">
              Get 5% off already-discounted games
            </p>
            <p className="text-gray-400 text-sm">
              (Save up to 20% vs retail stores)
            </p>
          </div>

          {/* Go button */}
          <button
            onClick={handleGoNow}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
          >
            <span className="text-lg">Go to Kinguin</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          {/* Auto-proceed countdown */}
          <p className="text-center text-gray-500 text-sm mt-4">
            Opening automatically in {countdown}s...
          </p>
        </div>
      </div>
    </>
  )
}


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
}

export const UpdatedKinguinButton: React.FC<UpdatedKinguinButtonProps> = ({ 
  gameName,
  onClick
}) => {
  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    try {
      // Copy code to clipboard
      await navigator.clipboard.writeText('STREAMSCOUT')
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
    
    // Trigger callback (opens modal)
    onClick?.()
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

// ============================================================================
// US-035: GROWTH SIGNALS - MOMENTUM BADGE COMPONENT
// v3.10.0 - Badge Clarity: Removed percentage, added tooltips
// ============================================================================

interface MomentumBadgeProps {
  momentum: string
  viewerGrowth?: number | null
  channelGrowth?: number | null
}

const MOMENTUM_CONFIG: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  hidden_gem: { 
    emoji: '💎', 
    label: 'HIDDEN GEM', 
    color: 'text-cyan-400', 
    bg: 'bg-cyan-400/10' 
  },
  rising: { 
    emoji: '🚀', 
    label: 'RISING', 
    color: 'text-green-400', 
    bg: 'bg-green-400/10' 
  },
  expanding: { 
    emoji: '📈', 
    label: 'EXPANDING', 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-400/10' 
  },
  crowding: { 
    emoji: '⚠️', 
    label: 'CROWDING', 
    color: 'text-yellow-400', 
    bg: 'bg-yellow-400/10' 
  },
  declining: { 
    emoji: '📉', 
    label: 'DECLINING', 
    color: 'text-red-400', 
    bg: 'bg-red-400/10' 
  },
  stable: { 
    emoji: '➡️', 
    label: 'STABLE', 
    color: 'text-gray-400', 
    bg: 'bg-gray-400/10' 
  }
}

// Tooltip explanations for each badge type (per Oracle spec)
const BADGE_TOOLTIPS: Record<string, string> = {
  hidden_gem: 'Good ratio, low competition',
  rising: 'More viewers and streamers than last week',
  expanding: 'Growing viewer base',
  crowding: 'More streamers flooding in',
  declining: 'Fewer viewers than last week',
  stable: 'Viewer count holding steady'
}

export const MomentumBadge: React.FC<MomentumBadgeProps> = ({ 
  momentum, 
  viewerGrowth, 
  channelGrowth 
}) => {
  const config = MOMENTUM_CONFIG[momentum]
  if (!config) return null
  
  // Get tooltip text for this badge type
  const tooltipText = BADGE_TOOLTIPS[momentum] || ''
  
  // REMOVED: Percentage display (per Oracle spec - Badge Clarity)
  // Badge now shows only the category word, not numbers
  // Sparkline shows the percentage instead
  
  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md ${config.bg} cursor-help`}
      title={tooltipText}
    >
      <span>{config.emoji}</span>
      <span className={`text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  )
}

// ============================================================================
// US-060: BACKUP GAME SUGGESTER COMPONENTS
// ============================================================================

// Match Reason Badge - Shows why games match with color coding
interface MatchReasonBadgeProps {
  reason: string
}

const REASON_CONFIG: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  strong_genre_match: { 
    label: '2+ SHARED GENRES', 
    emoji: '*', 
    color: 'text-green-400', 
    bg: 'bg-green-400/10' 
  },
  genre_match: { 
    label: 'SIMILAR GENRE', 
    emoji: '+', 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-400/10' 
  },
  similar_audience_size: { 
    label: 'SIMILAR SIZE', 
    emoji: '=', 
    color: 'text-blue-400', 
    bg: 'bg-blue-400/10' 
  },
  smaller_more_intimate: { 
    label: 'SMALLER & INTIMATE', 
    emoji: 'v', 
    color: 'text-cyan-400', 
    bg: 'bg-cyan-400/10' 
  },
  larger_potential: { 
    label: 'LARGER AUDIENCE', 
    emoji: '^', 
    color: 'text-purple-400', 
    bg: 'bg-purple-400/10' 
  },
  hidden_gem: { 
    label: 'HIDDEN GEM', 
    emoji: 'o', 
    color: 'text-cyan-400', 
    bg: 'bg-cyan-400/10' 
  },
  trending_up: { 
    label: 'TRENDING UP', 
    emoji: '>', 
    color: 'text-green-400', 
    bg: 'bg-green-400/10' 
  },
  better_discoverability: { 
    label: 'EASY TO FIND', 
    emoji: '@', 
    color: 'text-amber-400', 
    bg: 'bg-amber-400/10' 
  }
}

export const MatchReasonBadge: React.FC<MatchReasonBadgeProps> = ({ reason }) => {
  const config = REASON_CONFIG[reason]
  if (!config) return null

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${config.bg} ${config.color}`}>
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </div>
  )
}

// Alternative Game Card - Shows alternative game with stats and CTAs
interface AlternativeCardProps {
  game: {
    game_id: string
    game_name: string
    box_art_url: string | null
    viewers: number
    channels: number
    discoverability_rating: number
    shared_genres: string[]
    match_score: number
    match_reasons: string[]
    momentum: string
  }
  onTwitchClick: () => void
  onMoreInfo: () => void
}

export const AlternativeCard: React.FC<AlternativeCardProps> = ({ 
  game,
  onTwitchClick,
  onMoreInfo
}) => {
  return (
    <div className="matrix-card bg-gray-900/50 border-matrix-green/30">
      <div className="flex gap-3">
        {/* Box Art */}
        {game.box_art_url && (
          <div className="flex-shrink-0">
            <img
              src={game.box_art_url}
              alt={game.game_name}
              className="w-20 h-28 object-cover rounded border border-matrix-green/30"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        )}

        {/* Game Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-bold text-white mb-1 truncate">
            {game.game_name}
          </h4>

          {/* Stats Row */}
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
            <span className="flex items-center gap-1">
              <span className="text-matrix-green">[V]</span>
              {game.viewers.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-matrix-green">[C]</span>
              {game.channels}
            </span>
            <span className="text-matrix-green font-bold">
              {game.discoverability_rating.toFixed(1)}/10
            </span>
          </div>

          {/* Genres */}
          {game.shared_genres && game.shared_genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {game.shared_genres.map(genre => (
                <span
                  key={genre}
                  className="px-2 py-0.5 text-[10px] rounded bg-matrix-green/10 text-matrix-green/70 border border-matrix-green/20"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Match Reasons */}
          <div className="flex flex-wrap gap-1 mb-3">
            {game.match_reasons.map(reason => (
              <MatchReasonBadge key={reason} reason={reason} />
            ))}
          </div>

          {/* CTAs */}
          <div className="flex gap-2">
            <button
              onClick={onTwitchClick}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors"
            >
              <span>[T]</span> View on Twitch
            </button>
            <button
              onClick={onMoreInfo}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-matrix-green/20 hover:bg-matrix-green/30 text-matrix-green text-xs font-semibold transition-colors border border-matrix-green/30"
            >
              More Info
            </button>
          </div>
        </div>

        {/* Match Score Badge */}
        <div className="flex-shrink-0 text-right">
          <div className="text-2xl font-bold text-matrix-green">
            {game.match_score}%
          </div>
          <div className="text-[10px] text-gray-400">
            MATCH
          </div>
        </div>
      </div>
    </div>
  )
}

// Alternatives Modal - Full modal showing 3 alternative games
interface AlternativesModalProps {
  sourceGameName: string
  sourceGameId: string
  onClose: () => void
}

export const AlternativesModal: React.FC<AlternativesModalProps> = ({
  sourceGameName,
  sourceGameId,
  onClose
}) => {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [alternatives, setAlternatives] = React.useState<any[]>([])
  const [candidatesEvaluated, setCandidatesEvaluated] = React.useState(0)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  React.useEffect(() => {
    const fetchAlternatives = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`${API_URL}/api/v1/alternatives/${sourceGameId}?limit=3`)
        
        if (!response.ok) {
          throw new Error('Failed to load alternatives')
        }

        const data = await response.json()
        setAlternatives(data.alternatives || [])
        setCandidatesEvaluated(data.candidates_evaluated || 0)

        // GA4 - Modal opened
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'alternatives_opened', {
            source_game_id: sourceGameId,
            source_game_name: sourceGameName,
            alternatives_count: data.alternatives?.length || 0
          })
          console.log(`[TRACK] alternatives_opened: ${sourceGameName} (${data.alternatives?.length || 0} alternatives)`)
        }
      } catch (err) {
        setError('Could not load alternatives. Try again later.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAlternatives()
  }, [sourceGameId, sourceGameName, API_URL])

  const handleClose = () => {
    // GA4 - Modal closed
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'alternatives_closed', {
        source_game_id: sourceGameId,
        source_game_name: sourceGameName,
        viewed_count: alternatives.length
      })
      console.log(`[TRACK] alternatives_closed: ${sourceGameName} (viewed ${alternatives.length} alternatives)`)
    }
    onClose()
  }

  const handleTwitchClick = (alternative: any) => {
    // GA4 - Twitch click on alternative
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'alternative_twitch_click', {
        source_game_id: sourceGameId,
        source_game_name: sourceGameName,
        alternative_game_id: alternative.game_id,
        alternative_game_name: alternative.game_name
      })
      console.log(`[TRACK] alternative_twitch_click: ${alternative.game_name} (from ${sourceGameName})`)
    }

    const twitchUrl = `https://www.twitch.tv/search?term=${encodeURIComponent(alternative.game_name)}&type=categories`
    window.open(twitchUrl, '_blank', 'noopener,noreferrer')
  }

  const handleMoreInfo = (alternative: any) => {
    // GA4 - More info click
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'alternative_more_info', {
        source_game_id: sourceGameId,
        source_game_name: sourceGameName,
        alternative_game_id: alternative.game_id,
        alternative_game_name: alternative.game_name
      })
      console.log(`[TRACK] alternative_more_info: ${alternative.game_name} (from ${sourceGameName})`)
    }

    // Scroll to game in main list (if visible)
    // Note: This will only work if the alternative is in the current filtered view
    const gameCard = document.querySelector(`[data-game-id="${alternative.game_id}"]`)
    if (gameCard) {
      gameCard.scrollIntoView({ behavior: 'smooth', block: 'center' })
      
      // Auto-expand the game card after scroll completes
      setTimeout(() => {
        (gameCard as HTMLElement).click()
      }, 600) // Wait for smooth scroll animation to finish
      
      handleClose()
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 z-50 animate-fade-in"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-3xl max-h-[90vh] overflow-y-auto mx-4">
        <div className="bg-slate-900 border-2 border-matrix-green rounded-lg p-6 shadow-2xl relative">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-matrix-green mb-2">
              Alternative Games
            </h3>
            <p className="text-gray-300 text-sm">
              Burnt out on <span className="text-white font-semibold">{sourceGameName}</span>? Try these similar games with good discoverability.
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-2 border-matrix-green border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400">Finding alternatives...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-matrix-green/20 hover:bg-matrix-green/30 text-matrix-green rounded transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && alternatives.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-2">No alternatives found</p>
              <p className="text-gray-500 text-sm">
                We could not find similar games with good discoverability right now.
              </p>
              <button
                onClick={handleClose}
                className="mt-6 px-4 py-2 bg-matrix-green/20 hover:bg-matrix-green/30 text-matrix-green rounded transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {/* Alternatives List */}
          {!loading && !error && alternatives.length > 0 && (
            <>
              <div className="space-y-4 mb-4">
                {alternatives.map((alt, index) => (
                  <AlternativeCard
                    key={alt.game_id}
                    game={alt}
                    onTwitchClick={() => handleTwitchClick(alt)}
                    onMoreInfo={() => handleMoreInfo(alt)}
                  />
                ))}
              </div>

              {/* Footer Stats */}
              <div className="text-center pt-4 border-t border-matrix-green/30">
                <p className="text-gray-400 text-sm">
                  Evaluated {candidatesEvaluated} games - Showing top 3 matches
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
