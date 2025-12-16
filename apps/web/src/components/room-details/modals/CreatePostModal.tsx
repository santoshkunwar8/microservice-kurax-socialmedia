import React from 'react';
import { Sparkles, Paperclip, Video, Smile, Loader2, X, Image } from 'lucide-react';

interface CreatePostModalProps {
    isOpen: boolean;
    postContent: string;
    onPostContentChange: (content: string) => void;
    onClose: () => void;
    onSubmit: () => void;
    isLoading?: boolean;
    attachments?: string[];
    onAttachFile?: () => void;
    isUploading?: boolean;
}

export default function CreatePostModal({ 
    isOpen, 
    postContent, 
    onPostContentChange, 
    onClose, 
    onSubmit,
    isLoading = false,
    attachments = [],
    onAttachFile,
    isUploading = false,
}: CreatePostModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/20 rounded-3xl w-full max-w-2xl shadow-2xl shadow-purple-500/20 transform animate-scaleIn">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                            Share a Post
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-xl transition-all hover:rotate-90"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">
                            What's on your mind?
                        </label>
                        <textarea
                            value={postContent}
                            onChange={(e) => onPostContentChange(e.target.value)}
                            placeholder="Share your thoughts, ideas, or updates with the community..."
                            rows={6}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition resize-none"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Attachments Preview */}
                    {attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {attachments.map((url, idx) => (
                                <div key={idx} className="relative group">
                                    <img 
                                        src={url} 
                                        alt={`Attachment ${idx + 1}`}
                                        className="w-20 h-20 object-cover rounded-lg border border-white/20"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-lg">
                                        <Image className="w-6 h-6" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Attachment Options */}
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={onAttachFile}
                            disabled={isUploading}
                            className="flex items-center space-x-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 hover:border-cyan-500/50 disabled:opacity-50"
                        >
                            {isUploading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Paperclip className="w-4 h-4" />
                            )}
                            <span className="text-sm font-semibold">
                                {isUploading ? 'Uploading...' : 'Attach File'}
                            </span>
                        </button>
                        <button className="flex items-center space-x-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 hover:border-pink-500/50">
                            <Video className="w-4 h-4" />
                            <span className="text-sm font-semibold">Add Media</span>
                        </button>
                        <button className="flex items-center space-x-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 hover:border-yellow-500/50">
                            <Smile className="w-4 h-4" />
                            <span className="text-sm font-semibold">Emoji</span>
                        </button>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-white/10">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 font-semibold disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={isLoading || !postContent.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-xl transition-all font-semibold shadow-lg hover:shadow-purple-500/50 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isLoading ? 'Sharing...' : 'Share Post'}
                    </button>
                </div>
            </div>
        </div>
    );
}
