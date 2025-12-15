import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    AnimatedBackground,
    RoomHeader,
    StatsBar,
    TabNavigation,
    ChatSection,
    PostsTab,
    ResourcesTab,
    MembersSidebar,
    CreatePostModal,
    CreateResourceModal,
    TabType,
    mockPosts,
    mockResources
} from '../components/room-details';
import { RoomMember } from '../components/room-details/MembersSidebar';
import { wsManager } from '../hooks/useWebSocket';
import { useAuthStore } from '../store';
import { apiClient } from '../services/api';

interface RoomData {
    id: string;
    name: string | null;
    description: string | null;
    type: string;
    avatarUrl: string | null;
    createdById: string;
    members?: RoomMember[];
}

export default function RoomDetails() {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const { accessToken } = useAuthStore();

    // Room data state
    const [room, setRoom] = useState<RoomData | null>(null);
    const [members, setMembers] = useState<RoomMember[]>([]);
    const [isLoadingRoom, setIsLoadingRoom] = useState(true);
    const [isLoadingMembers, setIsLoadingMembers] = useState(true);
    const [isLeavingRoom, setIsLeavingRoom] = useState(false);

    // UI State
    const [activeTab, setActiveTab] = useState<TabType>('chats');
    const [showMembers, setShowMembers] = useState(true);

    // Modal State
    const [showPostModal, setShowPostModal] = useState(false);
    const [showResourceModal, setShowResourceModal] = useState(false);
    const [postContent, setPostContent] = useState('');
    const [resourceTitle, setResourceTitle] = useState('');
    const [resourceType, setResourceType] = useState('Document');

    // Connect to WebSocket when component mounts
    useEffect(() => {
        if (accessToken) {
            wsManager.connect(accessToken).catch(console.error);
        }
        return () => {
            // Don't disconnect here as other components may need the connection
        };
    }, [accessToken]);

    // Load room details
    useEffect(() => {
        const loadRoomDetails = async () => {
            if (!roomId) return;
            
            setIsLoadingRoom(true);
            try {
                const response = await apiClient.rooms.getRoomById(roomId);
                if (response.status === 200) {
                    // @ts-ignore
                    const roomData = response.data.data?.room;
                    setRoom(roomData);
                    // If room has members included, set them
                    if (roomData?.members) {
                        setMembers(roomData.members);
                        setIsLoadingMembers(false);
                    }
                }
            } catch (error) {
                console.error('Failed to load room details:', error);
            } finally {
                setIsLoadingRoom(false);
            }
        };

        loadRoomDetails();
    }, [roomId]);

    // Load room members separately if not included in room data
    useEffect(() => {
        const loadMembers = async () => {
            if (!roomId || (members.length > 0 && !isLoadingMembers)) return;
            
            setIsLoadingMembers(true);
            try {
                const response = await apiClient.rooms.getRoomMembers(roomId, 1, 100);
                if (response.status === 200) {
                    // @ts-ignore
                    const membersData = response.data.data?.members || [];
                    setMembers(membersData);
                }
            } catch (error) {
                console.error('Failed to load room members:', error);
            } finally {
                setIsLoadingMembers(false);
            }
        };

        // Only load if room is loaded and members not already loaded
        if (!isLoadingRoom && room) {
            loadMembers();
        }
    }, [roomId, isLoadingRoom, room]);

    // Handlers
    const handleCreatePost = () => {
        if (postContent.trim()) {
            console.log('Creating post:', postContent);
            setShowPostModal(false);
            setPostContent('');
        }
    };

    const handleCreateResource = () => {
        if (resourceTitle.trim()) {
            console.log('Creating resource:', { title: resourceTitle, type: resourceType });
            setShowResourceModal(false);
            setResourceTitle('');
            setResourceType('Document');
        }
    };

    const handleClosePostModal = () => {
        setShowPostModal(false);
        setPostContent('');
    };

    const handleCloseResourceModal = () => {
        setShowResourceModal(false);
        setResourceTitle('');
        setResourceType('Document');
    };

    const handleLeaveRoom = async () => {
        if (!roomId || isLeavingRoom) return;
        
        const confirmLeave = window.confirm('Are you sure you want to leave this room?');
        if (!confirmLeave) return;
        
        setIsLeavingRoom(true);
        try {
            await apiClient.rooms.leaveRoom(roomId);
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to leave room:', error);
            alert('Failed to leave room. Please try again.');
        } finally {
            setIsLeavingRoom(false);
        }
    };

    // Calculate online count
    const onlineCount = members.filter(m => m.user?.isOnline).length;

    if (!roomId) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <p className="text-gray-400">Room not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex">
            <AnimatedBackground />

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative">
                <RoomHeader
                    roomName={room?.name || ''}
                    roomType={room?.type}
                    memberCount={members.length}
                    onlineCount={onlineCount}
                    showMembers={showMembers}
                    onToggleMembers={() => setShowMembers(!showMembers)}
                    onLeaveRoom={handleLeaveRoom}
                    isLoading={isLoadingRoom}
                    isLeavingRoom={isLeavingRoom}
                />

                <StatsBar />

                <TabNavigation
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                {/* Content Area */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Main Chat/Content Area */}
                    <div className={`flex flex-col transition-all ${showMembers ? 'flex-[2]' : 'flex-1'}`}>
                        {activeTab === 'chats' && (
                            <ChatSection roomId={roomId} />
                        )}
                        {activeTab === 'posts' && (
                            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                                <PostsTab
                                    posts={mockPosts}
                                    onCreatePost={() => setShowPostModal(true)}
                                />
                            </div>
                        )}
                        {activeTab === 'resources' && (
                            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                                <ResourcesTab
                                    resources={mockResources}
                                    onCreateResource={() => setShowResourceModal(true)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Members Sidebar */}
                    {showMembers && (
                        <MembersSidebar
                            members={members}
                            isLoading={isLoadingMembers}
                            onClose={() => setShowMembers(false)}
                        />
                    )}
                </div>

                {/* Modals */}
                <CreatePostModal
                    isOpen={showPostModal}
                    postContent={postContent}
                    onPostContentChange={setPostContent}
                    onClose={handleClosePostModal}
                    onSubmit={handleCreatePost}
                />

                <CreateResourceModal
                    isOpen={showResourceModal}
                    resourceTitle={resourceTitle}
                    resourceType={resourceType}
                    onResourceTitleChange={setResourceTitle}
                    onResourceTypeChange={setResourceType}
                    onClose={handleCloseResourceModal}
                    onSubmit={handleCreateResource}
                />
            </div>
        </div>
    );
}