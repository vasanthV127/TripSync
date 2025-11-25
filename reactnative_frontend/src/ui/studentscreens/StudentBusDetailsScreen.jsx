import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Polyline, UrlTile } from "react-native-maps";
import Colors from "../../theme/appcolors";
import { useStudentStore } from "../../store/studentStore";
import { getStudentBus, getStudentRoute } from "../../api/studentService";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorView from "../../components/ErrorView";
import Toast from "react-native-toast-message";

export default function StudentBusDetailsScreen() {
  const { bus, route, setBus, setRoute } = useStudentStore();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  const loadData = async () => {
    try {
      setError(null);
      const [busData, routeData] = await Promise.all([
        getStudentBus(),
        getStudentRoute().catch(() => null),
      ]);
      
      setBus(busData);
      setRoute(routeData);
    } catch (err) {
      setError(err.message);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.message,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const centerOnBus = () => {
    if (bus?.currentLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: bus.currentLocation.lat,
          longitude: bus.currentLocation.long,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        },
        600
      );
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading bus details..." />;
  }

  if (error && !bus) {
    return <ErrorView message={error} onRetry={loadData} />;
  }

  const currentStop = bus?.coveragePoints?.find((p) => p.status === "current");
  const upcomingStop = bus?.coveragePoints?.find(
    (p) => p.order === (currentStop?.order || 0) + 1
  );

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: bus?.currentLocation?.lat || 16.4971,
              longitude: bus?.currentLocation?.long || 80.4992,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <UrlTile
              urlTemplate="https://a.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png"
              maximumZ={19}
              flipY={false}
            />

            {/* Bus Location */}
            {bus?.currentLocation && (
              <Marker
                coordinate={{
                  latitude: bus.currentLocation.lat,
                  longitude: bus.currentLocation.long,
                }}
                title="Your Bus"
                pinColor="blue"
              />
            )}

            {/* Route Polyline */}
            {bus?.coveragePoints && (
              <Polyline
                coordinates={bus.coveragePoints.map((p) => ({
                  latitude: p.lat,
                  longitude: p.long,
                }))}
                strokeWidth={4}
                strokeColor={Colors.color2}
              />
            )}
          </MapView>
          
          {/* Center on Bus Button */}
          <TouchableOpacity style={styles.centerButton} onPress={centerOnBus}>
            <Ionicons name="navigate" size={24} color={Colors.color2} />
          </TouchableOpacity>
        </View>

        {/* Bus Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.busNumber}>Bus {bus?.number || "N/A"}</Text>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: "#4CAF50" }]} />
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Route</Text>
              <Text style={styles.infoValue}>{bus?.route || "N/A"}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Current Stop</Text>
              <Text style={styles.infoValue}>
                {currentStop?.name || "Not Available"}
              </Text>
            </View>
          </View>

          {upcomingStop && (
            <View style={styles.upcomingContainer}>
              <Ionicons name="location" size={20} color={Colors.color2} />
              <View style={{ flex: 1 }}>
                <Text style={styles.upcomingLabel}>Next Stop</Text>
                <Text style={styles.upcomingValue}>{upcomingStop.name}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Route Stops */}
        {route?.stops && route.stops.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Route Stops</Text>
            <View style={styles.stopsCard}>
              {route.stops.map((stop, index) => {
                const stopName = typeof stop === "string" ? stop : stop.name || "Unknown";
                return (
                  <View key={index} style={styles.stopItem}>
                    <View style={styles.stopNumber}>
                      <Text style={styles.stopNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stopName}>{stopName}</Text>
                    {currentStop?.name === stopName && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>Current</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mapContainer: {
    height: 300,
    position: "relative",
    marginBottom: 16,
  },
  map: {
    flex: 1,
  },
  centerButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  busNumber: {
    fontSize: 22,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.color2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: "#4CAF50",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#999",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    color: "#333",
  },
  upcomingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  upcomingLabel: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#666",
  },
  upcomingValue: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.color2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.color2,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  stopsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  stopItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  stopNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.color2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stopNumberText: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: "#fff",
  },
  stopName: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#333",
    flex: 1,
  },
  currentBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  currentBadgeText: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    color: "#fff",
  },
});
