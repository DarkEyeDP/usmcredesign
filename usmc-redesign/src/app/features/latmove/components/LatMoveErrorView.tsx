import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  title?: string;
  summary?: string;
  error: unknown;
  onRetry?: () => void;
  onReset?: () => void;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message || 'An unexpected error occurred.';
  }

  if (typeof error === 'string') {
    return error;
  }

  try {
    return JSON.stringify(error, null, 2);
  } catch {
    return 'An unexpected error occurred.';
  }
}

function getErrorStack(error: unknown) {
  return error instanceof Error ? error.stack : null;
}

export function LatMoveErrorView({
  title = 'LATERAL MOVE TOOL ERROR.',
  summary = 'The matching tool hit an issue and stopped rendering correctly. The details below should make the problem visible without opening browser developer tools.',
  error,
  onRetry,
  onReset,
}: Props) {
  const message = getErrorMessage(error);
  const stack = getErrorStack(error);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative overflow-hidden border-b border-white/12 pt-20">
        <div className="relative h-48">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(10,0,0,0.98) 0%, rgba(18,4,4,0.95) 55%, rgba(5,5,8,0.92) 100%)',
              backgroundColor: '#050508',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.45) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="absolute right-8 top-6 border border-red-500/25 bg-red-950/20 px-5 py-3 text-right">
            <div className="text-[12px] font-black tracking-widest text-red-300">SYSTEM ALERT.</div>
            <div className="mt-2 h-px w-8 bg-red-500/80 ml-auto" />
          </div>
          <div className="relative z-10 flex h-full flex-col justify-center px-8">
            <div className="mb-3 flex items-center gap-3 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-[12px] font-bold tracking-[0.3em]">ERROR REPORT</span>
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 14, mass: 0.85 }}
              className="page-hero-title"
            >
              {title}
            </motion.h1>
            <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-gray-400">
              {summary}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.7fr)]">
          <section className="border border-red-500/20 bg-red-950/10 p-6">
            <div className="mb-3 text-[11px] font-bold tracking-[0.24em] text-red-300">ISSUE</div>
            <div className="border border-white/10 bg-black/50 p-4 font-mono text-sm leading-6 text-red-100">
              {message}
            </div>

            {stack && (
              <div className="mt-5">
                <div className="mb-3 text-[11px] font-bold tracking-[0.24em] text-gray-500">STACK TRACE</div>
                <pre className="max-h-[420px] overflow-auto border border-white/10 bg-black/70 p-4 font-mono text-xs leading-5 text-gray-300 whitespace-pre-wrap">
                  {stack}
                </pre>
              </div>
            )}
          </section>

          <aside className="border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-3 text-[11px] font-bold tracking-[0.24em] text-gray-500">RECOVERY</div>
            <p className="mb-5 text-sm leading-6 text-gray-300">
              Retry if this came from a temporary render or data issue. Reset clears the current lateral move inputs and lets the page start clean.
            </p>
            <div className="flex flex-col gap-3">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center justify-center gap-2 border border-red-500/50 bg-red-900/20 px-4 py-3 text-sm font-bold tracking-[0.16em] text-red-200 transition-colors hover:border-red-400 hover:bg-red-900/30"
                >
                  <RefreshCw className="h-4 w-4" />
                  TRY AGAIN
                </button>
              )}
              {onReset && (
                <button
                  type="button"
                  onClick={onReset}
                  className="inline-flex items-center justify-center gap-2 border border-white/14 bg-black/50 px-4 py-3 text-sm font-bold tracking-[0.16em] text-gray-200 transition-colors hover:border-white/35 hover:text-white"
                >
                  <RotateCcw className="h-4 w-4" />
                  RESET TOOL STATE
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
