'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface GameOpportunity {
  rank: number
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
  trend: string
  box_art_url: string | null
  genres: string[]
  purchase_links: {
    steam: string | null
    epic: string | null
    free: boolean
  }
  is_filtered?: boolean
  warning_flags?: string[]
  warning_text?: string | null
}

interface AnalysisData {
  timestamp: string
  total_games_analyzed: number
  top_opportunities: GameOpportunity[]
  next_refresh_in_seconds?: number
}

export default function TwitchStrikeAlternative() {
  const [data, setData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedGame, setSelectedGame] = useState<GameOpportunity | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/analyze?limit=20`)
        setData(response.data)
      } catch (err) {
        console.error('Failed to load data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 0.80) return 'score-excellent'
    if (score >= 0.65) return 'score-good'
    if (score >= 0.50) return 'score-moderate'
    return 'score-poor'
  }

  const getTwitchUrl = (gameName: string) => {
    return `https://www.twitch.tv/search?term=${encodeURIComponent(gameName)}`
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <Link href="/" className="inline-block mb-6 text-matrix-green hover:text-matrix-green-bright transition-colors">
            ← Back to StreamScout
          </Link>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-matrix-green-bright text-center">
            Find Games Where Small Streamers Can Actually Compete
          </h1>

          {/* The Message - Styled Like Main Site */}
          <div className="max-w-3xl mx-auto text-center mb-8">
            <p className="text-base sm:text-lg text-matrix-green-dim leading-relaxed mb-4">
              Looking for a tool that tells you which games give small streamers a real shot at discovery?
            </p>
            
            <p className="text-base sm:text-lg text-matrix-green-dim leading-relaxed mb-4">
              TwitchStrike used to do this. Good UI, solid recommendations. Then it went down. Been months. Still broken.
            </p>
            
            <p className="text-base sm:text-lg text-matrix-green leading-relaxed mb-8">
              If you're here, you already know that.
            </p>

            <div className="text-lg sm:text-xl font-bold text-matrix-green mb-2">
              What small streamers actually need:
            </div>
            <div className="text-sm sm:text-base text-matrix-green-dim space-y-1">
              <p>Which games have space for new faces</p>
              <p>Where you won't get buried 10 pages deep</p>
              <p>Real-time data, not yesterday's numbers</p>
              <p>The "why" behind the scores</p>
            </div>
          </div>

          {/* StreamScout vs Others - Same Card Style */}
          <div className="matrix-card mb-8 max-w-3xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-matrix-green">That's StreamScout.</h2>
            
            <div className="text-sm sm:text-base text-matrix-green-dim space-y-3">
              <p>
                <strong className="text-matrix-green">Live data</strong> every 10 minutes. Not daily snapshots.
              </p>
              <p>
                <strong className="text-matrix-green">500 games analyzed.</strong> Not just the top 100.
              </p>
              <p>
                <strong className="text-matrix-green">Transparent algorithm.</strong> You see why a game scores well: Discoverability (45%), Viability (35%), Engagement (20%).
              </p>
              <p>
                <strong className="text-matrix-green">Warning system.</strong> We show oversaturated games with clear "AVOID" warnings. No hiding the truth.
              </p>
            </div>
          </div>

          {/* vs Competitors - Same Card Style */}
          <div className="matrix-card mb-8 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold mb-4 text-matrix-green">vs Other Tools:</h2>
            <div className="text-sm sm:text-base text-matrix-green-dim space-y-3">
              <p>
                <strong className="text-matrix-green">SullyGnome:</strong> Great for historical data. Overwhelming when you just need "what should I stream today?"
              </p>
              <p>
                <strong className="text-matrix-green">TwitchTracker:</strong> Channel-focused analytics. Not built for game discovery.
              </p>
              <p>
                <strong className="text-matrix-green">StreamElements/Streamlabs:</strong> Overlays and alerts. Different problem.
              </p>
              <p className="text-matrix-green/60 italic mt-4">
                No hate to any of them. They solve different problems.
              </p>
              <p className="text-matrix-green font-bold mt-4">
                StreamScout answers one question: "Which games give small streamers the best shot?"
              </p>
            </div>
          </div>

          {/* Status Header - Same Style as Main Page */}
          {data && (
            <div className="flex flex-wrap justify-center gap-4 text-sm mb-6">
              <div className="matrix-badge">
                🎮 {data.total_games_analyzed} GAMES ANALYZED
              </div>
              <div className="matrix-badge">
                ⏱️ UPDATED: {new Date(data.timestamp).toLocaleTimeString()}
              </div>
            </div>
          )}

          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-matrix-green-bright mb-2">
              Live Opportunities Right Now
            </h2>
            <p className="text-matrix-green-dim text-sm sm:text-base">
              Top 20 opportunities. Free. No signup.
            </p>
          </div>
        </header>

        {/* Game Grid - EXACT SAME STYLE AS MAIN PAGE */}
        <main className="w-full">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-matrix-green-dim">Loading live data...</div>
            </div>
          ) : (
            <div className="grid gap-4">
              {data?.top_opportunities?.slice(0, 20).map((game) => (
                <div
                  key={game.rank}
                  className={`matrix-card cursor-pointer ${
                    game.is_filtered ? 'border-red-500/50 bg-red-900/10' : ''
                  }`}
                  onClick={() => setSelectedGame(selectedGame?.rank === game.rank ? null : game)}
                >
                  {/* Warning Banner */}
                  {game.is_filtered && game.warning_text && (
                    <div className="bg-red-500/20 border border-red-500/40 rounded px-3 py-2 mb-3 flex items-center gap-2">
                      <span className="text-red-400 font-bold text-sm">AVOID</span>
                      <span className="text-red-300/80 text-xs">{game.warning_text}</span>
                      {game.discoverability_rating !== undefined && (
                        <span className="ml-auto text-red-400 font-bold text-sm">
                          {game.discoverability_rating}/10
                        </span>
                      )}
                    </div>
                  )}

                  {/* Game Card - EXACT SAME LAYOUT */}
                  <div className="flex gap-4">
                    {/* Box Art */}
                    {game.box_art_url && (
                      <div className="flex-shrink-0">
                        <img
                          src={game.box_art_url}
                          alt={game.game_name}
                          className="w-20 h-28 sm:w-28 sm:h-40 md:w-32 md:h-44 object-cover rounded border-2 border-matrix-green/50"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      {/* Header Row */}
                      <div className="flex items-start gap-2 mb-2">
                        {/* Rank */}
                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-matrix-green-bright flex-shrink-0">
                          #{game.rank}
                        </div>

                        {/* Title */}
                        <div className="flex-1 min-w-0">
                          <h2 className="text-base sm:text-xl md:text-2xl font-bold leading-tight break-words">
                            {game.game_name}
                          </h2>
                          <div className="text-xs sm:text-sm text-matrix-green-dim mt-1">
                            {game.total_viewers?.toLocaleString() || 0} viewers • {game.channels} channels
                          </div>
                          {/* Genre Tags */}
                          {game.genres && game.genres.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {game.genres.slice(0, 3).map(genre => (
                                <span
                                  key={genre}
                                  className="px-2 py-0.5 text-[10px] sm:text-xs rounded bg-matrix-green/10 text-matrix-green/70 border border-matrix-green/20"
                                >
                                  {genre}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Score */}
                        <div className="text-right flex-shrink-0 ml-2 pr-1">
                          <div className={`text-2xl sm:text-4xl md:text-5xl font-bold leading-none ${
                            game.is_filtered ? 'text-red-500' : getScoreColor(game.overall_score)
                          }`}>
                            {game.is_filtered && game.discoverability_rating !== undefined
                              ? `${game.discoverability_rating}/10`
                              : `${(game.overall_score * 10).toFixed(1)}/10`
                            }
                          </div>
                          <div className="text-[10px] sm:text-xs text-matrix-green-dim mt-1">
                            {game.is_filtered ? 'POOR' : game.trend}
                          </div>
                          <div className={`text-[8px] sm:text-[10px] leading-tight max-w-[80px] sm:max-w-none ${
                            game.is_filtered ? 'text-red-400' : 'text-matrix-green-dim'
                          }`}>
                            {game.is_filtered ? 'NOT RECOMMENDED' : game.recommendation}
                          </div>
                        </div>
                      </div>

                      {/* Links */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <a
                          href={getTwitchUrl(game.game_name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="matrix-button-small bg-purple-600 hover:bg-purple-700 border-purple-500 text-xs sm:text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          📺 Twitch
                        </a>
                        {game.purchase_links.steam && (
                          <a
                            href={game.purchase_links.steam}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="matrix-button-small text-xs sm:text-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            🎮 Steam
                          </a>
                        )}
                        {game.purchase_links.epic && (
                          <a
                            href={game.purchase_links.epic}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="matrix-button-small text-xs sm:text-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            🎮 Epic
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedGame?.rank === game.rank && (
                    <div className="mt-4 pt-4 border-t border-matrix-green/30">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="matrix-stat">
                          <div className="text-matrix-green-dim text-xs">DISCOVERABILITY</div>
                          <div className={`text-2xl font-bold ${getScoreColor(game.discoverability_score)}`}>
                            {(game.discoverability_score * 10).toFixed(1)}/10
                          </div>
                        </div>
                        <div className="matrix-stat">
                          <div className="text-matrix-green-dim text-xs">VIABILITY</div>
                          <div className={`text-2xl font-bold ${getScoreColor(game.viability_score)}`}>
                            {(game.viability_score * 10).toFixed(1)}/10
                          </div>
                        </div>
                        <div className="matrix-stat">
                          <div className="text-matrix-green-dim text-xs">ENGAGEMENT</div>
                          <div className={`text-2xl font-bold ${getScoreColor(game.engagement_score)}`}>
                            {(game.engagement_score * 10).toFixed(1)}/10
                          </div>
                        </div>
                        <div className="matrix-stat">
                          <div className="text-matrix-green-dim text-xs">AVG VIEWERS/CH</div>
                          <div className="text-2xl font-bold text-matrix-green">
                            {game.avg_viewers_per_channel.toFixed(1)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 text-sm text-matrix-green-dim text-center">
                        Click card again to collapse
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>

        {/* CTA */}
        <div className="text-center matrix-card mt-8">
          <h2 className="text-2xl font-bold mb-4 text-matrix-green">See All 500 Games</h2>
          <p className="text-matrix-green-dim mb-6">
            Filter by genre, search for specific games, get the full picture.
          </p>
          <Link
            href="/"
            className="inline-block matrix-button text-lg px-8 py-3"
          >
            GO TO STREAMSCOUT
          </Link>
        </div>

        {/* Footer - Same as Main */}
        <footer className="mt-12 pt-8 border-t border-matrix-green/30 text-center text-sm text-matrix-green-dim">
          <p>Built by <span className="text-matrix-green font-bold">DIGITALVOCALS</span></p>
          <p className="mt-2">Data auto-updates every 10 minutes • Powered by Twitch API</p>
          <div className="mt-4 flex justify-center gap-4">
            <Link href="/about" className="hover:text-matrix-green transition-colors">About</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-matrix-green transition-colors">Contact</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-matrix-green transition-colors">Privacy Policy</Link>
          </div>
          <p className="mt-4">© {new Date().getFullYear()} StreamScout. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}
