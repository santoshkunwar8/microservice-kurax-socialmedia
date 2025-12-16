import React, { useState, useRef, useEffect } from 'react';
import AudioDuration from './AudioDuration';
import { Send, Paperclip, Smile, Image, MoreVertical, Mic, X, Loader2, Play, Pause, StopCircle, FileText, Download } from 'lucide-react';
import { useChatStore, useAuthStore } from '../../store';
import { apiClient } from '../../services/api';
import { wsManager } from '../../hooks/useWebSocket';
import { type MessageWithSender, MessageType, MessageStatus } from '@kuraxx/types';

interface ChatSectionProps {
    roomId: string;
}

interface AttachmentPreview {
    file: File;
    url: string;
    type: 'image' | 'file' | 'audio';
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

    // Attachment state
    const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Voice message state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingIntervalRef = useRef<ReturnType<typeof setInterval>>();
    const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

    // Filter messages for this room
    // Always show latest messages at the top
    const roomMessages = messages.filter((m) => m.roomId === roomId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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

        // Optimistic update: add tempMessage to the top
        useChatStore.setState((state) => ({
            messages: [tempMessage, ...state.messages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
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

        // Clear attachments
        setAttachments([]);
    };

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
        const files = e.target.files;
        if (!files) return;

        const newAttachments: AttachmentPreview[] = [];
        Array.from(files).forEach((file) => {
            const url = URL.createObjectURL(file);
            newAttachments.push({ file, url, type });
        });

        setAttachments((prev) => [...prev, ...newAttachments]);
        e.target.value = ''; // Reset input
    };

    // Remove attachment
    const removeAttachment = (index: number) => {
        setAttachments((prev) => {
            const newAttachments = [...prev];
            URL.revokeObjectURL(newAttachments[index].url);
            newAttachments.splice(index, 1);
            return newAttachments;
        });
    };

    // Upload attachments and send message
    const handleSendWithAttachments = async () => {
        if (!roomId || !user || (!messageText.trim() && attachments.length === 0 && !audioBlob)) return;

        setIsUploading(true);
        const uploadedUrls: string[] = [];

        try {
            // Upload each attachment
            for (const attachment of attachments) {
                const formData = new FormData();
                formData.append('file', attachment.file);

                const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/upload/file`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${useAuthStore.getState().accessToken}`,
                    },
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.data?.file?.url) {
                        uploadedUrls.push(data.data.file.url);
                    }
                }
            }

            // Upload voice message if exists
            if (audioBlob) {
                const formData = new FormData();
                formData.append('file', audioBlob, 'voice-message.webm');

                const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/upload/file`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${useAuthStore.getState().accessToken}`,
                    },
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.data?.file?.url) {
                        uploadedUrls.push(data.data.file.url);
                    }
                }
            }

            // Build message content with attachments
            let content = messageText.trim();
            if (uploadedUrls.length > 0) {
                if (content) content += '\n';
                content += uploadedUrls.map((url) => `[attachment](${url})`).join('\n');
            }

            if (content) {
                // Send the message
                await apiClient.messages.sendMessage(roomId, content, `temp-${Date.now()}`);
            }

            // Clear everything
            setMessageText('');
            setAttachments([]);
            setAudioBlob(null);
            setAudioUrl(null);
        } catch (error) {
            console.error('Failed to upload attachments:', error);
        } finally {
            setIsUploading(false);
        }
    };

    // Voice recording functions
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime((t) => t + 1);
            }, 1000);
        } catch (error) {
            console.error('Failed to start recording:', error);
            alert('Could not access microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
        }
    };

    const cancelRecording = () => {
        stopRecording();
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
    };

    const togglePreviewPlayback = () => {
        if (!audioPreviewRef.current || !audioUrl) return;

        if (isPlayingPreview) {
            audioPreviewRef.current.pause();
        } else {
            audioPreviewRef.current.play();
        }
        setIsPlayingPreview(!isPlayingPreview);
    };

    const formatRecordingTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Parse message content for attachments
    const parseMessageContent = (content: string) => {
        const attachmentRegex = /\[attachment\]\((https?:\/\/[^\)]+)\)/g;
        const parts: { type: 'text' | 'image' | 'audio' | 'file'; content: string }[] = [];
        let lastIndex = 0;
        let match;

        while ((match = attachmentRegex.exec(content)) !== null) {
            // Add text before the attachment
            if (match.index > lastIndex) {
                const textPart = content.substring(lastIndex, match.index).trim();
                if (textPart) {
                    parts.push({ type: 'text', content: textPart });
                }
            }

            // Determine attachment type
            const url = match[1];
            const lowerUrl = url.toLowerCase();
            if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)) {
                parts.push({ type: 'image', content: url });
            } else if (lowerUrl.match(/\.(mp3|wav|ogg|webm|m4a)(\?|$)/i) || lowerUrl.includes('voice-message')) {
                parts.push({ type: 'audio', content: url });
            } else {
                parts.push({ type: 'file', content: url });
            }

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < content.length) {
            const textPart = content.substring(lastIndex).trim();
            if (textPart) {
                parts.push({ type: 'text', content: textPart });
            }
        }

        // If no attachments found, return original content as text
        if (parts.length === 0) {
            parts.push({ type: 'text', content });
        }

        return parts;
    };

    // Render message content with attachments
    const renderMessageContent = (content: string, isOwn: boolean) => {
        const parts = parseMessageContent(content);

        return (
            <div className="space-y-2">
                {parts.map((part, index) => {
                    switch (part.type) {
                        case 'image':
                            return (
                                <a key={index} href={part.content} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={part.content}
                                        alt="Attachment"
                                        className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition"
                                        loading="lazy"
                                    />
                                </a>
                            );
                        case 'audio':
                            return (
                                <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl shadow-sm border border-blue-100">
                                    <button
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none"
                                        onClick={() => {
                                            const audio = document.getElementById(`audio-player-${index}`) as HTMLAudioElement;
                                            if (audio) {
                                                if (audio.paused) audio.play(); else audio.pause();
                                            }
                                        }}
                                        title="Play/Pause"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-6.518-3.759A1 1 0 007 8.118v7.764a1 1 0 001.234.97l6.518-1.757A1 1 0 0016 14.882V9.118a1 1 0 00-1.248-.95z" />
                                        </svg>
                                    </button>
                                    <audio id={`audio-player-${index}`} controls className="h-8 max-w-[180px] flex-1" style={{ display: 'inline-block' }}>
                                        <source src={part.content} />
                                    </audio>
                                    <span className="text-xs text-gray-500 font-mono min-w-[40px] text-right">
                                        <AudioDuration src={part.content} />
                                    </span>
                                </div>
                            );
                        case 'file':
                            return (
                                <a
                                    key={index}
                                    href={part.content}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-2 bg-black/20 rounded-lg hover:bg-black/30 transition"
                                >
                                    <FileText className="w-5 h-5 text-gray-300" />
                                    <span className="text-sm truncate max-w-[150px]">
                                        {part.content.split('/').pop()?.split('?')[0] || 'File'}
                                    </span>
                                    <Download className="w-4 h-4 text-gray-400" />
                                </a>
                            );
                        case 'text':
                        default:
                            return (
                                <p key={index} className="break-words text-sm md:text-base leading-relaxed">
                                    {part.content}
                                </p>
                            );
                    }
                })}
            </div>
        );
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
                                                {renderMessageContent(message.content, isOwn)}
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
                {/* Hidden file inputs */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, 'file')}
                />
                <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, 'image')}
                />

                {/* Attachment Preview */}
                {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {attachments.map((attachment, index) => (
                            <div key={index} className="relative group">
                                {attachment.type === 'image' ? (
                                    <img
                                        src={attachment.url}
                                        alt="Attachment"
                                        className="w-20 h-20 object-cover rounded-lg border border-white/20"
                                    />
                                ) : (
                                    <div className="w-20 h-20 bg-white/10 rounded-lg border border-white/20 flex flex-col items-center justify-center p-2">
                                        <FileText className="w-6 h-6 text-gray-400 mb-1" />
                                        <span className="text-[10px] text-gray-400 truncate w-full text-center">
                                            {attachment.file.name}
                                        </span>
                                    </div>
                                )}
                                <button
                                    onClick={() => removeAttachment(index)}
                                    className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Voice Recording Preview */}
                {audioUrl && !isRecording && (
                    <div className="flex items-center gap-3 mb-3 p-3 bg-white/5 rounded-xl border border-white/10">
                        <audio ref={audioPreviewRef} src={audioUrl} onEnded={() => setIsPlayingPreview(false)} />
                        <button
                            type="button"
                            onClick={togglePreviewPlayback}
                            className="p-2 bg-purple-500/20 rounded-full hover:bg-purple-500/30 transition"
                        >
                            {isPlayingPreview ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                        <div className="flex-1">
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full w-full bg-gradient-to-r from-purple-500 to-cyan-500 origin-left animate-pulse" />
                            </div>
                        </div>
                        <span className="text-sm text-gray-400">{formatRecordingTime(recordingTime)}</span>
                        <button
                            type="button"
                            onClick={cancelRecording}
                            className="p-2 hover:bg-red-500/20 rounded-full transition text-red-400"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Recording in progress */}
                {isRecording && (
                    <div className="flex items-center gap-3 mb-3 p-3 bg-red-500/10 rounded-xl border border-red-500/30">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm text-red-400">Recording...</span>
                        <span className="text-sm text-gray-400">{formatRecordingTime(recordingTime)}</span>
                        <div className="flex-1" />
                        <button
                            type="button"
                            onClick={stopRecording}
                            className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition"
                        >
                            <StopCircle className="w-5 h-5" />
                        </button>
                        <button
                            type="button"
                            onClick={cancelRecording}
                            className="p-2 hover:bg-white/10 rounded-full transition text-gray-400"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                <form onSubmit={(e) => {
                    e.preventDefault();
                    if (attachments.length > 0 || audioBlob) {
                        handleSendWithAttachments();
                    } else {
                        handleSendMessage(e);
                    }
                }} className="flex items-end gap-3">
                    {/* Attachment Button */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || isRecording}
                        className="p-3 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white disabled:opacity-50"
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
                            placeholder={isRecording ? "Recording voice message..." : "Type a message..."}
                            rows={1}
                            disabled={isRecording}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-28 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition resize-none text-white placeholder-gray-500 disabled:opacity-50"
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
                                onClick={() => imageInputRef.current?.click()}
                                disabled={isRecording}
                                className="p-2 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white disabled:opacity-50"
                            >
                                <Image className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`p-2 rounded-lg transition-all ${
                                    isRecording 
                                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                                        : 'hover:bg-white/10 text-gray-400 hover:text-white'
                                }`}
                            >
                                <Mic className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Send Button */}
                    <button
                        type="submit"
                        disabled={isUploading || (!messageText.trim() && attachments.length === 0 && !audioBlob)}
                        className="p-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-purple-500/30"
                    >
                        {isUploading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
