import Toast, { BaseToast } from "react-native-toast-message";

// Customize default toast
export const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "#4CAF50", paddingVertical: 10 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 14,
        fontFamily: "Poppins_400Regular",
        color: "#000000",
      }}
      text2Style={{
        fontSize: 14,
        fontFamily: "Poppins_300Light",
        color: "#000000",
      }}
    />
  ),
  error: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "#f44336", paddingVertical: 10 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 14,
        fontFamily: "Poppins_400Regular",
        color: "#000000",
      }}
      text2Style={{
        fontSize: 14,
        fontFamily: "Poppins_300Light",
        color: "#000000",
      }}
    />
  ),
};
