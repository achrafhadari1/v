"use client";

import { useRef, useEffect, useState } from "react";
import { usePlayerStore } from "@/store/player";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlayIcon,
  PauseIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ForwardIcon,
  BackwardIcon,
} from "@heroicons/react/24/solid";
import * as Slider from "@radix-ui/react-slider";

export default function Player() {
  const audioRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const { currentTrack, isPlaying, setIsPlaying, queue, setCurrentTrack } =
    usePlayerStore();

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = `/api/stream?fileId=${currentTrack.id}`;
      if (isPlaying) audioRef.current.play();
    }
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (value) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60) || 0;
    const seconds = Math.floor(time % 60) || 0;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const playNext = () => {
    if (!currentTrack || !queue.length) return;
    const currentIndex = queue.findIndex(
      (track) => track.id === currentTrack.id
    );
    if (currentIndex < queue.length - 1) {
      setCurrentTrack(queue[currentIndex + 1]);
    }
  };

  const playPrevious = () => {
    if (!currentTrack || !queue.length) return;
    const currentIndex = queue.findIndex(
      (track) => track.id === currentTrack.id
    );
    if (currentIndex > 0) {
      setCurrentTrack(queue[currentIndex - 1]);
    }
  };

  if (!currentTrack) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-neutral-900 text-white shadow-xl ${
          expanded ? "h-full" : "h-[72px]"
        } transition-all duration-300`}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
      >
        {/* MINI PLAYER */}
        {!expanded && (
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center gap-4 overflow-hidden">
              {currentTrack.albumArtUrl ? (
                <img
                  src={currentTrack.albumArtUrl}
                  alt="Album Art"
                  className="w-12 h-12 rounded-md object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-white/10 rounded-md flex items-center justify-center text-xl">
                  🎵
                </div>
              )}
              <div className="truncate">
                <h3 className="text-sm font-medium truncate">
                  {currentTrack.title}
                </h3>
                <p className="text-xs text-gray-400 truncate">
                  {currentTrack.artist}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={playPrevious}>
                <BackwardIcon className="w-5 h-5 text-white/70 hover:text-white" />
              </button>
              <button
                onClick={togglePlay}
                className="p-2 bg-white text-black rounded-full hover:scale-105 transition"
              >
                {isPlaying ? (
                  <PauseIcon className="w-5 h-5" />
                ) : (
                  <PlayIcon className="w-5 h-5" />
                )}
              </button>
              <button onClick={playNext}>
                <ForwardIcon className="w-5 h-5 text-white/70 hover:text-white" />
              </button>
              <button
                onClick={() => setExpanded(true)}
                className="ml-4 p-1 rounded-full hover:bg-white/10"
              >
                <ChevronUpIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* FULL PLAYER */}
        {expanded && (
          <div className="flex flex-col items-center justify-center h-full p-8 relative">
            <button
              onClick={() => setExpanded(false)}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full"
            >
              <ChevronDownIcon className="w-6 h-6" />
            </button>

            {currentTrack.albumArtUrl ? (
              <img
                src={currentTrack.albumArtUrl}
                alt="Album Art"
                className="w-64 h-64 rounded-xl shadow-lg mb-6 object-cover"
              />
            ) : (
              <div className="w-64 h-64 bg-white/10 rounded-xl flex items-center justify-center text-5xl mb-6">
                🎵
              </div>
            )}

            <h2 className="text-xl font-bold mb-1">{currentTrack.title}</h2>
            <p className="text-sm text-gray-400 mb-8">{currentTrack.artist}</p>

            {/* Slider */}
            <div className="w-full max-w-xl mb-6">
              <div className="flex justify-between text-xs mb-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <Slider.Root
                value={[currentTime]}
                max={duration || 1}
                step={1}
                onValueChange={handleSeek}
                className="relative flex items-center w-full h-2"
              >
                <Slider.Track className="bg-white/20 relative grow h-1 rounded-full">
                  <Slider.Range className="absolute bg-white h-full rounded-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-3 h-3 bg-white rounded-full hover:bg-white/90 focus:outline-none" />
              </Slider.Root>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-10">
              <button
                onClick={playPrevious}
                className="hover:scale-110 transition"
              >
                <BackwardIcon className="w-7 h-7 text-white/80" />
              </button>
              <button
                onClick={togglePlay}
                className="p-4 bg-white text-black rounded-full hover:scale-110 transition"
              >
                {isPlaying ? (
                  <PauseIcon className="w-8 h-8" />
                ) : (
                  <PlayIcon className="w-8 h-8" />
                )}
              </button>
              <button onClick={playNext} className="hover:scale-110 transition">
                <ForwardIcon className="w-7 h-7 text-white/80" />
              </button>
            </div>
          </div>
        )}

        <audio ref={audioRef} />
      </motion.div>
    </AnimatePresence>
  );
}
