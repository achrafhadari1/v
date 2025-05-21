"use client";

import { useEffect, useState } from "react";
import { usePlayerStore } from "@/store/player";
import { PlayIcon } from "@heroicons/react/24/solid";

export default function AlbumsPage() {
  const { library, setCurrentTrack, setIsPlaying, cachedAlbums } =
    usePlayerStore();
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    // Group tracks by album
    const albumMap = library.reduce((acc, track) => {
      if (!track.album) return acc;

      if (!acc[track.album]) {
        // Check if we have cached album info
        const cachedAlbum = cachedAlbums[track.album];
        if (cachedAlbum) {
          acc[track.album] = cachedAlbum;
        } else {
          acc[track.album] = {
            name: track.album,
            artist: track.artist,
            tracks: [],
            albumArtUrl: track.albumArtUrl,
            year: track.year,
          };
        }
      }

      if (!cachedAlbums[track.album]) {
        acc[track.album].tracks.push(track);
      }

      return acc;
    }, {});

    setAlbums(Object.values(albumMap));
  }, [library, cachedAlbums]);

  const playAlbum = (album) => {
    if (album.tracks.length > 0) {
      setCurrentTrack(album.tracks[0]);
      setIsPlaying(true);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Albums</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {albums.map((album) => (
          <div
            key={album.name}
            className="group relative bg-black/5 rounded-lg p-4 transition-all hover:bg-black/10"
          >
            <div className="aspect-square mb-4">
              {album.albumArtUrl ? (
                <img
                  src={album.albumArtUrl}
                  alt={album.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-black/20 rounded-lg flex items-center justify-center">
                  <span className="text-4xl">💿</span>
                </div>
              )}
              <button
                onClick={() => playAlbum(album)}
                className="absolute right-6 bottom-20 bg-red-500 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <PlayIcon className="w-6 h-6 text-white" />
              </button>
            </div>

            <a href={`/albums/${encodeURIComponent(album.name)}`}>
              <h3 className="font-semibold truncate">{album.name}</h3>
              <p className="text-sm text-gray-600 truncate">{album.artist}</p>
              {album.year && (
                <p className="text-sm text-gray-500">{album.year}</p>
              )}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
