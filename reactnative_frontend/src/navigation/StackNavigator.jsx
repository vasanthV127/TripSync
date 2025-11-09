import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabsNavigation from "./BottomTabsNavigation.jsx";
import IntroScreen from "../ui/IntroScreen";
import LoginScreen from "../ui/LoginScreen";
import RoleSelectionScreen from "../ui/RoleSelectionScreen.jsx";

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Intro">
      <Stack.Screen
        name="Intro"
        component={IntroScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RoleSelection"
        component={RoleSelectionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Main"
        component={BottomTabsNavigation}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
