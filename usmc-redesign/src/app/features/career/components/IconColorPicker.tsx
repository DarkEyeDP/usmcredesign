import {
  Flag, Medal, Star, Shield, Sword, Anchor, Crown, Crosshair,
  Trophy, Target, Rocket, Diamond, Lightning, Fire, CheckCircle, Sparkle,
  Briefcase, Certificate, GraduationCap, Handshake, Pencil, BookOpen, Clock, Calendar,
  Heart, House, Baby, Car, Airplane, Globe, MapPin, Compass,
  PiggyBank, CurrencyDollar, Wallet, Coin, ChartBar, TrendUp, ArrowUp, ArrowDown,
  Barbell, FirstAid, Coffee, MusicNote, Camera, GameController, Leaf, Sun,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';

interface IconEntry {
  name: string;
  label: string;
  Comp: Icon;
}

const ICON_LIBRARY: IconEntry[] = [
  // Military / Service
  { name: 'Flag',           label: 'Flag',         Comp: Flag },
  { name: 'Medal',          label: 'Medal',        Comp: Medal },
  { name: 'Star',           label: 'Star',         Comp: Star },
  { name: 'Shield',         label: 'Shield',       Comp: Shield },
  { name: 'Sword',          label: 'Sword',        Comp: Sword },
  { name: 'Anchor',         label: 'Anchor',       Comp: Anchor },
  { name: 'Crown',          label: 'Crown',        Comp: Crown },
  { name: 'Crosshair',      label: 'Crosshair',    Comp: Crosshair },
  // Achievement
  { name: 'Trophy',         label: 'Trophy',       Comp: Trophy },
  { name: 'Target',         label: 'Target',       Comp: Target },
  { name: 'Rocket',         label: 'Rocket',       Comp: Rocket },
  { name: 'Diamond',        label: 'Diamond',      Comp: Diamond },
  { name: 'Lightning',      label: 'Lightning',    Comp: Lightning },
  { name: 'Fire',           label: 'Fire',         Comp: Fire },
  { name: 'CheckCircle',    label: 'Complete',     Comp: CheckCircle },
  { name: 'Sparkle',        label: 'Sparkle',      Comp: Sparkle },
  // Career / Education
  { name: 'Briefcase',      label: 'Briefcase',    Comp: Briefcase },
  { name: 'Certificate',    label: 'Certificate',  Comp: Certificate },
  { name: 'GraduationCap',  label: 'Graduation',   Comp: GraduationCap },
  { name: 'Handshake',      label: 'Handshake',    Comp: Handshake },
  { name: 'Pencil',         label: 'Pencil',       Comp: Pencil },
  { name: 'BookOpen',       label: 'Book',         Comp: BookOpen },
  { name: 'Clock',          label: 'Clock',        Comp: Clock },
  { name: 'Calendar',       label: 'Calendar',     Comp: Calendar },
  // Life / Family
  { name: 'Heart',          label: 'Heart',        Comp: Heart },
  { name: 'House',          label: 'Home',         Comp: House },
  { name: 'Baby',           label: 'Baby',         Comp: Baby },
  { name: 'Car',            label: 'Car',          Comp: Car },
  { name: 'Airplane',       label: 'Travel',       Comp: Airplane },
  { name: 'Globe',          label: 'Globe',        Comp: Globe },
  { name: 'MapPin',         label: 'Location',     Comp: MapPin },
  { name: 'Compass',        label: 'Compass',      Comp: Compass },
  // Finance
  { name: 'PiggyBank',      label: 'Savings',      Comp: PiggyBank },
  { name: 'CurrencyDollar', label: 'Dollar',       Comp: CurrencyDollar },
  { name: 'Wallet',         label: 'Wallet',       Comp: Wallet },
  { name: 'Coin',           label: 'Coin',         Comp: Coin },
  { name: 'ChartBar',       label: 'Chart',        Comp: ChartBar },
  { name: 'TrendUp',        label: 'Growth',       Comp: TrendUp },
  { name: 'ArrowUp',        label: 'Rising',       Comp: ArrowUp },
  { name: 'ArrowDown',      label: 'Falling',      Comp: ArrowDown },
  // Health / Personal
  { name: 'Barbell',        label: 'Fitness',      Comp: Barbell },
  { name: 'FirstAid',       label: 'Health',       Comp: FirstAid },
  { name: 'Coffee',         label: 'Coffee',       Comp: Coffee },
  { name: 'MusicNote',      label: 'Music',        Comp: MusicNote },
  { name: 'Camera',         label: 'Camera',       Comp: Camera },
  { name: 'GameController', label: 'Gaming',       Comp: GameController },
  { name: 'Leaf',           label: 'Nature',       Comp: Leaf },
  { name: 'Sun',            label: 'Sun',          Comp: Sun },
];

export const ICON_MAP: Record<string, Icon> = Object.fromEntries(
  ICON_LIBRARY.map(e => [e.name, e.Comp])
);

export function renderCustomIcon(name: string, className = 'w-4 h-4'): React.ReactNode {
  const Comp = ICON_MAP[name] ?? Star;
  return <Comp className={className} />;
}

export const COLOR_PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#fbbf24',
  '#84cc16', '#22c55e', '#10b981', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
  '#ec4899', '#f43f5e', '#64748b', '#e2e8f0',
];

export const DEFAULT_CUSTOM_COLOR = '#a78bfa';
export const DEFAULT_CUSTOM_ICON  = 'Star';

interface Props {
  selectedIcon: string;
  selectedColor: string;
  onSelectIcon: (name: string) => void;
  onSelectColor: (hex: string) => void;
}

export function IconColorPicker({ selectedIcon, selectedColor, onSelectIcon, onSelectColor }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {/* Icon grid */}
      <div>
        <div className="text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-2">Choose Icon</div>
        <div className="grid grid-cols-8 gap-1">
          {ICON_LIBRARY.map(entry => {
            const isSelected = selectedIcon === entry.name;
            const Ic = entry.Comp;
            return (
              <button
                key={entry.name}
                type="button"
                onClick={() => onSelectIcon(entry.name)}
                title={entry.label}
                className={`w-8 h-8 flex items-center justify-center border transition-colors ${
                  isSelected
                    ? 'border-white/40 bg-white/[0.10]'
                    : 'border-white/[0.08] hover:border-white/25 bg-transparent'
                }`}
                style={{ color: isSelected ? selectedColor : 'var(--usmc-text-muted)' }}
              >
                <Ic className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Color swatches */}
      <div>
        <div className="text-[9px] font-mono tracking-[0.2em] text-white/35 uppercase mb-2">Choose Color</div>
        <div className="grid grid-cols-8 gap-1">
          {COLOR_PALETTE.map(hex => (
            <button
              key={hex}
              type="button"
              onClick={() => onSelectColor(hex)}
              className="w-8 h-8 transition-all"
              style={{
                background: hex,
                outline: selectedColor === hex ? '2px solid #fff' : '2px solid transparent',
                outlineOffset: '2px',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
