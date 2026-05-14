import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Maximize2, Minimize2 } from 'lucide-react';
import { GridPulses } from './GridPulses';
import { GridNodes } from './GridNodes';
import { VideoPlayer } from './VideoPlayer';
import { getHeroSlides, SLIDE_DURATION } from './heroSlides';
import { getVideoById, getDefaultVideo } from './heroVideos';

interface HeroSectionProps {
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function HeroSection({ isFullscreen = false, onToggleFullscreen }: HeroSectionProps) {
  const [slides] = useState(() => getHeroSlides());
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const carouselPaused = paused || videoOpen;

  useEffect(() => {
    if (carouselPaused) return;
    const id = setInterval(() => setCurrent(c => (c + 1) % slides.length), SLIDE_DURATION);
    return () => clearInterval(id);
  }, [carouselPaused, slides.length]);

  const slide = slides[current];
  const headingLines = slide.heading;
  const finalHeadingLine = headingLines[headingLines.length - 1];
  const finalHeadingText = finalHeadingLine.replace(/[,.]$/, '');
  const finalHeadingPunctuation = finalHeadingLine.match(/[,.]$/)?.[0];

  // Preload next two images so cross-fades never wait on a network/decode stall
  useEffect(() => {
    [1, 2].forEach(offset => {
      const img = new window.Image();
      img.src = slides[(current + offset) % slides.length].image as string;
    });
  }, [current, slides]);

  // Resolve which video to show: slide-specific → default
  const activeVideo = (slide.videoId ? getVideoById(slide.videoId) : undefined) ?? getDefaultVideo();

  return (
    <div className="relative h-[52svh] min-h-[420px] overflow-hidden md:h-screen md:min-h-0" style={{ contain: 'layout style paint' }}>

      {/* Sliding images — cinematic dissolve cross-fade */}
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={current}
          className="absolute inset-0"
          style={{ willChange: 'opacity' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.img
            src={slide.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: 'center', willChange: 'transform' }}
            initial={{ scale: 1.06, x: current % 2 === 0 ? 12 : -12, y: current % 3 === 0 ? 8 : -8 }}
            animate={{ scale: 1.0, x: 0, y: 0 }}
            transition={{ duration: SLIDE_DURATION / 1000, ease: 'linear' }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Static gradient layers — light/shadow structure never changes */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.80) 30%, rgba(0,0,0,0.28) 65%, rgba(0,0,0,0.12) 100%)'
      }} />
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.40) 28%, transparent 55%)'
      }} />
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, transparent 30%)'
      }} />

      {/* Per-slide color grade — dissolves with slide */}
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={`grade-${current}`}
          className="absolute inset-0 pointer-events-none"
          style={{ background: slide.colorGrade, willChange: 'opacity' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.2, ease: [0.4, 0, 0.2, 1] }}
        />
      </AnimatePresence>
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={`sweep-${current}`}
          className="absolute inset-0 pointer-events-none"
          style={{ background: slide.sweep, willChange: 'opacity' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.2, ease: [0.4, 0, 0.2, 1] }}
        />
      </AnimatePresence>

      {/* Tactical grid */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />
      <GridPulses />
      {!videoOpen && <GridNodes nodeColors={slide.nodeColors} slideKey={current} />}

      {/* Red accent line right edge */}
      <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-red-600/40" />

      {/* Progress bar */}
      {!videoOpen && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10 z-20">
          <motion.div
            key={current}
            className="h-full bg-red-600"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: SLIDE_DURATION / 1000, ease: 'linear' }}
          />
        </div>
      )}

      {/* Fullscreen toggle — desktop only */}
      {onToggleFullscreen && (
        <button
          onClick={onToggleFullscreen}
          className={`hidden lg:flex absolute bottom-4 right-4 z-20 items-center justify-center w-7 h-7 transition-colors ${isFullscreen ? 'text-red-500 hover:text-red-400' : 'text-gray-700 hover:text-gray-400'}`}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      )}

      {/* Slide dot indicators */}
      <div className="hidden md:flex absolute bottom-8 left-8 items-center gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); setPaused(true); setTimeout(() => setPaused(false), 12000); }}
            aria-label={`Slide ${i + 1}`}
            className="p-1 group"
          >
            <div className={`transition-all duration-300 rounded-full ${i === current ? 'w-4 h-1 bg-white' : 'w-1 h-1 bg-white/30 group-hover:bg-white/60'}`} />
          </button>
        ))}
      </div>

      {/* WATCH button — shows the active slide's video (or default) */}
      <button
        onClick={() => setVideoOpen(true)}
        className={`hidden md:flex absolute ${isFullscreen ? 'top-8' : 'top-28'} right-8 z-20 border border-white/10 bg-black/50 hover:bg-black/70 hover:border-white/20 p-3 items-center gap-3 w-64 transition-all duration-300 group text-left`}
      >
        <div className="w-10 h-10 rounded-full border border-white/40 group-hover:border-red-600/70 flex items-center justify-center flex-shrink-0 transition-colors duration-300">
          <Play className="w-4 h-4 text-white ml-0.5 group-hover:text-red-400 transition-colors duration-300" fill="currentColor" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-gray-500 tracking-widest font-mono">WATCH</div>
          <div className="mt-1 text-sm text-white font-black tracking-wide leading-tight">{activeVideo.title}</div>
          <div className="mt-1 text-[11px] text-gray-500 font-mono leading-snug">{activeVideo.subtitle}</div>
        </div>
      </button>

      {/* Hero text — animates per slide */}
      <div className="relative z-10 flex flex-col justify-center h-full px-6 md:px-8 max-w-4xl">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
          >
            <div className="text-sm text-gray-400 font-mono tracking-[0.3em] mb-3">{slide.label}</div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-4 leading-[0.9]">
              {headingLines.slice(0, -1).map((line, index) => (
                <span key={`${line}-${index}`}>
                  {line}
                  <br />
                </span>
              ))}
              {finalHeadingText}
              {finalHeadingPunctuation ? <span className="text-red-600">{finalHeadingPunctuation}</span> : null}
            </h1>
            <p className="text-sm text-gray-400 mb-8 tracking-wide max-w-xs md:max-w-sm">
              {slide.sub[0]}<span className="text-red-600">.</span><br />{slide.sub[1]}<span className="text-red-600">.</span>
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Video player modal */}
      <AnimatePresence>
        {videoOpen && (
          <VideoPlayer
            video={activeVideo}
            onClose={() => setVideoOpen(false)}
            nodeColors={slide.nodeColors}
            slideKey={current}
            avoidHeader={!isFullscreen}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
