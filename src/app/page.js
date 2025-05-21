"use client";

import { useEffect, useState } from "react";
import { usePlayerStore } from "@/store/player";
import { PlayIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const { library, setLibrary, lastFetched, setCurrentTrack, setIsPlaying } =
    usePlayerStore();

  const fetchLibrary = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/files");
      const data = await res.json();

      const tracksWithMetadata = await Promise.all(
        data.files.map(async (file) => {
          const res = await fetch(`/api/metadata?fileId=${file.id}`);
          const metadata = await res.json();
          return { ...file, ...metadata };
        })
      );

      setLibrary(tracksWithMetadata);
    } catch (error) {
      console.error("Failed to fetch library:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!library.length) {
      fetchLibrary();
    }
  }, []);

  const playTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  // Group tracks by recently added and featured
  const recentTracks = [...library]
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 6);
  const featuredAlbums = [
    ...new Set(
      library.filter((track) => track.album).map((track) => track.album)
    ),
  ].slice(0, 6);
  const albums = featuredAlbums.map((albumName) => {
    const albumTracks = library.filter((track) => track.album === albumName);
    return {
      name: albumName,
      artist: albumTracks[0].artist,
      artwork: albumTracks[0].albumArtUrl,
      tracks: albumTracks,
    };
  });

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
          Listen Now
        </h1>
        <button
          onClick={fetchLibrary}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-[#2A2A2A] rounded-full hover:bg-[#3A3A3A] transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon
            className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh Library
        </button>
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Recently Added</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {recentTracks.map((track) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group"
            >
              <div className="relative aspect-square mb-4">
                {track.albumArtUrl ? (
                  <img
                    src={track.albumArtUrl}
                    alt={track.album || "Album art"}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full bg-[#2A2A2A] rounded-xl flex items-center justify-center">
                    <span className="text-4xl">🎵</span>
                  </div>
                )}
                <button
                  onClick={() => playTrack(track)}
                  className="absolute right-2 bottom-2 bg-red-500 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 hover:bg-red-600"
                >
                  <PlayIcon className="w-6 h-6 text-white" />
                </button>
              </div>

              <h3 className="font-medium text-sm truncate">
                {track.title || track.name}
              </h3>
              {track.artist && (
                <p className="text-sm text-gray-400 truncate">{track.artist}</p>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Featured Albums</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {albums.map((album) => (
            <motion.a
              key={album.name}
              href={`/albums/${encodeURIComponent(album.name)}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group"
            >
              <div className="relative aspect-square mb-4">
                {album.artwork ? (
                  <img
                    src={album.artwork}
                    alt={album.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full bg-[#2A2A2A] rounded-xl flex items-center justify-center">
                    <span className="text-4xl">💿</span>
                  </div>
                )}
              </div>

              <h3 className="font-medium text-sm truncate">{album.name}</h3>
              <p className="text-sm text-gray-400 truncate">{album.artist}</p>
            </motion.a>
          ))}
        </div>
      </section>
    </div>
  );
}
