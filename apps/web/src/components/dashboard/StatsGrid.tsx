import { Activity, MessageCircle, Zap, Star, Users, TrendingUp } from 'lucide-react';

interface StatsGridProps {
  onlineUsers: number;
  activeRooms: number;
  messagesToday: number;
  userRoomsCount: number;
  totalUsers?: number;
  totalRooms?: number;
  isLoading?: boolean;
}

// Format large numbers (e.g., 1500000 -> 1.5M)
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

export default function StatsGrid({
  onlineUsers,
  activeRooms,
  messagesToday,
  userRoomsCount,
  totalUsers = 0,
  totalRooms = 0,
  isLoading = false,
}: StatsGridProps) {
  // Calculate percentage changes (simple ratio-based)
  const onlinePercent = totalUsers > 0 ? Math.round((onlineUsers / totalUsers) * 100) : 0;
  const activePercent = totalRooms > 0 ? Math.round((activeRooms / totalRooms) * 100) : 0;

  const stats = [
    {
      label: 'Online Users',
      value: formatNumber(onlineUsers),
      icon: <Activity className="w-5 h-5" />,
      gradient: 'from-green-500 to-emerald-500',
      change: `${onlinePercent}% online`,
      isLive: true,
    },
    {
      label: 'Active Rooms',
      value: formatNumber(activeRooms),
      icon: <MessageCircle className="w-5 h-5" />,
      gradient: 'from-purple-500 to-pink-500',
      change: `${activePercent}% active`,
      isLive: true,
    },
    {
      label: 'Messages Today',
      value: formatNumber(messagesToday),
      icon: <Zap className="w-5 h-5" />,
      gradient: 'from-cyan-500 to-blue-500',
      change: 'Today',
      isLive: true,
    },
    {
      label: 'Your Rooms',
      value: userRoomsCount.toString(),
      icon: <Star className="w-5 h-5" />,
      gradient: 'from-orange-500 to-red-500',
      change: 'Joined',
      isLive: false,
    },
  ];

  return (
    <section className="px-4 md:px-8 py-4 md:py-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="group relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-white/30 hover:scale-105 transition-all duration-300 overflow-hidden cursor-pointer"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}
            ></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2 md:mb-4">
                <div
                  className={`p-2 md:p-3 bg-gradient-to-br ${stat.gradient} rounded-lg md:rounded-xl group-hover:scale-110 transition-transform duration-300`}
                >
                  {stat.icon}
                </div>
                <div className="flex items-center space-x-1">
                  {stat.isLive && (
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  )}
                  <span className="text-xs md:text-sm text-gray-400 font-medium">{stat.change}</span>
                </div>
              </div>
              {isLoading ? (
                <div className="h-8 w-20 bg-white/10 rounded animate-pulse mb-1"></div>
              ) : (
                <div className="text-xl md:text-3xl font-bold mb-0.5 md:mb-1">{stat.value}</div>
              )}
              <div className="text-xs md:text-sm text-gray-400 truncate">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
