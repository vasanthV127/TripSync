import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "./apiService";

/**
 * Parent API Service
 * All API calls for parent-specific features
 */

// Get parent profile
export const getParentProfile = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  // Parents will use a similar endpoint structure
  const data = await apiRequest("/api/students/me", "GET", null);
  return data.student || data.parent;
};

// Get child's profile and details
export const getChildProfile = async (rollNo) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const data = await apiRequest(
    `/api/students/profile?roll_no=${rollNo}`,
    "GET",
    null
  );
  return data;
};

// Get child's attendance
export const getChildAttendance = async (rollNo, fromDate = null, toDate = null) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  let endpoint = `/api/students/${rollNo}/attendance-summary`;
  const params = [];
  if (fromDate) params.push(`from_date=${fromDate}`);
  if (toDate) params.push(`to_date=${toDate}`);
  if (params.length > 0) endpoint += `?${params.join("&")}`;

  const data = await apiRequest(endpoint, "GET", null);
  return data;
};

// Get child's bus location (real-time tracking)
export const getChildBusLocation = async (busNumber) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  // Get all buses and filter by busNumber
  const data = await apiRequest("/api/buses", "GET", null);
  const bus = data.find((b) => b.number === busNumber);
  return bus;
};

// Get all routes
export const getAllRoutes = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const data = await apiRequest("/api/routes", "GET", null);
  return data;
};

// Change password
export const changeParentPassword = async (oldPassword, newPassword) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const data = await apiRequest("/api/auth/change-password", "POST", {
    oldPassword,
    newPassword,
  });
  return data;
};

// Get messages relevant to parent's child
export const getParentMessages = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  // Parents can see route-specific messages
  // This would need to be enhanced based on backend support
  const data = await apiRequest("/api/messages/parent/groups", "GET", null);
  return data;
};
