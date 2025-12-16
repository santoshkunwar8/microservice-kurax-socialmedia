import React, { useEffect, useState } from 'react';

interface AudioDurationProps {
  src: string;
}

export default function AudioDuration({ src }: AudioDurationProps) {
  const [duration, setDuration] = useState<string>('');

  useEffect(() => {
    const audio = document.createElement('audio');
    audio.src = src;
    audio.addEventListener('loadedmetadata', () => {
      if (!isNaN(audio.duration)) {
        const min = Math.floor(audio.duration / 60);
        const sec = Math.floor(audio.duration % 60).toString().padStart(2, '0');
        setDuration(`${min}:${sec}`);
      }
    });
    return () => { audio.remove(); };
  }, [src]);

  return <span>{duration}</span>;
}