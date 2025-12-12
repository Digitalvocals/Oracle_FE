/**
 * US-028: Smart Purchase Links
 * Platform availability mapping for games
 * Only show purchase buttons where games are actually available
 */

export type Platform = 'steam' | 'epic' | 'blizzard' | 'riot' | 'origin' | 'ubisoft' | 'gog' | 'itch' | 'microsoft' | 'playstation' | 'nintendo' | 'free_standalone'

export interface PlatformInfo {
  name: string
  color: string // Tailwind bg color
  hoverColor: string
  icon: string // Emoji
  urlPattern?: string // Template for store URL
}

export const PLATFORMS: Record<Platform, PlatformInfo> = {
  steam: {
    name: 'Steam',
    color: 'bg-[#2a475e]',
    hoverColor: 'hover:bg-[#3d6a8a]',
    icon: '🎮',
    urlPattern: 'https://store.steampowered.com/search/?term={game}'
  },
  epic: {
    name: 'Epic',
    color: 'bg-[#313131]',
    hoverColor: 'hover:bg-[#444444]',
    icon: '🎮',
    urlPattern: 'https://store.epicgames.com/en-US/browse?q={game}'
  },
  blizzard: {
    name: 'Battle.net',
    color: 'bg-[#00aeff]',
    hoverColor: 'hover:bg-[#00bfff]',
    icon: '⚔️',
    urlPattern: 'https://www.blizzard.com/en-us/'
  },
  riot: {
    name: 'Riot Games',
    color: 'bg-[#eb0029]',
    hoverColor: 'hover:bg-[#ff1a3d]',
    icon: '🎯',
    urlPattern: 'https://www.riotgames.com/en'
  },
  origin: {
    name: 'EA',
    color: 'bg-[#ff6c00]',
    hoverColor: 'hover:bg-[#ff7f1a]',
    icon: '🎮',
    urlPattern: 'https://www.ea.com/games'
  },
  ubisoft: {
    name: 'Ubisoft',
    color: 'bg-[#0078f2]',
    hoverColor: 'hover:bg-[#1a8cff]',
    icon: '🎮',
    urlPattern: 'https://store.ubi.com/us/'
  },
  gog: {
    name: 'GOG',
    color: 'bg-[#86328a]',
    hoverColor: 'hover:bg-[#9d3ea0]',
    icon: '🎮',
    urlPattern: 'https://www.gog.com/en/games?query={game}'
  },
  itch: {
    name: 'itch.io',
    color: 'bg-[#fa5c5c]',
    hoverColor: 'hover:bg-[#ff6b6b]',
    icon: '🎮',
    urlPattern: 'https://itch.io/search?q={game}'
  },
  microsoft: {
    name: 'Xbox',
    color: 'bg-[#107c10]',
    hoverColor: 'hover:bg-[#128a12]',
    icon: '🎮',
    urlPattern: 'https://www.xbox.com/en-US/games/store'
  },
  playstation: {
    name: 'PlayStation',
    color: 'bg-[#003087]',
    hoverColor: 'hover:bg-[#0041a8]',
    icon: '🎮',
    urlPattern: 'https://store.playstation.com/en-us/search/{game}'
  },
  nintendo: {
    name: 'Nintendo',
    color: 'bg-[#e60012]',
    hoverColor: 'hover:bg-[#ff0d1f]',
    icon: '🎮',
    urlPattern: 'https://www.nintendo.com/us/store/games/'
  },
  free_standalone: {
    name: 'Free',
    color: 'bg-green-600',
    hoverColor: 'hover:bg-green-500',
    icon: '🆓',
  }
}

// Game-specific platform availability
// Key = lowercase game name for matching
export const GAME_PLATFORMS: Record<string, {
  platforms: Platform[]
  specificUrl?: string // Override URL if needed
}> = {
  // BLIZZARD GAMES
  'overwatch 2': {
    platforms: ['blizzard'],
    specificUrl: 'https://overwatch.blizzard.com/'
  },
  'overwatch': {
    platforms: ['blizzard'],
    specificUrl: 'https://overwatch.blizzard.com/'
  },
  'world of warcraft': {
    platforms: ['blizzard'],
    specificUrl: 'https://worldofwarcraft.blizzard.com/'
  },
  'hearthstone': {
    platforms: ['blizzard', 'free_standalone'],
    specificUrl: 'https://hearthstone.blizzard.com/'
  },
  'diablo iv': {
    platforms: ['blizzard', 'steam'],
    specificUrl: 'https://diablo4.blizzard.com/'
  },
  'diablo iii': {
    platforms: ['blizzard'],
    specificUrl: 'https://us.diablo3.blizzard.com/'
  },
  'starcraft ii': {
    platforms: ['blizzard'],
    specificUrl: 'https://starcraft2.blizzard.com/'
  },

  // RIOT GAMES
  'valorant': {
    platforms: ['riot', 'free_standalone'],
    specificUrl: 'https://playvalorant.com/'
  },
  'league of legends': {
    platforms: ['riot', 'free_standalone'],
    specificUrl: 'https://www.leagueoflegends.com/'
  },
  'teamfight tactics': {
    platforms: ['riot', 'free_standalone'],
    specificUrl: 'https://teamfighttactics.leagueoflegends.com/'
  },
  'legends of runeterra': {
    platforms: ['riot', 'free_standalone'],
    specificUrl: 'https://playruneterra.com/'
  },

  // EA/ORIGIN
  'apex legends': {
    platforms: ['steam', 'epic', 'origin', 'free_standalone'],
    specificUrl: 'https://www.ea.com/games/apex-legends'
  },
  'the sims 4': {
    platforms: ['steam', 'epic', 'origin'],
  },
  'fifa 23': {
    platforms: ['steam', 'epic', 'origin'],
  },
  'madden nfl 24': {
    platforms: ['steam', 'origin'],
  },

  // EPIC EXCLUSIVES (timed or permanent)
  'fortnite': {
    platforms: ['epic', 'free_standalone'],
    specificUrl: 'https://www.fortnite.com/'
  },
  'fall guys': {
    platforms: ['steam', 'epic', 'free_standalone'],
  },
  'rocket league': {
    platforms: ['steam', 'epic', 'free_standalone'],
  },

  // UBISOFT
  'rainbow six siege': {
    platforms: ['steam', 'ubisoft'],
  },
  'assassin\'s creed valhalla': {
    platforms: ['steam', 'epic', 'ubisoft'],
  },
  'the division 2': {
    platforms: ['steam', 'epic', 'ubisoft'],
  },

  // MULTI-PLATFORM POPULAR GAMES
  'minecraft': {
    platforms: ['microsoft', 'playstation', 'nintendo'],
    specificUrl: 'https://www.minecraft.net/'
  },
  'grand theft auto v': {
    platforms: ['steam', 'epic'],
  },
  'red dead redemption 2': {
    platforms: ['steam', 'epic'],
  },
  'call of duty: warzone': {
    platforms: ['blizzard', 'steam', 'free_standalone'],
  },
  'counter-strike 2': {
    platforms: ['steam', 'free_standalone'],
    specificUrl: 'https://store.steampowered.com/app/730/CounterStrike_2/'
  },
  'dota 2': {
    platforms: ['steam', 'free_standalone'],
    specificUrl: 'https://store.steampowered.com/app/570/Dota_2/'
  },
  'rust': {
    platforms: ['steam'],
    specificUrl: 'https://store.steampowered.com/app/252490/Rust/'
  },
  'terraria': {
    platforms: ['steam', 'gog'],
  },
  'stardew valley': {
    platforms: ['steam', 'gog'],
  },
  'among us': {
    platforms: ['steam', 'epic', 'itch'],
  },
  'phasmophobia': {
    platforms: ['steam'],
    specificUrl: 'https://store.steampowered.com/app/739630/Phasmophobia/'
  },
  'lethal company': {
    platforms: ['steam'],
    specificUrl: 'https://store.steampowered.com/app/1966720/Lethal_Company/'
  },
  'palworld': {
    platforms: ['steam'],
    specificUrl: 'https://store.steampowered.com/app/1623730/Palworld/'
  },
  'elden ring': {
    platforms: ['steam'],
    specificUrl: 'https://store.steampowered.com/app/1245620/ELDEN_RING/'
  },
  'baldur\'s gate 3': {
    platforms: ['steam', 'gog'],
  },
  'cyberpunk 2077': {
    platforms: ['steam', 'epic', 'gog'],
  },
}

/**
 * Get available platforms for a game
 * Returns default (Steam/Epic search) if game not in mapping
 */
export function getGamePlatforms(gameName: string): {
  platforms: Platform[]
  specificUrl?: string
} {
  const normalized = gameName.toLowerCase().trim()
  
  // Exact match
  if (GAME_PLATFORMS[normalized]) {
    return GAME_PLATFORMS[normalized]
  }
  
  // Fuzzy match (contains)
  for (const [key, value] of Object.entries(GAME_PLATFORMS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value
    }
  }
  
  // Default: Steam and Epic search
  return {
    platforms: ['steam', 'epic']
  }
}

/**
 * Generate platform URL for a game
 */
export function getPlatformUrl(platform: Platform, gameName: string, specificUrl?: string): string {
  // Use specific URL if provided
  if (specificUrl && platform === 'blizzard') return specificUrl
  if (specificUrl && platform === 'riot') return specificUrl
  if (specificUrl && platform === 'free_standalone') return specificUrl
  if (specificUrl && !PLATFORMS[platform].urlPattern) return specificUrl
  
  // Use platform's URL pattern
  const pattern = PLATFORMS[platform].urlPattern
  if (!pattern) return PLATFORMS[platform].urlPattern || '#'
  
  return pattern.replace('{game}', encodeURIComponent(gameName))
}
