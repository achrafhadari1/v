'use client';

import { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/player';
import { PlayIcon } from '@heroicons/react/24/solid';

export default function Home() {
  const [recentTracks, setRecentTracks] = useState([]);
  const { setCurrentTrack, setIsPlaying } = usePlayerStore();

  useEffect(() => {
    async function fetchFiles() {
      const res = await fetch('/api/files');
      const data = await res.json();
      
      // Fetch metadata for each file
      const tracksWithMetadata = await Promise.all(
        data.files.map(async (file) => {
          const res = await fetch(`/api/metadata?fileId=${file.id}`);
          const metadata = await res.json();
          return { ...file, ...metadata };
        })
      );
      
      setRecentTracks(tracksWithMetadata);
    }
    fetchFiles();
  }, []);

  const playTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Recently Added</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {recentTracks.map((track) => (
          <div 
            key={track.id}
            className="group relative bg-black/5 rounded-lg p-4 transition-all hover:bg-black/10"
          >
            <div className="aspect-square mb-4">
              {track.albumArtUrl ? (
                <img 
                  src={track.albumArtUrl} 
                  alt={track.album || 'Album art'}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-black/20 rounded-lg flex items-center justify-center">
                  <span className="text-4xl">🎵</span>
                </div>
              )}
              <button
                onClick={() => playTrack(track)}
                className="absolute right-6 bottom-20 bg-blue-600 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <PlayIcon className="w-6 h-6 text-white" />
              </button>
            </div>
            
            <h3 className="font-semibold truncate">{track.title || track.name}</h3>
            {track.artist && (
              <p className="text-sm text-gray-600 truncate">{track.artist}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}