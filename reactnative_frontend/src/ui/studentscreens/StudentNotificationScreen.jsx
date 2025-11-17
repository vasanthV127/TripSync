import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "../../theme/appcolors.js";
import { Ionicons } from "@expo/vector-icons";

const notificationsData = [
  {
    id: "1",
    sender: "John Doe",
    message: "Your trip to Downtown is confirmed!",
    datetime: "Today, 10:30 AM",
  },
  {
    id: "2",
    sender: "Admin",
    message: "New payment option added in your account.",
    datetime: "Yesterday, 4:15 PM",
  },
  {
    id: "3",
    sender: "Mary Smith",
    message: "Don’t forget to complete your feedback form.",
    datetime: "Nov 6, 2:00 PM",
  },
];

export default function StudentNotificationScreen({ navigation }) {
  const [notifications, setNotifications] = React.useState(notificationsData);

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
      <Text style={styles.sender}>{item.sender}</Text>
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
        {notifications.length === 0 ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text
              style={{
                fontSize: 16,
                color: "#999",
                fontFamily: "Poppins_400Regular",
              }}
            >
              No notifications
            </Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderNotification}
            showsVerticalScrollIndicator={false}
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
    marginBottom: 10, // If border is removed change this value to 15
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
});
