'use client';

import { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/player';

export default function ArtistsPage() {
  const [artists, setArtists] = useState([]);
  const { setCurrentTrack, setIsPlaying } = usePlayerStore();

  useEffect(() => {
    async function fetchArtists() {
      const res = await fetch('/api/files');
      const data = await res.json();
      
      // Fetch metadata for all tracks
      const tracksWithMetadata = await Promise.all(
        data.files.map(async (file) => {
          const res = await fetch(`/api/metadata?fileId=${file.id}`);
          const metadata = await res.json();
          return { ...file, ...metadata };
        })
      );
      
      // Group tracks by artist
      const artistMap = tracksWithMetadata.reduce((acc, track) => {
        if (!track.artist) return acc;
        
        if (!acc[track.artist]) {
          acc[track.artist] = {
            name: track.artist,
            tracks: [],
            albumArt: null
          };
        }
        
        acc[track.artist].tracks.push(track);
        if (track.albumArtUrl && !acc[track.artist].albumArt) {
          acc[track.artist].albumArt = track.albumArtUrl;
        }
        
        return acc;
      }, {});
      
      setArtists(Object.values(artistMap));
    }
    
    fetchArtists();
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Artists</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {artists.map((artist) => (
          <a 
            key={artist.name}
            href={`/artists/${encodeURIComponent(artist.name)}`}
            className="group bg-black/5 rounded-lg p-4 transition-all hover:bg-black/10"
          >
            <div className="aspect-square mb-4">
              {artist.albumArt ? (
                <img 
                  src={artist.albumArt}
                  alt={artist.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-black/20 rounded-full flex items-center justify-center">
                  <span className="text-4xl">👤</span>
                </div>
              )}
            </div>
            
            <h3 className="font-semibold text-center">{artist.name}</h3>
            <p className="text-sm text-center text-gray-600">
              {artist.tracks.length} {artist.tracks.length === 1 ? 'track' : 'tracks'}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}