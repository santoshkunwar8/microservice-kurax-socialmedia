import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { useChatStore } from '../store';
import { Room, RoomType } from '@kuraxx/types';

interface DiscoverRoomsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DiscoverRoomsModal({ isOpen, onClose }: DiscoverRoomsModalProps) {
  const [rooms, setDiscoverableRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [passcodePrompt, setPasscodePrompt] = useState<{ room: Room; open: boolean }>({ room: null as any, open: false });
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const { rooms: myRooms, setRooms } = useChatStore();

  useEffect(() => {
    if (isOpen) {
      loadRooms();
    }
  }, [isOpen]);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const response = await apiClient.rooms.discoverRooms();
      if (response.status === 200) {
        // @ts-ignore
        setDiscoverableRooms(response.data.data.rooms);
      }
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (room: Room) => {
    if (room.type === 'PRIVATE') {
      setPasscodePrompt({ room, open: true });
      setPasscodeInput('');
      setPasscodeError('');
      return;
    }
    await doJoin(room);
  };

  const doJoin = async (room: Room, passcode?: string) => {
    setJoiningId(room.id);
    try {
      const response = await apiClient.rooms.joinRoom(room.id, passcode);
      if (response.status === 200) {
        setRooms([...myRooms, room]);
        setDiscoverableRooms(rooms.filter(r => r.id !== room.id));
        onClose();
      }
    } catch (error: any) {
      if (room.type === 'PRIVATE') {
        setPasscodeError('Invalid passcode');
      }
      console.error('Failed to join room:', error);
    } finally {
      setJoiningId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden animate-fade-in-up">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Discover Rooms</h2>
            <p className="text-sm text-gray-500 mt-1">Find new communities to join</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 hover:bg-white/50 p-2 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <p className="text-gray-500 text-sm">Searching for rooms...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">No rooms found</h3>
              <p className="text-gray-500 mt-1">Check back later for new communities.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rooms.map((room) => (
                <div 
                  key={room.id} 
                  className="group flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm
                      ${room.type === RoomType.PRIVATE ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-cyan-600'}`}
                    >
                      {room.name?.charAt(0).toUpperCase() || '#'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {room.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider
                          ${room.type === RoomType.PRIVATE ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}
                        >
                          {room.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoin(room)}
                    disabled={joiningId === room.id}
                    className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg 
                      hover:bg-blue-600 hover:text-white hover:border-transparent disabled:opacity-50 disabled:cursor-not-allowed 
                      transition-all duration-200 shadow-sm hover:shadow"
                  >
                    {joiningId === room.id ? (
                      <span className="flex items-center space-x-2">
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Joining...</span>
                      </span>
                    ) : room.type === 'PRIVATE' ? 'Join (Passcode)' : 'Join'}
                  </button>
                      {/* Passcode Modal */}
                      {passcodePrompt.open && (
                        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs">
                            <h3 className="text-lg font-bold mb-2">Enter Passcode</h3>
                            <p className="text-sm text-gray-500 mb-4">This room requires a passcode to join.</p>
                            <input
                              type="password"
                              className="w-full px-3 py-2 border border-gray-200 rounded mb-2"
                              placeholder="Passcode"
                              value={passcodeInput}
                              onChange={e => setPasscodeInput(e.target.value)}
                              autoFocus
                            />
                            {passcodeError && <div className="text-red-500 text-xs mb-2">{passcodeError}</div>}
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                className="px-3 py-1.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                                onClick={() => setPasscodePrompt({ room: null as any, open: false })}
                              >Cancel</button>
                              <button
                                className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
                                onClick={async () => {
                                  setPasscodeError('');
                                  await doJoin(passcodePrompt.room, passcodeInput);
                                  setPasscodePrompt({ room: null as any, open: false });
                                }}
                                disabled={!passcodeInput || joiningId === passcodePrompt.room?.id}
                              >Join</button>
                            </div>
                          </div>
                        </div>
                      )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
