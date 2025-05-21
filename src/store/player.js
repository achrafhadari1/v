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
      cachedArtists: {},
      cachedAlbums: {},
      setCurrentTrack: (track) => set({ currentTrack: track }),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setQueue: (queue) => set({ queue }),
      addToQueue: (tracks) =>
        set((state) => ({
          queue: Array.isArray(tracks)
            ? [...state.queue, ...tracks]
            : [...state.queue, tracks],
        })),
      removeFromQueue: (trackId) =>
        set((state) => ({
          queue: state.queue.filter((track) => track.id !== trackId),
        })),
      clearQueue: () => set({ queue: [] }),
      setLibrary: (library) =>
        set({ library, lastFetched: new Date().toISOString() }),
      addToLibrary: (tracks) =>
        set((state) => ({
          library: [...state.library, ...tracks],
          lastFetched: new Date().toISOString(),
        })),
      setCachedArtist: (artistName, data) =>
        set((state) => ({
          cachedArtists: { ...state.cachedArtists, [artistName]: data },
        })),
      setCachedAlbum: (albumName, data) =>
        set((state) => ({
          cachedAlbums: { ...state.cachedAlbums, [albumName]: data },
        })),
    }),
    {
      name: "music-library",
    }
  )
);
