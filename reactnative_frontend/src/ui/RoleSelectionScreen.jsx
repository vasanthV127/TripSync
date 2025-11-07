import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Colors from "../theme/appcolors.js";

export default function RoleSelectionScreen({ navigation }) {
  const roles = [
    { name: "Student", icon: "school", color: "#FFA726" },
    { name: "Driver", icon: "drive-eta", color: "#29B6F6" },
    { name: "Parent", icon: "supervisor-account", color: "#66BB6A" },
  ];

  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setTimeout(() => {
      navigation.navigate("Login", { role });
    }, 200);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Choose your role</Text>
      <View style={styles.buttonContainer}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.name}
            style={[
              styles.button,
              {
                backgroundColor:
                  selectedRole === role.name ? role.color : "#fff",
                borderColor: role.color,
              },
            ]}
            activeOpacity={0.8}
            onPress={() => handleRoleSelect(role.name)}
          >
            <MaterialIcons
              name={role.icon}
              size={30}
              color={selectedRole === role.name ? "#fff" : role.color}
            />
            <Text
              style={[
                styles.buttonText,
                { color: selectedRole === role.name ? "#fff" : role.color },
              ]}
            >
              {role.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: Colors.background,
  },
  heading: {
    fontSize: 45,
    color: "#333",
    marginBottom: 40,
    textAlign: "left",
    fontFamily: "Poppins_300Light",
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
  },
  button: {
    width: 100,
    height: 100,
    rowGap: 3,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 15,
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: "Poppins_400Regular",
  },
});
