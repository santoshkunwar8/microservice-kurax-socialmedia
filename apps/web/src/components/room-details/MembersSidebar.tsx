import React from 'react';
import { Users, Search, Crown, Shield, X } from 'lucide-react';

// Member type from API
export interface RoomMember {
    id: string;
    userId: string;
    roomId: string;
    role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
    joinedAt: string | Date;
    user: {
        id: string;
        username: string;
        displayName: string | null;
        avatarUrl: string | null;
        isOnline: boolean;
        lastSeenAt: string | Date | null;
    };
}

interface MembersSidebarProps {
    members: RoomMember[];
    isLoading?: boolean;
    onClose?: () => void;
}

// Generate gradient based on user id
const getGradient = (id: string) => {
    const gradients = [
        'from-purple-500 to-pink-500',
        'from-cyan-500 to-blue-500',
        'from-orange-500 to-pink-500',
        'from-green-500 to-emerald-500',
        'from-violet-500 to-purple-500',
        'from-amber-500 to-orange-500',
        'from-rose-500 to-red-500',
        'from-teal-500 to-cyan-500',
    ];
    const index = id.charCodeAt(0) % gradients.length;
    return gradients[index];
};

// Get role badge
const getRoleBadge = (role: string) => {
    switch (role) {
        case 'OWNER':
            return <Crown className="w-3 h-3 text-yellow-400 flex-shrink-0" />;
        case 'ADMIN':
            return <Shield className="w-3 h-3 text-red-400 flex-shrink-0" />;
        case 'MODERATOR':
            return <Shield className="w-3 h-3 text-purple-400 flex-shrink-0" />;
        default:
            return null;
    }
};

// Get role label
const getRoleLabel = (role: string) => {
    switch (role) {
        case 'OWNER': return 'Owner';
        case 'ADMIN': return 'Admin';
        case 'MODERATOR': return 'Moderator';
        default: return 'Member';
    }
};

export default function MembersSidebar({ members, isLoading = false, onClose }: MembersSidebarProps) {
    // Separate online and offline members
    const onlineMembers = members.filter(m => m.user?.isOnline);
    const offlineMembers = members.filter(m => !m.user?.isOnline);

    // Sort by role priority: OWNER > ADMIN > MODERATOR > MEMBER
    const rolePriority: Record<string, number> = { OWNER: 0, ADMIN: 1, MODERATOR: 2, MEMBER: 3 };
    const sortByRole = (a: RoomMember, b: RoomMember) => 
        (rolePriority[a.role] || 3) - (rolePriority[b.role] || 3);

    const sortedOnline = [...onlineMembers].sort(sortByRole);
    const sortedOffline = [...offlineMembers].sort(sortByRole);

    return (
        <>
            {/* Mobile Overlay Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                onClick={onClose}
            />
            
            <div className="fixed md:relative right-0 top-0 h-full w-80 md:w-96 bg-black/90 md:bg-black/60 backdrop-blur-2xl border-l border-white/10 overflow-y-auto z-50 transition-all duration-300">
                <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6 md:mb-8">
                        <h3 className="text-lg md:text-xl font-bold flex items-center space-x-2 md:space-x-3">
                            <div className="p-1.5 md:p-2 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-lg md:rounded-xl">
                                <Users className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                            <span>Members</span>
                            <span className="text-sm font-normal text-gray-400">({members.length})</span>
                        </h3>
                        <div className="flex items-center space-x-2">
                            <button className="p-2 hover:bg-white/10 rounded-xl transition">
                                <Search className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                            {/* Mobile Close Button */}
                            <button
                                onClick={onClose}
                                className="md:hidden p-2 hover:bg-white/10 rounded-xl transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        // Loading skeleton
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center space-x-3 p-2.5 animate-pulse">
                                    <div className="w-10 h-10 bg-white/10 rounded-lg"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-white/10 rounded w-24"></div>
                                        <div className="h-3 bg-white/10 rounded w-16"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {/* Online Members */}
                            <div className="mb-6 md:mb-8">
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 md:mb-4 flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span>Online • {sortedOnline.length}</span>
                                </h4>
                                {sortedOnline.length === 0 ? (
                                    <p className="text-sm text-gray-500 px-2">No members online</p>
                                ) : (
                                    <div className="space-y-2 md:space-y-3">
                                        {sortedOnline.map((member) => (
                                            <div 
                                                key={member.id} 
                                                className="group flex items-center space-x-3 md:space-x-4 p-2.5 md:p-3 hover:bg-white/5 rounded-xl md:rounded-2xl transition-all cursor-pointer"
                                            >
                                                <div className="relative">
                                                    {member.user?.avatarUrl ? (
                                                        <img 
                                                            src={member.user.avatarUrl} 
                                                            alt={member.user.displayName || member.user.username}
                                                            className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl object-cover shadow-lg group-hover:scale-110 transition-transform"
                                                        />
                                                    ) : (
                                                        <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${getGradient(member.userId)} rounded-lg md:rounded-xl flex items-center justify-center text-lg md:text-xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                                            {(member.user?.displayName || member.user?.username || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-400 border-2 border-black rounded-full"></div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold flex items-center space-x-2 text-sm md:text-base">
                                                        <span className="truncate">{member.user?.displayName || member.user?.username || 'Unknown'}</span>
                                                        {getRoleBadge(member.role)}
                                                    </div>
                                                    <div className="text-xs text-gray-400">{getRoleLabel(member.role)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Offline Members */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 md:mb-4 flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                                    <span>Offline • {sortedOffline.length}</span>
                                </h4>
                                {sortedOffline.length === 0 ? (
                                    <p className="text-sm text-gray-500 px-2">No offline members</p>
                                ) : (
                                    <div className="space-y-2 md:space-y-3">
                                        {sortedOffline.map((member) => (
                                            <div 
                                                key={member.id} 
                                                className="group flex items-center space-x-3 md:space-x-4 p-2.5 md:p-3 hover:bg-white/5 rounded-xl md:rounded-2xl transition-all cursor-pointer opacity-60 hover:opacity-100"
                                            >
                                                <div className="relative">
                                                    {member.user?.avatarUrl ? (
                                                        <img 
                                                            src={member.user.avatarUrl} 
                                                            alt={member.user.displayName || member.user.username}
                                                            className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl object-cover grayscale"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg md:rounded-xl flex items-center justify-center text-lg md:text-xl font-bold text-white">
                                                            {(member.user?.displayName || member.user?.username || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold flex items-center space-x-2 text-sm md:text-base">
                                                        <span className="truncate">{member.user?.displayName || member.user?.username || 'Unknown'}</span>
                                                        {getRoleBadge(member.role)}
                                                    </div>
                                                    <div className="text-xs text-gray-400">{getRoleLabel(member.role)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
