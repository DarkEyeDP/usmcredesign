import { NavLink } from 'react-router';
import { loggedOutItems, loggedInItems } from './navigationConfig';

interface Props {
  isLoggedIn: boolean;
}

export function MobileBottomNav({ isLoggedIn }: Props) {
  const items = (isLoggedIn ? loggedInItems : loggedOutItems).filter(item => !item.hideFromMobileNav);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-white/12 bg-black print-hide">
      <div className="flex h-[72px] items-stretch overflow-x-auto scrollbar-hide">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex min-w-[60px] flex-1 flex-col items-center justify-center gap-1 px-1 pt-2 pb-1 transition-colors ${
                  isActive
                    ? 'text-red-500'
                    : 'text-gray-600 hover:text-gray-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`relative flex items-center justify-center ${isActive ? 'text-red-500' : ''}`}>
                    {isActive && (
                      <span className="absolute -top-[10px] left-1/2 h-px w-6 -translate-x-1/2 bg-red-600" />
                    )}
                    <Icon className="h-[22px] w-[22px]" />
                  </div>
                  <span className="text-[10px] font-bold tracking-widest leading-none">{item.mobileLabel}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
