import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import HomeScreen from "../screens/HomeScreen";
// import ProfileScreen from "../screens/ProfileScreen";
import StudentHomeScreen from "../ui/studentscreens/StudentHomeScreen";
import StudentProfileScreen from "../ui/studentscreens/StudentProfileScreen";
import StudentSettingsScreen from "../ui/studentscreens/StudentSettingsScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabsNavigation() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={StudentHomeScreen} />
      <Tab.Screen name="Profile" component={StudentProfileScreen} />
      <Tab.Screen name="Settings" component={StudentSettingsScreen} />
    </Tab.Navigator>
  );
}
