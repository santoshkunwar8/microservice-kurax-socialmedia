import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useChatStore } from '../store';
import { apiClient } from '../services/api';
import { wsManager } from '../hooks/useWebSocket';
import {
  AnimatedBackground,
  Sidebar,
  Header,
  StatsGrid,
  RoomFilters,
  RoomCard,
  CreateRoomModal,
  FilterType,
} from '../components/dashboard';

interface Room {
  id: string;
  name: string | null;
  type: 'GROUP' | 'DIRECT' | 'PRIVATE' | 'CHANNEL';
  memberCount?: number;
  _count?: {
    members: number;
    messages: number;
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { rooms, setRooms, setSelectedRoom } = useChatStore();

  // UI State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Discover rooms (all public rooms)
  const [discoverRooms, setDiscoverRooms] = useState<Room[]>([]);

  // Stats (simulated for now)
  const [onlineUsers, setOnlineUsers] = useState(15847);
  const [activeRooms, setActiveRooms] = useState(324);

  // Load user's rooms and discover rooms
  useEffect(() => {
    const loadRooms = async () => {
      try {
        setIsLoading(true);
        const [userRoomsRes, discoverRes] = await Promise.all([
          apiClient.rooms.listRooms(),
          apiClient.rooms.discoverRooms(),
        ]);

        if (userRoomsRes.status === 200) {
          // @ts-ignore
          const roomsData = userRoomsRes.data.data?.rooms || [];
          setRooms(roomsData);
        }

        if (discoverRes.status === 200) {
          // @ts-ignore
          const discoverData = discoverRes.data.data?.rooms || [];
          setDiscoverRooms(discoverData);
        }
      } catch (error) {
        console.error('Failed to load rooms:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRooms();
  }, [setRooms]);

  // Simulate real-time stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers((prev) => prev + Math.floor(Math.random() * 20 - 10));
      setActiveRooms((prev) => Math.max(1, prev + Math.floor(Math.random() * 4 - 2)));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    wsManager.disconnect();
    logout();
    navigate('/login');
  };

  const handleCreateRoom = async (name: string, type: 'GROUP' | 'PRIVATE') => {
    setIsCreating(true);
    try {
      const response = await apiClient.rooms.createRoom(name, type);
      if (response.status === 201 || response.status === 200) {
        // @ts-ignore
        const newRoom = response.data.data?.room || response.data.data;
        if (newRoom) {
          setRooms([...rooms, newRoom]);
        }
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Failed to create room:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    try {
      const response = await apiClient.rooms.joinRoom(roomId);
      if (response.status === 200 || response.status === 201) {
        // Refresh rooms list
        const roomsRes = await apiClient.rooms.listRooms();
        if (roomsRes.status === 200) {
          // @ts-ignore
          const roomsData = roomsRes.data.data?.rooms || [];
          setRooms(roomsData);
        }
      }
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoom(roomId);
    navigate(`/room/${roomId}`);
  };

  // Get user's room IDs for checking if joined
  const userRoomIds = new Set(rooms.map((r: Room) => r.id));

  // Combine user rooms and discover rooms, removing duplicates
  const allRooms = [
    ...rooms,
    ...discoverRooms.filter((r: Room) => !userRoomIds.has(r.id)),
  ];

  // Filter rooms based on search and filter type
  const filteredRooms = allRooms.filter((room: Room) => {
    const matchesSearch = (room.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'public' && room.type === 'GROUP') ||
      (filterType === 'private' && room.type !== 'GROUP');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <AnimatedBackground />

      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateRoom}
        isLoading={isCreating}
      />

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onCreateRoom={() => setShowCreateModal(true)}
        userRoomsCount={rooms.length}
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <main
        className={`transition-all duration-300 relative
          ml-0 md:${sidebarCollapsed ? 'ml-20' : 'ml-72'}
          ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-72'}
        `}
      >
        <Header
          user={user}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onLogout={handleLogout}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        <StatsGrid
          onlineUsers={onlineUsers}
          activeRooms={activeRooms}
          userRoomsCount={rooms.length}
        />

        <RoomFilters filterType={filterType} onFilterChange={setFilterType} />

        {/* Rooms Grid */}
        <section className="px-4 md:px-8 py-4 md:py-6 pb-8 md:pb-12">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <svg
                  className="animate-spin h-10 w-10 text-purple-500 mx-auto mb-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-gray-400">Loading rooms...</p>
              </div>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 mb-4">No rooms found</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-semibold hover:from-purple-500 hover:to-cyan-500 transition"
              >
                Create your first room
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
              {filteredRooms.map((room: Room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onJoin={handleJoinRoom}
                  onSelect={handleSelectRoom}
                  isJoined={userRoomIds.has(room.id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
