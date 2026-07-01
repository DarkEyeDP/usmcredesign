import { schoolBadge } from '../utils';

interface Props {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-10 h-10 text-[10px]',
  md: 'w-12 h-12 text-xs',
  lg: 'w-16 h-16 text-sm',
};

export function SchoolBadge({ name, size = 'md' }: Props) {
  const badge = schoolBadge(name);
  return (
    <div
      className={`${sizeMap[size]} flex items-center justify-center font-black tracking-tight flex-shrink-0`}
      style={{ backgroundColor: badge.bg, color: badge.fg }}
    >
      {badge.abbr}
    </div>
  );
}
