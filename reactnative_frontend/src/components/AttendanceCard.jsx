import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../theme/appcolors";

export default function AttendanceCard({ attendance }) {
  const { date, time, status, boarding, busNumber } = attendance || {};
  
  const isPresent = status === "Boarded";
  
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={isPresent ? "checkmark-circle" : "close-circle"}
          size={32}
          color={isPresent ? "#4CAF50" : "#f44336"}
        />
      </View>
      
      <View style={styles.info}>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.time}>{time}</Text>
        {boarding && (
          <Text style={styles.boarding}>📍 {boarding}</Text>
        )}
      </View>
      
      <View style={styles.statusContainer}>
        <Text
          style={[
            styles.status,
            { color: isPresent ? "#4CAF50" : "#f44336" },
          ]}
        >
          {status}
        </Text>
        {busNumber && (
          <Text style={styles.busNumber}>Bus {busNumber}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginVertical: 6,
    marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  date: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.color2,
    marginBottom: 2,
  },
  time: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "#666",
    marginBottom: 2,
  },
  boarding: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#888",
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  status: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 2,
  },
  busNumber: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#666",
  },
});
