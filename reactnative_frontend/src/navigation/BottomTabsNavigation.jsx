import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import StudentHomeScreen from "../ui/studentscreens/StudentHomeScreen";
import StudentProfileScreen from "../ui/studentscreens/StudentProfileScreen";
import StudentSettingsScreen from "../ui/studentscreens/StudentSettingsScreen";
import StudentNotificationScreen from "../ui/studentscreens/StudentNotificationScreen.jsx";
import Colors from "../theme/appcolors.js";

const Tab = createBottomTabNavigator();

export default function BottomTabsNavigation() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#4facfe",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          height: 60,
          backgroundColor: Colors.color1,
          paddingTop: 10,
          paddingBottom: 0,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={StudentHomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={26}
              color={Colors.color2}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Notification"
        component={StudentNotificationScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "notifications" : "notifications-outline"}
              size={26}
              color={Colors.color2}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={StudentProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={26}
              color={Colors.color2}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Settings"
        component={StudentSettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={26}
              color={Colors.color2}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
