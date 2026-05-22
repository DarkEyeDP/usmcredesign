import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { GridPulses } from './GridPulses';
import type { HeroVideo } from './types';

interface VideoPlayerProps {
  video: HeroVideo;
  onClose: () => void;
  nodeColors: readonly string[];
  slideKey: number;
  avoidHeader?: boolean;
}

export function VideoPlayer({ video, onClose, nodeColors: _nodeColors, slideKey: _slideKey, avoidHeader = false }: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const startParam = video.startSeconds ? `&start=${video.startSeconds}` : '';
  const src = `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&iv_load_policy=3&enablejsapi=1&origin=${encodeURIComponent(origin)}${startParam}`;

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Load YouTube IFrame API and auto-close when video ends
  useEffect(() => {
    const win = window as any;

    const attachPlayer = () => {
      if (!iframeRef.current || !win.YT?.Player) return;
      new win.YT.Player(iframeRef.current, {
        events: {
          onStateChange: (e: any) => {
            if (e.data === win.YT.PlayerState.ENDED) onClose();
          },
        },
      });
    };

    if (win.YT?.Player) {
      attachPlayer();
    } else {
      win.onYouTubeIframeAPIReady = attachPlayer;
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(s);
      }
    }
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[100]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Dark backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

      {/* Live grid streaks behind the player */}
      <GridPulses />

      {/* Static grid pattern on the backdrop */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Centered player card — z-20 sits above streaks (z-6) and nodes (z-7) */}
      <div
        className={`absolute inset-0 flex justify-center overflow-y-auto px-4 pb-6 ${avoidHeader ? 'items-start pt-24 md:px-8 md:pt-28' : 'items-center md:px-8'}`}
        style={{ zIndex: 20 }}
      >
        <motion.div
          className="relative w-full max-w-5xl"
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 12 }}
          transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
          onClick={e => e.stopPropagation()}
        >
          {/* Red top bar */}
          <div className="h-0.5 w-full bg-red-600" />

          {/* Header */}
          <div className="flex items-center justify-between bg-black border-x border-white/10 px-5 py-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                <span className="text-[10px] font-mono tracking-[0.3em] text-gray-500">{video.headerLabel}</span>
              </div>
              {video.headerMeta && (
                <>
                  <div className="h-3 w-px bg-white/10" />
                  <span className="text-[10px] font-mono tracking-[0.2em] text-gray-600">{video.headerMeta}</span>
                </>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-white transition-colors p-1"
              aria-label="Close video"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Video frame */}
          <div className="relative aspect-video bg-black border-x border-white/10">
            <iframe
              ref={iframeRef}
              src={src}
              title={video.subtitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>

          {/* Footer */}
          <div className="bg-black border border-white/10 border-t-white/6 px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-white font-black tracking-tight text-base leading-tight">
                  {video.title}<span className="text-red-600">.</span>
                </h2>
                <p className="text-[11px] font-mono tracking-[0.2em] text-gray-500 mt-1">
                  {video.subtitle}
                </p>
              </div>
              {video.year && (
                <div className="text-right flex-shrink-0">
                  <div className="text-[10px] font-mono tracking-widest text-gray-600">EST.</div>
                  <div className="text-white font-black text-lg leading-none tracking-tighter">{video.year}</div>
                </div>
              )}
            </div>
          </div>

          {/* Red bottom bar */}
          <div className="h-0.5 w-full bg-red-600/40" />
        </motion.div>
      </div>
    </motion.div>
  );
}
