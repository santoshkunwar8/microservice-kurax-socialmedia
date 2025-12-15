import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, Image, MoreVertical } from 'lucide-react';
import { useChatStore, useAuthStore } from '../../store';
import { apiClient } from '../../services/api';
import { wsManager } from '../../hooks/useWebSocket';
import { type MessageWithSender, MessageType, MessageStatus } from '@kuraxx/types';

interface ChatSectionProps {
    roomId: string;
}

export default function ChatSection({ roomId }: ChatSectionProps) {
    const { messages } = useChatStore();
    const { user } = useAuthStore();
    const [messageText, setMessageText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Filter messages for this room
    const roomMessages = messages.filter((m) => m.roomId === roomId);

    // Load messages for this room
    useEffect(() => {
        const loadMessages = async () => {
            if (!roomId) return;
            
            setIsLoading(true);
            try {
                const response = await apiClient.rooms.getRoomMessages(roomId);
                if (response.status === 200) {
                    // @ts-ignore
                    const newMessages = response.data.data?.messages || [];
                    // Replace messages for this room
                    useChatStore.setState((state) => ({
                        messages: [
                            ...state.messages.filter((m) => m.roomId !== roomId),
                            ...newMessages,
                        ],
                    }));
                }
            } catch (error) {
                console.error('Failed to load messages:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadMessages();

        // Join room via WebSocket
        wsManager.joinRoom(roomId);

        return () => {
            // Leave room when unmounting
            wsManager.leaveRoom(roomId);
        };
    }, [roomId]);

    // Scroll to bottom when messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [roomMessages]);

    // Handle typing indicator
    const handleTyping = () => {
        if (!isTyping && roomId) {
            setIsTyping(true);
            wsManager.startTyping(roomId);
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            if (roomId) {
                wsManager.stopTyping(roomId);
            }
        }, 3000);
    };

    // Handle sending message
    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!messageText.trim() || !roomId || !user) return;

        const tempMessage: MessageWithSender = {
            id: `temp-${Date.now()}`,
            roomId: roomId,
            senderId: user.id,
            content: messageText,
            type: MessageType.TEXT,
            status: MessageStatus.SENDING,
            replyToId: null,
            editedAt: null,
            deletedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            sender: {
                id: user.id,
                username: user.username || 'User',
                displayName: user.displayName,
                avatarUrl: user.avatarUrl || null,
                isOnline: true,
                lastSeenAt: new Date(),
            },
        };

        // Optimistic update
        useChatStore.setState((state) => ({
            messages: [...state.messages, tempMessage],
        }));

        setMessageText('');
        setIsTyping(false);

        try {
            // Send via API
            const response = await apiClient.messages.sendMessage(roomId, messageText, tempMessage.id);

            if (response.status === 201) {
                // @ts-ignore
                const realMessage = response.data.data.message;
                useChatStore.getState().replaceMessage(tempMessage.id, realMessage);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            // Mark message as failed
            useChatStore.setState((state) => ({
                messages: state.messages.map((m) =>
                    m.id === tempMessage.id
                        ? { ...m, status: MessageStatus.FAILED }
                        : m
                ),
            }));
        }

        // Also send via WS for real-time updates
        wsManager.sendMessage(roomId, messageText);
    };

    // Handle key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Get typing users for this room
    const typingUsers = useChatStore((state) => state.typingUsers);

    // Format time
    const formatTime = (date: Date | string) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Get gradient based on user
    const getGradient = (id: string | number) => {
        const gradients = [
            'from-purple-500 to-pink-500',
            'from-cyan-500 to-blue-500',
            'from-orange-500 to-pink-500',
            'from-green-500 to-emerald-500',
            'from-violet-500 to-purple-500',
        ];
        const numId = typeof id === 'string' ? id.charCodeAt(0) : id;
        return gradients[numId % gradients.length];
    };

    return (
        <div className="flex flex-col h-full">
            {/* Messages Area */}
            <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-gray-400 text-sm">Loading messages...</p>
                        </div>
                    </div>
                ) : roomMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mb-4">
                            <Send className="w-8 h-8 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">No messages yet</h3>
                        <p className="text-gray-400 text-sm max-w-xs">
                            Be the first to start the conversation!
                        </p>
                    </div>
                ) : (
                    <>
                        {roomMessages.map((message, index) => {
                            const isOwn = message.senderId === user?.id;
                            const showAvatar = !isOwn && (index === 0 || roomMessages[index - 1].senderId !== message.senderId);
                            const showName = !isOwn && (index === 0 || roomMessages[index - 1].senderId !== message.senderId);
                            const isSending = message.status === MessageStatus.SENDING;
                            const isFailed = message.status === MessageStatus.FAILED;

                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group animate-fadeIn`}
                                >
                                    <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                                        {/* Avatar */}
                                        {!isOwn && (
                                            <div className="w-10 flex-shrink-0 flex flex-col justify-end">
                                                {showAvatar ? (
                                                    <div className={`w-10 h-10 bg-gradient-to-br ${getGradient(message.senderId)} rounded-xl flex items-center justify-center text-white font-bold shadow-lg`}>
                                                        {message.sender?.displayName?.charAt(0).toUpperCase() || 
                                                         message.sender?.username?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                ) : (
                                                    <div className="w-10" />
                                                )}
                                            </div>
                                        )}

                                        {/* Message Content */}
                                        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                                            {showName && (
                                                <p className="text-xs text-gray-400 font-medium mb-1 ml-1">
                                                    {message.sender?.displayName || message.sender?.username || 'User'}
                                                </p>
                                            )}
                                            <div
                                                className={`relative px-4 py-3 rounded-2xl shadow-lg transition-all duration-200 ${
                                                    isOwn
                                                        ? 'bg-gradient-to-br from-purple-600 to-cyan-600 text-white rounded-br-sm'
                                                        : 'bg-white/10 backdrop-blur-xl border border-white/10 text-white rounded-bl-sm'
                                                } ${isSending ? 'opacity-70' : ''} ${isFailed ? 'border-red-500' : ''}`}
                                            >
                                                <p className="break-words text-sm md:text-base leading-relaxed">
                                                    {message.content}
                                                </p>
                                                {isFailed && (
                                                    <p className="text-xs text-red-400 mt-1">Failed to send</p>
                                                )}
                                            </div>
                                            <div className={`flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isOwn ? 'flex-row-reverse' : ''}`}>
                                                <p className="text-[10px] text-gray-500">
                                                    {formatTime(message.createdAt)}
                                                </p>
                                                {isSending && (
                                                    <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Typing Indicator */}
                        {typingUsers.size > 0 && (
                            <div className="flex items-center gap-3 animate-fadeIn">
                                <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center">
                                    <div className="flex space-x-1">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                    </div>
                                </div>
                                <span className="text-sm text-gray-400">Someone is typing...</span>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Message Input */}
            <div className="border-t border-white/10 bg-black/40 backdrop-blur-xl p-4">
                <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                    {/* Attachment Button */}
                    <button
                        type="button"
                        className="p-3 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white"
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>

                    {/* Input Container */}
                    <div className="flex-1 relative">
                        <textarea
                            value={messageText}
                            onChange={(e) => {
                                setMessageText(e.target.value);
                                handleTyping();
                            }}
                            onKeyDown={handleKeyPress}
                            placeholder="Type a message..."
                            rows={1}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-24 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition resize-none text-white placeholder-gray-500"
                            style={{ minHeight: '48px', maxHeight: '120px' }}
                        />
                        
                        {/* Input Actions */}
                        <div className="absolute right-2 bottom-2 flex items-center gap-1">
                            <button
                                type="button"
                                className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white"
                            >
                                <Smile className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white"
                            >
                                <Image className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Send Button */}
                    <button
                        type="submit"
                        disabled={!messageText.trim()}
                        className="p-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-purple-500/30"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
