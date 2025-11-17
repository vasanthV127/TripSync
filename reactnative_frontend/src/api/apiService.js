import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://tripsync-uh0i.onrender.com";

export const apiRequest = async (endpoint, method = "GET", body = null) => {
  try {
    const token = await AsyncStorage.getItem("token"); // get stored JWT
    const headers = { "Content-Type": "application/json" };

    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    // Safely parse JSON
    let data;
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {}; // parse only if text is not empty
    } catch (err) {
      console.warn("Failed to parse JSON:", err);
      data = {};
    }

    if (!response.ok) {
      const message = data?.message || "API error!";
      throw new Error(message);
    }

    return data; // token + role or other JSON data
  } catch (error) {
    Alert.alert("API Error", error.message);
    throw error;
  }
};
