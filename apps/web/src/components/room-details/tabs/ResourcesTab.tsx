import React from 'react';
import { Sparkles, MoreVertical, FileText, Code, Video, BookOpen, File, Link } from 'lucide-react';

interface Resource {
    id: number;
    title: string;
    type: string;
    sharedBy: string;
    date: string;
    icon?: React.ReactNode;
    gradient: string;
    fileUrl?: string | null;
}

interface ResourcesTabProps {
    resources: Resource[];
    onCreateResource: () => void;
}

// Get icon based on resource type
const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
        case 'document':
            return <FileText className="w-6 h-6" />;
        case 'code':
            return <Code className="w-6 h-6" />;
        case 'video':
            return <Video className="w-6 h-6" />;
        case 'tutorial':
            return <BookOpen className="w-6 h-6" />;
        case 'article':
            return <Sparkles className="w-6 h-6" />;
        default:
            return <File className="w-6 h-6" />;
    }
};

// Get gradient based on resource type
const getResourceGradient = (type: string) => {
    switch (type.toLowerCase()) {
        case 'document':
            return 'from-blue-600 to-purple-600';
        case 'code':
            return 'from-green-600 to-teal-600';
        case 'video':
            return 'from-red-600 to-pink-600';
        case 'tutorial':
            return 'from-orange-600 to-yellow-600';
        case 'article':
            return 'from-pink-600 to-rose-600';
        default:
            return 'from-gray-600 to-gray-700';
    }
};

export default function ResourcesTab({ resources, onCreateResource }: ResourcesTabProps) {
    return (
        <div className="space-y-6 max-w-4xl">
            {/* Share Resource */}
            <div
                onClick={onCreateResource}
                className="group bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-cyan-500/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-purple-500/50 transition-all cursor-pointer hover:scale-102"
            >
                <div className="flex items-center space-x-4 text-gray-300">
                    <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl group-hover:scale-110 transition-transform">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <span className="text-lg">Share a resource with the community...</span>
                </div>
            </div>

            {/* Empty State */}
            {resources.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No resources yet</p>
                    <p className="text-sm">Be the first to share a resource!</p>
                </div>
            )}

            {/* Resources List */}
            {resources.map((resource) => (
                <div key={resource.id} className="group bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-white/30 hover:scale-102 transition-all cursor-pointer">
                    <div className="flex items-start space-x-6">
                        <div className={`p-4 bg-gradient-to-br ${resource.gradient || getResourceGradient(resource.type)} rounded-2xl group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg`}>
                            {resource.icon || getResourceIcon(resource.type)}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition">
                                {resource.title}
                            </h3>
                            <div className="flex items-center space-x-3 mb-3">
                                <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-semibold">{resource.type}</span>
                                <span className="text-sm text-gray-400">
                                    Shared by <span className="text-white font-semibold">{resource.sharedBy}</span>
                                </span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-xs text-gray-500">{resource.date}</span>
                                {resource.fileUrl && (
                                    <a 
                                        href={resource.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                                    >
                                        <Link className="w-3 h-3" />
                                        View File
                                    </a>
                                )}
                            </div>
                        </div>
                        <button className="p-2 hover:bg-white/10 rounded-xl transition opacity-0 group-hover:opacity-100">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
