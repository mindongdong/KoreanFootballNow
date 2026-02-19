import React from 'react';
import { Newspaper, BarChart3 } from 'lucide-react';
import type { MainView } from '@/types';
import { cn } from '@/lib/utils';

interface NavbarProps {
  activeView: MainView;
  onViewChange: (view: MainView) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeView, onViewChange }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-[1400px] mx-auto flex h-16 items-center justify-between px-6">
        <button
          onClick={() => onViewChange('news')}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-1">
            <span className="text-2xl font-black tracking-tighter text-kfn-red">KFN</span>
            <div className="hidden sm:block h-5 w-px bg-gray-200 mx-1" />
            <span className="hidden sm:block text-sm font-semibold text-gray-500 tracking-tight">
              Korean Football Now
            </span>
          </div>
        </button>

        <nav className="flex items-center gap-1">
          <button
            onClick={() => onViewChange('news')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
              activeView === 'news'
                ? 'bg-kfn-red text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            )}
          >
            <Newspaper className="w-4 h-4" />
            <span>News</span>
          </button>
          <button
            onClick={() => onViewChange('stats')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
              activeView === 'stats'
                ? 'bg-kfn-red text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            )}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Stats</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
