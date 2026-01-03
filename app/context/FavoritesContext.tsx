'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

const STORAGE_KEY = 'streamscout_favorites'

interface Favorite {
  game_id: string
  game_name: string
  added_at: number
}

interface FavoritesContextType {
  favorites: Favorite[]
  isFavorited: (gameId: string) => boolean
  addFavorite: (gameId: string, gameName: string) => void
  removeFavorite: (gameId: string) => void
  toggleFavorite: (gameId: string, gameName: string) => void
  clearAllFavorites: () => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage
  const [favorites, setFavorites] = useState<Favorite[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // Sync to localStorage whenever favorites change
  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  }, [favorites])

  const isFavorited = (gameId: string) => {
    return favorites.some(fav => fav.game_id === gameId)
  }

  const addFavorite = (gameId: string, gameName: string) => {
    setFavorites(prev => {
      // Don't add duplicates
      if (prev.some(fav => fav.game_id === gameId)) return prev
      
      return [...prev, {
        game_id: gameId,
        game_name: gameName,
        added_at: Date.now()
      }]
    })
  }

  const removeFavorite = (gameId: string) => {
    setFavorites(prev => prev.filter(fav => fav.game_id !== gameId))
  }

  const toggleFavorite = (gameId: string, gameName: string) => {
    if (isFavorited(gameId)) {
      removeFavorite(gameId)
    } else {
      addFavorite(gameId, gameName)
    }
  }

  const clearAllFavorites = () => {
    setFavorites([])
  }

  return (
    <FavoritesContext.Provider value={{
      favorites,
      isFavorited,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      clearAllFavorites
    }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
