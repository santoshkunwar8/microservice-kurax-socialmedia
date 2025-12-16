import React from 'react';
import { MessageCircle, FileText, Sparkles, TrendingUp } from 'lucide-react';

interface StatsBarProps {
    messageCount: number;
    postCount: number;
    resourceCount: number;
    isLoading?: boolean;
}

function formatCount(count: number): string {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
}

function getActivityLevel(messageCount: number): { label: string; color: string } {
    if (messageCount >= 1000) return { label: 'Very Active', color: 'text-green-400' };
    if (messageCount >= 500) return { label: 'Active', color: 'text-emerald-400' };
    if (messageCount >= 100) return { label: 'Moderate', color: 'text-yellow-400' };
    if (messageCount >= 10) return { label: 'Low', color: 'text-orange-400' };
    return { label: 'New', color: 'text-gray-400' };
}

export default function StatsBar({ messageCount, postCount, resourceCount, isLoading = false }: StatsBarProps) {
    const activity = getActivityLevel(messageCount);

    if (isLoading) {
        return (
            <div className="bg-black/60 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 py-3 md:py-4">
                <div className="flex items-center space-x-4 md:space-x-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-white/10 rounded-lg animate-pulse"></div>
                            <div>
                                <div className="h-3 w-12 bg-white/10 rounded animate-pulse mb-1"></div>
                                <div className="h-4 w-8 bg-white/10 rounded animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-black/60 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 py-3 md:py-4 overflow-x-auto">
            <div className="flex items-center space-x-4 md:space-x-8 min-w-max md:min-w-0">
                <div className="flex items-center space-x-2">
                    <div className="p-1.5 md:p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
                        <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-400">Messages</div>
                        <div className="text-sm font-bold">{formatCount(messageCount)}</div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="p-1.5 md:p-2 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-lg">
                        <FileText className="w-3 h-3 md:w-4 md:h-4" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-400">Posts</div>
                        <div className="text-sm font-bold">{formatCount(postCount)}</div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="p-1.5 md:p-2 bg-gradient-to-br from-orange-600 to-pink-600 rounded-lg">
                        <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-400">Resources</div>
                        <div className="text-sm font-bold">{formatCount(resourceCount)}</div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="p-1.5 md:p-2 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg">
                        <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-400">Activity</div>
                        <div className={`text-sm font-bold ${activity.color}`}>{activity.label}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
