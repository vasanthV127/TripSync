import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "./apiService";

/**
 * Student API Service
 * All API calls for student-specific features
 */

// Get student profile
export const getStudentProfile = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const data = await apiRequest("/api/students/me", "GET", null);
  return data.student;
};

// Get student's route details
export const getStudentRoute = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const data = await apiRequest("/api/students/me/route", "GET", null);
  return data.route;
};

// Get student's bus details with location
export const getStudentBus = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const data = await apiRequest("/api/students/me/bus", "GET", null);
  return data.bus;
};

// Get student's driver details
export const getStudentDriver = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const data = await apiRequest("/api/students/me/driver", "GET", null);
  return data.driver;
};

// Get student's attendance history
export const getStudentAttendance = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const data = await apiRequest("/api/students/me/attendance", "GET", null);
  return data.attendance;
};

// Submit a complaint
export const submitComplaint = async (complaintData) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const data = await apiRequest(
    "/api/messages/student/complaint",
    "POST",
    complaintData
  );
  return data;
};

// Get all my complaints
export const getMyComplaints = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const data = await apiRequest(
    "/api/messages/student/my-complaints",
    "GET",
    null
  );
  return data;
};

// Get messages from driver
export const getDriverMessages = async (limit = 50, skip = 0) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const data = await apiRequest(
    `/api/messages/student/driver-messages?limit=${limit}&skip=${skip}`,
    "GET",
    null
  );
  return data;
};

// Get bus chat messages (student to student)
export const getBusChatMessages = async (limit = 50, skip = 0) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const data = await apiRequest(
    `/api/messages/student/bus-chat?limit=${limit}&skip=${skip}`,
    "GET",
    null
  );
  return data;
};

// Send message in bus chat
export const sendBusMessage = async (content) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const data = await apiRequest(
    "/api/messages/student/send-message",
    "POST",
    { content }
  );
  return data;
};

// Change password
export const changePassword = async (oldPassword, newPassword) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const data = await apiRequest("/api/auth/change-password", "POST", {
    oldPassword,
    newPassword,
  });
  return data;
};
