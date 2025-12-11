import { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Best Survival Games to Stream | StreamScout',
  description: 'Find the best Survival games for small streamers. Discover games with high discoverability scores and low competition.',
  openGraph: {
    title: 'Best Survival Games to Stream | StreamScout',
    description: 'Discover Survival games with the best discoverability scores for small streamers.',
    url: 'https://streamscout.gg/best-survival-games-to-stream',
    type: 'website',
  },
}
export default function BestSurvivalGamesToStream() {
  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">Best Survival Games to Stream</h1>
        <p className="text-lg text-gray-300 mb-8">Discover Survival games with the highest discoverability scores for small streamers.</p>
        <div className="text-center py-12 bg-[#111] rounded-lg"><p className="text-gray-400">StreamScout game analyzer</p></div>
        <div className="mt-16 pt-8 border-t border-gray-800 text-gray-400 space-y-6"><h2 className="text-xl font-bold text-white">Why Survival Games?</h2><p>Survival games create tension and personal investment. StreamScout identifies which Survival titles have the best discoverability for building engaged communities.</p></div>
      </div>
    </div>
  )
}
