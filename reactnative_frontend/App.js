import useAppFonts from "./src/theme/fonts.js";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/StackNavigator.jsx";

export default function App() {
  const fontsLoaded = useAppFonts();
  if (!fontsLoaded) {
    return null;
  }
  return (
    <NavigationContainer>
      <StackNavigator />
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
