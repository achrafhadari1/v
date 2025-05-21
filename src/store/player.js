import { create } from "zustand";
import { persist } from "zustand/middleware";

export const usePlayerStore = create(
  persist(
    (set) => ({
      currentTrack: null,
      isPlaying: false,
      queue: [],
      library: [],
      lastFetched: null,
      setCurrentTrack: (track) => set({ currentTrack: track }),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setQueue: (queue) => set({ queue }),
      addToQueue: (track) =>
        set((state) => ({ queue: [...state.queue, track] })),
      clearQueue: () => set({ queue: [] }),
      setLibrary: (library) =>
        set({ library, lastFetched: new Date().toISOString() }),
      addToLibrary: (tracks) =>
        set((state) => ({
          library: [...state.library, ...tracks],
          lastFetched: new Date().toISOString(),
        })),
    }),
    {
      name: "music-library",
    }
  )
);
