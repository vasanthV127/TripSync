import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../theme/appcolors";
import { useStudentStore } from "../../store/studentStore";
import { getStudentAttendance } from "../../api/studentService";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorView from "../../components/ErrorView";
import AttendanceCard from "../../components/AttendanceCard";
import Toast from "react-native-toast-message";

export default function StudentAttendanceScreen() {
  const { attendance, setAttendance } = useStudentStore();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setError(null);
      const data = await getStudentAttendance();
      setAttendance(data);
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

  if (loading) {
    return <LoadingSpinner message="Loading attendance..." />;
  }

  if (error && !attendance) {
    return <ErrorView message={error} onRetry={loadData} />;
  }

  const totalDays = attendance?.total_days || 0;
  const presentDays = attendance?.present_days || 0;
  const attendancePercentage = attendance?.attendance_percentage || 0;
  const history = attendance?.history || [];

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Ionicons name="calendar" size={32} color={Colors.color2} />
          <Text style={styles.statValue}>{totalDays}</Text>
          <Text style={styles.statLabel}>Total Days</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.statItem}>
          <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
          <Text style={styles.statValue}>{presentDays}</Text>
          <Text style={styles.statLabel}>Present</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.statItem}>
          <Ionicons name="stats-chart" size={32} color={Colors.color2} />
          <Text style={styles.statValue}>{attendancePercentage.toFixed(1)}%</Text>
          <Text style={styles.statLabel}>Percentage</Text>
        </View>
      </View>

      {/* Attendance History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Attendance History</Text>
        {history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No attendance records yet</Text>
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => <AttendanceCard attendance={item} />}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  statsCard: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.color2,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#666",
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: "#e0e0e0",
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.color2,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#999",
    marginTop: 15,
  },
});
