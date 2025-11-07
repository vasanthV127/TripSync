import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Colors from "../../theme/appcolors.js";
import { MaterialIcons } from "@expo/vector-icons";

export default function StudentProfileScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text>Hi</Text>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <MaterialIcons name="settings" size={26} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: "#333",
  },
});
