import { useState, useRef, useEffect } from 'react';
import { useChatStore, useAuthStore } from '../store';
import { apiClient } from '../services/api';
import { wsManager } from '../hooks/useWebSocket';
import MessageList from './MessageList';
import { type MessageWithSender, MessageType, MessageStatus } from '@kuraxx/types';

export default function ChatWindow() {
  const { selectedRoomId, messages, rooms, setMessages } = useChatStore();
  const { user } = useAuthStore();
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const roomMessages = messages.filter((m) => m.roomId === selectedRoomId);

  useEffect(() => {
    if (selectedRoomId) {
      const loadMessages = async () => {
        try {
          const response = await apiClient.rooms.getRoomMessages(selectedRoomId);
          if (response.status === 200) {
            // @ts-ignore
            const newMessages = response.data.data?.messages || [];
            // Simple strategy: replace all messages for this room
            // In a real app, we'd merge and de-duplicate
            useChatStore.setState((state) => ({
              messages: [
                ...state.messages.filter((m) => m.roomId !== selectedRoomId),
                ...newMessages,
              ],
            }));
          }
        } catch (error) {
          console.error('Failed to load messages:', error);
        }
      };
      loadMessages();
    }
  }, [selectedRoomId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [roomMessages]);

  const handleTyping = () => {
    if (!isTyping && selectedRoomId) {
      setIsTyping(true);
      wsManager.startTyping(selectedRoomId);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (selectedRoomId) {
        wsManager.stopTyping(selectedRoomId);
      }
    }, 3000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedRoomId || !user) return;

    const tempMessage: MessageWithSender = {
      id: `temp-${Date.now()}`,
      roomId: selectedRoomId,
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
      // Send via API - API will save to DB AND publish to Redis
      // WS Service receives from Redis and broadcasts to all clients
      const response = await apiClient.messages.sendMessage(selectedRoomId, messageText, tempMessage.id);
      
      if (response.status === 201) {
        // @ts-ignore
        const realMessage = response.data.data.message;
        useChatStore.getState().replaceMessage(tempMessage.id, realMessage);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // TODO: Show error state for the message
    }

    // Note: No wsManager.sendMessage() needed - API publishes to Redis,
    // WS Service subscribes and broadcasts to all connected clients
  };

  if (!selectedRoom) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Room not found
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white md:bg-gray-50/50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex items-center shadow-sm z-10 sticky top-0">
        <button
          onClick={() => useChatStore.getState().setSelectedRoom(null)}
          className="mr-3 md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md mr-3 ring-2 ring-white">
          {selectedRoom.name?.charAt(0).toUpperCase() || '#'}
        </div>
        
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-900 truncate">{selectedRoom.name}</h2>
          <p className="text-xs text-gray-500 flex items-center font-medium">
            {selectedRoom.type === 'DIRECT' ? 'Direct Message' : selectedRoom.type.charAt(0) + selectedRoom.type.slice(1).toLowerCase()}
            {isTyping && (
              <span className="ml-2 text-blue-500 font-semibold animate-pulse flex items-center gap-1">
                <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                Someone is typing...
              </span>
            )}
          </p>
        </div>
        
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden relative bg-gray-50/50">
        <MessageList messages={roomMessages} currentUserId={user?.id} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10"
      >
        <div className="flex gap-3 items-end max-w-4xl mx-auto">
          <button
            type="button"
            className="p-2.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all duration-200 mb-0.5"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          
          <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white transition-all duration-200 border border-transparent focus-within:border-blue-500/50 shadow-inner">
            <input
              type="text"
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message..."
              className="w-full bg-transparent border-none focus:ring-0 p-0 text-gray-800 placeholder-gray-500 text-sm md:text-base"
            />
          </div>
          
          <button
            type="submit"
            disabled={!messageText.trim()}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 mb-0.5 disabled:hover:translate-y-0 disabled:shadow-none"
          >
            <svg className="w-5 h-5 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>

      <div ref={messagesEndRef} />
    </div>
  );
}
