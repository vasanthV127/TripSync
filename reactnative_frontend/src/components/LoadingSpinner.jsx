import React from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import Colors from "../theme/appcolors";

export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.color2} />
      {message && <Text style={styles.text}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  text: {
    marginTop: 15,
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: Colors.color2,
  },
});
