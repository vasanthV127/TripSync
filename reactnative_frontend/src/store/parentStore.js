import { create } from "zustand";

/**
 * Parent Store
 * Manages parent-specific data
 */
export const useParentStore = create((set, get) => ({
  // State
  profile: null,
  childProfile: null,
  childAttendance: null,
  childBus: null,
  routes: [],
  messages: [],
  
  // Loading states
  isLoadingProfile: false,
  isLoadingChild: false,
  isLoadingAttendance: false,
  isLoadingBus: false,

  // Actions
  setProfile: (profile) => set({ profile }),
  
  setChildProfile: (childProfile) => set({ childProfile }),
  
  setChildAttendance: (childAttendance) => set({ childAttendance }),
  
  setChildBus: (childBus) => set({ childBus }),
  
  setRoutes: (routes) => set({ routes }),
  
  setMessages: (messages) => set({ messages }),

  // Loading setters
  setLoadingProfile: (isLoading) => set({ isLoadingProfile: isLoading }),
  setLoadingChild: (isLoading) => set({ isLoadingChild: isLoading }),
  setLoadingAttendance: (isLoading) => set({ isLoadingAttendance: isLoading }),
  setLoadingBus: (isLoading) => set({ isLoadingBus: isLoading }),

  // Clear all data (on logout)
  clearParentData: () => set({
    profile: null,
    childProfile: null,
    childAttendance: null,
    childBus: null,
    routes: [],
    messages: [],
    isLoadingProfile: false,
    isLoadingChild: false,
    isLoadingAttendance: false,
    isLoadingBus: false,
  }),
}));
