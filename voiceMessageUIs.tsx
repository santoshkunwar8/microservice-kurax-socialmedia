import React, { useState, useEffect } from 'react';
import { Play, Pause, Download, MoreVertical, Mic } from 'lucide-react';

export default function VoiceMessageUI() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration] = useState(43); // 43 seconds

    useEffect(() => {
        let interval;
        if (isPlaying && currentTime < duration) {
            interval = setInterval(() => {
                setCurrentTime(prev => {
                    if (prev >= duration) {
                        setIsPlaying(false);
                        return duration;
                    }
                    return prev + 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentTime, duration]);

    const togglePlay = () => {
        if (currentTime >= duration) {
            setCurrentTime(0);
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = (currentTime / duration) * 100;

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="max-w-2xl w-full space-y-8 relative">
                {/* Title */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                        Voice Message UI
                    </h2>
                    <p className="text-gray-400">Beautiful voice message component for kuraX</p>
                </div>

                {/* Voice Message Card - Sent */}
                <div className="flex justify-end">
                    <div className="max-w-md">
                        <div className="bg-gradient-to-br from-purple-600/30 via-pink-600/30 to-cyan-600/30 backdrop-blur-xl border border-white/20 rounded-3xl p-5 shadow-2xl shadow-purple-500/20">
                            <div className="flex items-center space-x-4">
                                {/* Play Button */}
                                <button
                                    onClick={togglePlay}
                                    className="group relative w-14 h-14 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-110 flex-shrink-0"
                                >
                                    {isPlaying ? (
                                        <Pause className="w-6 h-6 text-white" />
                                    ) : (
                                        <Play className="w-6 h-6 text-white ml-0.5" />
                                    )}
                                    {isPlaying && (
                                        <div className="absolute inset-0 rounded-2xl bg-white/20 animate-ping"></div>
                                    )}
                                </button>

                                {/* Waveform & Time */}
                                <div className="flex-1">
                                    {/* Waveform */}
                                    <div className="flex items-center space-x-1 h-12 mb-2">
                                        {[...Array(30)].map((_, i) => {
                                            const height = Math.random() * 100;
                                            const isPassed = (i / 30) * 100 < progress;
                                            return (
                                                <div
                                                    key={i}
                                                    className={`flex-1 rounded-full transition-all duration-300 ${isPassed
                                                        ? 'bg-gradient-to-t from-purple-400 to-cyan-400'
                                                        : 'bg-white/20'
                                                        }`}
                                                    style={{ height: `${Math.max(height, 20)}%` }}
                                                ></div>
                                            );
                                        })}
                                    </div>

                                    {/* Time Display */}
                                    <div className="flex items-center justify-between text-sm text-white/80">
                                        <span className="font-mono">{formatTime(currentTime)}</span>
                                        <span className="font-mono">{formatTime(duration)}</span>
                                    </div>
                                </div>

                                {/* More Options */}
                                <button className="p-2 hover:bg-white/10 rounded-xl transition-all">
                                    <MoreVertical className="w-5 h-5 text-white/60" />
                                </button>
                            </div>
                        </div>
                        <div className="text-right mt-1 text-xs text-gray-500">11:23 PM</div>
                    </div>
                </div>

                {/* Voice Message Card - Received */}
                <div className="flex justify-start">
                    <div className="max-w-md">
                        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl hover:border-white/30 transition-all">
                            <div className="flex items-center space-x-4">
                                {/* Avatar */}
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-lg">
                                    👨‍💻
                                </div>

                                {/* Play Button */}
                                <button
                                    className="group relative w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg hover:shadow-green-500/50 transition-all hover:scale-110 flex-shrink-0"
                                >
                                    <Play className="w-5 h-5 text-white ml-0.5" />
                                </button>

                                {/* Waveform & Time */}
                                <div className="flex-1">
                                    {/* Waveform */}
                                    <div className="flex items-center space-x-1 h-10 mb-2">
                                        {[...Array(25)].map((_, i) => {
                                            const height = Math.random() * 100;
                                            return (
                                                <div
                                                    key={i}
                                                    className="flex-1 bg-white/20 rounded-full hover:bg-gradient-to-t hover:from-green-400 hover:to-emerald-400 transition-all cursor-pointer"
                                                    style={{ height: `${Math.max(height, 20)}%` }}
                                                ></div>
                                            );
                                        })}
                                    </div>

                                    {/* Time Display */}
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <span className="font-mono">0:00</span>
                                        <span className="font-mono">0:38</span>
                                    </div>
                                </div>

                                {/* Download */}
                                <button className="p-2 hover:bg-white/10 rounded-xl transition-all hover:scale-110">
                                    <Download className="w-5 h-5 text-white/60" />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs font-semibold text-gray-400">Alex Chen</span>
                            <span className="text-xs text-gray-500">11:20 PM</span>
                        </div>
                    </div>
                </div>

                {/* Compact Voice Message - Sent */}
                <div className="flex justify-end">
                    <div className="max-w-xs">
                        <div className="bg-gradient-to-br from-blue-600/30 to-purple-600/30 backdrop-blur-xl border border-white/20 rounded-3xl p-4 shadow-lg">
                            <div className="flex items-center space-x-3">
                                <button className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md hover:scale-110 transition-all">
                                    <Play className="w-4 h-4 text-white ml-0.5" />
                                </button>

                                <div className="flex-1">
                                    <div className="flex items-center space-x-0.5 h-8 mb-1">
                                        {[...Array(20)].map((_, i) => {
                                            const height = Math.random() * 100;
                                            return (
                                                <div
                                                    key={i}
                                                    className="flex-1 bg-white/30 rounded-full"
                                                    style={{ height: `${Math.max(height, 15)}%` }}
                                                ></div>
                                            );
                                        })}
                                    </div>
                                    <div className="text-xs text-white/70 font-mono">0:28</div>
                                </div>
                            </div>
                        </div>
                        <div className="text-right mt-1 text-xs text-gray-500">11:25 PM</div>
                    </div>
                </div>

                {/* Recording Voice Message */}
                <div className="flex justify-center">
                    <div className="max-w-md w-full">
                        <div className="bg-gradient-to-br from-red-600/30 via-pink-600/30 to-purple-600/30 backdrop-blur-xl border border-red-500/50 rounded-3xl p-6 shadow-2xl shadow-red-500/20">
                            <div className="flex items-center space-x-4">
                                {/* Recording Indicator */}
                                <div className="relative">
                                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                                        <Mic className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="absolute inset-0 rounded-2xl bg-red-500/30 animate-ping"></div>
                                </div>

                                {/* Live Waveform */}
                                <div className="flex-1">
                                    <div className="flex items-center space-x-1 h-16 mb-2">
                                        {[...Array(35)].map((_, i) => {
                                            const height = Math.random() * 100;
                                            const delay = i * 0.05;
                                            return (
                                                <div
                                                    key={i}
                                                    className="flex-1 bg-gradient-to-t from-red-400 to-pink-400 rounded-full animate-pulse"
                                                    style={{
                                                        height: `${Math.max(height, 25)}%`,
                                                        animationDelay: `${delay}s`
                                                    }}
                                                ></div>
                                            );
                                        })}
                                    </div>

                                    {/* Recording Time */}
                                    <div className="text-center">
                                        <span className="text-2xl font-mono font-bold text-white">0:15</span>
                                        <span className="text-sm text-red-400 ml-2">● Recording...</span>
                                    </div>
                                </div>

                                {/* Stop Button */}
                                <button className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all hover:scale-110 border border-white/20">
                                    <div className="w-6 h-6 bg-white rounded-md"></div>
                                </button>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold transition-all">
                                    Cancel
                                </button>
                                <button className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 rounded-xl text-sm font-semibold transition-all shadow-lg">
                                    Send Voice Message
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="text-center text-sm text-gray-400 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <p className="mb-2">✨ <strong className="text-white">Features:</strong></p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>🎵 Animated waveforms</div>
                        <div>⏱️ Real-time progress</div>
                        <div>🎨 Gradient designs</div>
                        <div>💫 Smooth animations</div>
                        <div>📱 Responsive layout</div>
                        <div>🎯 Interactive controls</div>
                    </div>
                </div>
            </div>
        </div>
    );
}