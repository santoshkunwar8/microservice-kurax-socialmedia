import { Activity, MessageCircle, Zap, Star } from 'lucide-react';

interface StatsGridProps {
  onlineUsers: number;
  activeRooms: number;
  userRoomsCount: number;
}

export default function StatsGrid({
  onlineUsers,
  activeRooms,
  userRoomsCount,
}: StatsGridProps) {
  const stats = [
    {
      label: 'Online Users',
      value: onlineUsers.toLocaleString(),
      icon: <Activity className="w-5 h-5" />,
      gradient: 'from-green-500 to-emerald-500',
      change: '+12%',
    },
    {
      label: 'Active Rooms',
      value: activeRooms,
      icon: <MessageCircle className="w-5 h-5" />,
      gradient: 'from-purple-500 to-pink-500',
      change: '+8%',
    },
    {
      label: 'Messages Today',
      value: '2.4M',
      icon: <Zap className="w-5 h-5" />,
      gradient: 'from-cyan-500 to-blue-500',
      change: '+24%',
    },
    {
      label: 'Your Rooms',
      value: userRoomsCount.toString(),
      icon: <Star className="w-5 h-5" />,
      gradient: 'from-orange-500 to-red-500',
      change: '+2',
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
                <span className="text-xs md:text-sm text-green-400 font-semibold">{stat.change}</span>
              </div>
              <div className="text-xl md:text-3xl font-bold mb-0.5 md:mb-1">{stat.value}</div>
              <div className="text-xs md:text-sm text-gray-400 truncate">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
