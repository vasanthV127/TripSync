import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import Colors from "../../theme/appcolors.js";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import {
  getStudentProfile,
  submitComplaint,
  getStudentDriver,
  getStudentRoute,
} from "../../api/studentService.js";
import Toast from "react-native-toast-message";
import { useBusStore } from "../../store/useBusStore.js";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function StudentProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showBusModal, setShowBusModal] = useState(false);
  const [driver, setDriver] = useState(null);
  const [loadingDriver, setLoadingDriver] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [route, setRoute] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintData, setComplaintData] = useState({
    category: "",
    description: "",
    busNumber: "",
  });
  const [loadingComplaint, setLoadingComplaint] = useState(false);
  const setBusData = useBusStore((s) => s.setBusData);

  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.log("No token found, skipping profile fetch");
        return;
      }
      const data = await getStudentProfile();
      setProfile(data);

      setBusData({
        busNumber: data.assignedBus || data.bus?.busNumber || "N/A",
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Failed to load profile",
        // text2: err.message,
      });
    }
  };

  if (!profile) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.color2} />
        <Text
          style={{
            marginTop: 10,
            fontSize: 16,
            color: "#555",
            fontFamily: "Poppins_500Medium",
          }}
        >
          Loading profile...
        </Text>
      </SafeAreaView>
    );
  }

  const openBusModal = async () => {
    setShowBusModal(true);
    setLoadingDriver(true);
    try {
      const data = await getStudentDriver();
      setDriver(data);

      setBusData({
        driverName: data.name,
        driverPhone: data.phone,
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Failed to load driver info",
      });
    } finally {
      setLoadingDriver(false);
    }
  };

  const openRouteModal = async () => {
    setShowRouteModal(true);
    setLoadingRoute(true);
    try {
      const data = await getStudentRoute();
      setRoute(data);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Failed to load route info",
      });
    } finally {
      setLoadingRoute(false);
    }
  };

  const submitComplaint = async () => {
    const { category, description, busNumber } = complaintData;
    if (!category || !description || !busNumber) {
      Toast.show({ type: "error", text1: "All fields are required" });
      return;
    }

    setLoadingComplaint(true);
    try {
      const response = await submitComplaint(complaintData);
      Toast.show({
        type: "success",
        text1: "Complaint submitted successfully",
      });
      setShowComplaintModal(false);
      setComplaintData({ category: "", description: "", busNumber: "" });
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to submit complaint" });
    } finally {
      setLoadingComplaint(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity onPress={() => setShowCalendar(!showCalendar)}>
            <Ionicons name="calendar-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        {showCalendar && (
          <Modal visible={showCalendar} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Calendar
                  onDayPress={(day) => {
                    console.log("selected day", day);
                  }}
                  markingType={"custom"}
                  markedDates={{
                    "2025-11-01": {
                      customStyles: {
                        container: {
                          backgroundColor: "green",
                          borderRadius: 8,
                        },
                        text: {
                          color: "#fff",
                          fontWeight: "600",
                        },
                      },
                    },
                    "2025-11-02": {
                      customStyles: {
                        container: {
                          backgroundColor: "red",
                          borderRadius: 8,
                        },
                        text: {
                          color: "#fff",
                          fontWeight: "600",
                        },
                      },
                    },
                    "2025-11-03": {
                      customStyles: {
                        container: {
                          backgroundColor: "green",
                          borderRadius: 8,
                        },
                        text: {
                          color: "#fff",
                          fontWeight: "600",
                        },
                      },

                      marked: true,
                      dotColor: "white",
                    },
                  }}
                />

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setShowCalendar(false)}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 16,
                      fontFamily: "Poppins_400Regular",
                    }}
                  >
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            columnGap: 15,
            marginBottom: 25,
            padding: 15,
            backgroundColor: "#fff",
            borderRadius: 15,
            borderWidth: 1,
            borderColor: "#ccc",
          }}
        >
          <Image
            source={require("../../../assets/FINAL MW.png")}
            style={{
              width: 90,
              height: 90,
              borderRadius: 15,
              borderWidth: 1,
              borderColor: "#000000",
            }}
          />
          <View>
            <Text style={{ fontFamily: "Poppins_500Medium", fontSize: 20 }}>
              {profile.name}
            </Text>
            <Text style={{ fontFamily: "Poppins_300Light", fontSize: 16 }}>
              {profile.roll_no}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 15 }}>
          {/* <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate("Address")}
          >
            <Ionicons name="location-outline" size={24} color="#000" />
            <Text style={styles.itemText}>Address</Text>
            <Ionicons name="chevron-forward" size={20} color="#000" />
          </TouchableOpacity> */}
          {/* Remaining Details Card */}
          <View
            style={{
              padding: 15,
              backgroundColor: "#fff",
              borderRadius: 15,
              borderWidth: 1,
              borderColor: "#ccc",
              rowGap: 5,
            }}
          >
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{profile.email}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Role</Text>
              <Text style={styles.detailValue}>{capitalize(profile.role)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Boarding</Text>
              <Text style={styles.detailValue}>{profile.boarding}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Assigned Bus</Text>
              <Text style={styles.detailValue}>{profile.assignedBus}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Route</Text>
              <Text style={styles.detailValue}>{profile.route}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.item} onPress={openRouteModal}>
            <Ionicons name="map-outline" size={24} color="#000" />
            <Text style={styles.itemText}>Route</Text>
            <Ionicons name="chevron-forward" size={20} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={openBusModal}>
            <Ionicons name="bus-outline" size={24} color="#000" />
            <Text style={styles.itemText}>Bus Info</Text>
            <Ionicons name="chevron-forward" size={20} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={() => setShowComplaintModal(true)}
          >
            <Ionicons name="chatbox-ellipses-outline" size={24} color="#000" />
            <Text style={styles.itemText}>Complaints</Text>
            <Ionicons name="chevron-forward" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      {/* Driver Modal */}
      <Modal visible={showBusModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {driver ? (
              <View style={{ rowGap: 10 }}>
                <Text style={{ fontFamily: "Poppins_500Medium", fontSize: 18 }}>
                  Driver Info
                </Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name</Text>
                  <Text style={styles.detailValue}>{driver.name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{driver.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text style={styles.detailValue}>{driver.phone}</Text>
                </View>
              </View>
            ) : (
              <ActivityIndicator size="large" color={Colors.color2} />
            )}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowBusModal(false)}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontFamily: "Poppins_400Regular",
                }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Route Info Modal */}
      <Modal visible={showRouteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {route ? (
              <View style={{ rowGap: 7 }}>
                <Text style={{ fontFamily: "Poppins_500Medium", fontSize: 18 }}>
                  Route Info
                </Text>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Route Name</Text>
                  <Text style={styles.detailValue}>{route.name}</Text>
                </View>

                <Text
                  style={{
                    fontFamily: "Poppins_500Medium",
                    fontSize: 16,
                    marginTop: 10,
                  }}
                >
                  Stops
                </Text>
                {route.stops.map((stop, index) => (
                  <View key={index} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{stop.name}</Text>
                    <Text style={styles.detailValue}>
                      Lat: {stop.lat}, Long: {stop.long}
                    </Text>
                  </View>
                ))}

                <Text
                  style={{
                    fontFamily: "Poppins_500Medium",
                    fontSize: 16,
                    marginTop: 10,
                  }}
                >
                  Coverage Areas
                </Text>
                {route.coverageAreas.map((area, index) => (
                  <Text
                    key={index}
                    style={{ fontFamily: "Poppins_400Regular", fontSize: 15 }}
                  >
                    - {area}
                  </Text>
                ))}
              </View>
            ) : (
              <ActivityIndicator size="large" color={Colors.color2} />
            )}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowRouteModal(false)}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontFamily: "Poppins_400Regular",
                }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Compliant Submission */}
      <Modal visible={showComplaintModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text
              style={{
                color: "#000000",
                fontSize: 14,
                fontFamily: "Poppins_400Regular",
              }}
            >
              Submit Complaint
            </Text>

            <Text
              style={{
                color: "#000000",
                fontSize: 14,
                fontFamily: "Poppins_400Regular",
              }}
            >
              Category
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Lost / Other"
              value={complaintData.category}
              onChangeText={(text) =>
                setComplaintData({ ...complaintData, category: text })
              }
            />

            <Text
              style={{
                color: "#000000",
                fontSize: 14,
                fontFamily: "Poppins_400Regular",
              }}
            >
              Description
            </Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Describe the issue"
              value={complaintData.description}
              multiline
              onChangeText={(text) =>
                setComplaintData({ ...complaintData, description: text })
              }
            />

            <Text
              style={{
                color: "#000000",
                fontSize: 14,
                fontFamily: "Poppins_400Regular",
              }}
            >
              Bus Number
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Bus Number"
              value={complaintData.busNumber}
              onChangeText={(text) =>
                setComplaintData({ ...complaintData, busNumber: text })
              }
            />

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: Colors.color2 }]}
              onPress={submitComplaint}
              disabled={loadingComplaint}
            >
              {loadingComplaint ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 16,
                    fontFamily: "Poppins_400Regular",
                  }}
                >
                  Submit
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.closeBtn,
                { marginTop: 10, backgroundColor: Colors.color1 },
              ]}
              onPress={() => setShowComplaintModal(false)}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontFamily: "Poppins_400Regular",
                }}
              >
                Cancel
              </Text>
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
  },

  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    elevation: 10,
  },

  closeBtn: {
    marginTop: 15,
    backgroundColor: Colors.color1,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 15,
    color: "#555",
  },
  detailValue: {
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
    color: "#111",
    flexShrink: 1,
    textAlign: "right",
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 10,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    marginBottom: 15,
  },
});
