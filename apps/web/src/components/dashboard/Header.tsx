import { useState } from 'react';
import { Search, Bell, User, Settings, LogOut, Menu } from 'lucide-react';

interface HeaderProps {
  user: {
    displayName?: string | null;
    username?: string | null;
  } | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onLogout: () => void;
  onMenuClick?: () => void;
}

export default function Header({
  user,
  searchQuery,
  onSearchChange,
  onLogout,
  onMenuClick,
}: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-black/60 backdrop-blur-xl border-b border-white/10">
      <div className="px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-white/10 rounded-xl transition flex-shrink-0"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 md:pl-12 pr-4 py-2 md:py-3 text-sm md:text-base focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
          <button className="relative p-2 hover:bg-white/10 rounded-xl transition hidden sm:block">
            <Bell className="w-5 md:w-6 h-5 md:h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 md:space-x-3 px-2 md:px-3 py-1.5 md:py-2 hover:bg-white/10 rounded-xl transition"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base">
                {user?.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-sm font-semibold">{user?.displayName || 'User'}</div>
                <div className="text-xs text-gray-400">@{user?.username || 'user'}</div>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                <a
                  href="#"
                  className="flex items-center space-x-2 px-4 py-3 hover:bg-white/10 transition"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </a>
                <a
                  href="#"
                  className="flex items-center space-x-2 px-4 py-3 hover:bg-white/10 transition"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </a>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-white/10 transition text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
