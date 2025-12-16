import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    _count?: {
        messages: number;
        members: number;
        posts: number;
        resources: number;
    };
}

interface PostData {
    id: string;
    content: string;
    authorId: string;
    attachments: string[];
    likes: number;
    createdAt: string;
    author: {
        id: string;
        username: string;
        displayName: string | null;
        avatarUrl: string | null;
    };
    _count: {
        comments: number;
    };
}

interface ResourceData {
    id: string;
    title: string;
    type: string;
    fileUrl: string | null;
    authorId: string;
    createdAt: string;
    author: {
        id: string;
        username: string;
        displayName: string | null;
        avatarUrl: string | null;
    };
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

    // Posts and Resources state
    const [posts, setPosts] = useState<PostData[]>([]);
    const [resources, setResources] = useState<ResourceData[]>([]);
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);
    const [isLoadingResources, setIsLoadingResources] = useState(false);
    const [isCreatingPost, setIsCreatingPost] = useState(false);
    const [isCreatingResource, setIsCreatingResource] = useState(false);

    // File upload state
    const [postAttachments, setPostAttachments] = useState<string[]>([]);
    const [resourceFileUrl, setResourceFileUrl] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const resourceFileInputRef = useRef<HTMLInputElement>(null);

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

    // Load posts
    const loadPosts = useCallback(async () => {
        if (!roomId) return;
        
        setIsLoadingPosts(true);
        try {
            const response = await apiClient.posts.getPosts(roomId);
            if (response.status === 200) {
                // @ts-ignore
                const postsData = response.data.data?.posts || [];
                setPosts(postsData);
            }
        } catch (error) {
            console.error('Failed to load posts:', error);
        } finally {
            setIsLoadingPosts(false);
        }
    }, [roomId]);

    // Load resources
    const loadResources = useCallback(async () => {
        if (!roomId) return;
        
        setIsLoadingResources(true);
        try {
            const response = await apiClient.resources.getResources(roomId);
            if (response.status === 200) {
                // @ts-ignore
                const resourcesData = response.data.data?.resources || [];
                setResources(resourcesData);
            }
        } catch (error) {
            console.error('Failed to load resources:', error);
        } finally {
            setIsLoadingResources(false);
        }
    }, [roomId]);

    // Load posts and resources when tab changes
    useEffect(() => {
        if (activeTab === 'posts' && posts.length === 0) {
            loadPosts();
        } else if (activeTab === 'resources' && resources.length === 0) {
            loadResources();
        }
    }, [activeTab, loadPosts, loadResources, posts.length, resources.length]);

    // Handle file upload for posts
    const handlePostFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const response = await apiClient.upload.uploadFile(file);
            if (response.status === 201) {
                // @ts-ignore
                const fileUrl = response.data.data?.file?.url;
                if (fileUrl) {
                    setPostAttachments(prev => [...prev, fileUrl]);
                }
            }
        } catch (error) {
            console.error('Failed to upload file:', error);
            alert('Failed to upload file');
        } finally {
            setIsUploading(false);
        }
    };

    // Handle file upload for resources
    const handleResourceFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const response = await apiClient.upload.uploadFile(file);
            if (response.status === 201) {
                // @ts-ignore
                const fileUrl = response.data.data?.file?.url;
                if (fileUrl) {
                    setResourceFileUrl(fileUrl);
                }
            }
        } catch (error) {
            console.error('Failed to upload file:', error);
            alert('Failed to upload file');
        } finally {
            setIsUploading(false);
        }
    };

    // Handlers
    const handleCreatePost = async () => {
        if (!postContent.trim() || !roomId) return;
        
        setIsCreatingPost(true);
        try {
            const response = await apiClient.posts.createPost(roomId, postContent, postAttachments);
            if (response.status === 201) {
                // @ts-ignore
                const newPost = response.data.data?.post;
                if (newPost) {
                    setPosts(prev => [newPost, ...prev]);
                }
                setShowPostModal(false);
                setPostContent('');
                setPostAttachments([]);
            }
        } catch (error) {
            console.error('Failed to create post:', error);
            alert('Failed to create post');
        } finally {
            setIsCreatingPost(false);
        }
    };

    const handleCreateResource = async () => {
        if (!resourceTitle.trim() || !roomId) return;
        
        setIsCreatingResource(true);
        try {
            const response = await apiClient.resources.createResource(
                roomId,
                resourceTitle,
                resourceType,
                resourceFileUrl || undefined
            );
            if (response.status === 201) {
                // @ts-ignore
                const newResource = response.data.data?.resource;
                if (newResource) {
                    setResources(prev => [newResource, ...prev]);
                }
                setShowResourceModal(false);
                setResourceTitle('');
                setResourceType('Document');
                setResourceFileUrl('');
            }
        } catch (error) {
            console.error('Failed to create resource:', error);
            alert('Failed to create resource');
        } finally {
            setIsCreatingResource(false);
        }
    };

    const handleClosePostModal = () => {
        setShowPostModal(false);
        setPostContent('');
        setPostAttachments([]);
    };

    const handleCloseResourceModal = () => {
        setShowResourceModal(false);
        setResourceTitle('');
        setResourceType('Document');
        setResourceFileUrl('');
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

    // Transform posts to the expected format for PostsTab
    const transformedPosts = posts.map(post => ({
        id: parseInt(post.id.slice(0, 8), 16) || Math.random(), // Convert UUID to number for display
        user: post.author.displayName || post.author.username,
        avatar: post.author.avatarUrl || post.author.username.charAt(0).toUpperCase(),
        content: post.content,
        likes: post.likes,
        comments: post._count.comments,
        date: new Date(post.createdAt).toLocaleDateString(),
        gradient: 'from-purple-500 to-pink-500',
        commentsList: [], // Comments are loaded separately
    }));

    // Transform resources to the expected format for ResourcesTab
    const transformedResources = resources.map(resource => ({
        id: parseInt(resource.id.slice(0, 8), 16) || Math.random(),
        title: resource.title,
        type: resource.type,
        sharedBy: resource.author.displayName || resource.author.username,
        date: new Date(resource.createdAt).toLocaleDateString(),
        icon: null, // Will be handled by ResourcesTab
        gradient: 'from-cyan-600 to-blue-600',
        fileUrl: resource.fileUrl,
    }));

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

            {/* Hidden file inputs */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handlePostFileUpload}
                className="hidden"
                accept="image/*,application/pdf,.doc,.docx,.txt"
            />
            <input
                type="file"
                ref={resourceFileInputRef}
                onChange={handleResourceFileUpload}
                className="hidden"
                accept="*/*"
            />

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

                <StatsBar
                    messageCount={room?._count?.messages || 0}
                    postCount={room?._count?.posts || 0}
                    resourceCount={room?._count?.resources || 0}
                    isLoading={isLoadingRoom}
                />

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
                                {isLoadingPosts ? (
                                    <div className="flex items-center justify-center py-20">
                                        <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
                                    </div>
                                ) : (
                                    <PostsTab
                                        posts={transformedPosts}
                                        onCreatePost={() => setShowPostModal(true)}
                                    />
                                )}
                            </div>
                        )}
                        {activeTab === 'resources' && (
                            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                                {isLoadingResources ? (
                                    <div className="flex items-center justify-center py-20">
                                        <div className="animate-spin h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full"></div>
                                    </div>
                                ) : (
                                    <ResourcesTab
                                        resources={transformedResources}
                                        onCreateResource={() => setShowResourceModal(true)}
                                    />
                                )}
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
                    isLoading={isCreatingPost}
                    attachments={postAttachments}
                    onAttachFile={() => fileInputRef.current?.click()}
                    isUploading={isUploading}
                />

                <CreateResourceModal
                    isOpen={showResourceModal}
                    resourceTitle={resourceTitle}
                    resourceType={resourceType}
                    onResourceTitleChange={setResourceTitle}
                    onResourceTypeChange={setResourceType}
                    onClose={handleCloseResourceModal}
                    onSubmit={handleCreateResource}
                    isLoading={isCreatingResource}
                    fileUrl={resourceFileUrl}
                    onUploadFile={() => resourceFileInputRef.current?.click()}
                    isUploading={isUploading}
                />
            </div>
        </div>
    );
}