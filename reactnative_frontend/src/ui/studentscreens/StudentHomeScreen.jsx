import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Colors from "../../theme/appcolors.js";
import { MaterialIcons } from "@expo/vector-icons";

export default function StudentHomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text>HomeScreen</Text>
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
