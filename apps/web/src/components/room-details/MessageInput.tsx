import React from 'react';
import { Smile, Paperclip, Send } from 'lucide-react';

interface MessageInputProps {
    message: string;
    onMessageChange: (message: string) => void;
    onSendMessage: () => void;
}

export default function MessageInput({ message, onMessageChange, onSendMessage }: MessageInputProps) {
    return (
        <div className="bg-black/80 backdrop-blur-2xl border-t border-white/10 p-6">
            <div className="max-w-4xl flex items-center space-x-4">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => onMessageChange(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
                        placeholder="Say something..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-6 pr-28 py-4 text-lg focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                        <button className="p-2.5 hover:bg-white/10 rounded-xl transition-all hover:scale-110">
                            <Smile className="w-5 h-5 text-gray-400 hover:text-yellow-400 transition" />
                        </button>
                        <button className="p-2.5 hover:bg-white/10 rounded-xl transition-all hover:scale-110">
                            <Paperclip className="w-5 h-5 text-gray-400 hover:text-cyan-400 transition" />
                        </button>
                    </div>
                </div>
                <button
                    onClick={onSendMessage}
                    className="p-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-2xl transition-all transform hover:scale-110 shadow-lg hover:shadow-purple-500/50"
                >
                    <Send className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}
