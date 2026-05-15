import { RefreshCw, ExternalLink } from 'lucide-react';

interface FetchFailedProps {
  url: string;
  onRetry?: () => void;
}

export function FetchFailed({ url, onRetry }: FetchFailedProps) {
  return (
    <div className="border border-white/12 p-6 mb-8">
      <div className="text-[11px] text-gray-600 font-bold tracking-[0.2em] mb-2">FULL TEXT UNAVAILABLE</div>
      <p className="text-[13px] text-gray-400 leading-relaxed mb-4">
        The full message could not be retrieved automatically. Read the complete MARADMIN on Marines.mil.
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 text-gray-300 text-[11px] font-bold tracking-widest hover:border-white/40 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> TRY AGAIN
          </button>
        )}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 border border-red-600/40 text-red-500 text-[11px] font-bold tracking-widest hover:bg-red-900/10 transition-colors"
        >
          READ ON MARINES.MIL <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
