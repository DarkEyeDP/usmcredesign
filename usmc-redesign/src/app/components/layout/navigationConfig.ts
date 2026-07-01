import type { ComponentType } from 'react';
import {
  Anchor,
  ArrowsLeftRight,
  BookOpen,
  CurrencyDollar,
  FolderOpen,
  GraduationCap,
  Question,
  House,
  SquaresFour,
  Chat,
  Newspaper,
  Signpost,
  Wrench,
} from '@phosphor-icons/react';

export interface NavItem {
  path: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  mobileLabel: string;
  hideFromMobileNav?: boolean;
  badge?: string;
}

export const loggedOutItems: NavItem[] = [
  { path: '/', icon: House, label: 'HOME', mobileLabel: 'HOME' },
  { path: '/news', icon: Newspaper, label: 'NEWS', mobileLabel: 'NEWS', hideFromMobileNav: true },
  { path: '/messages', icon: Chat, label: 'MARADMINS', mobileLabel: 'MARADMINS' },
  { path: '/pay-benefits', icon: CurrencyDollar, label: 'BENEFITS', mobileLabel: 'PAY' },
  { path: '/education', icon: GraduationCap, label: 'EDUCATION', mobileLabel: 'EDU', hideFromMobileNav: true },
  { path: '/lateral-move', icon: ArrowsLeftRight, label: 'LATERAL MOVE', mobileLabel: 'LATMOVE' },
  { path: '/reading-list', icon: BookOpen, label: 'CMC READING', mobileLabel: 'READING', badge: 'NEW' },
  { path: '/career-path', icon: Signpost, label: 'CAREER PATH', mobileLabel: 'CAREER', badge: 'NEW' },
];

export const loggedInItems: NavItem[] = [
  { path: '/', icon: SquaresFour, label: 'DASHBOARD', mobileLabel: 'HOME' },
  { path: '/news', icon: Newspaper, label: 'NEWS', mobileLabel: 'NEWS' },
  { path: '/messages', icon: Chat, label: 'MARADMINS', mobileLabel: 'MARADMINS' },
  { path: '/pay-benefits', icon: CurrencyDollar, label: 'BENEFITS', mobileLabel: 'PAY' },
  { path: '/stay-marine', icon: Anchor, label: 'STAY MARINE', mobileLabel: 'STAY' },
  { path: '/lateral-move', icon: ArrowsLeftRight, label: 'LATERAL MOVE', mobileLabel: 'LATMOVE' },
  { path: '/reading-list', icon: BookOpen, label: 'CMC READING', mobileLabel: 'READING', badge: 'NEW' },
  { path: '/career-path', icon: Signpost, label: 'CAREER PATH', mobileLabel: 'CAREER' },
  { path: '/resources', icon: FolderOpen, label: 'RESOURCES', mobileLabel: 'RESOURCES' },
  { path: '/tools', icon: Wrench, label: 'TOOLS', mobileLabel: 'TOOLS' },
  { path: '/help', icon: Question, label: 'HELP & SUPPORT', mobileLabel: 'HELP' },
];
