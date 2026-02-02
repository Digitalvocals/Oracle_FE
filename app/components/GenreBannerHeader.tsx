import React from 'react';
import Link from 'next/link';

interface GenreBannerHeaderProps {
  genre: string;
  subtitle?: string;
}

export function GenreBannerHeader({ genre, subtitle }: GenreBannerHeaderProps) {
  return (
    <div className="relative w-full max-w-[1400px] mx-auto rounded-xl overflow-hidden shadow-2xl mb-8">
      {/* Background Image */}
      <img
        src="/images/banner-bg.png"
        alt="StreamScout"
        className="w-full h-auto block"
      />

      {/* Dark Gradient Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(10,14,26,0.75) 0%, rgba(10,14,26,0.45) 50%, rgba(10,14,26,0.65) 100%)'
        }}
      />

      {/* Text Overlay */}
      <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 lg:px-20">
        {/* StreamScout Logo Link */}
        <Link href="/" className="mb-2">
          <span
            className="text-2xl md:text-4xl lg:text-5xl font-black tracking-[0.1em] uppercase text-white hover:text-brand-primary transition-colors"
            style={{
              textShadow: `
                0 0 40px rgba(0,220,130,0.6),
                0 0 20px rgba(0,220,130,0.4),
                0 3px 8px rgba(0,0,0,0.9)
              `
            }}
          >
            STREAMSCOUT
          </span>
        </Link>

        {/* Genre Title */}
        <h1
          className="text-3xl md:text-5xl lg:text-6xl font-black tracking-wide text-white mb-2 md:mb-4 leading-tight"
          style={{
            textShadow: `
              0 0 60px rgba(0,220,130,0.8),
              0 0 30px rgba(0,220,130,0.6),
              0 4px 12px rgba(0,0,0,0.9),
              0 2px 4px rgba(0,0,0,0.8)
            `
          }}
        >
          Best {genre} Games to Stream
        </h1>

        <p
          className="text-xs md:text-base lg:text-lg font-semibold tracking-wide text-gray-100"
          style={{
            textShadow: `
              0 3px 10px rgba(0,0,0,0.95),
              0 2px 6px rgba(0,0,0,0.9)
            `
          }}
        >
          {subtitle || `Find ${genre} games where small streamers can actually get discovered.`}
        </p>
      </div>
    </div>
  );
}
