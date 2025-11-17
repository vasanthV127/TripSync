import { create } from "zustand";

export const useBusStore = create((set) => ({
  busNumber: "",
  driverName: "",
  driverPhone: "",
  setBusData: (data) => set(data),
}));
