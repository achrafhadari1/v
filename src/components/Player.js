"use client";
import { useRef, useEffect, useState } from "react";
import { usePlayerStore } from "@/store/player";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  SpeakerWaveIcon,
  QueueListIcon,
} from "@heroicons/react/24/solid";
import * as Slider from "@radix-ui/react-slider";

export default function Player() {
  const audioRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showQueue, setShowQueue] = useState(false);

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
    const handleEnded = () => {
      const currentIndex = queue.findIndex(
        (track) => track.id === currentTrack.id
      );
      if (currentIndex < queue.length - 1) {
        setCurrentTrack(queue[currentIndex + 1]);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [queue, currentTrack]);

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

  const handleVolumeChange = (value) => {
    if (!audioRef.current) return;
    const newVolume = value[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
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
        className={`fixed bottom-0 left-0 right-0 z-50 bg-[#1A1A1A] backdrop-blur-xl bg-opacity-95 shadow-2xl ${
          expanded ? "h-full" : "h-20"
        } transition-all duration-300`}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
      >
        {/* Mini Player */}
        {!expanded && (
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div
                className="relative group cursor-pointer"
                onClick={() => setExpanded(true)}
              >
                {currentTrack.albumArtUrl ? (
                  <img
                    src={currentTrack.albumArtUrl}
                    alt="Album Art"
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-[#2A2A2A] rounded-lg flex items-center justify-center">
                    🎵
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="text-sm font-medium truncate hover:text-red-500 cursor-pointer"
                  onClick={() => setExpanded(true)}
                >
                  {currentTrack.title}
                </h3>
                <p className="text-xs text-gray-400 truncate">
                  {currentTrack.artist}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button onClick={playPrevious}>
                <BackwardIcon className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
              </button>
              <button
                onClick={togglePlay}
                className="w-8 h-8 flex items-center justify-center bg-white rounded-full hover:transform hover:scale-105 transition-all"
              >
                {isPlaying ? (
                  <PauseIcon className="w-4 h-4 text-black" />
                ) : (
                  <PlayIcon className="w-4 h-4 text-black" />
                )}
              </button>
              <button onClick={playNext}>
                <ForwardIcon className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        )}

        {/* Full Player */}
        {expanded && (
          <div className="flex h-full p-8">
            {/* Left Side - Album Art & Info */}
            <div className="flex-1 flex flex-col items-center justify-center gap-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative group"
              >
                {currentTrack.albumArtUrl ? (
                  <img
                    src={currentTrack.albumArtUrl}
                    alt="Album Art"
                    className="w-[400px] h-[400px] rounded-2xl shadow-2xl object-cover"
                  />
                ) : (
                  <div className="w-[400px] h-[400px] bg-[#2A2A2A] rounded-2xl flex items-center justify-center text-6xl">
                    🎵
                  </div>
                )}
              </motion.div>

              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">
                  {currentTrack.title}
                </h2>
                <p className="text-gray-400">{currentTrack.artist}</p>
                {currentTrack.album && (
                  <p className="text-sm text-gray-500 mt-1">
                    {currentTrack.album}
                  </p>
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md">
                <Slider.Root
                  value={[currentTime]}
                  max={duration || 1}
                  step={1}
                  onValueChange={handleSeek}
                  className="relative flex items-center w-full h-1 touch-none select-none"
                >
                  <Slider.Track className="bg-gray-600 relative grow rounded-full h-1">
                    <Slider.Range className="absolute bg-red-500 rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-3 h-3 bg-white rounded-full hover:scale-125 transition focus:outline-none" />
                </Slider.Root>
                <div className="flex justify-between mt-2 text-sm text-gray-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-8">
                <button onClick={playPrevious}>
                  <BackwardIcon className="w-8 h-8 text-gray-400 hover:text-white transition-colors" />
                </button>
                <button
                  onClick={togglePlay}
                  className="w-16 h-16 flex items-center justify-center bg-white rounded-full hover:transform hover:scale-105 transition-all"
                >
                  {isPlaying ? (
                    <PauseIcon className="w-8 h-8 text-black" />
                  ) : (
                    <PlayIcon className="w-8 h-8 text-black" />
                  )}
                </button>
                <button onClick={playNext}>
                  <ForwardIcon className="w-8 h-8 text-gray-400 hover:text-white transition-colors" />
                </button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-2 w-full max-w-xs">
                <SpeakerWaveIcon className="w-5 h-5 text-gray-400" />
                <Slider.Root
                  value={[volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="relative flex items-center w-full h-1 touch-none select-none"
                >
                  <Slider.Track className="bg-gray-600 relative grow rounded-full h-1">
                    <Slider.Range className="absolute bg-white rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-3 h-3 bg-white rounded-full hover:scale-125 transition focus:outline-none" />
                </Slider.Root>
              </div>
            </div>

            {/* Right Side - Queue */}
            <div className="w-80 border-l border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Up Next</h3>
                <button onClick={() => setShowQueue(!showQueue)}>
                  <QueueListIcon className="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-300px)]">
                {queue.map((track, index) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white/5 ${
                      currentTrack.id === track.id ? "bg-white/10" : ""
                    }`}
                    onClick={() => setCurrentTrack(track)}
                  >
                    {track.albumArtUrl ? (
                      <img
                        src={track.albumArtUrl}
                        alt={track.title}
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-[#2A2A2A] rounded flex items-center justify-center">
                        🎵
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">
                        {track.title}
                      </h4>
                      <p className="text-xs text-gray-400 truncate">
                        {track.artist}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setExpanded(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white"
            >
              Done
            </button>
          </div>
        )}

        <audio ref={audioRef} />
      </motion.div>
    </AnimatePresence>
  );
}
