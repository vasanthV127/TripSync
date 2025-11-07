import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "../theme/appcolors.js";

export default function IntroScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("RoleSelection");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text
        style={{
          fontFamily: "UnicaOne_400Regular",
          fontSize: 65,
          color: Colors.color1,
        }}
      >
        TripSync
      </Text>
      <Text
        style={{
          fontFamily: "Poppins_300Light",
          fontSize: 17,
          color: Colors.color2,
        }}
      >
        Sync your ride, Save your time
      </Text>
      <Text
        style={{
          fontFamily: "Merriweather_300Light_Italic",
          fontSize: 12,
          color: Colors.color2,
        }}
      >
        by
      </Text>
      <Text
        style={{
          fontFamily: "Merriweather_400Regular",
          fontSize: 25,
          color: Colors.color2,
          letterSpacing: 2,
        }}
      >
        VIT
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
