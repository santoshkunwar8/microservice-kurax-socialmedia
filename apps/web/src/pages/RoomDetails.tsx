import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    AnimatedBackground,
    RoomHeader,
    StatsBar,
    TabNavigation,
    ChatsTab,
    PostsTab,
    ResourcesTab,
    MessageInput,
    MembersSidebar,
    CreatePostModal,
    CreateResourceModal,
    TabType,
    mockOnlineMembers,
    mockOfflineMembers,
    mockChats,
    mockPosts,
    mockResources
} from '../components/room-details';

export default function RoomDetails() {
    const { roomId } = useParams<{ roomId: string }>();

    // UI State
    const [activeTab, setActiveTab] = useState<TabType>('chats');
    const [message, setMessage] = useState('');
    const [showMembers, setShowMembers] = useState(true);

    // Modal State
    const [showPostModal, setShowPostModal] = useState(false);
    const [showResourceModal, setShowResourceModal] = useState(false);
    const [postContent, setPostContent] = useState('');
    const [resourceTitle, setResourceTitle] = useState('');
    const [resourceType, setResourceType] = useState('Document');

    // Handlers
    const handleSendMessage = () => {
        if (message.trim()) {
            console.log('Sending message:', message);
            setMessage('');
        }
    };

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
                        <div className="flex-1 overflow-y-auto p-8">
                            {activeTab === 'chats' && <ChatsTab chats={mockChats} />}
                            {activeTab === 'posts' && (
                                <PostsTab
                                    posts={mockPosts}
                                    onCreatePost={() => setShowPostModal(true)}
                                />
                            )}
                            {activeTab === 'resources' && (
                                <ResourcesTab
                                    resources={mockResources}
                                    onCreateResource={() => setShowResourceModal(true)}
                                />
                            )}
                        </div>

                        {/* Message Input (only for chats) */}
                        {activeTab === 'chats' && (
                            <MessageInput
                                message={message}
                                onMessageChange={setMessage}
                                onSendMessage={handleSendMessage}
                            />
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