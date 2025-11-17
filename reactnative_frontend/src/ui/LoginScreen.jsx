import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Colors from "../theme/appcolors.js";
import { loginUser } from "../api/authService.js";
import { CommonActions } from "@react-navigation/native";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";

export default function LoginScreen({ navigation, route }) {
  // const { role } = route.params;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const data = await loginUser(email, password);
      Toast.show({
        type: "success",
        text1: `Login Successful`,
        // text2: `Role: ${data.role}`,
      });
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Main" }],
        })
      );
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        // text2: error.message,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Hey!{"\n"}Login Now</Text>
      <Text style={styles.subtitle}>Enter your login details</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    padding: 20,
  },
  heading: {
    fontSize: 45,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.color2,
    textAlign: "left",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "left",
    marginBottom: 30,
    fontFamily: "Poppins_400Regular",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    fontFamily: "Poppins_400Regular",
    backgroundColor: "#fff",
  },
  loginButton: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.color2,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 50,
    alignSelf: "center",
  },
  loginButtonText: {
    color: Colors.color1,
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
  },
});
