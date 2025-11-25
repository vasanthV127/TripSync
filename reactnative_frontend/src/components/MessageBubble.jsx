import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "../theme/appcolors";

export default function MessageBubble({ message, isOwnMessage = false }) {
  const { content, sender, timestamp } = message || {};
  
  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.ownMessage : styles.otherMessage,
      ]}
    >
      {!isOwnMessage && sender && (
        <Text style={styles.senderName}>
          {sender.name || "Unknown"}
          {sender.rollNo && ` (${sender.rollNo})`}
        </Text>
      )}
      
      <Text
        style={[
          styles.content,
          isOwnMessage && { color: "#fff" },
        ]}
      >
        {content}
      </Text>
      
      <Text
        style={[
          styles.timestamp,
          isOwnMessage && { color: "#fff", opacity: 0.8 },
        ]}
      >
        {timestamp
          ? new Date(timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: "75%",
    borderRadius: 15,
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 16,
  },
  ownMessage: {
    alignSelf: "flex-end",
    backgroundColor: Colors.color2,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f0f0",
  },
  senderName: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.color2,
    marginBottom: 4,
  },
  content: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#333",
    lineHeight: 20,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    color: "#999",
    textAlign: "right",
  },
});
