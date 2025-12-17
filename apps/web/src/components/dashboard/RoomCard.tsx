import {
  Globe,
  Lock,
  Crown,
  MoreVertical,
  Activity,
  ChevronRight,
  MessageCircle,
  Users,
  Tag,
} from 'lucide-react';

interface Room {
  id: string;
  name: string | null;
  type: 'PUBLIC' | 'PRIVATE';
  memberCount?: number;
  _count?: {
    members: number;
    messages: number;
  };
}

interface RoomCardProps {
  room: Room;
  onJoin: (roomId: string) => void;
  onSelect: (roomId: string) => void;
  isJoined?: boolean;
}

// Generate gradient based on room name
function getGradient(name: string | null): string {
  const gradients = [
    'from-purple-500 via-pink-500 to-red-500',
    'from-cyan-500 via-blue-500 to-purple-500',
    'from-orange-500 via-pink-500 to-purple-500',
    'from-green-500 via-emerald-500 to-teal-500',
    'from-pink-500 via-purple-500 to-indigo-500',
    'from-amber-500 via-orange-500 to-red-500',
    'from-yellow-500 via-orange-500 to-red-500',
    'from-rose-500 via-pink-500 to-purple-500',
  ];
  const index = (name || 'Room').charCodeAt(0) % gradients.length;
  return gradients[index];
}

export default function RoomCard({ room, onJoin, onSelect, isJoined }: RoomCardProps) {
  const gradient = getGradient(room.name);
  const isPublic = room.type === 'PUBLIC';
  const memberCount = room._count?.members || room.memberCount || 0;
  const messageCount = room._count?.messages || 0;

  return (
    <div
      onClick={() => isJoined && onSelect(room.id)}
      className={`group relative bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 hover:scale-105 transition-all duration-300 flex flex-col ${
        isJoined ? 'cursor-pointer' : ''
      }`}
    >
      {/* Gradient Header */}
      <div className={`relative h-24 bg-gradient-to-br ${gradient} overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <div className="p-2 bg-black/40 backdrop-blur-xl rounded-lg border border-white/20">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 bg-black/40 backdrop-blur-xl rounded-lg border border-white/20 hover:bg-black/60 transition"
            >
              <MoreVertical className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              isPublic
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
            }`}
          >
            {isPublic ? (
              <Globe className="w-2.5 h-2.5 inline mr-1" />
            ) : (
              <Lock className="w-2.5 h-2.5 inline mr-1" />
            )}
            {isPublic ? 'PUBLIC' : 'PRIVATE'}
          </span>
        </div>

        <h3 className="text-base font-bold mb-1.5 line-clamp-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition">
          {room.name || 'Unnamed Room'}
        </h3>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-white/10">
          <div>
            <div className="text-xs text-gray-400 mb-0.5">Members</div>
            <div className="text-xs font-semibold flex items-center">
              <Users className="w-3 h-3 mr-1" />
              {memberCount.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-0.5">Messages</div>
            <div className="text-xs font-semibold">{messageCount.toLocaleString()}</div>
          </div>
        </div>

        {/* Topics removed: no longer in Room model */}

        {/* Action */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xs text-gray-500 flex items-center">
            <Activity className="w-3 h-3 mr-1" />
            Active
          </span>
          {isJoined ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(room.id);
              }}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold transition-all transform hover:scale-110 flex items-center space-x-1"
            >
              <span>Open</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onJoin(room.id);
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-lg text-xs font-semibold transition-all transform hover:scale-110 flex items-center space-x-1"
            >
              <span>Join</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Hover Effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none`}
      ></div>
    </div>
  );
}
