import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * User Store
 * Manages authentication and user data across the app
 */
export const useUserStore = create((set, get) => ({
  // State
  token: null,
  role: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,

  // Actions
  setToken: (token) => set({ token, isAuthenticated: !!token }),
  
  setRole: (role) => set({ role }),
  
  setUser: (user) => set({ user }),

  // Initialize user from AsyncStorage
  initializeUser: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const role = await AsyncStorage.getItem("role");
      
      if (token && role) {
        set({
          token,
          role,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error("Failed to initialize user:", error);
    }
  },

  // Login
  login: async (token, role, user = null) => {
    try {
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("role", role);
      
      set({
        token,
        role,
        user,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Failed to save login data:", error);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("role");
      
      set({
        token: null,
        role: null,
        user: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  },

  // Update user data
  updateUser: (userData) => {
    const currentUser = get().user;
    set({ user: { ...currentUser, ...userData } });
  },

  // Set loading state
  setLoading: (isLoading) => set({ isLoading }),
}));
