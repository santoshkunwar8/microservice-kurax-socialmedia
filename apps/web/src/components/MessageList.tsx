import { useChatStore } from '../store';
import type { MessageWithSender, MessageType } from '@kuraxx/types';

interface MessageListProps {
  messages: MessageWithSender[];
  currentUserId?: string;
}

// System message component - Discord/WhatsApp style
function SystemMessage({ message }: { message: MessageWithSender }) {
  const isJoinMessage = message.content.includes('joined the room');
  const isLeaveMessage = message.content.includes('left the room');
  
  return (
    <div className="flex justify-center py-2 animate-fade-in-up">
      <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-100/80 rounded-full">
        {/* Icon based on action */}
        <span className="flex-shrink-0">
          {isJoinMessage ? (
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          ) : isLeaveMessage ? (
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </span>
        
        {/* Message text */}
        <span className="text-xs font-medium text-gray-500">
          {message.content}
        </span>
        
        {/* Timestamp */}
        <span className="text-[10px] text-gray-400 ml-1">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

export default function MessageList({
  messages,
  currentUserId,
}: MessageListProps) {
  const typingUsers = useChatStore((state) => state.typingUsers);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50 custom-scrollbar">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="font-medium text-gray-500">No messages yet</p>
          <p className="text-sm mt-1 text-gray-400">Start the conversation!</p>
        </div>
      ) : (
        messages.map((message, index) => {
          // Handle system messages (join/leave)
          if (message.type === 'SYSTEM') {
            return <SystemMessage key={message.id} message={message} />;
          }

          const isOwn = message.senderId === currentUserId;
          const prevMessage = messages[index - 1];
          const showAvatar = !isOwn && (index === 0 || prevMessage?.senderId !== message.senderId || prevMessage?.type === 'SYSTEM');
          const showName = !isOwn && (index === 0 || prevMessage?.senderId !== message.senderId || prevMessage?.type === 'SYSTEM');
          
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group animate-fade-in-up`}
            >
              <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                {!isOwn && (
                  <div className="w-8 flex-shrink-0 flex flex-col justify-end">
                    {showAvatar ? (
                      <img
                        src={
                          message.sender?.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            message.sender?.displayName || 'User'
                          )}&background=random`
                        }
                        alt={message.sender?.displayName || 'User'}
                        className="w-8 h-8 rounded-full shadow-sm ring-2 ring-white"
                      />
                    ) : <div className="w-8" />}
                  </div>
                )}
                
                <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                  {showName && (
                    <p className="text-xs text-gray-500 font-medium mb-1 ml-1">
                      {message.sender?.displayName}
                    </p>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl shadow-sm text-[15px] leading-relaxed break-words transition-all duration-200 hover:shadow-md ${
                      isOwn
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                  </div>
                  <p className={`text-[10px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isOwn ? 'text-right mr-1' : 'text-left ml-1'} text-gray-400 font-medium`}>
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Typing indicator */}
      {typingUsers.size > 0 && (
        <div className="flex items-center gap-2 text-gray-500 text-sm ml-12 animate-fade-in">
          <div className="space-y-1">
            {Array.from(typingUsers.entries()).map(([userId, isTyping]) => {
              if (!isTyping) return null;
              return (
                <div key={userId} className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-full shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                    <div
                      className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    />
                    <div
                      className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Typing...</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
