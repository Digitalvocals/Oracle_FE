'use client';

import { useState, useEffect, useCallback } from 'react';

interface FavoriteGame {
  game_id: string;
  game_name: string;
  added_at: number;
}

interface UseFavoritesReturn {
  favorites: FavoriteGame[];
  isFavorited: (gameId: string) => boolean;
  addFavorite: (gameId: string, gameName: string) => void;
  removeFavorite: (gameId: string) => void;
  toggleFavorite: (gameId: string, gameName: string) => void;
  clearAllFavorites: () => void;
}

const STORAGE_KEY = 'streamscout_favorites';

export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<FavoriteGame[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavorites(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.warn('Failed to load favorites from localStorage:', error);
      setFavorites([]);
    }
  }, []);

  // Sync to localStorage on every change
  useEffect(() => {
    if (!isClient) return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.warn('Failed to save favorites to localStorage:', error);
    }
  }, [favorites, isClient]);

  const isFavorited = useCallback(
    (gameId: string): boolean => {
      return favorites.some(f => f.game_id === gameId);
    },
    [favorites]
  );

  const addFavorite = useCallback(
    (gameId: string, gameName: string) => {
      setFavorites(prev => {
        // Prevent duplicates
        if (prev.some(f => f.game_id === gameId)) {
          return prev;
        }
        return [...prev, { game_id: gameId, game_name: gameName, added_at: Date.now() }];
      });
    },
    []
  );

  const removeFavorite = useCallback(
    (gameId: string) => {
      setFavorites(prev => prev.filter(f => f.game_id !== gameId));
    },
    []
  );

  const toggleFavorite = useCallback(
    (gameId: string, gameName: string) => {
      if (isFavorited(gameId)) {
        removeFavorite(gameId);
      } else {
        addFavorite(gameId, gameName);
      }
    },
    [isFavorited, addFavorite, removeFavorite]
  );

  const clearAllFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    isFavorited,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearAllFavorites,
  };
}
