'use client'

import { getGamePlatforms, isGameFree, PLATFORMS, Platform } from './game-platforms'

interface SmartBuyLinksProps {
  gameName: string
  onLinkClick?: (platform: string, gameName: string) => void
  className?: string
}

/**
 * SmartBuyLinks - Shows appropriate purchase buttons based on game platform availability
 * 
 * US-028: Only show buy links where game is actually available
 * - Valorant → Riot (free)
 * - Overwatch → Battle.net (free)  
 * - Minecraft → Microsoft Store
 * - Most games → Steam + Epic search
 */
export function SmartBuyLinks({ gameName, onLinkClick, className = '' }: SmartBuyLinksProps) {
  const gameInfo = getGamePlatforms(gameName)
  const isFree = isGameFree(gameName)
  
  // Filter out 'free_standalone' from display - we show a badge instead
  const displayPlatforms = gameInfo.platforms.filter(p => p !== 'free_standalone')
  
  const handleClick = (platform: Platform, url: string) => {
    if (onLinkClick) {
      onLinkClick(platform, gameName)
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }
  
  const getPlatformUrl = (platform: Platform): string => {
    // Use specific URL if available
    if (gameInfo.specificUrl) {
      // For platforms without URL patterns, use specific URL
      if (!PLATFORMS[platform].urlPattern) {
        return gameInfo.specificUrl
      }
    }
    
    // Use URL pattern
    const pattern = PLATFORMS[platform].urlPattern
    if (!pattern) {
      return gameInfo.specificUrl || '#'
    }
    
    return pattern.replace('{game}', encodeURIComponent(gameName))
  }
  
  return (
    <div className={`flex flex-wrap gap-2 items-center ${className}`}>
      {/* Free to Play Badge */}
      {isFree && (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          🆓 Free to Play
        </span>
      )}
      
      {/* Platform Buttons */}
      {displayPlatforms.map((platform) => {
        const platformInfo = PLATFORMS[platform]
        const url = getPlatformUrl(platform)
        
        return (
          <button
            key={platform}
            onClick={() => handleClick(platform, url)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all hover:scale-105 hover:shadow-lg"
            style={{
              backgroundColor: `${platformInfo.color}20`,
              color: platformInfo.color === '#1b2838' ? '#66c0f4' : platformInfo.color,
              border: `1px solid ${platformInfo.color}40`
            }}
            title={`Get on ${platformInfo.name}`}
          >
            <span>{platformInfo.icon}</span>
            <span>{platformInfo.name}</span>
          </button>
        )
      })}
    </div>
  )
}

/**
 * Compact version for card layouts - just icons
 */
export function SmartBuyLinksCompact({ gameName, onLinkClick }: SmartBuyLinksProps) {
  const gameInfo = getGamePlatforms(gameName)
  const isFree = isGameFree(gameName)
  const displayPlatforms = gameInfo.platforms.filter(p => p !== 'free_standalone')
  
  const getPlatformUrl = (platform: Platform): string => {
    if (gameInfo.specificUrl && !PLATFORMS[platform].urlPattern) {
      return gameInfo.specificUrl
    }
    const pattern = PLATFORMS[platform].urlPattern
    if (!pattern) return gameInfo.specificUrl || '#'
    return pattern.replace('{game}', encodeURIComponent(gameName))
  }
  
  const handleClick = (platform: Platform, url: string) => {
    if (onLinkClick) onLinkClick(platform, gameName)
    window.open(url, '_blank', 'noopener,noreferrer')
  }
  
  return (
    <div className="flex gap-1.5 items-center">
      {isFree && (
        <span className="text-emerald-400 text-xs" title="Free to Play">🆓</span>
      )}
      {displayPlatforms.slice(0, 3).map((platform) => {
        const platformInfo = PLATFORMS[platform]
        const url = getPlatformUrl(platform)
        
        return (
          <button
            key={platform}
            onClick={() => handleClick(platform, url)}
            className="w-7 h-7 rounded flex items-center justify-center transition-all hover:scale-110"
            style={{
              backgroundColor: `${platformInfo.color}30`,
              border: `1px solid ${platformInfo.color}50`
            }}
            title={platformInfo.name}
          >
            <span className="text-sm">{platformInfo.icon}</span>
          </button>
        )
      })}
      {displayPlatforms.length > 3 && (
        <span className="text-xs text-gray-400">+{displayPlatforms.length - 3}</span>
      )}
    </div>
  )
}

/**
 * Primary CTA button - shows the main/best platform for a game
 */
export function PrimaryBuyButton({ gameName, onLinkClick }: SmartBuyLinksProps) {
  const gameInfo = getGamePlatforms(gameName)
  const isFree = isGameFree(gameName)
  
  // Get primary platform (first non-free_standalone)
  const primaryPlatform = gameInfo.platforms.find(p => p !== 'free_standalone') || 'steam'
  const platformInfo = PLATFORMS[primaryPlatform]
  
  const url = gameInfo.specificUrl || 
    (platformInfo.urlPattern?.replace('{game}', encodeURIComponent(gameName)) || '#')
  
  const handleClick = () => {
    if (onLinkClick) onLinkClick(primaryPlatform, gameName)
    window.open(url, '_blank', 'noopener,noreferrer')
  }
  
  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 hover:shadow-lg"
      style={{
        backgroundColor: isFree ? '#10b981' : platformInfo.color,
        color: 'white'
      }}
    >
      <span>{platformInfo.icon}</span>
      <span>{isFree ? 'Play Free' : `Get on ${platformInfo.name}`}</span>
    </button>
  )
}

export default SmartBuyLinks
