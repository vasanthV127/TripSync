import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import Colors from "../../theme/appcolors.js";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, UrlTile } from "react-native-maps";
import * as Location from "expo-location";

const { width, height } = Dimensions.get("window");

export default function StudentHomeScreen({ navigation }) {
  const [userLocation, setUserLocation] = useState(null);

  // Static bus locations
  const buses = [
    { id: 1, latitude: 12.9716, longitude: 77.5946, name: "Bus 1" },
    { id: 2, latitude: 12.9352, longitude: 77.6245, name: "Bus 2" },
  ];

  // Get user location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>TripSync</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <Ionicons name="person" size={24} color="#000000ff" />
          </TouchableOpacity>
        </View>

        {/* Map View */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 12.9716,
              longitude: 77.5946,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {/* OpenStreetMap Tiles */}
            <UrlTile
              urlTemplate="https://a.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png"
              maximumZ={19}
              flipY={false}
            />

            {/* User Location */}
            {userLocation && (
              <Marker coordinate={userLocation} title="You" pinColor="green" />
            )}

            {/* Bus Locations */}
            {buses.map((bus) => (
              <Marker
                key={bus.id}
                coordinate={{
                  latitude: bus.latitude,
                  longitude: bus.longitude,
                }}
                title={bus.name}
                pinColor="blue"
              />
            ))}
          </MapView>
        </View>
      </View>
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
    marginBottom: 25,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 35,
    fontFamily: "UnicaOne_400Regular",
    color: Colors.color1,
  },
  mapContainer: {
    flex: 1, // Map fills the remaining space
    borderRadius: 15,
    overflow: "hidden", // Ensures rounded corners work
  },
  map: {
    width: width - 40, // considering container padding
    height: height * 0.5,
  },
});
