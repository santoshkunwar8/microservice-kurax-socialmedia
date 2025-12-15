export interface Member {
    id: number;
    name: string;
    avatar: string;
    status: 'online' | 'offline';
    role: 'Admin' | 'Moderator' | 'Member';
}

export interface Chat {
    id: number;
    user: string;
    avatar: string;
    message: string;
    time: string;
    gradient: string;
}

export interface Post {
    id: number;
    user: string;
    avatar: string;
    content: string;
    likes: number;
    comments: number;
    date: string;
    gradient: string;
    commentsList: Comment[];
}

export interface Comment {
    user: string;
    avatar: string;
    text: string;
    time: string;
}

export interface Resource {
    id: number;
    title: string;
    type: string;
    sharedBy: string;
    date: string;
    icon: React.ReactNode;
    gradient: string;
}

export type TabType = 'chats' | 'posts' | 'resources';
