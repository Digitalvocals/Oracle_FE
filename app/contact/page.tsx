'use client'

import Link from 'next/link'
import { BannerHeader } from '../components/BannerHeader'

export default function Contact() {
  return (
    <main className="min-h-screen bg-bg-primary p-4 md:p-8">
      <BannerHeader />

      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-brand-primary hover:text-brand-primary/80 mb-8 inline-block">
          &larr; Back to StreamScout
        </Link>

        <h1 className="text-3xl font-bold text-text-primary mb-6">Contact Us</h1>

        <div className="space-y-6 text-text-secondary">
          <section>
            <p className="text-lg">
              Have questions, feedback, or suggestions? We'd love to hear from you!
            </p>
          </section>

          <section className="bg-bg-elevated border border-brand-primary/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Get in Touch</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-text-primary mb-1">General Inquiries</h3>
                <a
                  href="mailto:hello@streamscout.gg"
                  className="text-brand-primary hover:underline text-lg"
                >
                  hello@streamscout.gg
                </a>
              </div>

              <div>
                <h3 className="font-semibold text-text-primary mb-1">Privacy Concerns</h3>
                <a
                  href="mailto:privacy@streamscout.gg"
                  className="text-brand-primary hover:underline text-lg"
                >
                  privacy@streamscout.gg
                </a>
              </div>

              <div>
                <h3 className="font-semibold text-text-primary mb-1">Bug Reports & Feature Requests</h3>
                <a
                  href="mailto:feedback@streamscout.gg"
                  className="text-brand-primary hover:underline text-lg"
                >
                  feedback@streamscout.gg
                </a>
              </div>
            </div>
          </section>

          <section className="bg-bg-elevated border border-bg-hover rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-2">Connect With Us</h2>
            <div className="space-y-2">
              <p>
                <strong className="text-brand-primary">Twitch:</strong>{' '}
                <a
                  href="https://twitch.tv/DigitalVocals"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-primary hover:underline"
                >
                  twitch.tv/DigitalVocals
                </a>
              </p>
              <p>
                <strong className="text-brand-primary">Twitter/X:</strong>{' '}
                <a
                  href="https://twitter.com/StreamScoutGG"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-primary hover:underline"
                >
                  @StreamScoutGG
                </a>
              </p>
            </div>
          </section>

          <section className="bg-bg-elevated border border-bg-hover rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-2">Response Time</h2>
            <p>
              We typically respond to emails within 24-48 hours. For urgent issues,
              reach out on Twitter for a faster response.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
