import { useChatStore } from '../store';
import { wsManager } from '../hooks/useWebSocket';
import type { Room } from '@kuraxx/types';

interface RoomListProps {
  rooms: Room[];
  selectedRoomId: string | null;
}

export default function RoomList({ rooms, selectedRoomId }: RoomListProps) {
  const { setSelectedRoom } = useChatStore();

  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room.id);
    wsManager.joinRoom(room.id);
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
      {rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400 p-4">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500">No rooms yet</p>
          <p className="text-xs mt-1 text-gray-400">Create or discover one!</p>
        </div>
      ) : (
        rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => handleSelectRoom(room)}
            className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-center gap-3 group relative overflow-hidden ${
              selectedRoomId === room.id
                ? 'bg-blue-50 text-blue-900 shadow-sm ring-1 ring-blue-100'
                : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
            }`}
          >
            {selectedRoomId === room.id && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full"></div>
            )}
            
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm transition-transform group-hover:scale-105 flex-shrink-0
              ${selectedRoomId === room.id 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-200' 
                : 'bg-white border border-gray-100 text-gray-500 group-hover:border-blue-200 group-hover:text-blue-500'}
            `}>
              {room.name?.charAt(0).toUpperCase() || '#'}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <p className={`font-semibold truncate text-sm ${selectedRoomId === room.id ? 'text-blue-900' : 'text-gray-900'}`}>
                  {room.name}
                </p>
                {/* Placeholder for last message time */}
                {/* <span className="text-[10px] text-gray-400">12:30</span> */}
              </div>
              <p className={`text-xs truncate mt-0.5 flex items-center gap-1 ${selectedRoomId === room.id ? 'text-blue-600' : 'text-gray-500'}`}>
                {room.type === 'CHANNEL' && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                )}
                {room.type === 'GROUP' && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )}
                {room.type === 'DIRECT' ? 'Direct Message' : room.type.charAt(0) + room.type.slice(1).toLowerCase()}
              </p>
            </div>
          </button>
        ))
      )}
    </div>
  );
}
