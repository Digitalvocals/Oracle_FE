// StreamScout UI Components
// Reusable button components with onClick support for GA4 tracking

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

// TwitchButton Component (existing)
interface TwitchButtonProps {
  gameName: string
}

export const TwitchButton: React.FC<TwitchButtonProps> = ({ gameName }) => {
  return (
    <a
      href={urls.twitch(gameName)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold transition-colors leading-none"
    >
      <span className="text-sm">📺</span> Twitch
    </a>
  )
}

// YouTubeButton Component (existing)
interface YouTubeButtonProps {
  gameName: string
  searchType?: string
}

export const YouTubeButton: React.FC<YouTubeButtonProps> = ({ 
  gameName, 
  searchType = 'gameplay' 
}) => {
  return (
    <a
      href={urls.youtube(gameName, searchType)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-semibold transition-colors leading-none"
    >
      <span className="text-sm">📹</span> YouTube
    </a>
  )
}
