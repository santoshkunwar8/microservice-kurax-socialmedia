import React from 'react';
import { MessageCircle, FileText, Sparkles } from 'lucide-react';
import { TabType } from './types';

interface TabNavigationProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
    return (
        <div className="bg-black/40 backdrop-blur-xl border-b border-white/10 px-4 md:px-8">
            <div className="flex space-x-2 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => onTabChange('chats')}
                    className={`relative flex items-center space-x-2 px-4 md:px-6 py-3 md:py-4 font-semibold transition-all whitespace-nowrap ${activeTab === 'chats' ? 'text-white' : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chats</span>
                    {activeTab === 'chats' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500"></div>
                    )}
                </button>
                <button
                    onClick={() => onTabChange('posts')}
                    className={`relative flex items-center space-x-2 px-4 md:px-6 py-3 md:py-4 font-semibold transition-all whitespace-nowrap ${activeTab === 'posts' ? 'text-white' : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <FileText className="w-4 h-4" />
                    <span>Posts</span>
                    {activeTab === 'posts' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500"></div>
                    )}
                </button>
                <button
                    onClick={() => onTabChange('resources')}
                    className={`relative flex items-center space-x-2 px-4 md:px-6 py-3 md:py-4 font-semibold transition-all whitespace-nowrap ${activeTab === 'resources' ? 'text-white' : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <Sparkles className="w-4 h-4" />
                    <span>Resources</span>
                    {activeTab === 'resources' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500"></div>
                    )}
                </button>
            </div>
        </div>
    );
}
