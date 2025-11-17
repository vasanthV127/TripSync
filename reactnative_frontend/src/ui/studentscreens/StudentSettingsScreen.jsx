import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Colors from "../../theme/appcolors.js";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { CommonActions } from "@react-navigation/native";
import { logoutUser } from "../../api/authService.js";
import Toast from "react-native-toast-message";

export default function StudentSettingsScreen({ navigation }) {
  const handleLogout = async () => {
    try {
      await logoutUser(); // clear token and role
      Toast.show({
        type: "success",
        text1: "Logged out Successfully",
      });
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" }],
        })
      );
    } catch (error) {
      console.log("Logout failed:", error);
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <Ionicons name="person" size={24} color="#000000ff" />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "column", gap: 15 }}>
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate("Address")}
          >
            <Ionicons name="people-outline" size={24} color="#000" />
            <Text style={styles.itemText}>Account</Text>
            <Ionicons name="chevron-forward" size={20} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate("Route")}
          >
            <Ionicons name="card-outline" size={24} color="#000" />
            <Text style={styles.itemText}>Payment</Text>
            <Ionicons name="chevron-forward" size={20} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate("BusInfo")}
          >
            <Ionicons name="help-circle-outline" size={24} color="#000" />
            <Text style={styles.itemText}>Help</Text>
            <Ionicons name="chevron-forward" size={20} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#000" />
            <Text style={styles.itemText}>Logout</Text>
            <Ionicons name="chevron-forward" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "flex-start",
    padding: 20,
  },
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
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  itemText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#000",
  },
});
