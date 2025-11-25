import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Colors from "../theme/appcolors";

export default function ErrorView({ message = "Something went wrong", onRetry }) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>😕</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 20,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  message: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.color2,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  retryText: {
    color: Colors.color1,
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
  },
});
