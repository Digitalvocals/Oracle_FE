import { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Best Action Games to Stream | StreamScout',
  description: 'Find the best Action games for small streamers. Discover games with high discoverability scores and low competition.',
  openGraph: {
    title: 'Best Action Games to Stream | StreamScout',
    description: 'Discover Action games with the best discoverability scores for small streamers.',
    url: 'https://streamscout.gg/best-action-games-to-stream',
    type: 'website',
  },
}
export default function BestActionGamesToStream() {
  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">Best Action Games to Stream</h1>
        <p className="text-lg text-gray-300 mb-8">Discover Action games with the highest discoverability scores for small streamers.</p>
        <div className="text-center py-12 bg-[#111] rounded-lg"><p className="text-gray-400">StreamScout game analyzer</p></div>
        <div className="mt-16 pt-8 border-t border-gray-800 text-gray-400 space-y-6"><h2 className="text-xl font-bold text-white">Why Action Games?</h2><p>Action games create dynamic, exciting streams with fast-paced gameplay. StreamScout identifies which Action titles have the best discoverability beyond mega-franchises.</p></div>
      </div>
    </div>
  )
}
