import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
    mockOnlineMembers,
    mockOfflineMembers,
    mockPosts,
    mockResources
} from '../components/room-details';
import { wsManager } from '../hooks/useWebSocket';
import { useAuthStore } from '../store';

export default function RoomDetails() {
    const { roomId } = useParams<{ roomId: string }>();
    const { accessToken } = useAuthStore();

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
                    showMembers={showMembers}
                    onToggleMembers={() => setShowMembers(!showMembers)}
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
                            onlineMembers={mockOnlineMembers}
                            offlineMembers={mockOfflineMembers}
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