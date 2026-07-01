export function isFullscreenCapablePath(pathname: string): boolean {
  return pathname === '/' || pathname === '/lateral-move' || pathname === '/career-path' || pathname === '/messages' || pathname.startsWith('/messages/');
}
