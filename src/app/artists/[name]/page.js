"use client";

import { useEffect, useState, use } from "react";
import { usePlayerStore } from "@/store/player";
import { PlayIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

export default function ArtistPage({ params }) {
  const { name } = use(params);
  const decodedName = decodeURIComponent(name);
  const { library, setCurrentTrack, setIsPlaying } = usePlayerStore();
  const [artistInfo, setArtistInfo] = useState(null);

  useEffect(() => {
    const fetchArtistInfo = async () => {
      try {
        const res = await fetch(
          `/api/artist-info?name=${encodeURIComponent(decodedName)}`
        );
        const data = await res.json();
        setArtistInfo(data);
      } catch (error) {
        console.error("Failed to fetch artist info:", error);
      }
    };

    fetchArtistInfo();
  }, [decodedName]);

  const artistTracks = library.filter((track) => track.artist === decodedName);

  // Group tracks by album
  const albums = artistTracks.reduce((acc, track) => {
    if (!track.album) return acc;

    if (!acc[track.album]) {
      acc[track.album] = {
        name: track.album,
        year: track.year,
        artwork: track.albumArtUrl,
        tracks: [],
      };
    }

    acc[track.album].tracks.push(track);
    return acc;
  }, {});

  const playTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  return (
    <div className="space-y-8">
      <div className="relative h-[400px] -mx-8 -mt-8">
        {artistInfo?.image ? (
          <img
            src={artistInfo.image}
            alt={decodedName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-red-500/20 to-black" />
        )}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/80 to-transparent">
          <h1 className="text-6xl font-bold">{decodedName}</h1>
          {artistInfo?.listeners && (
            <p className="text-gray-400 mt-2">
              {artistInfo.listeners.toLocaleString()} monthly listeners
            </p>
          )}
        </div>
      </div>

      {artistInfo?.bio && (
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold mb-4">About</h2>
          <p className="text-gray-300 leading-relaxed">{artistInfo.bio}</p>
        </div>
      )}

      <div className="space-y-12">
        {Object.values(albums).map((album) => (
          <section key={album.name}>
            <div className="flex items-end gap-6 mb-6">
              <img
                src={album.artwork}
                alt={album.name}
                className="w-40 h-40 object-cover rounded-xl"
              />
              <div>
                <h2 className="text-2xl font-semibold">{album.name}</h2>
                {album.year && (
                  <p className="text-gray-400">Album • {album.year}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              {album.tracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group flex items-center gap-4 p-3 rounded-lg hover:bg-white/5"
                >
                  <span className="w-6 text-center text-sm text-gray-400 group-hover:hidden">
                    {index + 1}
                  </span>
                  <button
                    onClick={() => playTrack(track)}
                    className="hidden group-hover:block"
                  >
                    <PlayIcon className="w-6 h-6 text-white" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{track.title}</h3>
                  </div>
                  <span className="text-sm text-gray-400">
                    {Math.floor(track.duration / 60)}:
                    {String(Math.floor(track.duration % 60)).padStart(2, "0")}
                  </span>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
