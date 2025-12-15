import React from 'react';
import { Chat } from '../types';

interface ChatsTabProps {
    chats: Chat[];
}

export default function ChatsTab({ chats }: ChatsTabProps) {
    return (
        <div className="space-y-6 max-w-4xl">
            {chats.map((chat) => (
                <div key={chat.id} className="group flex space-x-4 hover:bg-white/5 -mx-4 px-4 py-3 rounded-2xl transition-all">
                    <div className={`w-12 h-12 bg-gradient-to-br ${chat.gradient} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                        {chat.avatar}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <span className="font-bold text-lg">{chat.user}</span>
                            <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">{chat.time}</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed">{chat.message}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
