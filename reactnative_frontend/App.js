import useAppFonts from "./src/theme/fonts.js";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/StackNavigator.jsx";
import Toast from "react-native-toast-message";
import { toastConfig } from "./src/theme/toastConfig.js";

export default function App() {
  const fontsLoaded = useAppFonts();
  if (!fontsLoaded) {
    return null;
  }
  return (
    <>
      <NavigationContainer>
        <StackNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
      <Toast config={toastConfig} />
    </>
  );
}
