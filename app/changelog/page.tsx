'use client'

import Link from 'next/link'

interface ChangelogEntry {
  version: string
  date: string
  title: string
  added?: string[]
  changed?: string[]
  fixed?: string[]
}

const changelog: ChangelogEntry[] = [
  {
    version: "3.2.0",
    date: "December 14, 2025",
    title: "Massive Game Expansion & Historical Data",
    added: [
      "1,533 games now analyzed (up from 456) - find niche games and hidden gems",
      "Historical data collection - foundation for upcoming trend features",
      "13 genre landing pages - dedicated pages for Action, RPG, Horror, Sports, and more",
      "TwitchStrike Alternative page - for users migrating from the defunct tool",
      "Share buttons - share game opportunities to Twitter and Discord",
      "Game info expansion - IGDB, YouTube gameplay, and Wikipedia links on every card"
    ],
    changed: [
      "Backend optimization - refresh time reduced from 125s to 58s (54% faster)",
      "Dynamic batch processing - scales automatically as we add more games",
      "Improved score accuracy - more games means better market coverage",
      "Shows full spectrum of opportunities (including 5-6 score games) for honest assessment"
    ],
    fixed: [
      "API rate limiting issues with large game batches",
      "Cache validation for better data accuracy"
    ]
  },
  {
    version: "3.1.0",
    date: "December 10, 2025",
    title: "UI Polish & Game Info Update",
    added: [
      "Game Info links - Click any card to see IGDB, YouTube gameplay, and Wikipedia links",
      "Score tooltips - Hover over the ? icon to understand why a game has its score",
      "Metric explanations - Each metric (Discoverability, Viability, Engagement) now explains what it means",
      "This changelog page - Track what's new with StreamScout"
    ],
    changed: [
      "Completely redesigned UI with improved contrast and readability",
      "Platform buttons (Twitch/Steam/Epic) now have consistent styling",
      "Status pills redesigned to be less visually dominant",
      "Excellent Opportunity indicator now uses amber color for better visibility",
      "Improved text hierarchy throughout the interface"
    ],
    fixed: [
      "Text contrast issues - all text is now easily readable",
      "Icon consistency - all tooltip icons now use the same solid circle style",
      "Mobile responsiveness improvements"
    ]
  },
  {
    version: "3.0.0",
    date: "December 7, 2025",
    title: "Genre Filters & Algorithm Improvements",
    added: [
      "Genre filters - Filter games by RPG, FPS, Horror, and 17 other genres",
      "Game search - Find any game in our database instantly",
      "Warning system - Games with poor discoverability now show clear warnings",
      "500 games analyzed (up from 100)"
    ],
    changed: [
      "Improved scoring algorithm with three-component system (Discoverability, Viability, Engagement)",
      "Backend architecture rewrite for faster load times",
      "10-minute auto-refresh for real-time data"
    ]
  },
  {
    version: "2.0.0",
    date: "November 2025",
    title: "Public Launch",
    added: [
      "Core opportunity analyzer",
      "Real-time Twitch API integration",
      "Mobile-responsive design",
      "Steam and Epic store links"
    ]
  }
]

export default function ChangelogPage() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <Link href="/" className="text-matrix-green hover:text-matrix-green-bright transition-colors mb-4 inline-block">
            &larr; Back to StreamScout
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-matrix-green-bright mb-2">
            Changelog
          </h1>
          <p className="text-gray-400">
            What's new with StreamScout - updates, features, and improvements.
          </p>
        </header>

        {/* Changelog Entries */}
        <div className="space-y-8">
          {changelog.map((entry, index) => (
            <article 
              key={entry.version}
              className="matrix-card"
            >
              {/* Version Header */}
              <div className="flex flex-wrap items-baseline gap-3 mb-4">
                <span className="text-xl font-bold text-matrix-green-bright">
                  v{entry.version}
                </span>
                <span className="text-gray-500 text-sm">
                  {entry.date}
                </span>
                {index === 0 && (
                  <span className="px-2 py-0.5 bg-matrix-green/20 text-matrix-green text-xs rounded-full border border-matrix-green/30">
                    Latest
                  </span>
                )}
              </div>
              
              <h2 className="text-lg font-semibold text-white mb-4">
                {entry.title}
              </h2>

              {/* Added */}
              {entry.added && entry.added.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    Added
                  </h3>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    {entry.added.map((item, i) => (
                      <li key={i} className="pl-4">&bull; {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Changed */}
              {entry.changed && entry.changed.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                    Changed
                  </h3>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    {entry.changed.map((item, i) => (
                      <li key={i} className="pl-4">&bull; {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fixed */}
              {entry.fixed && entry.fixed.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    Fixed
                  </h3>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    {entry.fixed.map((item, i) => (
                      <li key={i} className="pl-4">&bull; {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="mt-8 p-6 border border-matrix-green/30 rounded-lg bg-matrix-green/5">
          <h3 className="text-lg font-semibold text-matrix-green-bright mb-2">Coming Soon</h3>
          <ul className="space-y-1 text-gray-300 text-sm">
            <li className="pl-4">&bull; Historical trend sparklines - see 7-day trends at a glance</li>
            <li className="pl-4">&bull; Best time to stream - recommendations based on historical data</li>
            <li className="pl-4">&bull; Real-time opportunity indicators - know when to go live</li>
          </ul>
          <p className="text-gray-500 text-xs mt-3">Target: December 19, 2025</p>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-matrix-green/30 text-center text-sm text-matrix-green-dim">
          <p>
            Have feedback or feature requests?{' '}
            <a href="mailto:digitalvocalstv@gmail.com" className="text-matrix-green hover:underline">
              Get in touch
            </a>
          </p>
          <div className="mt-4">
            <Link href="/" className="text-matrix-green hover:text-matrix-green-bright transition-colors">
              &larr; Back to StreamScout
            </Link>
          </div>
        </footer>
      </div>
    </div>
  )
}
