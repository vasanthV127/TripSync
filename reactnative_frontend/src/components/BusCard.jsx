import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../theme/appcolors";

export default function BusCard({ bus, onPress }) {
  const { number, route, currentLocation, status } = bus || {};
  
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.busIcon}>
          <Ionicons name="bus" size={28} color={Colors.color2} />
        </View>
        <View style={styles.info}>
          <Text style={styles.busNumber}>Bus {number}</Text>
          <Text style={styles.route}>{route}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#999" />
      </View>
      
      {status && (
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: status === "active" ? "#4CAF50" : "#999" },
            ]}
          />
          <Text style={styles.statusText}>
            {status === "active" ? "Active" : "Inactive"}
          </Text>
        </View>
      )}
      
      {currentLocation && (
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.locationText}>
            Lat: {currentLocation.lat?.toFixed(4)}, Lng:{" "}
            {currentLocation.long?.toFixed(4)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 18,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  busIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  busNumber: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.color2,
    marginBottom: 2,
  },
  route: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#666",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "#666",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  locationText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#666",
    marginLeft: 4,
  },
});
