import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import Colors from "../../theme/appcolors.js";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, UrlTile, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { Linking } from "react-native";
import { useBusStore } from "../../store/useBusStore.js";
import { getStudentBusDataCurrent } from "../../api/authService.js";

export default function StudentHomeScreen({ navigation, route }) {
  const [userLocation, setUserLocation] = useState(null);
  const [routeModalVisible, setRouteModalVisible] = useState(false);
  const { busNumber, driverName, driverPhone } = useBusStore();
  const [busData, setBusData] = useState(null);
  const mapRef = useRef(null);

  const isIn = true;

  const currentStop = busData?.coveragePoints?.find(
    (p) => p.status === "current"
  );

  const upcomingStop = busData?.coveragePoints?.find(
    (p) => p.order === currentStop?.order + 1
  );

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

  useEffect(() => {
    (async () => {
      try {
        const bus = await getStudentBusDataCurrent();
        setBusData(bus); // your state
      } catch (e) {
        console.log("Bus fetch failed:", e);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>TripSync</Text>
          <TouchableOpacity onPress={() => setRouteModalVisible(true)}>
            <Ionicons name="git-branch" size={24} color="#000000ff" />
          </TouchableOpacity>

          <Modal
            transparent
            visible={routeModalVisible}
            animationType="fade"
            onRequestClose={() => setRouteModalVisible(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setRouteModalVisible(false)}
              style={styles.modalOverlay}
            >
              <View style={styles.sheetWrapper}>
                <View style={styles.modalBox}>
                  {/* Header */}
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Route Timeline</Text>
                    <TouchableOpacity
                      onPress={() => setRouteModalVisible(false)}
                    >
                      <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                  </View>

                  {/* Timeline Content */}
                  <View style={{ gap: 14, marginTop: 10 }}>
                    <Text style={styles.timelineItem}>Pickup 8:00 AM</Text>
                    <Text style={styles.timelineItem}>Stop 1 8:10 AM</Text>
                    <Text style={styles.timelineItem}>Stop 2 8:20 AM</Text>
                    <Text style={styles.timelineItem}>
                      College Arrival 8:45 AM
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        {/* Map View */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: 16.4971,
              longitude: 80.4992,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <UrlTile
              urlTemplate="https://a.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png"
              maximumZ={19}
              flipY={false}
            />

            {/* User Marker */}
            {userLocation && (
              <Marker coordinate={userLocation} title="You" pinColor="green" />
            )}

            {/* Bus Route Polyline */}
            {busData?.coveragePoints && (
              <Polyline
                coordinates={busData.coveragePoints.map((p) => ({
                  latitude: p.lat,
                  longitude: p.long,
                }))}
                strokeWidth={4}
                strokeColor="blue"
              />
            )}

            {/* Live Bus Marker */}
            {busData && (
              <Marker
                coordinate={{
                  latitude: busData.currentLocation.lat,
                  longitude: busData.currentLocation.long,
                }}
                title="Your Bus"
                pinColor="blue"
              />
            )}
          </MapView>
        </View>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Bus Info</Text>

            <View style={styles.locationChip}>
              {/* <Text style={styles.locationText}>Current Location</Text> */}
              <TouchableOpacity
                onPress={() => {
                  if (!busData) return;
                  mapRef.current.animateToRegion(
                    {
                      latitude: busData.currentLocation.lat,
                      longitude: busData.currentLocation.long,
                      latitudeDelta: 0.03,
                      longitudeDelta: 0.03,
                    },
                    600
                  );
                }}
              >
                {/* <Text style={styles.locationText}>Current Location</Text> */}
                <Ionicons name="navigate" size={24} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Top Row */}
          <View style={styles.rowBetween}>
            <Text style={styles.busNumber}>{busNumber}</Text>

            <View style={styles.statusChip}>
              <Text style={styles.statusText}>
                Current: {currentStop?.name || "Not Available"}
              </Text>
            </View>
          </View>

          {/* Bottom Row */}
          <View style={styles.bottomRow}>
            <View style={styles.driverBlock}>
              <Text style={styles.label}>Driver</Text>
              <Text style={styles.info}>{driverName}</Text>
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:+91${driverPhone}`)}
              >
                <Text style={styles.mobileText}>+91 {driverPhone}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.etaBlock}>
              <Text style={styles.label}>Upcoming</Text>
              <Text style={styles.info}>
                {upcomingStop?.name || "No more stops"}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.attendanceStatusRow}>
          <View style={styles.attendanceTagLeft}>
            <Text style={styles.attendanceTagLeftText}>Student</Text>
          </View>

          <View
            style={[
              styles.attendanceTagRight,
              { backgroundColor: isIn ? "#D1F8E4" : "#FFE0E0" },
            ]}
          >
            <Text
              style={[
                styles.attendanceTagRightText,
                { color: isIn ? "#0C8A3E" : "#C62828" },
              ]}
            >
              {isIn ? "IN" : "OUT"}
            </Text>
          </View>
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
    marginBottom: 20,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 30,
    fontFamily: "UnicaOne_400Regular",
    color: Colors.color1,
  },
  mapContainer: {
    height: 300,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#ddd",
  },
  map: { flex: 1 },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#eee",
    gap: 10,
    marginBottom: 20,
  },

  cardTitle: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: "#111",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationChip: {
    backgroundColor: "#E3F2FD",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  locationText: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    color: "#0A6ECE",
  },

  busNumber: {
    fontSize: 18,
    fontFamily: "Poppins_500Medium",
    color: "#222",
  },

  statusChip: {
    backgroundColor: "#E8F8EA",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  statusText: {
    color: "#2E7D32",
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  driverBlock: {
    gap: 2,
  },

  etaBlock: {
    alignItems: "flex-end",
    gap: 2,
  },

  label: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#999",
  },

  info: {
    fontSize: 15,
    fontFamily: "Poppins_500Medium",
    color: "#333",
  },

  mobileText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "#1A73E8",
  },
  attendanceStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 15,
  },

  attendanceTagLeft: {
    backgroundColor: "#E3E6ED",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },

  attendanceTagLeftText: {
    fontFamily: "Poppins_500Medium",
    color: "#333",
    fontSize: 14,
  },

  attendanceTagRight: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 10,
  },

  attendanceTagRightText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },

  sheetWrapper: {
    width: "100%",
    transform: [{ translateY: 0 }],
  },

  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 0,
    borderWidth: 1,
    borderColor: "#eee",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: "#222",
  },

  timelineItem: {
    fontSize: 15,
    fontFamily: "Poppins_500Medium",
    color: "#444",
  },
});
