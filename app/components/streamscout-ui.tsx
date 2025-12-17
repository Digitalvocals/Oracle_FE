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
