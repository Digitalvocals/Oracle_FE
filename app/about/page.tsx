'use client'

import Link from 'next/link'
import { BannerHeader } from '../components/BannerHeader'

export default function About() {
  return (
    <main className="min-h-screen bg-bg-primary p-4 md:p-8">
      <BannerHeader />

      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-brand-primary hover:text-brand-primary/80 mb-8 inline-block">
          &larr; Back to StreamScout
        </Link>

        <h1 className="text-3xl font-bold text-text-primary mb-6">About StreamScout</h1>

        <div className="space-y-6 text-text-secondary">
          <section className="bg-bg-elevated border border-bg-hover rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-2">What is StreamScout?</h2>
            <p>
              StreamScout is a free tool that helps small streamers find games with
              good discoverability potential on Twitch. We analyze 500+ games every
              10 minutes and rank them by opportunity score - helping you find games
              where you can actually get noticed.
            </p>
          </section>

          <section className="bg-bg-elevated border border-bg-hover rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-2">Why We Built This</h2>
            <p>
              As a small streamer, you've probably heard the advice: "don't stream
              oversaturated games." But which games <em className="text-brand-primary">should</em> you stream? That's
              the question StreamScout answers.
            </p>
            <p className="mt-2">
              We built this tool to solve our own problem - and decided to share it
              with the streaming community for free.
            </p>
          </section>

          <section className="bg-bg-elevated border border-bg-hover rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-2">How It Works</h2>
            <p className="mb-2">Our algorithm considers three factors:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong className="text-brand-primary">Discoverability</strong> - Can viewers actually find you in this category?</li>
              <li><strong className="text-brand-primary">Viability</strong> - Is there enough viewership to be worth streaming?</li>
              <li><strong className="text-brand-primary">Engagement</strong> - Are viewers actively watching, or just lurking?</li>
            </ul>
            <p className="mt-2">
              We combine these into an overall opportunity score, updated every 10 minutes
              with live Twitch data.
            </p>
          </section>

          <section className="bg-bg-elevated border border-bg-hover rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-2">Our Values</h2>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong className="text-brand-primary">Free forever</strong> - No paywalls, no premium tiers</li>
              <li><strong className="text-brand-primary">No signup required</strong> - Just visit and use it</li>
              <li><strong className="text-brand-primary">Transparent</strong> - See all the data, not just what we pick for you</li>
              <li><strong className="text-brand-primary">Privacy-first</strong> - We don't collect your personal information</li>
            </ul>
          </section>

          <section className="bg-bg-elevated border border-bg-hover rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-2">About the Creator</h2>
            <p>
              StreamScout was created by a fellow streamer who wanted to make
              discoverability data accessible to everyone - not just those who can
              afford expensive analytics tools.
            </p>
            <p className="mt-2">
              Find me on Twitch:{' '}
              <a
                href="https://twitch.tv/DigitalVocals"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary hover:underline"
              >
                twitch.tv/DigitalVocals
              </a>
            </p>
          </section>

          <section className="bg-bg-elevated border border-bg-hover rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-2">Feedback & Suggestions</h2>
            <p>
              Have ideas for new features? Found a bug? We'd love to hear from you:{' '}
              <a href="mailto:hello@streamscout.gg" className="text-brand-primary hover:underline">
                hello@streamscout.gg
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
