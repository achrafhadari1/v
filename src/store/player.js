import { create } from 'zustand';

export const usePlayerStore = create((set) => ({
  currentTrack: null,
  isPlaying: false,
  queue: [],
  setCurrentTrack: (track) => set({ currentTrack: track }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setQueue: (queue) => set({ queue }),
  addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),
  clearQueue: () => set({ queue: [] }),
}));