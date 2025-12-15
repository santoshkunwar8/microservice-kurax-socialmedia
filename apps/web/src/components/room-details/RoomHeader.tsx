import React from 'react';
import { ChevronLeft, Share2, Users, LogOut, Crown, Activity, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RoomHeaderProps {
    showMembers: boolean;
    onToggleMembers: () => void;
}

export default function RoomHeader({ showMembers, onToggleMembers }: RoomHeaderProps) {
    const navigate = useNavigate();

    return (
        <header className="bg-black/80 backdrop-blur-2xl border-b border-white/10 px-4 md:px-8 py-4 md:py-5">
            <div className="flex items-center justify-between">
                {/* Left Section */}
                <div className="flex items-center space-x-2 md:space-x-6 flex-1 min-w-0">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="group p-2 md:p-2.5 hover:bg-white/10 rounded-xl transition-all hover:scale-110 flex-shrink-0"
                    >
                        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div className="flex items-center space-x-2 md:space-x-4 min-w-0">
                        <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-2xl shadow-lg shadow-purple-500/30">
                                🎨
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 w-3 h-3 md:w-5 md:h-5 bg-green-400 border-2 border-black rounded-full"></div>
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center space-x-1 md:space-x-2">
                                <h1 className="text-base md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent truncate">
                                    Design & Creative
                                </h1>
                                <Crown className="w-3 h-3 md:w-5 md:h-5 text-yellow-400 flex-shrink-0" />
                            </div>
                            <div className="hidden sm:flex items-center space-x-2 md:space-x-3 text-xs md:text-sm text-gray-400 mt-1">
                                <span className="flex items-center space-x-1">
                                    <Users className="w-3 md:w-3.5 h-3 md:h-3.5" />
                                    <span>284</span>
                                </span>
                                <span>•</span>
                                <span className="flex items-center space-x-1">
                                    <Activity className="w-3 md:w-3.5 h-3 md:h-3.5 text-green-400" />
                                    <span className="text-green-400">156</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section - Desktop */}
                <div className="hidden md:flex items-center space-x-3">
                    <button className="group flex items-center space-x-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 hover:border-purple-500/50 hover:scale-105">
                        <Share2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        <span className="text-sm font-semibold">Share</span>
                    </button>
                    <button
                        onClick={onToggleMembers}
                        className="group flex items-center space-x-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 hover:border-cyan-500/50 hover:scale-105"
                    >
                        <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-semibold">{showMembers ? 'Hide' : 'Show'} Members</span>
                    </button>
                    <button className="group flex items-center space-x-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all border border-red-500/30 hover:border-red-500/50 text-red-400 hover:scale-105">
                        <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        <span className="text-sm font-semibold">Leave</span>
                    </button>
                </div>

                {/* Right Section - Mobile */}
                <div className="flex md:hidden items-center space-x-2">
                    <button
                        onClick={onToggleMembers}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10"
                    >
                        <Users className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10">
                        <Menu className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </header>
    );
}
