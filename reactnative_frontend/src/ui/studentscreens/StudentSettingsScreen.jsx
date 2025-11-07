import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Colors from "../../theme/appcolors.js";
import { MaterialIcons } from "@expo/vector-icons";

export default function StudentSettingsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text>SettingsScreen</Text>
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
});
