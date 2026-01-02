// US-073: Skeleton UI Components
// Oracle's Spec: Progressive loading with visual structure, no spinners

import React from 'react'

export function GameListSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="max-w-7xl mx-auto px-4 pb-12">
      {/* Filter skeleton */}
      <div className="mb-6 space-y-3">
        <div className="h-12 bg-bg-elevated rounded-lg animate-pulse" />
        <div className="flex gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 w-20 bg-bg-elevated rounded-full animate-pulse" />
          ))}
        </div>
      </div>
      
      {/* Game card skeletons */}
      <div className="grid gap-3">
        {[...Array(count)].map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export function GameCardSkeleton() {
  return (
    <div className="bg-bg-elevated border-2 border-bg-hover rounded-lg p-6">
      <div className="flex gap-4">
        {/* Box art skeleton */}
        <div className="w-24 h-32 sm:w-28 sm:h-40 bg-bg-hover rounded animate-pulse flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          {/* Title and rank skeleton */}
          <div className="flex items-start gap-2 mb-3">
            <div className="w-12 h-8 bg-bg-hover rounded animate-pulse" />
            <div className="flex-1">
              <div className="h-6 bg-bg-hover rounded animate-pulse mb-2 w-3/4" />
              <div className="h-4 bg-bg-hover rounded animate-pulse w-1/2" />
            </div>
            <div className="w-16 h-12 bg-bg-hover rounded animate-pulse" />
          </div>
          
          {/* Stats skeleton */}
          <div className="flex gap-4 mb-3">
            <div className="h-4 w-20 bg-bg-hover rounded animate-pulse" />
            <div className="h-4 w-20 bg-bg-hover rounded animate-pulse" />
          </div>
          
          {/* Buttons skeleton */}
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-bg-hover rounded animate-pulse" />
            <div className="h-8 w-24 bg-bg-hover rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function LoadMoreSkeleton() {
  return (
    <div className="flex justify-center py-8">
      <div className="h-12 w-40 bg-bg-elevated rounded-lg animate-pulse" />
    </div>
  )
}
