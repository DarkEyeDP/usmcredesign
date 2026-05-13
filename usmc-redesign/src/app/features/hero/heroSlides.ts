import hero1 from '@/app/assets/hero-1.webp';
import hero2 from '@/app/assets/hero-2.webp';
import hero3 from '@/app/assets/hero-3.webp';
import hero4 from '@/app/assets/hero-4.webp';
import hero5 from '@/app/assets/hero-5.webp';
import hero6 from '@/app/assets/hero-6.webp';
import hero7 from '@/app/assets/hero-7.webp';
import hero8 from '@/app/assets/hero-8.webp';
import hero9 from '@/app/assets/hero-9.webp';
import hero10 from '@/app/assets/hero-10.webp';
import hero11 from '@/app/assets/hero-11.webp';
import type { HeroSlide } from './types';

export const SLIDE_DURATION = 20000;

/**
 * Hero slideshow entries.
 *
 * To add a new slide:
 *  1. Optimize the image to WebP (see CLAUDE.md › Hero Images) and drop it in src/app/assets/
 *  2. Add an import above
 *  3. Append a new entry below
 *
 * Each entry can optionally include a `videoId` that maps to a VIDEOS entry in heroVideos.ts.
 * If omitted, the WATCH button will use DEFAULT_VIDEO_ID.
 */
export const SLIDES: HeroSlide[] = [
  {
    // Artillery crew firing M777 in arid desert — smoke, dust, amber heat
    image: hero1,
    label: 'FIRE FOR EFFECT',
    heading: ['DOWNRANGE.', 'ON CALL. ALWAYS.'],
    sub: ['WHEN THE GRID LOCKS, WE ANSWER.', 'STEEL, SMOKE, AND TIMING.'],
    colorGrade: 'radial-gradient(ellipse at 75% 50%, rgba(160,40,0,0.32) 0%, transparent 65%)',
    sweep: 'linear-gradient(125deg, transparent 30%, rgba(100,20,0,0.22) 60%, transparent 80%)',
    nodeColors: ['rgba(255,160,50,0.9)', 'rgba(220,90,20,0.9)', 'rgba(255,200,70,0.9)'],
  },
  {
    // CH-53E Super Stallion over tropical jungle — blue-gray sky, green canopy below
    image: hero2,
    label: 'AIR ASSAULT',
    heading: ['EVERY CLIME', 'AND PLACE.'],
    sub: ['OVER THE SURF. THROUGH THE CANOPY.', 'DISTANCE DOES NOT SAVE THE TARGET.'],
    colorGrade: 'radial-gradient(ellipse at 70% 45%, rgba(0,40,120,0.30) 0%, transparent 65%)',
    sweep: 'linear-gradient(125deg, transparent 30%, rgba(0,20,80,0.22) 60%, transparent 80%)',
    nodeColors: ['rgba(80,190,255,0.9)', 'rgba(110,225,255,0.9)', 'rgba(50,140,210,0.9)'],
  },
  {
    // Close-up of Marines in woodland MARPAT in the field — earth, green, brotherhood
    image: hero3,
    label: 'BROTHERHOOD',
    heading: ['STAND FAST.', 'HIT HARD.'],
    sub: ['FORGED UNDER PRESSURE.', 'THE LINE HOLDS WHEN WE DO.'],
    colorGrade: 'radial-gradient(ellipse at 72% 48%, rgba(0,70,15,0.28) 0%, transparent 65%)',
    sweep: 'linear-gradient(125deg, transparent 30%, rgba(0,45,8,0.20) 60%, transparent 80%)',
    nodeColors: ['rgba(100,210,80,0.9)', 'rgba(150,220,60,0.9)', 'rgba(70,180,110,0.9)'],
  },
  {
    // F-35B on tarmac at dusk — dramatic purple and amber sky, aviation power
    image: hero4,
    label: 'AIR DOMINANCE',
    heading: ['FIFTH GEN.', 'FIRST STRIKE.'],
    sub: ['FAST IN. CLEAN OUT.', 'POWER PROJECTED WITHOUT WARNING.'],
    colorGrade: 'radial-gradient(ellipse at 65% 50%, rgba(90,20,140,0.28) 0%, transparent 60%)',
    sweep: 'linear-gradient(125deg, transparent 25%, rgba(140,60,10,0.20) 55%, transparent 80%)',
    nodeColors: ['rgba(210,150,50,0.9)', 'rgba(170,80,230,0.9)', 'rgba(255,180,60,0.9)'],
  },
  {
    // Extreme close-up rifle optic, marksman focus, warm red-brown tones
    image: hero5,
    label: 'EVERY MARINE A RIFLEMAN',
    heading: ['ONE SHOT.', 'ONE PURPOSE.'],
    sub: ['SIGHT PICTURE. BREATH. BREAK.', 'DISCIPLINE MAKES THE DIFFERENCE.'],
    colorGrade: 'radial-gradient(ellipse at 70% 50%, rgba(160,30,0,0.30) 0%, transparent 65%)',
    sweep: 'linear-gradient(125deg, transparent 30%, rgba(100,15,0,0.22) 60%, transparent 80%)',
    nodeColors: ['rgba(210,70,35,0.9)', 'rgba(245,110,30,0.9)', 'rgba(180,50,25,0.9)'],
  },
  {
    // Two RHIBs with armed Marines in heavy ocean surf — dark navy, white foam, aerial
    image: hero6,
    label: 'MARITIME STRIKE',
    heading: ['SWIFT.', 'LETHAL. UNSTOPPABLE.'],
    sub: ['SURF LINE TO TARGET LINE.', 'WE HIT BEFORE THE HORIZON WARNS THEM.'],
    colorGrade: 'radial-gradient(ellipse at 60% 45%, rgba(0,25,90,0.32) 0%, transparent 65%)',
    sweep: 'linear-gradient(125deg, transparent 30%, rgba(0,12,60,0.24) 60%, transparent 80%)',
    nodeColors: ['rgba(40,130,230,0.9)', 'rgba(80,210,255,0.9)', 'rgba(190,225,255,0.9)'],
  },
  {
    // USMC color guard with Eagle Globe Anchor flag at stadium ceremony — heritage, tradition
    image: hero7,
    label: 'CONTINUE OUR LEGACY',
    heading: ['250 YEARS', 'STILL ADVANCING.'],
    sub: ['WHAT WAS BUILT IN 1775 STILL MOVES.', 'WE CARRY THE WEIGHT FORWARD.'],
    colorGrade: 'radial-gradient(ellipse at 65% 50%, rgba(100,55,0,0.28) 0%, transparent 65%)',
    sweep: 'linear-gradient(125deg, transparent 30%, rgba(80,30,0,0.20) 60%, transparent 80%)',
    nodeColors: ['rgba(215,160,30,0.9)', 'rgba(195,35,30,0.9)', 'rgba(255,195,50,0.9)'],
    videoId: 'semper-fidelis-250',
  },
  {
    // CH-53 with Marines at door — deep violet/purple twilight sky, second helo distant
    image: hero8,
    label: 'NIGHT OPS',
    heading: ['OWN THE', 'NIGHT.'],
    sub: ['BLACK SKY. QUIET ROTORS.', 'WE ARRIVE BEFORE THE WARNING DOES.'],
    colorGrade: 'radial-gradient(ellipse at 68% 50%, rgba(55,0,110,0.28) 0%, transparent 65%)',
    sweep: 'linear-gradient(125deg, transparent 30%, rgba(38,0,75,0.22) 60%, transparent 80%)',
    nodeColors: ['rgba(170,80,255,0.9)', 'rgba(210,60,200,0.9)', 'rgba(125,60,245,0.9)'],
  },
  {
    // Marine in full combat load in rocky arid terrain, intense close angle, warm amber-red
    image: hero9,
    label: 'CLOSE COMBAT',
    heading: ['HOLD THE LINE.', 'BREAK THE THREAT.'],
    sub: ['DISCIPLINE UNDER FIRE.', 'PRESSURE FORWARD. NO HESITATION.'],
    colorGrade: 'radial-gradient(ellipse at 74% 50%, rgba(155,35,0,0.30) 0%, transparent 65%)',
    sweep: 'linear-gradient(125deg, transparent 30%, rgba(100,18,0,0.22) 60%, transparent 80%)',
    nodeColors: ['rgba(215,100,40,0.9)', 'rgba(255,130,30,0.9)', 'rgba(185,70,20,0.9)'],
  },
  {
    // MARSOC operator in full kit at aircraft door — dark blue-steel, US flag patch, special ops
    image: hero10,
    label: 'SPECIAL OPERATIONS',
    heading: ['WHERE OTHERS', "WON'T GO."],
    sub: ['QUIET ENTRY. VIOLENT FINISH.', 'FIRST THROUGH THE BREACH.'],
    colorGrade: 'radial-gradient(ellipse at 65% 46%, rgba(0,30,100,0.30) 0%, transparent 65%)',
    sweep: 'linear-gradient(125deg, transparent 30%, rgba(0,15,70,0.22) 60%, transparent 80%)',
    nodeColors: ['rgba(60,140,225,0.9)', 'rgba(100,185,255,0.9)', 'rgba(145,195,240,0.9)'],
  },
  {
    // Operator with NODs and suppressed rifle in darkness — deep blue-black, night vision
    image: hero11,
    label: 'DEEP STRIKE',
    heading: ['UNSEEN.', 'UNSTOPPABLE.'],
    sub: ['IN DEEP BEFORE FIRST LIGHT.', 'GONE BEFORE THE ECHO DIES.'],
    colorGrade: 'radial-gradient(ellipse at 68% 49%, rgba(0,20,80,0.32) 0%, transparent 65%)',
    sweep: 'linear-gradient(125deg, transparent 30%, rgba(0,10,55,0.24) 60%, transparent 80%)',
    nodeColors: ['rgba(80,130,215,0.9)', 'rgba(100,165,255,0.9)', 'rgba(60,100,195,0.9)'],
  },
];
