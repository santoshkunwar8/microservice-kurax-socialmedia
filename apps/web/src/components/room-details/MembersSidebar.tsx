import React from 'react';
import { Users, Search, Crown, Shield, X } from 'lucide-react';
import { Member } from './types';

interface MembersSidebarProps {
    onlineMembers: Member[];
    offlineMembers: Member[];
    onClose?: () => void;
}

export default function MembersSidebar({ onlineMembers, offlineMembers, onClose }: MembersSidebarProps) {
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

                {/* Online Members */}
                <div className="mb-6 md:mb-8">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 md:mb-4 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>Online • {onlineMembers.length}</span>
                    </h4>
                    <div className="space-y-2 md:space-y-3">
                        {onlineMembers.map((member) => (
                            <div key={member.id} className="group flex items-center space-x-3 md:space-x-4 p-2.5 md:p-3 hover:bg-white/5 rounded-xl md:rounded-2xl transition-all cursor-pointer hover:scale-102">
                                <div className="relative">
                                    <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${member.id === 1 ? 'from-purple-500 to-pink-500' :
                                            member.id === 2 ? 'from-cyan-500 to-blue-500' :
                                                'from-orange-500 to-pink-500'
                                        } rounded-lg md:rounded-xl flex items-center justify-center text-lg md:text-xl shadow-lg group-hover:scale-110 transition-transform`}>
                                        {member.avatar}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-400 border-2 border-black rounded-full"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold flex items-center space-x-2 text-sm md:text-base">
                                        <span className="truncate">{member.name}</span>
                                        {member.role === 'Admin' && <Shield className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
                                        {member.role === 'Moderator' && <Crown className="w-3 h-3 text-purple-400 flex-shrink-0" />}
                                    </div>
                                    <div className="text-xs text-gray-400">{member.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Offline Members */}
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 md:mb-4 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                        <span>Offline • {offlineMembers.length}</span>
                    </h4>
                    <div className="space-y-2 md:space-y-3">
                        {offlineMembers.map((member) => (
                            <div key={member.id} className="group flex items-center space-x-3 md:space-x-4 p-2.5 md:p-3 hover:bg-white/5 rounded-xl md:rounded-2xl transition-all cursor-pointer opacity-60 hover:opacity-100">
                                <div className="relative">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg md:rounded-xl flex items-center justify-center text-lg md:text-xl">
                                        {member.avatar}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm md:text-base truncate">{member.name}</div>
                                    <div className="text-xs text-gray-400">{member.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}
