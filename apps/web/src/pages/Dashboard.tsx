import { useEffect, useState, useCallback, useMemo } from 'react';
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
  topics?: string[];
  _count?: {
    members: number;
    messages: number;
  };
}

interface PlatformStats {
  onlineUsers: number;
  totalUsers: number;
  activeRooms: number;
  totalRooms: number;
  messagesToday: number;
  messagesTotal: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, accessToken } = useAuthStore();
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

  // Stats (real-time from API)
  const [stats, setStats] = useState<PlatformStats>({
    onlineUsers: 0,
    totalUsers: 0,
    activeRooms: 0,
    totalRooms: 0,
    messagesToday: 0,
    messagesTotal: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Fetch stats from API
  const fetchStats = useCallback(async () => {
    try {
      const response = await apiClient.stats.getStats();
      if (response.status === 200 && response.data.data) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Connect to WebSocket and listen for stats updates
  useEffect(() => {
    if (!accessToken) return;

    wsManager.connect(accessToken).catch(console.error);

    // Listen for stats updates via WebSocket
    const handleStatsUpdate = (data: unknown) => {
      setStats(data as PlatformStats);
    };

    wsManager.on('stats:update', handleStatsUpdate);

    return () => {
      wsManager.off('stats:update', handleStatsUpdate);
    };
  }, [accessToken]);

  // Fetch initial stats and poll for updates
  useEffect(() => {
    fetchStats();

    // Poll stats every 30 seconds for real-time updates
    const statsInterval = setInterval(fetchStats, 30000);

    return () => clearInterval(statsInterval);
  }, [fetchStats]);

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

  const handleLogout = () => {
    wsManager.disconnect();
    logout();
    navigate('/login');
  };

  const handleCreateRoom = async (name: string, type: 'GROUP' | 'PRIVATE', topics: string[] = []) => {
    setIsCreating(true);
    try {
      const response = await apiClient.rooms.createRoom(name, type, topics);
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

  // Compute topics from all rooms
  const topicsWithCount = useMemo(() => {
    const topicMap = new Map<string, number>();
    allRooms.forEach((room: Room) => {
      if (room.topics && room.topics.length > 0) {
        room.topics.forEach(topic => {
          topicMap.set(topic, (topicMap.get(topic) || 0) + 1);
        });
      }
    });
    return Array.from(topicMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Show top 10 topics
  }, [allRooms]);

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
        topics={topicsWithCount}
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
          onlineUsers={stats.onlineUsers}
          activeRooms={stats.activeRooms}
          messagesToday={stats.messagesToday}
          userRoomsCount={rooms.length}
          totalUsers={stats.totalUsers}
          totalRooms={stats.totalRooms}
          isLoading={isLoadingStats}
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
