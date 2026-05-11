import { useId } from 'react';

interface SiteLogoProps {
  size?: number;
  className?: string;
}

export function SiteLogo({ size = 44, className = '' }: SiteLogoProps) {
  const gradientId = useId().replace(/:/g, '');
  const width = Math.round(size * 0.62);

  return (
    <div className={`relative shrink-0 ${className}`.trim()} style={{ width, height: size }} aria-hidden="true">
      <svg
        viewBox="0 0 729.73 1191.89"
        className="h-full w-full drop-shadow-[0_0_14px_rgba(168,38,38,0.28)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradientId} x1="364.865" y1="0" x2="364.865" y2="1191.89" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(255,244,214,1)" />
            <stop offset="42%" stopColor="rgba(212,173,93,1)" />
            <stop offset="100%" stopColor="rgba(163,29,45,1)" />
          </linearGradient>
        </defs>
        <path
          d="M604.06 653.85 554.33 664.53 607.91 622.17 507.18 436.07 442.33 478l49.55-93.43-122.93-252.22-122.93 252.22 69.04-53.21-84.34 104.71-100.73 186.1 69.63-76.47-54.82 108.15 41.48-11.75-78.52 60.64-58.52 146.99 132.11 163.08 22.07-141.25 2.21 141.25 163.32 139.04 163.32-139.04 2.21-141.25 22.07 141.25 123.97-153.03-76.44-205.93ZM369.47 778.63l-31.15 48.24 31.15-16.08v253.24l-126.62-97.48-1.01-203-88.43 145.72-59.29-64.32 53.26-117.58 108.53-109.54-55.27 18.09 72.35-152.75-45.22 39.19 132.71-262.61-49.3 300.79s58.29-68.34 58.29-63.31v281.38Z"
          fill={`url(#${gradientId})`}
        />
      </svg>
    </div>
  );
}
