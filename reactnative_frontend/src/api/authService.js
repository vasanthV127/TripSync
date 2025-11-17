import { apiRequest } from "./apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const loginUser = async (email, password) => {
  // Call login API
  const data = await apiRequest("/api/login", "POST", { email, password });

  // Save token and role safely
  if (data.token) {
    await AsyncStorage.setItem("token", data.token);
  }
  if (data.role) {
    await AsyncStorage.setItem("role", data.role);
  }

  return data; // returns { token, role }
};

export const logoutUser = async () => {
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("role");
};

export const getProfile = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const data = await apiRequest("/api/students/me", "GET", null, {
    Authorization: `Bearer ${token}`,
  });
  return data.student; // return student object
};

// Get driver info for the logged-in student
export const getDriverInfo = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const data = await apiRequest("/api/students/me/driver", "GET", null, {
    Authorization: `Bearer ${token}`,
  });
  return data.driver;
};

//Route Info for Profile
export const getRouteInfo = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const data = await apiRequest("/api/students/me/route", "GET", null, {
    Authorization: `Bearer ${token}`,
  });
  return data.route;
};

export const submitStudentComplaint = async (complaintData) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const data = await apiRequest(
    "/api/messages/student/complaint",
    "POST",
    complaintData,
    {
      Authorization: `Bearer ${token}`,
    }
  );

  // Only return success or fail message
  return {
    success: data.success,
    message: data.message,
  };
};

export const getStudentBusDataCurrent = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const data = await apiRequest("/api/students/me/bus", "GET", null, {
    Authorization: `Bearer ${token}`,
  });

  return data.bus;
};
