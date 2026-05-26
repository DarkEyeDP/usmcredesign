import type { ComponentType } from 'react';
import {
  Anchor,
  ArrowLeftRight,
  BookOpen,
  DollarSign,
  FolderOpen,
  GraduationCap,
  HelpCircle,
  Home,
  LayoutDashboard,
  MessageSquare,
  Newspaper,
  Wrench,
} from 'lucide-react';

export interface NavItem {
  path: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  mobileLabel: string;
  hideFromMobileNav?: boolean;
  badge?: string;
}

export const loggedOutItems: NavItem[] = [
  { path: '/', icon: Home, label: 'HOME', mobileLabel: 'HOME' },
  { path: '/news', icon: Newspaper, label: 'NEWS', mobileLabel: 'NEWS', hideFromMobileNav: true },
  { path: '/messages', icon: MessageSquare, label: 'MARADMINS', mobileLabel: 'MARADMINS' },
  { path: '/pay-benefits', icon: DollarSign, label: 'BENEFITS', mobileLabel: 'PAY' },
  { path: '/education', icon: GraduationCap, label: 'EDUCATION', mobileLabel: 'EDU', hideFromMobileNav: true },
  { path: '/lateral-move', icon: ArrowLeftRight, label: 'LATERAL MOVE', mobileLabel: 'LATMOVE' },
  { path: '/reading-list', icon: BookOpen, label: 'CMC READING', mobileLabel: 'READING', badge: 'NEW' },
];

export const loggedInItems: NavItem[] = [
  { path: '/', icon: LayoutDashboard, label: 'DASHBOARD', mobileLabel: 'HOME' },
  { path: '/news', icon: Newspaper, label: 'NEWS', mobileLabel: 'NEWS' },
  { path: '/messages', icon: MessageSquare, label: 'MARADMINS', mobileLabel: 'MARADMINS' },
  { path: '/pay-benefits', icon: DollarSign, label: 'BENEFITS', mobileLabel: 'PAY' },
  { path: '/stay-marine', icon: Anchor, label: 'STAY MARINE', mobileLabel: 'STAY' },
  { path: '/lateral-move', icon: ArrowLeftRight, label: 'LATERAL MOVE', mobileLabel: 'LATMOVE' },
  { path: '/reading-list', icon: BookOpen, label: 'CMC READING', mobileLabel: 'READING', badge: 'NEW' },
  { path: '/resources', icon: FolderOpen, label: 'RESOURCES', mobileLabel: 'RESOURCES' },
  { path: '/tools', icon: Wrench, label: 'TOOLS', mobileLabel: 'TOOLS' },
  { path: '/help', icon: HelpCircle, label: 'HELP & SUPPORT', mobileLabel: 'HELP' },
];
