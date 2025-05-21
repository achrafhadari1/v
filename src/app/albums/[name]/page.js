"use client";

import { useEffect, useState, use } from "react";
import { usePlayerStore } from "@/store/player";
import { PlayIcon, PauseIcon, QueueListIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

export default function AlbumPage({ params }) {
  const { name } = use(params);
  const decodedName = decodeURIComponent(name);
  const {
    library,
    currentTrack,
    isPlaying,
    setCurrentTrack,
    setIsPlaying,
    setQueue,
    addToQueue,
    cachedAlbums,
    setCachedAlbum,
  } = usePlayerStore();

  const albumTracks = library.filter((track) => track.album === decodedName);
  const albumInfo = albumTracks[0] || {};

  useEffect(() => {
    if (!cachedAlbums[decodedName] && albumTracks.length > 0) {
      setCachedAlbum(decodedName, {
        name: decodedName,
        artist: albumInfo.artist,
        tracks: albumTracks,
        artwork: albumInfo.albumArtUrl,
        year: albumInfo.year,
      });
    }
  }, [decodedName, albumTracks]);

  const isTrackPlaying = (track) => {
    return currentTrack?.id === track.id && isPlaying;
  };

  const playTrack = (track, index) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      // Set the queue to all remaining tracks in the album
      const newQueue = [
        ...albumTracks.slice(index),
        ...albumTracks.slice(0, index),
      ];
      setQueue(newQueue);
    }
  };

  const playAlbum = () => {
    if (albumTracks.length > 0) {
      setCurrentTrack(albumTracks[0]);
      setIsPlaying(true);
      setQueue(albumTracks);
    }
  };

  const addAlbumToQueue = () => {
    addToQueue(albumTracks);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-72 h-72 shrink-0"
        >
          {albumInfo.albumArtUrl ? (
            <img
              src={albumInfo.albumArtUrl}
              alt={decodedName}
              className="w-full h-full object-cover rounded-2xl shadow-2xl"
            />
          ) : (
            <div className="w-full h-full bg-[#2A2A2A] rounded-2xl flex items-center justify-center">
              <span className="text-6xl">💿</span>
            </div>
          )}
        </motion.div>

        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-bold mb-4">{decodedName}</h1>
            <div className="flex items-center gap-2 text-gray-400 mb-6">
              <span className="text-lg">{albumInfo.artist}</span>
              {albumInfo.year && (
                <>
                  <span>•</span>
                  <span>{albumInfo.year}</span>
                </>
              )}
              <span>•</span>
              <span>{albumTracks.length} songs</span>
            </div>

            <div className="flex gap-4">
              <button
                onClick={playAlbum}
                className="px-8 py-3 bg-red-500 rounded-full font-semibold hover:bg-red-600 transition-colors"
              >
                Play
              </button>
              <button
                onClick={addAlbumToQueue}
                className="px-8 py-3 bg-white/10 rounded-full font-semibold hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <QueueListIcon className="w-5 h-5" />
                Add to Queue
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="space-y-2">
        {albumTracks.map((track, index) => (
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
              onClick={() => playTrack(track, index)}
              className="hidden group-hover:block"
            >
              {isTrackPlaying(track) ? (
                <PauseIcon className="w-6 h-6 text-red-500" />
              ) : (
                <PlayIcon className="w-6 h-6 text-white" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <h3
                className={`font-medium truncate ${
                  isTrackPlaying(track) ? "text-red-500" : ""
                }`}
              >
                {track.title}
              </h3>
            </div>
            <span className="text-sm text-gray-400">
              {Math.floor(track.duration / 60)}:
              {String(Math.floor(track.duration % 60)).padStart(2, "0")}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
