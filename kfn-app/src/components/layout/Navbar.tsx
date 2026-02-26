import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Newspaper, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar: React.FC = () => {
  const location = useLocation();
  const isNews = location.pathname.startsWith('/news') || location.pathname === '/';
  const isStats = location.pathname.startsWith('/stats');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-[1400px] mx-auto flex h-16 items-center justify-between px-6">
        <Link
          to="/news"
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-1">
            <span className="text-2xl font-black tracking-tighter text-kfn-red">KFN</span>
            <div className="hidden sm:block h-5 w-px bg-gray-200 mx-1" />
            <span className="hidden sm:block text-sm font-semibold text-gray-500 tracking-tight">
              Korean Football Now
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            to="/news"
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
              isNews
                ? 'bg-kfn-red text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            )}
          >
            <Newspaper className="w-4 h-4" />
            <span>News</span>
          </Link>
          <Link
            to="/stats"
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
              isStats
                ? 'bg-kfn-red text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            )}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Stats</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
