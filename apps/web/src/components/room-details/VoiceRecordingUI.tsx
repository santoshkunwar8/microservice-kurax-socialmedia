import React from 'react';
import { Mic } from 'lucide-react';

interface VoiceRecordingUIProps {
    recordingTime: number;
    onStop: () => void;
    onCancel: () => void;
}

export function VoiceRecordingUI({ recordingTime, onStop, onCancel }: VoiceRecordingUIProps) {
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
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
                        <span className="text-2xl font-mono font-bold text-white">{formatTime(recordingTime)}</span>
                        <span className="text-sm text-red-400 ml-2">● Recording...</span>
                    </div>
                </div>
                {/* Stop Button */}
                <button onClick={onStop} className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all hover:scale-110 border border-white/20">
                    <div className="w-6 h-6 bg-white rounded-md"></div>
                </button>
            </div>
            {/* Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                <button onClick={onCancel} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold transition-all">
                    Cancel
                </button>
                <button onClick={onStop} className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 rounded-xl text-sm font-semibold transition-all shadow-lg">
                    Send Voice Message
                </button>
            </div>
        </div>
    );
}
