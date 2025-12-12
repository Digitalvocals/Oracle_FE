import { Metadata } from 'next'
import Link from 'next/link'
import GENRE_INSIGHTS from './genre-insights'

// This template is for: best-sports-games-to-stream
const GENRE_KEY = 'sports' // e.g., 'fps', 'horror', 'rpg'
const GENRE_DISPLAY = GENRE_INSIGHTS[GENRE_KEY].display
const API_URL = 'https://web-production-90f4a9.up.railway.app/api/v1/analyze?limit=500'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Best ${GENRE_DISPLAY} Games to Stream on Twitch in 2025 | StreamScout`,
    description: `Discover the best ${GENRE_DISPLAY} games for growing your Twitch channel. Find hidden gems with high viewer potential and low competition. Free game discoverability tool.`,
    keywords: `${GENRE_DISPLAY} games to stream, best ${GENRE_DISPLAY} Twitch games, ${GENRE_DISPLAY} streaming opportunities, grow Twitch channel`,
    openGraph: {
      title: `Best ${GENRE_DISPLAY} Games to Stream on Twitch`,
      description: `Find ${GENRE_DISPLAY} games where small streamers can actually get discovered`,
      url: `https://streamscout.gg/best-sports-games-to-stream`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Best ${GENRE_DISPLAY} Games to Stream`,
      description: `${GENRE_DISPLAY} game recommendations for Twitch growth`,
    }
  }
}

async function fetchGameData() {
  try {
    const res = await fetch(API_URL, {
      next: { revalidate: 600 } // Revalidate every 10 minutes
    })
    
    if (!res.ok) {
      throw new Error('Failed to fetch game data')
    }
    
    const data = await res.json()
    return data.top_opportunities || []
  } catch (error) {
    console.error('Error fetching game data:', error)
    return []
  }
}

// Helper to check if game matches this genre
function matchesGenre(game: any): boolean {
  if (!game.genres || !Array.isArray(game.genres)) return false
  
  // Genre matching logic - adjust based on actual API genre values
  const genreKeywords: Record<string, string[]> = {
    'fps': ['FPS', 'First-Person Shooter', 'Shooter'],
    'horror': ['Horror', 'Survival Horror'],
    'rpg': ['RPG', 'Role-Playing', 'JRPG', 'MMORPG'],
    'battle-royale': ['Battle Royale', 'BR'],
    'moba': ['MOBA', 'Multiplayer Online Battle Arena'],
    'strategy': ['Strategy', 'RTS', 'Turn-Based Strategy', 'Grand Strategy'],
    'survival': ['Survival', 'Survival Craft'],
    'indie': ['Indie', 'Independent'],
    'mmo': ['MMO', 'MMORPG', 'Massively Multiplayer'],
    'simulation': ['Simulation', 'Sim', 'Life Simulation'],
    'action': ['Action', 'Action-Adventure', 'Hack and Slash'],
    'sports': ['Sports', 'Racing', 'Sports Game']
  }
  
  const keywords = genreKeywords[GENRE_KEY] || []
  return game.genres.some((genre: string) => 
    keywords.some(keyword => 
      genre.toLowerCase().includes(keyword.toLowerCase())
    )
  )
}

export default async function BestGenreGamesToStream() {
  const insights = GENRE_INSIGHTS[GENRE_KEY]
  const allGames = await fetchGameData()
  
  // Filter games by this genre
  const genreGames = allGames.filter(matchesGenre)
  
  // Split into good and bad opportunities
  const goodGames = genreGames.filter((g: any) => g.overall_score >= 6.0).slice(0, 10)
  const badGames = genreGames.filter((g: any) => g.overall_score < 4.0).slice(0, 10)
  
  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0f1419]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-green-400 hover:text-green-300 transition-colors">
            StreamScout
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Best {GENRE_DISPLAY} Games to Stream on Twitch
          </h1>
          <p className="text-xl text-gray-300">
            Find {GENRE_DISPLAY} games where small streamers can actually get discovered. 
            Real-time discoverability scores and competition analysis.
          </p>
        </div>

        {/* StreamScout CTA */}
        <div className="mb-12 p-6 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-lg">
          <h2 className="text-2xl font-bold text-green-400 mb-3">
            Want to analyze ALL games in real-time?
          </h2>
          <p className="text-gray-300 mb-4">
            StreamScout shows live discoverability scores for 450+ games across all genres. 
            Free, instant, no signup required.
          </p>
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
          >
            Try StreamScout Free →
          </Link>
        </div>

        {/* Insights Section */}
        <div className="space-y-8 mb-12">
          <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">The Challenge</h2>
            <div className="text-gray-300 whitespace-pre-line leading-relaxed">
              {insights.challenge}
            </div>
          </div>

          <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">The Opportunity</h2>
            <div className="text-gray-300 whitespace-pre-line leading-relaxed">
              {insights.opportunity}
            </div>
          </div>

          <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">What Actually Works</h2>
            <div className="text-gray-300 whitespace-pre-line leading-relaxed">
              {insights.advice}
            </div>
          </div>
        </div>

        {/* Good Games Section */}
        {goodGames.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-green-400 mb-6">
              Strong {GENRE_DISPLAY} Opportunities (Score ≥ 6.0)
            </h2>
            <div className="grid gap-4">
              {goodGames.map((game: any) => (
                <div key={game.game_name} className="bg-[#1a1f2e] border border-green-500/30 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-white">{game.game_name}</h3>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                      Score: {game.overall_score.toFixed(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Viewers</div>
                      <div className="text-white font-semibold">{game.total_viewers.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Channels</div>
                      <div className="text-white font-semibold">{game.channels.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Avg/Channel</div>
                      <div className="text-white font-semibold">{game.avg_viewers_per_channel.toFixed(1)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bad Games Section */}
        {badGames.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-red-400 mb-6">
              {GENRE_DISPLAY} Games to Avoid (Score &lt; 4.0)
            </h2>
            <p className="text-gray-400 mb-4">
              These games have brutal competition. Unless you're already established, growth will be extremely difficult.
            </p>
            <div className="grid gap-4">
              {badGames.map((game: any) => (
                <div key={game.game_name} className="bg-[#1a1f2e] border border-red-500/30 rounded-lg p-6 opacity-75">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-white">{game.game_name}</h3>
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-semibold">
                      Score: {game.overall_score.toFixed(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Viewers</div>
                      <div className="text-white font-semibold">{game.total_viewers.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Channels</div>
                      <div className="text-white font-semibold">{game.channels.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Avg/Channel</div>
                      <div className="text-white font-semibold">{game.avg_viewers_per_channel.toFixed(1)}</div>
                    </div>
                  </div>
                  {game.warning_text && (
                    <div className="mt-3 text-sm text-red-400">
                      ⚠️ {game.warning_text}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Games Message */}
        {genreGames.length === 0 && (
          <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg p-8 text-center">
            <p className="text-gray-400 text-lg">
              No {GENRE_DISPLAY} games currently streaming. Check back later or try the full analyzer.
            </p>
            <Link 
              href="/"
              className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
            >
              View All Games
            </Link>
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-12 p-6 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Ready to Find Your Perfect Game?
          </h2>
          <p className="text-gray-300 mb-4">
            StreamScout analyzes 450+ games in real-time. Free forever, no signup required.
          </p>
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
          >
            Launch StreamScout →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center text-gray-400">
            <p className="mb-2">StreamScout - Find games where small streamers can actually get discovered</p>
            <p className="text-sm">Data updates every 10 minutes • Free forever • No signup required</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
