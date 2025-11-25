import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabsNavigation from "./BottomTabsNavigation.jsx";
import IntroScreen from "../ui/IntroScreen";
import LoginScreen from "../ui/LoginScreen";
import RoleSelectionScreen from "../ui/RoleSelectionScreen.jsx";
import StudentAttendanceScreen from "../ui/studentscreens/StudentAttendanceScreen";
import StudentComplaintsScreen from "../ui/studentscreens/StudentComplaintsScreen";
import StudentMessagesScreen from "../ui/studentscreens/StudentMessagesScreen";
import StudentBusDetailsScreen from "../ui/studentscreens/StudentBusDetailsScreen";

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
      <Stack.Screen
        name="StudentAttendance"
        component={StudentAttendanceScreen}
        options={{ 
          headerShown: true,
          title: "Attendance History",
          headerStyle: { backgroundColor: "#fff" },
          headerTitleStyle: { fontFamily: "Poppins_600SemiBold" }
        }}
      />
      <Stack.Screen
        name="StudentComplaints"
        component={StudentComplaintsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="StudentMessages"
        component={StudentMessagesScreen}
        options={{ 
          headerShown: true,
          title: "Messages",
          headerStyle: { backgroundColor: "#fff" },
          headerTitleStyle: { fontFamily: "Poppins_600SemiBold" }
        }}
      />
      <Stack.Screen
        name="StudentBusDetails"
        component={StudentBusDetailsScreen}
        options={{ 
          headerShown: true,
          title: "Bus Details",
          headerStyle: { backgroundColor: "#fff" },
          headerTitleStyle: { fontFamily: "Poppins_600SemiBold" }
        }}
      />
      <Stack.Screen
        name="StudentNotification"
        component={StudentAttendanceScreen}
        options={{ 
          headerShown: true,
          title: "Notifications",
          headerStyle: { backgroundColor: "#fff" },
          headerTitleStyle: { fontFamily: "Poppins_600SemiBold" }
        }}
      />
    </Stack.Navigator>
  );
}
