import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "./apiService";

/**
 * Driver API Service
 * All API calls for driver-specific features
 */

// Get driver profile with bus and route info
export const getDriverProfile = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const data = await apiRequest("/api/drivers/me", "GET", null);
  return data.driver;
};

// Get list of assigned students
export const getAssignedStudents = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const data = await apiRequest("/api/drivers/me/students", "GET", null);
  return data;
};

// Get bus location and status
export const getDriverBusLocation = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const data = await apiRequest("/api/drivers/me/bus-location", "GET", null);
  return data.bus;
};

// Request leave
export const requestLeave = async (date, reason) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const data = await apiRequest("/api/drivers/me/leave", "POST", {
    date,
    reason,
  });
  return data;
};

// Get all my leave requests
export const getMyLeaves = async (status = null) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const endpoint = status
    ? `/api/drivers/me/leaves?status=${status}`
    : "/api/drivers/me/leaves";
  const data = await apiRequest(endpoint, "GET", null);
  return data.leaves;
};

// Cancel leave request
export const cancelLeaveRequest = async (leaveId) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const data = await apiRequest(
    `/api/drivers/me/leave/${leaveId}`,
    "DELETE",
    null
  );
  return data;
};

// Get work schedule
export const getDriverSchedule = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const data = await apiRequest("/api/drivers/me/schedule", "GET", null);
  return data;
};

// Send message to assigned students
export const sendMessageToStudents = async (content) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const data = await apiRequest(
    "/api/messages/driver/send-to-students",
    "POST",
    { content }
  );
  return data;
};

// Get driver's message groups
export const getDriverGroups = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const data = await apiRequest("/api/messages/driver/my-groups", "GET", null);
  return data.groups;
};

// Update bus location
export const updateBusLocation = async (busNumber, lat, long) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const data = await apiRequest("/api/buses/location", "POST", {
    busNumber,
    lat,
    long,
  });
  return data;
};

// Change password
export const changeDriverPassword = async (oldPassword, newPassword) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const data = await apiRequest("/api/auth/change-password", "POST", {
    oldPassword,
    newPassword,
  });
  return data;
};
