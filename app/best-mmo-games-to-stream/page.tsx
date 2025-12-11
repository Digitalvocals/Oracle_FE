import { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Best MMO Games to Stream | StreamScout',
  description: 'Find the best MMO games for small streamers. Discover games with high discoverability scores and low competition.',
  openGraph: {
    title: 'Best MMO Games to Stream | StreamScout',
    description: 'Discover MMO games with the best discoverability scores for small streamers.',
    url: 'https://streamscout.gg/best-mmo-games-to-stream',
    type: 'website',
  },
}
export default function BestMmoGamesToStream() {
  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">Best MMO Games to Stream</h1>
        <p className="text-lg text-gray-300 mb-8">Discover MMO games with the highest discoverability scores for small streamers.</p>
        <div className="text-center py-12 bg-[#111] rounded-lg"><p className="text-gray-400">StreamScout game analyzer</p></div>
        <div className="mt-16 pt-8 border-t border-gray-800 text-gray-400 space-y-6"><h2 className="text-xl font-bold text-white">Why MMO Games?</h2><p>MMOs create endless content with communities and shared worlds. StreamScout identifies which MMO titles have the best discoverability for growing streamers.</p></div>
      </div>
    </div>
  )
}
