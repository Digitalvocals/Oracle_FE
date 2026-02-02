// US-073: GameList Client Component
// US-033: Multi-select genre filter with AND/OR toggle (Oracle's spec)
// Fuzzy search v4: Fuse.js + normalization + alias expansion

'use client'

import { useState, useEffect, useMemo } from 'react'
import Fuse from 'fuse.js'
import { GameCard } from './GameCard'
import { LoadMoreSkeleton } from './Skeletons'
import { 
  FavoritesFilter,
  EmptyFavoritesState,
  ClearFavoritesButton,
  UntrackedFavoriteCard
} from '@/app/components/streamscout-ui'
import { useFavorites } from '@/app/hooks/useFavorites'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-90f4a9.up.railway.app'

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

interface GameListProps {
  initialGames: GameOpportunity[]
  hasError: boolean
}

const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Battle Royale', 'Card Game', 'FPS', 'Fighting',
  'Horror', 'Indie', 'MMO', 'MOBA', 'Party', 'Platformer', 'Puzzle',
  'RPG', 'Racing', 'Sandbox', 'Simulation', 'Sports', 'Strategy', 'Survival'
]

// ============================================================================
// SEARCH UTILITIES (outside component)
// ============================================================================

/**
 * Common abbreviations/aliases for game names
 */
const SEARCH_ALIASES: Record<string, string> = {
  'gta': 'grand theft auto',
  'cod': 'call of duty',
  'lol': 'league of legends',
  'csgo': 'counter strike',
  'cs2': 'counter strike',
  'pubg': 'playerunknown battlegrounds',
  'ow': 'overwatch',
  'ow2': 'overwatch',
  'rl': 'rocket league',
  'bg3': 'baldurs gate',
  'ff14': 'final fantasy 14',
  'ffxiv': 'final fantasy 14',
  'ff16': 'final fantasy 16',
  'ffxvi': 'final fantasy 16',
  'poe': 'path of exile',
  'poe2': 'path of exile',
  'eft': 'escape from tarkov',
  'tarkov': 'escape from tarkov',
  'dbd': 'dead by daylight',
  'rs': 'runescape',
  'osrs': 'runescape',
  'wow': 'world of warcraft',
  'eso': 'elder scrolls online',
  'ds': 'dark souls',
  'ds3': 'dark souls 3',
  'er': 'elden ring',
  'botw': 'breath of the wild',
  'totk': 'tears of the kingdom',
  'r6': 'rainbow six',
  'apex': 'apex legends',
  'fifa': 'ea sports fc',
  'hsr': 'honkai star rail',
  'zzz': 'zenless zone zero',
}

/**
 * Preprocesses a string for fuzzy search comparison.
 * Normalizes accents, roman numerals, punctuation, spacing.
 */
function preprocessForSearch(str: string): string {
  return str
    // Lowercase
    .toLowerCase()
    // Normalize accented characters (é → e, ü → u, etc.)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remove punctuation
    .replace(/[.:\-'\"!?(),&]/g, '')
    // Roman numerals → digits (ORDER MATTERS - longest first)
    .replace(/\bviii\b/g, '8')
    .replace(/\bvii\b/g, '7')
    .replace(/\bvi\b/g, '6')
    .replace(/\biv\b/g, '4')
    .replace(/\biii\b/g, '3')
    .replace(/\bii\b/g, '2')
    .replace(/\bv\b/g, '5')
    .replace(/\bi\b/g, '1')
    // Remove all spaces (handles "fo rtnite" and "darksouls")
    .replace(/\s+/g, '')
    .trim()
}

/**
 * Expands search aliases (gta → grand theft auto)
 * Returns original term if no alias found
 */
function expandAlias(term: string): string {
  const cleaned = term.toLowerCase().trim()
  return SEARCH_ALIASES[cleaned] || cleaned
}

export default function GameList({ initialGames, hasError }: GameListProps) {
  const [allGames, setAllGames] = useState<GameOpportunity[]>(initialGames)
  const [displayedGames, setDisplayedGames] = useState<GameOpportunity[]>(initialGames.slice(0, 100))
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isLoadingAll, setIsLoadingAll] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  
  // Favorites hook
  const { favorites, isFavorited, removeFavorite, clearAllFavorites } = useFavorites()
  
  // Filters - Multi-select genre (US-033)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [genreMode, setGenreMode] = useState<'AND' | 'OR'>('AND')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false)
  const [genresExpanded, setGenresExpanded] = useState<boolean>(false)
  
  // ALWAYS load full game list in background
  useEffect(() => {
    if (!hasError) {
      loadAllGames()
    }
  }, [])

  // Read URL hash on mount and on hash change to support direct links
  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const hashValue = decodeURIComponent(window.location.hash.slice(1))
        if (hashValue) {
          setSearchQuery(hashValue)
        }
      }
    }

    // Check hash on mount
    handleHashChange()

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  async function loadAllGames() {
    if (isLoadingAll) return
    
    setIsLoadingAll(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/analyze?limit=2000`)
      if (!res.ok) throw new Error('Failed to load')
      
      const data = await res.json()
      const games = data.top_opportunities || []
      
      setAllGames(games)
      setHasMore(games.length > 100)
    } catch (error) {
      console.error('Failed to load all games:', error)
    } finally {
      setIsLoadingAll(false)
    }
  }
  
  function loadMore() {
    setIsLoadingMore(true)
    
    setTimeout(() => {
      const currentCount = displayedGames.length
      const nextBatch = finalFilteredGames.slice(currentCount, currentCount + 100)
      setDisplayedGames([...displayedGames, ...nextBatch])
      setIsLoadingMore(false)
      setHasMore(currentCount + 100 < finalFilteredGames.length)
    }, 300)
  }
  
  // ============================================================================
  // FUZZY SEARCH WITH FUSE.JS
  // ============================================================================
  
  // Preprocessed games for search
  const searchableGames = useMemo(() => {
    return allGames.map(game => ({
      ...game,
      _searchName: preprocessForSearch(game.game_name)
    }))
  }, [allGames])
  
  // Fuse instance
  const fuse = useMemo(() => {
    return new Fuse(searchableGames, {
      keys: ['_searchName'],
      threshold: 0.4,          // 0=exact, 1=match anything. 0.4 allows typos
      distance: 100,           // How far into string to search
      includeScore: true,      // Better relevance sorting
      ignoreLocation: true,    // Match anywhere in string
      minMatchCharLength: 2,   // Skip single-char searches
    })
  }, [searchableGames])
  
  // Search logic with fuzzy matching + alias expansion
  const searchedGames = useMemo(() => {
    const trimmedSearch = searchQuery.trim()
    
    // No search = return all games
    if (!trimmedSearch) return allGames
    
    // Expand aliases (gta → grand theft auto)
    const expandedSearch = expandAlias(trimmedSearch)
    
    // Preprocess the search term
    const processedSearch = preprocessForSearch(expandedSearch)
    
    // Skip if preprocessing resulted in empty string
    if (!processedSearch) return allGames
    
    // Run Fuse fuzzy search
    const results = fuse.search(processedSearch)
    
    // Extract original game objects (preserve references for React keys)
    return results.map(result => {
      const originalGame = allGames.find(g => g.game_id === result.item.game_id)
      return originalGame || result.item
    })
  }, [searchQuery, fuse, allGames])
  
  // ============================================================================
  // REMAINING FILTERS (genre, favorites)
  // ============================================================================

  // Apply genre filter to searched results (US-033: multi-select with AND/OR)
  const filteredGames = useMemo(() => {
    let result = searchedGames

    if (selectedGenres.length === 0) {
      return result
    }

    if (selectedGenres.length === 1) {
      return result.filter(game => game.genres?.includes(selectedGenres[0]))
    }

    // Multi-select: AND or OR mode
    if (genreMode === 'AND') {
      return result.filter(game =>
        selectedGenres.every(genre => game.genres?.includes(genre))
      )
    } else {
      return result.filter(game =>
        selectedGenres.some(genre => game.genres?.includes(genre))
      )
    }
  }, [searchedGames, selectedGenres, genreMode])
  
  // Apply favorites filter
  const finalFilteredGames = showFavoritesOnly
    ? filteredGames.filter(game => isFavorited(game.game_id))
    : filteredGames
  
  // Untracked favorites (favorited games not in top 2000)
  const untrackedFavorites = favorites.filter(fav => 
    !allGames.some(game => game.game_id === fav.game_id)
  )
  
  // Update displayed games when filters change
  useEffect(() => {
    setDisplayedGames(finalFilteredGames.slice(0, 100))
    setHasMore(finalFilteredGames.length > 100)
  }, [selectedGenres, genreMode, searchQuery, allGames, showFavoritesOnly, finalFilteredGames])

  // Toggle genre selection (US-033)
  function toggleGenre(genre: string) {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)  // Deselect
        : [...prev, genre]                // Add
    )
    // Track multi-genre filter usage
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'multi_genre_filter', {
        genre: genre,
        action: selectedGenres.includes(genre) ? 'remove' : 'add',
        total_selected: selectedGenres.includes(genre) ? selectedGenres.length - 1 : selectedGenres.length + 1
      })
    }
  }

  function clearGenres() {
    setSelectedGenres([])
    setGenreMode('AND')  // Reset to default per spec
  }
  
  const handleViewFavorites = () => {
    setShowFavoritesOnly(!showFavoritesOnly)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'view_favorites', {
        showing_favorites: !showFavoritesOnly
      })
      console.log(`[TRACK] view_favorites: ${!showFavoritesOnly}`)
    }
  }
  
  const handleClearAllFavorites = () => {
    if (confirm(`Clear all ${favorites.length} favorites?`)) {
      clearAllFavorites()
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'clear_all_favorites', {
          count: favorites.length
        })
      }
    }
  }
  
  // Error state
  if (hasError && initialGames.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-bg-elevated border-2 border-brand-danger rounded-lg p-8 text-center">
          <div className="text-h1 text-brand-danger mb-4">Unable to Load Data</div>
          <div className="text-body text-text-secondary">
            Our backend is warming up. Please refresh in a moment.
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 pb-12">
      {/* Search bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search for any game (e.g., Fortnite, League of Legends)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-bg-elevated border border-text-tertiary/30 rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30"
        />
      </div>
      
      {/* Genre filters - US-033: Multi-select with AND/OR toggle */}
      <div className="mb-6 space-y-2">
        {/* Header with count and AND/OR toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-text-secondary text-sm">Filter by genre:</span>
            {/* AND/OR toggle - only visible when 2+ genres selected */}
            {selectedGenres.length >= 2 && (
              <div className="flex rounded-full border border-text-tertiary/30 overflow-hidden">
                <button
                  onClick={() => setGenreMode('AND')}
                  className={
                    genreMode === 'AND'
                      ? 'px-3 py-1 text-xs font-semibold bg-brand-primary text-bg-primary'
                      : 'px-3 py-1 text-xs text-text-secondary hover:text-text-primary'
                  }
                >
                  AND
                </button>
                <button
                  onClick={() => setGenreMode('OR')}
                  className={
                    genreMode === 'OR'
                      ? 'px-3 py-1 text-xs font-semibold bg-brand-primary text-bg-primary'
                      : 'px-3 py-1 text-xs text-text-secondary hover:text-text-primary'
                  }
                >
                  OR
                </button>
              </div>
            )}
          </div>
          <span className="text-text-tertiary text-xs">
            {selectedGenres.length === 0
              ? `${allGames.length} games total`
              : selectedGenres.length === 1
                ? `${filteredGames.length} ${selectedGenres[0]} games`
                : genreMode === 'AND'
                  ? `${filteredGames.length} ${selectedGenres.join(' + ')} games`
                  : `${filteredGames.length} ${selectedGenres.join(' or ')} games`
            }
          </span>
        </div>

        {/* Genre buttons - Collapsible on mobile */}
        <div className="flex flex-wrap gap-2">
          {GENRE_OPTIONS
            .slice(0, genresExpanded ? undefined : 6)
            .map(genre => (
            <button
              key={genre}
              onClick={() => toggleGenre(genre)}
              className={
                selectedGenres.includes(genre)
                  ? 'px-4 py-2 rounded-full bg-brand-primary text-bg-primary font-semibold border border-brand-primary transition-colors'
                  : 'px-4 py-2 rounded-full bg-transparent text-text-secondary border border-text-tertiary/30 hover:border-brand-primary hover:text-text-primary transition-colors'
              }
            >
              {genre}
            </button>
          ))}

          {/* Show more/less toggle */}
          {!genresExpanded && GENRE_OPTIONS.length > 6 && (
            <button
              onClick={() => setGenresExpanded(true)}
              className="px-4 py-2 rounded-full bg-transparent text-text-tertiary border border-text-tertiary/30 hover:text-text-primary hover:border-text-secondary transition-colors"
            >
              +{GENRE_OPTIONS.length - 6} more
            </button>
          )}

          {genresExpanded && (
            <button
              onClick={() => setGenresExpanded(false)}
              className="px-4 py-2 rounded-full bg-transparent text-text-tertiary border border-text-tertiary/30 hover:text-text-primary transition-colors"
            >
              Show less
            </button>
          )}

          {/* Clear filter - only shows when filter active */}
          {selectedGenres.length > 0 && (
            <button
              onClick={clearGenres}
              className="px-4 py-2 rounded-full bg-transparent text-brand-danger border border-brand-danger/50 hover:bg-brand-danger/10 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        
        {/* Search results indicator */}
        {searchQuery && (
          <div className="text-text-tertiary text-sm">
            Search results for "{searchQuery}": {finalFilteredGames.length} games
          </div>
        )}
      </div>
      
      {/* Favorites Filter */}
      <FavoritesFilter 
        showFavoritesOnly={showFavoritesOnly}
        favoriteCount={favorites.length}
        onToggle={handleViewFavorites}
      />

      {/* Clear All Button (shows when viewing favorites) */}
      {showFavoritesOnly && favorites.length > 0 && (
        <ClearFavoritesButton 
          onClick={handleClearAllFavorites}
        />
      )}

      {/* Empty State (shows when viewing favorites but have none) */}
      {showFavoritesOnly && favorites.length === 0 ? (
        <EmptyFavoritesState />
      ) : showFavoritesOnly && displayedGames.length === 0 && untrackedFavorites.length === 0 ? (
        <div className="text-center py-12 text-text-tertiary">
          None of your favorites match the current filters
        </div>
      ) : null}

      {/* Untracked Favorites (favorited games not in top 2000) */}
      {showFavoritesOnly && untrackedFavorites.length > 0 && (
        <div className="space-y-4 mb-6">
          {untrackedFavorites.map(fav => (
            <UntrackedFavoriteCard 
              key={fav.game_id}
              gameName={fav.game_name}
              onRemove={() => {
                removeFavorite(fav.game_id)
                if (typeof window !== 'undefined' && (window as any).gtag) {
                  (window as any).gtag('event', 'remove_favorite', {
                    game_name: fav.game_name,
                    game_id: fav.game_id,
                    source: 'untracked_card'
                  })
                }
              }}
            />
          ))}
        </div>
      )}
      
      {/* Game grid */}
      <div className="grid gap-3">
        {finalFilteredGames.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            {searchQuery ? (
              <div className="space-y-4">
                <p>"{searchQuery}" isn't in our database.</p>
                <div className="flex justify-center gap-4">
                  <a
                    href={`https://www.twitch.tv/search?term=${encodeURIComponent(searchQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    Search on Twitch
                  </a>
                  <a
                    href={`mailto:gary@streamscout.co?subject=Game%20Request:%20${encodeURIComponent(searchQuery)}`}
                    className="text-accent hover:underline"
                  >
                    Let us know about this game
                  </a>
                </div>
              </div>
            ) : selectedGenres.length >= 2 && genreMode === 'AND' ? (
              <div className="space-y-4">
                <p>No games match all selected genres.</p>
                <button
                  onClick={() => setGenreMode('OR')}
                  className="px-4 py-2 bg-brand-primary text-bg-primary font-semibold rounded-lg hover:bg-brand-primary/90 transition-colors"
                >
                  Try OR mode instead
                </button>
              </div>
            ) : selectedGenres.length > 0 ? (
              `No ${selectedGenres.join(' or ')} games found. Try different genres.`
            ) : (
              'No games found.'
            )}
          </div>
        ) : (
          displayedGames.map((game) => (
            <GameCard key={game.game_id} game={game} />
          ))
        )}
      </div>
      
      {/* Load more button */}
      {hasMore && finalFilteredGames.length > displayedGames.length && (
        <div className="mt-6 text-center">
          {isLoadingMore ? (
            <LoadMoreSkeleton />
          ) : (
            <button
              onClick={loadMore}
              className="px-8 py-4 bg-brand-primary hover:bg-brand-primary/90 text-black font-bold rounded-lg transition-colors"
            >
              Load More Games
            </button>
          )}
        </div>
      )}
    </div>
  )
}
