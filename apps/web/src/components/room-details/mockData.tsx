import { FileText, Code, Sparkles } from 'lucide-react';
import { Member, Chat, Post, Resource } from './types';

export const mockOnlineMembers: Member[] = [
    { id: 1, name: 'Alex Chen', avatar: '👨‍💻', status: 'online', role: 'Admin' },
    { id: 2, name: 'Jordan Rivera', avatar: '👩‍🎨', status: 'online', role: 'Moderator' },
    { id: 3, name: 'Casey Park', avatar: '🎨', status: 'online', role: 'Member' },
    { id: 4, name: 'Morgan Lee', avatar: '👩‍💼', status: 'online', role: 'Member' }
];

export const mockOfflineMembers: Member[] = [
    { id: 5, name: 'Taylor Smith', avatar: '👨‍🎤', status: 'offline', role: 'Member' }
];

export const mockChats: Chat[] = [
    {
        id: 1,
        user: 'Alex Chen',
        avatar: '👨‍💻',
        message: 'Hey everyone! Just started exploring kuraX and loving the vibe so far.',
        time: 'about 1 hour ago',
        gradient: 'from-purple-500 to-pink-500'
    },
    {
        id: 2,
        user: 'Jordan Rivera',
        avatar: '👩‍🎨',
        message: 'Welcome! This community is amazing. Feel free to share your work anytime.',
        time: 'about 1 hour ago',
        gradient: 'from-cyan-500 to-blue-500'
    },
    {
        id: 3,
        user: 'Casey Park',
        avatar: '🎨',
        message: 'Just launched my latest project! Would love feedback from the community.',
        time: '30 minutes ago',
        gradient: 'from-orange-500 to-pink-500'
    },
    {
        id: 4,
        user: 'Taylor Smith',
        avatar: '👨‍🎤',
        message: 'That looks incredible! The design is so clean. Great execution.',
        time: '10 minutes ago',
        gradient: 'from-green-500 to-emerald-500'
    }
];

export const mockPosts: Post[] = [
    {
        id: 1,
        user: 'Alex Chen',
        avatar: '👨‍💻',
        content: 'Just finished redesigning my portfolio. Here\'s the new version with improved UX and animations!',
        likes: 24,
        comments: 1,
        date: '12/14/2025',
        gradient: 'from-purple-500 to-pink-500',
        commentsList: [
            { user: 'Jordan Rivera', avatar: '👩‍🎨', text: 'Looks amazing! Love the animations.', time: '10:26:06 PM' }
        ]
    },
    {
        id: 2,
        user: 'Casey Park',
        avatar: '🎨',
        content: 'Sharing my latest UI component library - open source and ready to use!',
        likes: 42,
        comments: 0,
        date: '12/13/2025',
        gradient: 'from-orange-500 to-pink-500',
        commentsList: []
    }
];

export const mockResources: Resource[] = [
    {
        id: 1,
        title: 'Design System Guide',
        type: 'Document',
        sharedBy: 'Jordan Rivera',
        date: '12/12/2025',
        icon: <FileText className="w-6 h-6" />,
        gradient: 'from-blue-600 to-purple-600'
    },
    {
        id: 2,
        title: 'Advanced CSS Techniques',
        type: 'Tutorial',
        sharedBy: 'Taylor Smith',
        date: '12/13/2025',
        icon: <Code className="w-6 h-6" />,
        gradient: 'from-green-600 to-teal-600'
    },
    {
        id: 3,
        title: 'React Performance Tips',
        type: 'Article',
        sharedBy: 'Morgan Lee',
        date: '12/14/2025',
        icon: <Sparkles className="w-6 h-6" />,
        gradient: 'from-pink-600 to-rose-600'
    }
];
