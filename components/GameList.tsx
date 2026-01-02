// US-073: GameList Client Component
// Oracle's Spec: Handles interactivity, maintains existing features
// Receives server-rendered initial games, loads rest in background

'use client'

import { useState, useEffect } from 'react'
import { GameCard } from './GameCard'
import { LoadMoreSkeleton } from './Skeletons'

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

export default function GameList({ initialGames, hasError }: GameListProps) {
  const [allGames, setAllGames] = useState<GameOpportunity[]>(initialGames)
  const [displayedGames, setDisplayedGames] = useState<GameOpportunity[]>(initialGames.slice(0, 100))
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isLoadingAll, setIsLoadingAll] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  
  // Filters
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  
  // Load remaining games in background (per Oracle spec)
  useEffect(() => {
    if (initialGames.length < 100 && !hasError) {
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
    
    // Simulate loading delay for UX (per Oracle spec)
    setTimeout(() => {
      const currentCount = displayedGames.length
      const nextBatch = filteredGames.slice(currentCount, currentCount + 100)
      setDisplayedGames([...displayedGames, ...nextBatch])
      setIsLoadingMore(false)
      setHasMore(currentCount + 100 < filteredGames.length)
    }, 300)
  }
  
  // Filter logic
  const filteredGames = allGames.filter(game => {
    if (searchQuery && !game.game_name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    if (selectedGenres.length > 0) {
      const hasMatchingGenre = game.genres?.some(g => selectedGenres.includes(g))
      if (!hasMatchingGenre) return false
    }
    
    return true
  })
  
  // Update displayed games when filters change
  useEffect(() => {
    setDisplayedGames(filteredGames.slice(0, 100))
    setHasMore(filteredGames.length > 100)
  }, [selectedGenres, searchQuery, allGames])
  
  function toggleGenre(genre: string) {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
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
      
      {/* Genre filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-text-secondary text-sm mr-2">Filter by genre:</span>
          {GENRE_OPTIONS.map(genre => (
            <button
              key={genre}
              onClick={() => toggleGenre(genre)}
              className={`px-3 py-2 rounded-full text-sm transition-all ${
                selectedGenres.includes(genre)
                  ? 'bg-brand-primary text-black font-semibold'
                  : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/30 hover:bg-brand-primary/20'
              }`}
            >
              {genre}
            </button>
          ))}
          {selectedGenres.length > 0 && (
            <button
              onClick={() => setSelectedGenres([])}
              className="px-3 py-2 rounded-full text-sm bg-brand-danger/20 text-brand-danger border border-brand-danger/30 hover:bg-brand-danger/30 ml-2"
            >
              Clear All
            </button>
          )}
        </div>
        
        {/* Results count */}
        {(selectedGenres.length > 0 || searchQuery) && (
          <div className="text-text-tertiary text-sm mt-2">
            {searchQuery && `Search results for "${searchQuery}": `}
            {filteredGames.length} of {allGames.length} games
          </div>
        )}
      </div>
      
      {/* Game grid */}
      <div className="grid gap-3">
        {filteredGames.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            {searchQuery
              ? `No games found matching "${searchQuery}". Try a different search.`
              : 'No games found matching selected genres. Try different filters.'
            }
          </div>
        ) : (
          displayedGames.map((game) => (
            <GameCard key={game.game_id} game={game} />
          ))
        )}
      </div>
      
      {/* Load more button */}
      {hasMore && filteredGames.length > displayedGames.length && (
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
