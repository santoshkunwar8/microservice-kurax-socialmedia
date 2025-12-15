import React from 'react';
import { Sparkles, Heart, MessageSquare } from 'lucide-react';
import { Post } from '../types';

interface PostsTabProps {
    posts: Post[];
    onCreatePost: () => void;
}

export default function PostsTab({ posts, onCreatePost }: PostsTabProps) {
    return (
        <div className="space-y-6 max-w-4xl">
            {/* Share Post */}
            <div
                onClick={onCreatePost}
                className="group bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-cyan-500/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-purple-500/50 transition-all cursor-pointer hover:scale-102"
            >
                <div className="flex items-center space-x-4 text-gray-300">
                    <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl group-hover:scale-110 transition-transform">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <span className="text-lg">Share a post with the community...</span>
                </div>
            </div>

            {/* Posts List */}
            {posts.map((post) => (
                <div key={post.id} className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:border-white/30 hover:scale-102 transition-all">
                    <div className="p-8">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <div className={`w-14 h-14 bg-gradient-to-br ${post.gradient} rounded-2xl flex items-center justify-center text-2xl shadow-lg`}>
                                    {post.avatar}
                                </div>
                                <div>
                                    <div className="font-bold text-lg">{post.user}</div>
                                    <div className="text-sm text-gray-400">Community Member</div>
                                </div>
                            </div>
                            <span className="text-sm text-gray-500 bg-white/5 px-3 py-1 rounded-full">{post.date}</span>
                        </div>

                        <p className="text-gray-300 text-lg leading-relaxed mb-6">{post.content}</p>

                        <div className="flex items-center space-x-8 text-sm pb-6 border-b border-white/10">
                            <button className="group flex items-center space-x-2 text-gray-400 hover:text-pink-400 transition-all">
                                <div className="p-2 group-hover:bg-pink-500/10 rounded-lg transition">
                                    <Heart className="w-5 h-5" />
                                </div>
                                <span className="font-semibold">{post.likes} Likes</span>
                            </button>
                            <button className="group flex items-center space-x-2 text-gray-400 hover:text-cyan-400 transition-all">
                                <div className="p-2 group-hover:bg-cyan-500/10 rounded-lg transition">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <span className="font-semibold">{post.comments} Comments</span>
                            </button>
                        </div>

                        {/* Comments */}
                        {post.commentsList.length > 0 && (
                            <div className="mt-6 space-y-4">
                                {post.commentsList.map((comment, idx) => (
                                    <div key={idx} className="flex space-x-3 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-2xl p-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                                            {comment.avatar}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-semibold">{comment.user}</span>
                                                <span className="text-xs text-gray-500">{comment.time}</span>
                                            </div>
                                            <p className="text-gray-300">{comment.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
