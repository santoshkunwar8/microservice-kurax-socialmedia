import {
  MessageCircle,
  Hash,
  Star,
  Users,
  Bell,
  Plus,
  ChevronRight,
  Code,
  Gamepad2,
  Music,
  Coffee,
  X,
  Tag,
} from 'lucide-react';

interface TopicWithCount {
  name: string;
  count: number;
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onCreateRoom: () => void;
  userRoomsCount: number;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  topics?: TopicWithCount[];
}

// Icon mapping for common topics
const getTopicIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('code') || lowerName.includes('development') || lowerName.includes('programming')) {
    return <Code className="w-4 h-4" />;
  }
  if (lowerName.includes('game') || lowerName.includes('gaming')) {
    return <Gamepad2 className="w-4 h-4" />;
  }
  if (lowerName.includes('music')) {
    return <Music className="w-4 h-4" />;
  }
  if (lowerName.includes('coffee') || lowerName.includes('chat')) {
    return <Coffee className="w-4 h-4" />;
  }
  return <Tag className="w-4 h-4" />;
};

export default function Sidebar({
  collapsed,
  onToggle,
  onCreateRoom,
  userRoomsCount,
  isMobileOpen = false,
  onMobileClose,
  topics = [],
}: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen bg-black/80 md:bg-black/40 backdrop-blur-xl border-r border-white/10 p-6 z-50 transition-all duration-300
          ${collapsed ? 'md:w-20' : 'md:w-72'}
          w-72
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            {(!collapsed || isMobileOpen) && (
              <img src="/transparent-logo.svg" alt="kuraX" className="h-10 w-auto" />
            )}
            {collapsed && !isMobileOpen && (
              <img src="/transparent-logo.svg" alt="kuraX" className="h-10 w-auto mx-auto" />
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onMobileClose}
            className="md:hidden p-2 hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Toggle Button - Desktop Only */}
        <button
          onClick={onToggle}
          className="hidden md:flex absolute -right-3 top-8 w-6 h-6 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full items-center justify-center transition-all"
        >
          <ChevronRight
            className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-0' : 'rotate-180'}`}
          />
        </button>

        {/* Navigation */}
        <nav className="space-y-2">
          <a
            href="#"
            className={`flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-purple-600/30 to-cyan-600/30 border border-purple-500/50 rounded-xl ${collapsed && !isMobileOpen ? 'md:justify-center' : ''
              }`}
          >
            <Hash className="w-5 h-5" />
            {(!collapsed || isMobileOpen) && <span className="font-semibold">Discover</span>}
          </a>
          <a
            href="#"
            className={`flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition ${collapsed && !isMobileOpen ? 'md:justify-center' : ''
              }`}
          >
            <Star className="w-5 h-5" />
            {(!collapsed || isMobileOpen) && (
              <>
                <span>My Rooms</span>
                <span className="ml-auto text-xs text-gray-500">{userRoomsCount}</span>
              </>
            )}
          </a>
          <a
            href="#"
            className={`flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition ${collapsed && !isMobileOpen ? 'md:justify-center' : ''
              }`}
          >
            <Users className="w-5 h-5" />
            {(!collapsed || isMobileOpen) && <span>Friends</span>}
          </a>
          <a
            href="#"
            className={`relative flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition ${collapsed && !isMobileOpen ? 'md:justify-center' : ''
              }`}
          >
            <Bell className="w-5 h-5" />
            {(!collapsed || isMobileOpen) && <span>Notifications</span>}
            {(!collapsed || isMobileOpen) && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                5
              </span>
            )}
            {collapsed && !isMobileOpen && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </a>
        </nav>

        {/* Trending Topics */}
        {(!collapsed || isMobileOpen) && (
          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">
              {topics.length > 0 ? 'Room Topics' : 'No Topics Yet'}
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {topics.length > 0 ? (
                topics.map((topic, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-lg cursor-pointer transition group"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="text-purple-400">{getTopicIcon(topic.name)}</div>
                      <span className="text-sm group-hover:text-white transition">
                        {topic.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                      {topic.count} {topic.count === 1 ? 'room' : 'rooms'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 px-3">
                  Create a room with topics to see them here
                </p>
              )}
            </div>
          </div>
        )}

        {/* Create Room Button */}
        <button
          onClick={() => {
            onCreateRoom();
            onMobileClose?.();
          }}
          className={`mt-auto absolute bottom-6 left-6 right-6 px-6 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center space-x-2 shadow-lg hover:shadow-purple-500/30 ${collapsed && !isMobileOpen ? 'md:px-0' : ''
            }`}
        >
          <Plus className="w-5 h-5" />
          {(!collapsed || isMobileOpen) && <span>Create Room</span>}
        </button>
      </aside>
    </>
  );
}
