export function isFullscreenCapablePath(pathname: string): boolean {
  return pathname === '/' || pathname === '/lateral-move' || pathname === '/messages' || pathname.startsWith('/messages/');
}
