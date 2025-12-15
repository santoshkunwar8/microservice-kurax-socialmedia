import React from 'react';
import { MessageCircle, FileText, Sparkles, TrendingUp } from 'lucide-react';

export default function StatsBar() {
    return (
        <div className="bg-black/60 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 py-3 md:py-4 overflow-x-auto">
            <div className="flex items-center space-x-4 md:space-x-8 min-w-max md:min-w-0">
                <div className="flex items-center space-x-2">
                    <div className="p-1.5 md:p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
                        <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-400">Messages</div>
                        <div className="text-sm font-bold">2.4k</div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="p-1.5 md:p-2 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-lg">
                        <FileText className="w-3 h-3 md:w-4 md:h-4" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-400">Posts</div>
                        <div className="text-sm font-bold">127</div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="p-1.5 md:p-2 bg-gradient-to-br from-orange-600 to-pink-600 rounded-lg">
                        <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-400">Resources</div>
                        <div className="text-sm font-bold">45</div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="p-1.5 md:p-2 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg">
                        <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-400">Activity</div>
                        <div className="text-sm font-bold text-green-400">Very Active</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
