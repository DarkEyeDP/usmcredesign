import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const COLORS = [
  '#22c55e',
  '#4ade80',
  '#dc2626',
  '#ef4444',
  'rgba(212,173,93,1)',
  'rgba(255,244,214,1)',
  '#eab308',
  '#f59e0b',
  '#fcd34d',
];
const DESKTOP_PARTICLE_COUNT = 42;
const MOBILE_PARTICLE_COUNT = 24;
const REDUCED_MOTION_PARTICLE_COUNT = 14;
const OVERLAY_DURATION_MS = 4800;
const FOOTER_LINES = [
  'Rah responsibly.',
  'No page 11 entry generated.',
  'This celebration is non-binding.',
  'Motivation level: administratively significant.',
  'S-1 has been notified emotionally.',
  'One row. Many feelings.',
];

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  width: number;
  height: number;
  rotation: number;
  rotationSpeed: number;
  age: number;
  ttl: number;
  delay: number;
}

function makeParticles(width: number, height: number, prefersReducedMotion: boolean): ConfettiParticle[] {
  const isMobile = width < 768;
  const particleCount = prefersReducedMotion
    ? REDUCED_MOTION_PARTICLE_COUNT
    : isMobile
      ? MOBILE_PARTICLE_COUNT
      : DESKTOP_PARTICLE_COUNT;

  return Array.from({ length: particleCount }, () => {
    const initialY = prefersReducedMotion
      ? height * (0.18 + Math.random() * 0.64)
      : -16 - Math.random() * 96;

    return {
      x: width * Math.random(),
      y: initialY,
      vx: prefersReducedMotion ? 0 : (Math.random() - 0.5) * (isMobile ? 44 : 70),
      vy: prefersReducedMotion ? 0 : 180 + Math.random() * 130,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      width: Math.random() * 6 + 4,
      height: Math.random() > 0.45 ? Math.random() * 6 + 4 : Math.random() * 12 + 6,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: prefersReducedMotion ? 0 : (Math.random() > 0.5 ? 1 : -1) * (2.4 + Math.random() * 4),
      age: 0,
      ttl: prefersReducedMotion ? 1200 + Math.random() * 450 : 2500 + Math.random() * 1300,
      delay: prefersReducedMotion ? Math.random() * 120 : Math.random() * 280,
    };
  });
}

interface Props {
  onDone: () => void;
}

// Mounted fresh for every celebration (parent keys each instance with a unique ID).
// Particles are generated at mount time so every trigger gets a new set.
export function CelebrationOverlay({ onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [footerLine] = useState(() => FOOTER_LINES[Math.floor(Math.random() * FOOTER_LINES.length)]);

  useEffect(() => {
    const t = setTimeout(onDone, OVERLAY_DURATION_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animationFrame = 0;
    let lastTime = performance.now();
    let particles: ConfettiParticle[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = makeParticles(width, height, prefersReducedMotion);
    };

    const drawParticle = (particle: ConfettiParticle, alpha: number) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      ctx.fillStyle = particle.color;
      ctx.fillRect(
        -particle.width / 2,
        -particle.height / 2,
        particle.width,
        particle.height,
      );
      ctx.restore();
    };

    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.033);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      let hasLiveParticles = false;
      particles.forEach((particle) => {
        particle.age += dt * 1000;
        if (particle.age < particle.delay) {
          hasLiveParticles = true;
          return;
        }

        const liveAge = particle.age - particle.delay;
        const progress = liveAge / particle.ttl;
        if (progress > 1) return;

        hasLiveParticles = true;
        const alpha = progress < 0.08
          ? progress / 0.08
          : progress > 0.82
            ? (1 - progress) / 0.18
            : 1;

        if (!prefersReducedMotion) {
          particle.x += particle.vx * dt;
          particle.y += particle.vy * dt;
          particle.rotation += particle.rotationSpeed * dt;
          particle.vy += 18 * dt;
        }

        drawParticle(particle, alpha);
      });

      if (hasLiveParticles) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return createPortal(
    <motion.div
      className="fixed inset-0"
      role="dialog"
      aria-modal="true"
      aria-label="Congratulations"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      onPointerDown={onDone}
      style={{ zIndex: 99999, cursor: 'default', overflow: 'hidden' }}
    >
      <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 22, delay: 0.08 }}
          className="relative border border-red-600/70 bg-black/95 px-10 py-7 text-center shadow-[0_0_40px_rgba(0,0,0,0.65)]"
        >
          <span className="absolute left-1.5 top-1.5 h-2.5 w-2.5 border-l border-t border-red-600/60" />
          <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 border-r border-t border-red-600/60" />
          <span className="absolute bottom-1.5 left-1.5 h-2.5 w-2.5 border-b border-l border-red-600/60" />
          <span className="absolute bottom-1.5 right-1.5 h-2.5 w-2.5 border-b border-r border-red-600/60" />

          <p className="mb-2 font-mono text-[10px] font-bold tracking-[0.35em] text-red-500">
            ADMIN VICTORY LOGGED
          </p>
          <p className="font-mono text-3xl font-black tracking-tighter text-white">
            NICE WORK, MARINE
          </p>
          <p className="mt-2 font-mono text-[10px] font-bold tracking-[0.18em] text-gray-600">
            {footerLine}
          </p>
          <div className="mt-4 flex justify-center gap-3">
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                className="font-mono text-lg font-black text-red-600"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
              >
                ›
              </motion.span>
            ))}
          </div>
          <p className="mt-3 font-mono text-[9px] tracking-[0.2em] text-gray-700">
            TAP ANYWHERE TO DISMISS
          </p>
        </motion.div>
      </div>

      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-40" aria-hidden="true" />
    </motion.div>,
    document.body,
  );
}
