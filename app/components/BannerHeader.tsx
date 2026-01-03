import React from 'react';

export function BannerHeader() {
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
          background: 'linear-gradient(135deg, rgba(10,14,26,0.65) 0%, rgba(10,14,26,0.35) 50%, rgba(10,14,26,0.55) 100%)'
        }}
      />
      
      {/* Text Overlay */}
      <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 lg:px-20">
        <h1 
          className="text-4xl md:text-6xl lg:text-[80px] font-black tracking-[0.1em] uppercase text-white mb-2 md:mb-4 leading-none"
          style={{
            textShadow: `
              0 0 60px rgba(0,220,130,0.8),
              0 0 30px rgba(0,220,130,0.6),
              0 4px 12px rgba(0,0,0,0.9),
              0 2px 4px rgba(0,0,0,0.8),
              3px 3px 0px rgba(0,0,0,0.6),
              -2px -2px 0px rgba(0,0,0,0.4)
            `,
            WebkitTextStroke: '2px rgba(0,0,0,0.5)',
            paintOrder: 'stroke fill'
          }}
        >
          STREAMSCOUT
        </h1>
        
        <p 
          className="text-xs md:text-base lg:text-xl font-semibold tracking-[0.15em] uppercase text-gray-50"
          style={{
            textShadow: `
              0 3px 10px rgba(0,0,0,0.95),
              0 2px 6px rgba(0,0,0,0.9),
              2px 2px 0px rgba(0,0,0,0.7)
            `,
            WebkitTextStroke: '1px rgba(0,0,0,0.4)'
          }}
        >
          Find Your Audience. Grow Your Channel.
        </p>
      </div>
    </div>
  );
}
