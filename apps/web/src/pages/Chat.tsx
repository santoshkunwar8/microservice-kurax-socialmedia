import { useEffect, useState } from 'react';
import { useAuthStore, useChatStore } from '../store';
import { apiClient } from '../services/api';
import { wsManager } from '../hooks/useWebSocket';
import RoomList from '../components/RoomList';
import ChatWindow from '../components/ChatWindow';
import CreateRoomModal from '../components/CreateRoomModal';
import DiscoverRoomsModal from '../components/DiscoverRoomsModal';

export default function ChatPage() {
  const { user, logout } = useAuthStore();
  const { selectedRoomId, rooms, setRooms } = useChatStore();
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const [isDiscoverModalOpen, setIsDiscoverModalOpen] = useState(false);

  useEffect(() => {
    // Fetch rooms on mount
    const loadRooms = async () => {
      try {
        const response = await apiClient.rooms.listRooms();
        if (response.status === 200) {
          // @ts-ignore - response type needs update
          const roomsData = response.data.data?.rooms || [];
          setRooms(roomsData);
        }
      } catch (error) {
        console.error('Failed to load rooms:', error);
      }
    };

    loadRooms();
  }, [setRooms]);

  const handleLogout = () => {
    wsManager.disconnect();
    logout();
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar - Hidden on mobile when chat is open */}
      <div className={`
        w-full md:w-80 bg-white border-r border-gray-200 flex flex-col z-20 transition-all duration-300 ease-in-out
        ${selectedRoomId ? 'hidden md:flex' : 'flex'}
      `}>
        <div className="p-5 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200 ring-2 ring-white transition-transform group-hover:scale-105">
                  {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate text-base group-hover:text-blue-600 transition-colors">
                  {user?.displayName}
                </h3>
                <p className="text-xs text-gray-500 truncate font-medium">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-100"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setIsCreateRoomModalOpen(true)}
              className="flex-1 py-2.5 px-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 transform hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              New Room
            </button>
            <button
              onClick={() => setIsDiscoverModalOpen(true)}
              className="flex-1 py-2.5 px-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-all duration-200 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Discover
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <RoomList rooms={rooms} selectedRoomId={selectedRoomId} />
        </div>
      </div>

      {/* Main Chat Area - Hidden on mobile when no chat selected */}
      <div className={`
        flex-1 flex flex-col bg-white relative
        ${!selectedRoomId ? 'hidden md:flex' : 'flex'}
      `}>
        {selectedRoomId ? (
          <ChatWindow />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 p-8">
            <div className="w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center mb-6 animate-bounce-slow">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to KuraXX</h2>
            <p className="text-gray-500 text-center max-w-md">
              Select a room from the sidebar or create a new one to start chatting with your team.
            </p>
          </div>
        )}
      </div>

      <CreateRoomModal
        isOpen={isCreateRoomModalOpen}
        onClose={() => setIsCreateRoomModalOpen(false)}
      />
      
      <DiscoverRoomsModal
        isOpen={isDiscoverModalOpen}
        onClose={() => setIsDiscoverModalOpen(false)}
      />
    </div>
  );
}
