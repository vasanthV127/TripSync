import { create } from "zustand";

/**
 * Student Store
 * Manages student-specific data
 */
export const useStudentStore = create((set, get) => ({
  // State
  profile: null,
  bus: null,
  route: null,
  driver: null,
  attendance: null,
  complaints: [],
  messages: [],
  busChatMessages: [],
  
  // Loading states
  isLoadingProfile: false,
  isLoadingBus: false,
  isLoadingAttendance: false,
  isLoadingComplaints: false,
  isLoadingMessages: false,

  // Actions
  setProfile: (profile) => set({ profile }),
  
  setBus: (bus) => set({ bus }),
  
  setRoute: (route) => set({ route }),
  
  setDriver: (driver) => set({ driver }),
  
  setAttendance: (attendance) => set({ attendance }),
  
  setComplaints: (complaints) => set({ complaints }),
  
  addComplaint: (complaint) => {
    const currentComplaints = get().complaints;
    set({ complaints: [complaint, ...currentComplaints] });
  },
  
  setMessages: (messages) => set({ messages }),
  
  setBusChatMessages: (busChatMessages) => set({ busChatMessages }),
  
  addBusChatMessage: (message) => {
    const currentMessages = get().busChatMessages;
    set({ busChatMessages: [...currentMessages, message] });
  },

  // Loading setters
  setLoadingProfile: (isLoading) => set({ isLoadingProfile: isLoading }),
  setLoadingBus: (isLoading) => set({ isLoadingBus: isLoading }),
  setLoadingAttendance: (isLoading) => set({ isLoadingAttendance: isLoading }),
  setLoadingComplaints: (isLoading) => set({ isLoadingComplaints: isLoading }),
  setLoadingMessages: (isLoading) => set({ isLoadingMessages: isLoading }),

  // Clear all data (on logout)
  clearStudentData: () => set({
    profile: null,
    bus: null,
    route: null,
    driver: null,
    attendance: null,
    complaints: [],
    messages: [],
    busChatMessages: [],
    isLoadingProfile: false,
    isLoadingBus: false,
    isLoadingAttendance: false,
    isLoadingComplaints: false,
    isLoadingMessages: false,
  }),
}));
