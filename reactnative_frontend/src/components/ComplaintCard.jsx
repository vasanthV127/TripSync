import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../theme/appcolors";

export default function ComplaintCard({ complaint, onPress }) {
  const { category, description, status, submittedAt, adminResponse } =
    complaint || {};
  
  const getStatusColor = () => {
    switch (status) {
      case "resolved":
        return "#4CAF50";
      case "in_progress":
        return "#FF9800";
      default:
        return "#999";
    }
  };
  
  const getStatusText = () => {
    switch (status) {
      case "resolved":
        return "Resolved";
      case "in_progress":
        return "In Progress";
      default:
        return "Pending";
    }
  };
  
  const getCategoryIcon = () => {
    switch (category) {
      case "rash_driving":
        return "warning";
      case "lost_found":
        return "search";
      case "bus_issue":
        return "bus";
      default:
        return "alert-circle";
    }
  };
  
  const getCategoryLabel = () => {
    switch (category) {
      case "rash_driving":
        return "Rash Driving";
      case "lost_found":
        return "Lost & Found";
      case "bus_issue":
        return "Bus Issue";
      default:
        return "Other";
    }
  };
  
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={getCategoryIcon()}
            size={24}
            color={Colors.color2}
          />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.category}>{getCategoryLabel()}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor() + "20" },
            ]}
          >
            <Text
              style={[styles.statusText, { color: getStatusColor() }]}
            >
              {getStatusText()}
            </Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.description} numberOfLines={2}>
        {description}
      </Text>
      
      {adminResponse && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseLabel}>Admin Response:</Text>
          <Text style={styles.responseText} numberOfLines={2}>
            {adminResponse}
          </Text>
        </View>
      )}
      
      <Text style={styles.date}>
        {submittedAt
          ? new Date(submittedAt).toLocaleDateString()
          : ""}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  category: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.color2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
  },
  description: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "#666",
    lineHeight: 20,
    marginBottom: 8,
  },
  responseContainer: {
    backgroundColor: Colors.background,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  responseLabel: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.color2,
    marginBottom: 4,
  },
  responseText: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#666",
    lineHeight: 18,
  },
  date: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: "#999",
  },
});
