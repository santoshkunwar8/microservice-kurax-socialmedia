import React from 'react';
import { FileText, Paperclip, Loader2, X, Check } from 'lucide-react';

interface CreateResourceModalProps {
    isOpen: boolean;
    resourceTitle: string;
    resourceType: string;
    onResourceTitleChange: (title: string) => void;
    onResourceTypeChange: (type: string) => void;
    onClose: () => void;
    onSubmit: () => void;
    isLoading?: boolean;
    fileUrl?: string;
    onUploadFile?: () => void;
    isUploading?: boolean;
}

const RESOURCE_TYPES = ['Document', 'Tutorial', 'Article', 'Video', 'Code', 'Other'];

export default function CreateResourceModal({
    isOpen,
    resourceTitle,
    resourceType,
    onResourceTitleChange,
    onResourceTypeChange,
    onClose,
    onSubmit,
    isLoading = false,
    fileUrl = '',
    onUploadFile,
    isUploading = false,
}: CreateResourceModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/20 rounded-3xl w-full max-w-2xl shadow-2xl shadow-cyan-500/20 transform animate-scaleIn">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            Share a Resource
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
                            Resource Title
                        </label>
                        <input
                            type="text"
                            value={resourceTitle}
                            onChange={(e) => onResourceTitleChange(e.target.value)}
                            placeholder="Enter resource title..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">
                            Resource Type
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {RESOURCE_TYPES.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => onResourceTypeChange(type)}
                                    disabled={isLoading}
                                    className={`px-4 py-3 rounded-xl font-semibold transition-all border ${resourceType === type
                                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-500/50 shadow-lg shadow-cyan-500/30'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyan-500/30'
                                        } disabled:opacity-50`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Upload Area */}
                    <div 
                        onClick={onUploadFile}
                        className={`border-2 border-dashed rounded-2xl p-8 text-center hover:border-cyan-500/50 transition-all cursor-pointer bg-white/5 ${
                            fileUrl ? 'border-green-500/50' : 'border-white/20'
                        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        <div className="flex flex-col items-center space-y-3">
                            <div className={`p-4 rounded-2xl ${fileUrl ? 'bg-gradient-to-br from-green-600 to-emerald-600' : 'bg-gradient-to-br from-cyan-600 to-blue-600'}`}>
                                {isUploading ? (
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                ) : fileUrl ? (
                                    <Check className="w-8 h-8" />
                                ) : (
                                    <Paperclip className="w-8 h-8" />
                                )}
                            </div>
                            <div>
                                <p className="text-lg font-semibold mb-1">
                                    {isUploading ? 'Uploading...' : fileUrl ? 'File Uploaded!' : 'Upload Resource'}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {fileUrl ? 'Click to replace file' : 'Click to browse or drag and drop'}
                                </p>
                            </div>
                        </div>
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
                        disabled={isLoading || !resourceTitle.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl transition-all font-semibold shadow-lg hover:shadow-cyan-500/50 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isLoading ? 'Sharing...' : 'Share Resource'}
                    </button>
                </div>
            </div>
        </div>
    );
}
