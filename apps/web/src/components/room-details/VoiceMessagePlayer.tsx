import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, MoreVertical, Mic } from 'lucide-react';

interface VoiceMessagePlayerProps {
    src: string;
    duration?: number; // in seconds, optional
}

export function VoiceMessagePlayer({ src, duration: propDuration }: VoiceMessagePlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState<number>(propDuration || 0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleEnded = () => setIsPlaying(false);
        const handleLoadedMetadata = () => setDuration(audio.duration);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    }, []);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = duration ? (currentTime / duration) * 100 : 0;

    return (
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
                <audio ref={audioRef} src={src} preload="metadata" style={{ display: 'none' }} />
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
    );
}
