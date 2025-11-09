import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import Colors from "../../theme/appcolors.js";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StudentProfileScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
            <Ionicons name="settings" size={24} color="#000000ff" />
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            columnGap: 15,
            marginBottom: 25,
            padding: 15,
            backgroundColor: "#fff",
            borderRadius: 15,
            borderWidth: 1,
            borderColor: "#ccc",
          }}
        >
          <Image
            source={require("../../../assets/FINAL MW.png")}
            style={{
              width: 90,
              height: 90,
              borderRadius: 15,
              borderWidth: 1,
              borderColor: "#000000",
            }}
          />
          <View>
            <Text style={{ fontFamily: "Poppins_500Medium", fontSize: 20 }}>
              Purushothaman M
            </Text>
            <Text style={{ fontFamily: "Poppins_300Light", fontSize: 16 }}>
              22BEC7001
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 15 }}>
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate("Address")}
          >
            <Ionicons name="location-outline" size={24} color="#000" />
            <Text style={styles.itemText}>Address</Text>
            <Ionicons name="chevron-forward" size={20} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate("Route")}
          >
            <Ionicons name="map-outline" size={24} color="#000" />
            <Text style={styles.itemText}>Route</Text>
            <Ionicons name="chevron-forward" size={20} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate("BusInfo")}
          >
            <Ionicons name="bus-outline" size={24} color="#000" />
            <Text style={styles.itemText}>Bus Info</Text>
            <Ionicons name="chevron-forward" size={20} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate("Complaints")}
          >
            <Ionicons name="chatbox-ellipses-outline" size={24} color="#000" />
            <Text style={styles.itemText}>Complaints</Text>
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
    marginBottom: 25,
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
