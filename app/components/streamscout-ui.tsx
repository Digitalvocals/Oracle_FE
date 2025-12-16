// StreamScout UI Components
// Updated: Dec 16, 2025 - Added Smart Purchase Links (US-028)

import React from 'react';

// ============================================================================
// PURCHASE / DOWNLOAD BUTTONS
// ============================================================================

// ------- Steam Button (Modified - added isFree + url props) -------
interface SteamButtonProps {
  gameName?: string;    // For search URL (fallback)
  url?: string;         // Direct URL (preferred)
  isFree?: boolean;
}

export function SteamButton({ gameName, url, isFree = false }: SteamButtonProps) {
  const href = url || `https://store.steampowered.com/search/?term=${encodeURIComponent(gameName || '')}`;
  
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1b2838] hover:bg-[#2a475e] text-white text-sm font-medium rounded transition-colors"
    >
      {isFree ? 'Play Free' : 'Buy'} on Steam
    </a>
  );
}

// ------- Epic Button (Modified - added isFree + url props) -------
interface EpicButtonProps {
  gameName?: string;    // For search URL (fallback)
  url?: string;         // Direct URL (preferred)
  isFree?: boolean;
}

export function EpicButton({ gameName, url, isFree = false }: EpicButtonProps) {
  const href = url || `https://store.epicgames.com/browse?q=${encodeURIComponent(gameName || '')}`;
  
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#313131] hover:bg-[#414141] text-white text-sm font-medium rounded transition-colors"
    >
      {isFree ? 'Play Free' : 'Buy'} on Epic
    </a>
  );
}

// ------- Battle.net Button (NEW) -------
interface BattleNetButtonProps {
  url: string;
  isFree?: boolean;
}

export function BattleNetButton({ url, isFree = false }: BattleNetButtonProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00AEFF] hover:bg-[#0095DD] text-white text-sm font-medium rounded transition-colors"
    >
      {isFree ? 'Play Free' : 'Get'} on Battle.net
    </a>
  );
}

// ------- Riot Button (NEW) -------
interface RiotButtonProps {
  url: string;
  isFree?: boolean;
}

export function RiotButton({ url, isFree = false }: RiotButtonProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D13639] hover:bg-[#B12D30] text-white text-sm font-medium rounded transition-colors"
    >
      {isFree ? 'Play Free' : 'Get'} on Riot
    </a>
  );
}

// ------- Official Site Button (NEW) -------
interface OfficialButtonProps {
  url: string;
  isFree?: boolean;
}

export function OfficialButton({ url, isFree = false }: OfficialButtonProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium rounded transition-colors"
    >
      {isFree ? 'Play Free' : 'Buy'} - Official Site
    </a>
  );
}

// ============================================================================
// PLATFORM BUTTONS
// ============================================================================

interface TwitchButtonProps {
  gameName: string;
}

export function TwitchButton({ gameName }: TwitchButtonProps) {
  const url = `https://www.twitch.tv/directory/category/${encodeURIComponent(gameName)}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded transition-colors"
    >
      Watch on Twitch
    </a>
  );
}

interface YouTubeButtonProps {
  gameName: string;
  searchType?: string;
}

export function YouTubeButton({ gameName, searchType = "gameplay" }: YouTubeButtonProps) {
  const query = `${gameName} ${searchType}`;
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
    >
      Watch on YouTube
    </a>
  );
}

// ============================================================================
// SHARE BUTTON
// ============================================================================

interface ShareButtonProps {
  gameName: string;
  score: number;
  viewers: number;
  channels: number;
}

export function ShareButton({ gameName, score, viewers, channels }: ShareButtonProps) {
  const ratio = (viewers / channels).toFixed(1);
  const text = `Found a streaming opportunity: ${gameName} - ${score}/10 discoverability (${viewers} viewers, ${channels} channels, ${ratio} ratio) via @StreamScoutGG`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=https://streamscout.gg`;
  
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded transition-colors"
    >
      Share
    </a>
  );
}

// ============================================================================
// GENERIC BUTTON
// ============================================================================

interface MatrixButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function MatrixButton({ onClick, children, variant = 'primary' }: MatrixButtonProps) {
  const baseClasses = "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded transition-colors";
  const variantClasses = variant === 'primary'
    ? "bg-green-600 hover:bg-green-700 text-white"
    : "bg-slate-700 hover:bg-slate-600 text-white";
  
  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses}`}
    >
      {children}
    </button>
  );
}

// ============================================================================
// TOOLTIPS
// ============================================================================

interface InfoTooltipProps {
  content: string;
}

export function InfoTooltip({ content }: InfoTooltipProps) {
  return (
    <span className="group relative inline-block cursor-help">
      <span className="text-gray-400 hover:text-gray-300">ⓘ</span>
      <span className="invisible group-hover:visible absolute left-0 bottom-full mb-2 w-64 p-2 bg-slate-800 text-white text-xs rounded shadow-lg z-10">
        {content}
      </span>
    </span>
  );
}

interface MetricTooltipProps {
  value: number | string;
  label: string;
  explanation: string;
}

export function MetricTooltip({ value, label, explanation }: MetricTooltipProps) {
  return (
    <span className="group relative inline-block cursor-help">
      <span className="text-green-400 font-semibold">{value}</span>
      <span className="invisible group-hover:visible absolute left-0 bottom-full mb-2 w-64 p-2 bg-slate-800 text-white text-xs rounded shadow-lg z-10">
        <strong>{label}:</strong> {explanation}
      </span>
    </span>
  );
}

// ============================================================================
// HISTORICAL FEATURES (US-006, US-007, US-018)
// ============================================================================

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
}

export function Sparkline({ data, width = 120, height = 40 }: SparklineProps) {
  if (!data || data.length === 0) return null;
  
  const min = 0;
  const max = 10;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / (max - min)) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke="#00ff00"
        strokeWidth="2"
      />
    </svg>
  );
}

interface TrendArrowProps {
  trend: 'up' | 'down' | 'stable';
  magnitude: number;
}

export function TrendArrow({ trend, magnitude }: TrendArrowProps) {
  const arrows = {
    up: '↗',
    down: '↘',
    stable: '→'
  };
  
  const colors = {
    up: 'text-green-400',
    down: 'text-red-400',
    stable: 'text-gray-400'
  };
  
  const percentage = trend !== 'stable' && magnitude != null && magnitude !== 0
    ? ` ${magnitude >= 0 ? '+' : ''}${magnitude.toFixed(1)}%`
    : '';
  
  const labels = {
    up: 'TRENDING UP',
    down: 'TRENDING DOWN',
    stable: 'STABLE'
  };
  
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${colors[trend]}`}>
      <span className="text-lg">{arrows[trend]}</span>
      <span>{labels[trend]}{percentage}</span>
    </span>
  );
}

interface BestTimeDisplayProps {
  timeBlock: string;
  status: 'good' | 'ok' | 'avoid';
}

export function BestTimeDisplay({ timeBlock, status }: BestTimeDisplayProps) {
  // Convert "08-12" to "8 AM - 12 PM PST"
  const [start, end] = timeBlock.split('-').map(Number);
  const formatHour = (h: number) => {
    if (h === 0) return '12 AM';
    if (h < 12) return `${h} AM`;
    if (h === 12) return '12 PM';
    return `${h - 12} PM`;
  };
  
  const timeRange = `${formatHour(start)} - ${formatHour(end)} PST`;
  
  const statusColors = {
    good: 'text-green-400',
    ok: 'text-yellow-400',
    avoid: 'text-red-400'
  };
  
  return (
    <span className={`text-sm font-medium ${statusColors[status]}`}>
      BEST TIME: {timeRange}
    </span>
  );
}

// ============================================================================
// URL HELPERS
// ============================================================================

export const urls = {
  twitch: (gameName: string) => 
    `https://www.twitch.tv/directory/category/${encodeURIComponent(gameName)}`,
  
  steam: (gameName: string) => 
    `https://store.steampowered.com/search/?term=${encodeURIComponent(gameName)}`,
  
  epic: (gameName: string) => 
    `https://store.epicgames.com/browse?q=${encodeURIComponent(gameName)}`,
  
  igdb: (gameName: string) => 
    `https://www.igdb.com/search?q=${encodeURIComponent(gameName)}`,
  
  youtube: (gameName: string, type = 'gameplay') => 
    `https://www.youtube.com/results?search_query=${encodeURIComponent(`${gameName} ${type}`)}`,
  
  wikipedia: (gameName: string) => 
    `https://en.wikipedia.org/wiki/${encodeURIComponent(gameName.replace(/ /g, '_'))}`,
};
