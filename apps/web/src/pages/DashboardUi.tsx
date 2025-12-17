import React, { useState, useEffect } from 'react';
import {
    Search, Plus, TrendingUp, Users, MessageCircle, Globe,
    Lock, Star, Filter, MoreVertical, Bell, Settings,
    LogOut, User, Zap, Activity, Eye, Crown, ChevronRight,
    Hash, Video, Music, Gamepad2, Coffee, BookOpen, Code, Sparkles
} from 'lucide-react';

export default function KuraXDashboard() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [onlineUsers, setOnlineUsers] = useState(15847);
    const [activeRooms, setActiveRooms] = useState(324);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newRoomTitle, setNewRoomTitle] = useState('');
    const [newRoomType, setNewRoomType] = useState('public');
    const [newRoomCategory, setNewRoomCategory] = useState('General');

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setOnlineUsers(prev => prev + Math.floor(Math.random() * 20 - 10));
            setActiveRooms(prev => prev + Math.floor(Math.random() * 4 - 2));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const stats = [
        {
            label: 'Online Users',
            value: onlineUsers.toLocaleString(),
            icon: <Activity className="w-5 h-5" />,
            gradient: 'from-green-500 to-emerald-500',
            change: '+12%'
        },
        {
            label: 'Active Rooms',
            value: activeRooms,
            icon: <MessageCircle className="w-5 h-5" />,
            gradient: 'from-purple-500 to-pink-500',
            change: '+8%'
        },
        {
            label: 'Messages Today',
            value: '2.4M',
            icon: <Zap className="w-5 h-5" />,
            gradient: 'from-cyan-500 to-blue-500',
            change: '+24%'
        },
        {
            label: 'Your Rooms',
            value: '12',
            icon: <Star className="w-5 h-5" />,
            gradient: 'from-orange-500 to-red-500',
            change: '+2'
        }
    ];

    const trendingTopics = [
        { name: 'Web Development', count: '1.2k', icon: <Code className="w-4 h-4" /> },
        { name: 'Gaming', count: '890', icon: <Gamepad2 className="w-4 h-4" /> },
        { name: 'Music Production', count: '654', icon: <Music className="w-4 h-4" /> },
        { name: 'Coffee Chat', count: '543', icon: <Coffee className="w-4 h-4" /> }
    ];

    const rooms = [
        {
            id: 1,
            title: 'Tech Innovators Hub',
            description: 'Discuss latest tech trends, startups, and innovations',
            members: 1247,
            online: 234,
            category: 'Technology',
            type: 'public',
            gradient: 'from-purple-500 via-pink-500 to-red-500',
            icon: <Code className="w-6 h-6" />,
            isVerified: true,
            messages: '12.4k',
            activity: 'Very Active'
        },
        {
            id: 2,
            title: 'Gaming Legends',
            description: 'Connect with gamers worldwide, share tips and strategies',
            members: 2156,
            online: 456,
            category: 'Gaming',
            type: 'public',
            gradient: 'from-cyan-500 via-blue-500 to-purple-500',
            icon: <Gamepad2 className="w-6 h-6" />,
            isVerified: true,
            messages: '24.8k',
            activity: 'Very Active'
        },
        {
            id: 3,
            title: 'Design Studio',
            description: 'UI/UX designers sharing work and feedback',
            members: 856,
            online: 142,
            category: 'Design',
            type: 'private',
            gradient: 'from-orange-500 via-pink-500 to-purple-500',
            icon: <Sparkles className="w-6 h-6" />,
            isVerified: true,
            messages: '8.2k',
            activity: 'Active'
        },
        {
            id: 4,
            title: 'Startup Founders',
            description: 'Network with entrepreneurs and startup enthusiasts',
            members: 543,
            online: 89,
            category: 'Business',
            type: 'private',
            gradient: 'from-green-500 via-emerald-500 to-teal-500',
            icon: <TrendingUp className="w-6 h-6" />,
            isVerified: false,
            messages: '6.7k',
            activity: 'Active'
        },
        {
            id: 5,
            title: 'Music Producers Club',
            description: 'Share beats, get feedback, collaborate on projects',
            members: 1089,
            online: 178,
            category: 'Music',
            type: 'public',
            gradient: 'from-pink-500 via-purple-500 to-indigo-500',
            icon: <Music className="w-6 h-6" />,
            isVerified: true,
            messages: '15.3k',
            activity: 'Very Active'
        },
        {
            id: 6,
            title: 'Book Club Society',
            description: 'Discuss your favorite books and discover new reads',
            members: 432,
            online: 67,
            category: 'Literature',
            type: 'public',
            gradient: 'from-amber-500 via-orange-500 to-red-500',
            icon: <BookOpen className="w-6 h-6" />,
            isVerified: false,
            messages: '4.1k',
            activity: 'Moderate'
        },
        {
            id: 7,
            title: 'Crypto & Web3',
            description: 'Deep dive into blockchain, DeFi, and NFTs',
            members: 1876,
            online: 312,
            category: 'Crypto',
            type: 'public',
            gradient: 'from-yellow-500 via-orange-500 to-red-500',
            icon: <Crown className="w-6 h-6" />,
            isVerified: true,
            messages: '18.9k',
            activity: 'Very Active'
        },
        {
            id: 8,
            title: 'Coffee & Chill',
            description: 'Casual conversations and making new friends',
            members: 3421,
            online: 589,
            category: 'Social',
            type: 'public',
            gradient: 'from-rose-500 via-pink-500 to-purple-500',
            icon: <Coffee className="w-6 h-6" />,
            isVerified: true,
            messages: '32.1k',
            activity: 'Very Active'
        }
    ];

    const filteredRooms = rooms.filter(room => {
        const matchesSearch = room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            room.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === 'all' || room.type === filterType;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Create Room Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}>
                    <div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl transition"
                        >
                            <Plus className="w-5 h-5 rotate-45" />
                        </button>

                        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                            Create New Room
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-300">Room Title</label>
                                <input
                                    type="text"
                                    value={newRoomTitle}
                                    onChange={(e) => setNewRoomTitle(e.target.value)}
                                    placeholder="Enter room title..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-300">Category</label>
                                <select
                                    value={newRoomCategory}
                                    onChange={(e) => setNewRoomCategory(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 transition"
                                >
                                    <option value="General">General</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Gaming">Gaming</option>
                                    <option value="Design">Design</option>
                                    <option value="Music">Music</option>
                                    <option value="Business">Business</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-300">Privacy</label>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setNewRoomType('public')}
                                        className={`flex-1 px-4 py-3 rounded-xl border transition-all ${newRoomType === 'public'
                                            ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                            }`}
                                    >
                                        <Globe className="w-5 h-5 mx-auto mb-1" />
                                        <div className="text-sm font-semibold">Public</div>
                                    </button>
                                    <button
                                        onClick={() => setNewRoomType('private')}
                                        className={`flex-1 px-4 py-3 rounded-xl border transition-all ${newRoomType === 'private'
                                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                            }`}
                                    >
                                        <Lock className="w-5 h-5 mx-auto mb-1" />
                                        <div className="text-sm font-semibold">Private</div>
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    // Handle room creation
                                    setShowCreateModal(false);
                                    setNewRoomTitle('');
                                }}
                                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-xl font-semibold transition-all transform hover:scale-105 mt-6"
                            >
                                Create Room
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <aside className={`fixed left-0 top-0 h-screen bg-black/40 backdrop-blur-xl border-r border-white/10 p-6 z-40 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-72'}`}>
                <div className="flex items-center space-x-3 mb-8">
                    {!sidebarCollapsed && (
                        <img src="/transparent-logo.svg" alt="kuraX" className="h-10 w-auto" />
                    )}
                    {sidebarCollapsed && (
                        <img src="/transparent-logo.svg" alt="kuraX" className="h-10 w-auto mx-auto" />
                    )}
                </div>

                <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="absolute -right-3 top-8 w-6 h-6 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center transition-all"
                >
                    <ChevronRight className={`w-4 h-4 transition-transform ${sidebarCollapsed ? 'rotate-0' : 'rotate-180'}`} />
                </button>

                <nav className="space-y-2">
                    <a href="#" className={`flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-purple-600/30 to-cyan-600/30 border border-purple-500/50 rounded-xl ${sidebarCollapsed ? 'justify-center' : ''}`}>
                        <Hash className="w-5 h-5" />
                        {!sidebarCollapsed && <span className="font-semibold">Discover</span>}
                    </a>
                    <a href="#" className={`flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition ${sidebarCollapsed ? 'justify-center' : ''}`}>
                        <Star className="w-5 h-5" />
                        {!sidebarCollapsed && <span>My Rooms</span>}
                    </a>
                    <a href="#" className={`flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition ${sidebarCollapsed ? 'justify-center' : ''}`}>
                        <Users className="w-5 h-5" />
                        {!sidebarCollapsed && <span>Friends</span>}
                    </a>
                    <a href="#" className={`relative flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition ${sidebarCollapsed ? 'justify-center' : ''}`}>
                        <Bell className="w-5 h-5" />
                        {!sidebarCollapsed && <span>Notifications</span>}
                        {!sidebarCollapsed && <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">5</span>}
                        {sidebarCollapsed && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
                    </a>
                </nav>

                {!sidebarCollapsed && (
                    <div className="mt-8 pt-8 border-t border-white/10">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Trending Topics</h3>
                        <div className="space-y-2">
                            {trendingTopics.map((topic, idx) => (
                                <div key={idx} className="flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-lg cursor-pointer transition group">
                                    <div className="flex items-center space-x-2">
                                        <div className="text-purple-400">{topic.icon}</div>
                                        <span className="text-sm group-hover:text-white transition">{topic.name}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">{topic.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setShowCreateModal(true)}
                    className={`mt-auto absolute bottom-6 left-6 right-6 px-6 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center space-x-2 shadow-lg hover:shadow-purple-500/30 ${sidebarCollapsed ? 'px-0' : ''}`}
                >
                    <Plus className="w-5 h-5" />
                    {!sidebarCollapsed && <span>Create Room</span>}
                </button>
            </aside>

            {/* Main Content */}
            <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-72'} relative`}>
                {/* Header */}
                <header className="sticky top-0 z-30 bg-black/60 backdrop-blur-xl border-b border-white/10">
                    <div className="px-8 py-4 flex items-center justify-between">
                        <div className="flex-1 max-w-2xl">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search rooms, topics, or people..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 ml-6">
                            <button className="relative p-2 hover:bg-white/10 rounded-xl transition">
                                <Bell className="w-6 h-6" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center space-x-3 px-3 py-2 hover:bg-white/10 rounded-xl transition"
                                >
                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div className="text-left hidden lg:block">
                                        <div className="text-sm font-semibold">Alex Morgan</div>
                                        <div className="text-xs text-gray-400">@alexm</div>
                                    </div>
                                </button>

                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                                        <a href="#" className="flex items-center space-x-2 px-4 py-3 hover:bg-white/10 transition">
                                            <User className="w-4 h-4" />
                                            <span>Profile</span>
                                        </a>
                                        <a href="#" className="flex items-center space-x-2 px-4 py-3 hover:bg-white/10 transition">
                                            <Settings className="w-4 h-4" />
                                            <span>Settings</span>
                                        </a>
                                        <a href="#" className="flex items-center space-x-2 px-4 py-3 hover:bg-white/10 transition text-red-400">
                                            <LogOut className="w-4 h-4" />
                                            <span>Logout</span>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Stats Grid */}
                <section className="px-8 py-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat, idx) => (
                            <div
                                key={idx}
                                className="group relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/30 hover:scale-105 transition-all duration-300 overflow-hidden cursor-pointer"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                                            {stat.icon}
                                        </div>
                                        <span className="text-sm text-green-400 font-semibold">{stat.change}</span>
                                    </div>
                                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                                    <div className="text-sm text-gray-400">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Filters */}
                <section className="px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setFilterType('all')}
                                className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 ${filterType === 'all'
                                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 shadow-lg shadow-purple-500/30'
                                    : 'bg-white/5 hover:bg-white/10 hover:scale-105 border border-transparent'
                                    }`}
                            >
                                All Rooms
                            </button>
                            <button
                                onClick={() => setFilterType('public')}
                                className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${filterType === 'public'
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg shadow-green-500/30'
                                    : 'bg-white/5 hover:bg-white/10 hover:scale-105 border border-transparent'
                                    }`}
                            >
                                <Globe className="w-4 h-4" />
                                <span>Public</span>
                            </button>
                            <button
                                onClick={() => setFilterType('private')}
                                className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${filterType === 'private'
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30'
                                    : 'bg-white/5 hover:bg-white/10 hover:scale-105 border border-transparent'
                                    }`}
                            >
                                <Lock className="w-4 h-4" />
                                <span>Private</span>
                            </button>
                        </div>

                        <button className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-105 border border-white/10 hover:border-white/30">
                            <Filter className="w-4 h-4" />
                            <span className="text-sm">More Filters</span>
                        </button>
                    </div>
                </section>

                {/* Rooms Grid */}
                <section className="px-8 py-6 pb-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                        {filteredRooms.map((room) => (
                            <div
                                key={room.id}
                                className="group relative bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col"
                            >
                                {/* Gradient Header */}
                                <div className={`relative h-24 bg-gradient-to-br ${room.gradient} overflow-hidden`}>
                                    <div className="absolute inset-0 bg-black/20"></div>
                                    <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                                        <div className={`p-2 bg-black/40 backdrop-blur-xl rounded-lg border border-white/20`}>
                                            {room.icon}
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            {room.isVerified && (
                                                <div className="p-1.5 bg-black/40 backdrop-blur-xl rounded-lg border border-white/20">
                                                    <Crown className="w-3 h-3 text-yellow-400" />
                                                </div>
                                            )}
                                            <button className="p-1.5 bg-black/40 backdrop-blur-xl rounded-lg border border-white/20 hover:bg-black/60 transition">
                                                <MoreVertical className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${room.type === 'public'
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                            : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                            }`}>
                                            {room.type === 'public' ? <Globe className="w-2.5 h-2.5 inline mr-1" /> : <Lock className="w-2.5 h-2.5 inline mr-1" />}
                                            {room.type.toUpperCase()}
                                        </span>
                                        <span className="px-2 py-0.5 bg-white/5 rounded-full text-xs text-gray-400">
                                            {room.category}
                                        </span>
                                    </div>

                                    <h3 className="text-base font-bold mb-1.5 line-clamp-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition">
                                        {room.title}
                                    </h3>
                                    <p className="text-xs text-gray-400 mb-3 line-clamp-2 flex-1">{room.description}</p>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-2 mb-3 pb-3 border-b border-white/10">
                                        <div>
                                            <div className="text-xs text-gray-400 mb-0.5">Members</div>
                                            <div className="text-xs font-semibold">{room.members.toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 mb-0.5">Online</div>
                                            <div className="text-xs font-semibold text-green-400 flex items-center">
                                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                                                {room.online}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 mb-0.5">Messages</div>
                                            <div className="text-xs font-semibold">{room.messages}</div>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500 flex items-center">
                                            <Activity className="w-3 h-3 mr-1" />
                                            {room.activity}
                                        </span>
                                        <button className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-lg text-xs font-semibold transition-all transform hover:scale-110 flex items-center space-x-1">
                                            <span>Join</span>
                                            <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>

                                {/* Hover Effect */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${room.gradient} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none`}></div>
                            </div>
                        ))}
                    </div>

                    {/* Load More */}
                    <div className="mt-8 text-center">
                        <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-cyan-500/20">
                            Load More Rooms
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
}