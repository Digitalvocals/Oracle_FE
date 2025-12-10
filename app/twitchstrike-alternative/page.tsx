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
        const response = await axios.get(`${API_URL}/api/v1/analyze?limit=15`)
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <Link href="/" className="inline-block mb-6 text-matrix-green hover:text-matrix-green-bright transition-colors">
            ← Back to StreamScout
          </Link>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-6 text-matrix-green-bright">
            Find Games Where Small Streamers Can Actually Compete
          </h1>

          {/* The Problem */}
          <div className="space-y-4 text-matrix-green-dim leading-relaxed mb-8">
            <p>
              Looking for a tool that tells you which games give small streamers a real shot at discovery?
            </p>
            
            <p>
              TwitchStrike used to do this. Good UI, solid recommendations. Then it went down. Been months. Still broken.
            </p>
            
            <p>
              If you're here, you already know that.
            </p>
          </div>

          {/* What Small Streamers Need */}
          <div className="matrix-card mb-8">
            <h2 className="text-xl font-bold mb-4 text-matrix-green">What Small Streamers Actually Need:</h2>
            <div className="space-y-2 text-matrix-green-dim">
              <p>• Which games have space for new faces</p>
              <p>• Where you won't get buried 10 pages deep</p>
              <p>• Real-time data, not yesterday's numbers</p>
              <p>• The "why" behind the scores</p>
            </div>
          </div>

          {/* What StreamScout Does */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-matrix-green">That's StreamScout.</h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="matrix-card">
                <h3 className="font-bold text-matrix-green mb-2">Live Data</h3>
                <p className="text-sm text-matrix-green-dim">
                  Updates every 10 minutes. Not daily snapshots. You see what's happening right now.
                </p>
              </div>
              
              <div className="matrix-card">
                <h3 className="font-bold text-matrix-green mb-2">500 Games Analyzed</h3>
                <p className="text-sm text-matrix-green-dim">
                  Not just the top 100. We dig deeper to find hidden opportunities most tools miss.
                </p>
              </div>
              
              <div className="matrix-card">
                <h3 className="font-bold text-matrix-green mb-2">Transparent Algorithm</h3>
                <p className="text-sm text-matrix-green-dim">
                  You see exactly why a game scores well: Discoverability (45%), Viability (35%), Engagement (20%).
                </p>
              </div>
              
              <div className="matrix-card">
                <h3 className="font-bold text-matrix-green mb-2">Warning System</h3>
                <p className="text-sm text-matrix-green-dim">
                  We don't hide oversaturated games. We show them with clear "AVOID" warnings so you don't waste time.
                </p>
              </div>
            </div>
          </div>

          {/* vs Other Tools */}
          <div className="matrix-card mb-8">
            <h2 className="text-xl font-bold mb-4 text-matrix-green">vs Other Tools:</h2>
            <div className="space-y-3 text-sm text-matrix-green-dim">
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
              <p className="text-matrix-green font-bold">
                StreamScout answers one question: "Which games give small streamers the best shot?"
              </p>
            </div>
          </div>

          {/* Live Data Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-matrix-green-bright mb-2">
              Live Opportunities (Updated {data ? new Date(data.timestamp).toLocaleTimeString() : 'Loading...'})
            </h2>
            <p className="text-matrix-green-dim">
              Top 15 opportunities right now. Free. No signup.
            </p>
          </div>
        </header>

        {/* Live Data */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-matrix-green-dim">Loading live data...</div>
          </div>
        ) : (
          <div className="space-y-4 mb-12">
            {data?.top_opportunities?.slice(0, 15).map((game) => (
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
                  </div>
                )}

                {/* Game Card */}
                <div className="flex gap-4">
                  {/* Box Art */}
                  {game.box_art_url && (
                    <div className="flex-shrink-0">
                      <img
                        src={game.box_art_url}
                        alt={game.game_name}
                        className="w-20 h-28 sm:w-24 sm:h-32 object-cover rounded border-2 border-matrix-green/50"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start gap-2 mb-2">
                      {/* Rank */}
                      <div className="text-2xl sm:text-3xl font-bold text-matrix-green-bright flex-shrink-0">
                        #{game.rank}
                      </div>

                      {/* Title */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold leading-tight break-words">
                          {game.game_name}
                        </h3>
                        <div className="text-xs sm:text-sm text-matrix-green-dim mt-1">
                          {game.total_viewers?.toLocaleString() || 0} viewers • {game.channels} channels
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right flex-shrink-0">
                        <div className={`text-3xl sm:text-4xl font-bold ${
                          game.is_filtered ? 'text-red-500' : getScoreColor(game.overall_score)
                        }`}>
                          {game.discoverability_rating !== undefined
                            ? `${game.discoverability_rating}/10`
                            : `${(game.overall_score * 10).toFixed(1)}/10`
                          }
                        </div>
                        <div className="text-xs text-matrix-green-dim mt-1">
                          {game.is_filtered ? 'POOR' : game.trend}
                        </div>
                      </div>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <a
                        href={getTwitchUrl(game.game_name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="matrix-button-small bg-purple-600 hover:bg-purple-700 border-purple-500 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        📺 Twitch
                      </a>
                      {game.purchase_links.steam && (
                        <a
                          href={game.purchase_links.steam}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="matrix-button-small text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          🎮 Steam
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
                        <div className={`text-xl font-bold ${getScoreColor(game.discoverability_score)}`}>
                          {(game.discoverability_score * 10).toFixed(1)}/10
                        </div>
                      </div>
                      <div className="matrix-stat">
                        <div className="text-matrix-green-dim text-xs">VIABILITY</div>
                        <div className={`text-xl font-bold ${getScoreColor(game.viability_score)}`}>
                          {(game.viability_score * 10).toFixed(1)}/10
                        </div>
                      </div>
                      <div className="matrix-stat">
                        <div className="text-matrix-green-dim text-xs">ENGAGEMENT</div>
                        <div className={`text-xl font-bold ${getScoreColor(game.engagement_score)}`}>
                          {(game.engagement_score * 10).toFixed(1)}/10
                        </div>
                      </div>
                      <div className="matrix-stat">
                        <div className="text-matrix-green-dim text-xs">AVG VIEWERS/CH</div>
                        <div className="text-xl font-bold text-matrix-green">
                          {game.avg_viewers_per_channel.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center matrix-card">
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

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-matrix-green/30 text-center text-sm text-matrix-green-dim">
          <p>Built by <span className="text-matrix-green font-bold">DIGITALVOCALS</span></p>
          <p className="mt-2">Data updates every 10 minutes • Powered by Twitch API</p>
          <div className="mt-4 flex justify-center gap-4">
            <Link href="/about" className="hover:text-matrix-green transition-colors">About</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-matrix-green transition-colors">Contact</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-matrix-green transition-colors">Privacy</Link>
          </div>
        </footer>
      </div>
    </div>
  )
}
