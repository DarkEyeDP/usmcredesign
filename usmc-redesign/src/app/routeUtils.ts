export function isFullscreenCapablePath(pathname: string): boolean {
  return pathname === '/lateral-move' || pathname === '/messages' || pathname.startsWith('/messages/');
}
