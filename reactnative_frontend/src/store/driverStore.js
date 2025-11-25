import { create } from "zustand";

/**
 * Driver Store
 * Manages driver-specific data
 */
export const useDriverStore = create((set, get) => ({
  // State
  profile: null,
  bus: null,
  route: null,
  students: [],
  leaves: [],
  schedule: null,
  messageGroups: [],
  
  // Loading states
  isLoadingProfile: false,
  isLoadingStudents: false,
  isLoadingLeaves: false,
  isLoadingSchedule: false,

  // Actions
  setProfile: (profile) => set({ profile }),
  
  setBus: (bus) => set({ bus }),
  
  setRoute: (route) => set({ route }),
  
  setStudents: (students) => set({ students }),
  
  setLeaves: (leaves) => set({ leaves }),
  
  addLeave: (leave) => {
    const currentLeaves = get().leaves;
    set({ leaves: [leave, ...currentLeaves] });
  },
  
  removeLeave: (leaveId) => {
    const currentLeaves = get().leaves;
    set({ leaves: currentLeaves.filter((l) => l._id !== leaveId) });
  },
  
  setSchedule: (schedule) => set({ schedule }),
  
  setMessageGroups: (messageGroups) => set({ messageGroups }),

  // Loading setters
  setLoadingProfile: (isLoading) => set({ isLoadingProfile: isLoading }),
  setLoadingStudents: (isLoading) => set({ isLoadingStudents: isLoading }),
  setLoadingLeaves: (isLoading) => set({ isLoadingLeaves: isLoading }),
  setLoadingSchedule: (isLoading) => set({ isLoadingSchedule: isLoading }),

  // Clear all data (on logout)
  clearDriverData: () => set({
    profile: null,
    bus: null,
    route: null,
    students: [],
    leaves: [],
    schedule: null,
    messageGroups: [],
    isLoadingProfile: false,
    isLoadingStudents: false,
    isLoadingLeaves: false,
    isLoadingSchedule: false,
  }),
}));
