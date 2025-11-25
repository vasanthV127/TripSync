import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "../../theme/appcolors.js";
import { Ionicons } from "@expo/vector-icons";
import { getDriverMessages, getMyComplaints } from "../../api/studentService";

export default function StudentNotificationScreen({ navigation }) {
  const [notifications, setNotifications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      console.log("Fetching notifications...");
      
      // Fetch driver messages
      const driverMessagesResponse = await getDriverMessages();
      console.log("Driver messages response:", driverMessagesResponse);
      const driverMessages = driverMessagesResponse.messages || [];
      
      // Fetch my complaints with responses
      const complaintsResponse = await getMyComplaints();
      console.log("Complaints response:", complaintsResponse);
      const complaints = complaintsResponse.complaints || [];
      
      // Filter complaints that have admin responses
      const complaintResponses = complaints.filter(c => c.adminResponse);
      
      // Combine both into notifications
      const allNotifications = [
        // Driver messages
        ...driverMessages.map(msg => ({
          id: msg._id || Math.random().toString(),
          type: "driver_message",
          sender: msg.senderName || "Driver",
          message: msg.content,
          datetime: formatDateTime(msg.timestamp),
          icon: "megaphone",
        })),
        // Complaint responses
        ...complaintResponses.map(complaint => ({
          id: complaint._id || Math.random().toString(),
          type: "complaint_response",
          sender: "Admin Response",
          message: complaint.adminResponse,
          datetime: formatDateTime(complaint.respondedAt || complaint.submittedAt),
          icon: "chatbox-ellipses",
          status: complaint.status,
          originalComplaint: complaint.description,
        }))
      ];
      
      console.log("Total notifications:", allNotifications.length);
      console.log("Notifications:", allNotifications);
      
      setNotifications(allNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      Alert.alert("Error", "Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "";
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) {
      return diffMins <= 1 ? "Just now" : `${diffMins} mins ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const clearAllNotifications = () => {
    Alert.alert(
      "Clear All",
      "Are you sure you want to clear all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => setNotifications([]),
        },
      ]
    );
  };

  const renderNotification = ({ item }) => (
    <View style={styles.notificationCard}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
        <Ionicons 
          name={item.icon || "notifications"} 
          size={16} 
          color={item.type === "complaint_response" ? "#ff6b35" : Colors.color1} 
        />
        <Text style={styles.sender}> {item.sender}</Text>
        {item.status && (
          <View style={[styles.statusBadge, { 
            backgroundColor: item.status === "resolved" ? "#4caf50" : "#ff9800" 
          }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        )}
      </View>
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.datetime}>{item.datetime}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View
        style={{
          flex: 1,
          justifyContent: "flex-start",
          backgroundColor: Colors.background,
          padding: 20,
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>

          {/* Clear All icon */}
          <TouchableOpacity
            onPress={clearAllNotifications}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        {loading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color={Colors.color1} />
            <Text style={{ marginTop: 10, fontFamily: "Poppins_400Regular", color: "#666" }}>
              Loading notifications...
            </Text>
          </View>
        ) : notifications.length === 0 ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
            <Text
              style={{
                fontSize: 16,
                color: "#999",
                fontFamily: "Poppins_400Regular",
                marginTop: 10,
              }}
            >
              No notifications yet
            </Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderNotification}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.color1]}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 20,
    fontFamily: "Poppins_500Medium",
    color: "#333",
  },
  clearButton: {
    backgroundColor: "#ff4d4d",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
  },
  notificationCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
  },
  sender: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: "#333",
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#666",
    marginBottom: 5,
  },
  datetime: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#999",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: "auto",
  },
  statusText: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    color: "#fff",
    textTransform: "uppercase",
  },
});
