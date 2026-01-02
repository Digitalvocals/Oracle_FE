// US-073: Tailwind Config with Oracle's Design System
// Extends Tailwind with custom design tokens

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Oracle's Dark Professional palette
        'bg-primary': 'var(--bg-primary)',
        'bg-elevated': 'var(--bg-elevated)',
        'bg-hover': 'var(--bg-hover)',
        
        'brand-primary': 'var(--brand-primary)',
        'brand-secondary': 'var(--brand-secondary)',
        'brand-warning': 'var(--brand-warning)',
        'brand-danger': 'var(--brand-danger)',
        
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        
        'success': 'var(--success)',
        'info': 'var(--info)',
        'chart-rise': 'var(--chart-rise)',
        'chart-fall': 'var(--chart-fall)',
        'chart-stable': 'var(--chart-stable)',
      },
      fontSize: {
        'display': 'var(--text-display)',
        'h1': 'var(--text-h1)',
        'h2': 'var(--text-h2)',
        'body': 'var(--text-body)',
        'caption': 'var(--text-caption)',
        'mono': 'var(--text-mono)',
      },
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'full': 'var(--radius-full)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'glow': 'var(--shadow-glow)',
      },
    },
  },
  plugins: [],
}

export default config
