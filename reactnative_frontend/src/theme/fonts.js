import { useFonts } from "expo-font";
import {
  Poppins_100Thin,
  Poppins_200ExtraLight,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black,
} from "@expo-google-fonts/poppins";
import { UnicaOne_400Regular } from "@expo-google-fonts/unica-one";
import {
  Merriweather_300Light_Italic,
  Merriweather_400Regular,
} from "@expo-google-fonts/merriweather";

export default function useAppFonts() {
  const [loaded] = useFonts({
    Poppins_100Thin,
    Poppins_200ExtraLight,
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    UnicaOne_400Regular,
    Merriweather_300Light_Italic,
    Merriweather_400Regular,
  });
  return loaded;
}
