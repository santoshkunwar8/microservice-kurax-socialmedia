import { Globe, Lock, Filter } from 'lucide-react';

export type FilterType = 'all' | 'public' | 'private';

interface RoomFiltersProps {
  filterType: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export default function RoomFilters({ filterType, onFilterChange }: RoomFiltersProps) {
  return (
    <section className="px-4 md:px-8 py-3 md:py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2 md:space-x-3 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-4 md:px-6 py-2 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap text-sm md:text-base ${
              filterType === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 shadow-lg shadow-purple-500/30'
                : 'bg-white/5 hover:bg-white/10 hover:scale-105 border border-transparent'
            }`}
          >
            All Rooms
          </button>
          <button
            onClick={() => onFilterChange('public')}
            className={`px-4 md:px-6 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 whitespace-nowrap text-sm md:text-base ${
              filterType === 'public'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg shadow-green-500/30'
                : 'bg-white/5 hover:bg-white/10 hover:scale-105 border border-transparent'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Public</span>
          </button>
          <button
            onClick={() => onFilterChange('private')}
            className={`px-4 md:px-6 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 whitespace-nowrap text-sm md:text-base ${
              filterType === 'private'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30'
                : 'bg-white/5 hover:bg-white/10 hover:scale-105 border border-transparent'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Private</span>
          </button>
        </div>

        <button className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-105 border border-white/10 hover:border-white/30 flex-shrink-0">
          <Filter className="w-4 h-4" />
          <span className="text-sm">More Filters</span>
        </button>
      </div>
    </section>
  );
}
