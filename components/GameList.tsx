// US-073: GameList Client Component
// Single-select genre filter - CORRECT STYLING (Oracle's spec)

'use client'

import { useState, useEffect } from 'react'
import { GameCard } from './GameCard'
import { LoadMoreSkeleton } from './Skeletons'
import { 
  FavoritesFilter,
  EmptyFavoritesState,
  ClearFavoritesButton,
  UntrackedFavoriteCard
} from '@/app/components/streamscout-ui'
import { useFavorites } from '@/app/hooks/useFavorites'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-bcd88.up.railway.app'

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

/**
 * Normalizes a string for fuzzy search comparison.
 * Apply to BOTH search input AND game names.
 */
function normalizeForSearch(str: string): string {
  return str
    // Lowercase
    .toLowerCase()
    // Trim leading/trailing whitespace
    .trim()
    // Remove punctuation (periods, colons, dashes, apostrophes, quotes, etc.)
    .replace(/[.:\-'\"!?(),]/g, '')
    // Collapse multiple spaces into single space
    .replace(/\s+/g, ' ')
    // Normalize roman numerals to digits (common in game titles)
    .replace(/\bviii\b/g, '8')
    .replace(/\bvii\b/g, '7')
    .replace(/\bvi\b/g, '6')
    .replace(/\biv\b/g, '4')
    .replace(/\biii\b/g, '3')
    .replace(/\bii\b/g, '2')
    .replace(/\bv\b/g, '5')  // Must come AFTER viii, vii, vi, iv
    .replace(/\bi\b/g, '1')  // Must come AFTER iii, ii
    // Final trim in case normalization created edge whitespace
    .trim();
}

export default function GameList({ initialGames, hasError }: GameListProps) {
  const [allGames, setAllGames] = useState<GameOpportunity[]>(initialGames)
  const [displayedGames, setDisplayedGames] = useState<GameOpportunity[]>(initialGames.slice(0, 100))
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isLoadingAll, setIsLoadingAll] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  
  // Favorites hook
  const { favorites, isFavorited, removeFavorite, clearAllFavorites } = useFavorites()
  
  // Filters - Single-select genre
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false)
  
  // ALWAYS load full game list in background
  useEffect(() => {
    if (!hasError) {
      loadAllGames()
    }
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
  
  // Filter logic - Single genre + fuzzy search
  const filteredGames = allGames.filter(game => {
    // Fuzzy search filter with normalization
    if (searchQuery) {
      const normalizedSearch = normalizeForSearch(searchQuery)
      // Skip filter if normalized search is empty (e.g., user typed only spaces)
      if (!normalizedSearch) return true
      
      const normalizedGameName = normalizeForSearch(game.game_name)
      if (!normalizedGameName.includes(normalizedSearch)) {
        return false
      }
    }
    
    // Genre filter (single select)
    if (selectedGenre && !game.genres?.includes(selectedGenre)) {
      return false
    }
    
    return true
  })
  
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
  }, [selectedGenre, searchQuery, allGames, showFavoritesOnly, finalFilteredGames])
  
  function selectGenre(genre: string) {
    setSelectedGenre(genre)
  }
  
  function clearGenre() {
    setSelectedGenre(null)
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
      
      {/* Genre filters - ORACLE'S CORRECT STYLING */}
      <div className="mb-6 space-y-2">
        {/* Header with count */}
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-sm">Filter by genre:</span>
          <span className="text-text-tertiary text-xs">
            {selectedGenre 
              ? `${filteredGames.length} ${selectedGenre} games`
              : `${allGames.length} games total`
            }
          </span>
        </div>
        
        {/* Genre buttons - CORRECT: Active=green, Inactive=gray */}
        <div className="flex flex-wrap gap-2">
          {GENRE_OPTIONS.map(genre => (
            <button
              key={genre}
              onClick={() => selectGenre(genre)}
              className={
                selectedGenre === genre
                  ? 'px-4 py-2 rounded-full bg-brand-primary text-bg-primary font-semibold border border-brand-primary transition-colors'
                  : 'px-4 py-2 rounded-full bg-transparent text-text-secondary border border-text-tertiary/30 hover:border-brand-primary hover:text-text-primary transition-colors'
              }
            >
              {genre}
            </button>
          ))}
          
          {/* Clear All - only shows when filter active */}
          {selectedGenre && (
            <button
              onClick={clearGenre}
              className="px-4 py-2 rounded-full bg-transparent text-brand-danger border border-brand-danger/50 hover:bg-brand-danger/10 transition-colors"
            >
              Clear All
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
            {searchQuery
              ? `No games found matching "${searchQuery}". Try a different search.`
              : selectedGenre
              ? `No ${selectedGenre} games found. Try a different genre.`
              : 'No games found.'
            }
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
