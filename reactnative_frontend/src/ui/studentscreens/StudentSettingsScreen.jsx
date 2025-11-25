import React, { useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  TextInput, 
  ActivityIndicator 
} from "react-native";
import Colors from "../../theme/appcolors.js";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { CommonActions } from "@react-navigation/native";
import { logoutUser } from "../../api/authService.js";
import { changePassword } from "../../api/studentService.js";
import Toast from "react-native-toast-message";

export default function StudentSettingsScreen({ navigation }) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      Toast.show({
        type: "success",
        text1: "Logged out Successfully",
      });
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" }],
        })
      );
    } catch (error) {
      console.log("Logout failed:", error);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "All fields are required",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "New passwords do not match",
      });
      return;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: "error",
        text1: "Password must be at least 6 characters",
      });
      return;
    }

    setLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      Toast.show({
        type: "success",
        text1: "Password changed successfully",
      });
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to change password",
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <Ionicons name="person" size={24} color="#000000ff" />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "column", gap: 15 }}>
          <TouchableOpacity 
            style={styles.item} 
            onPress={() => setShowPasswordModal(true)}
          >
            <Ionicons name="key-outline" size={24} color="#000" />
            <Text style={styles.itemText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#000" />
            <Text style={styles.itemText}>Logout</Text>
            <Ionicons name="chevron-forward" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Old Password"
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleChangePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Change Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    gap: 15,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: "#222",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    backgroundColor: "#f9f9f9",
  },
  submitButton: {
    backgroundColor: Colors.color1,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
});
