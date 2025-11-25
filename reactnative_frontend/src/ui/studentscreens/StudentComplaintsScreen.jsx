import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../theme/appcolors";
import { useStudentStore } from "../../store/studentStore";
import { getMyComplaints, submitComplaint } from "../../api/studentService";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorView from "../../components/ErrorView";
import ComplaintCard from "../../components/ComplaintCard";
import Toast from "react-native-toast-message";

export default function StudentComplaintsScreen() {
  const { complaints, setComplaints, addComplaint } = useStudentStore();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [category, setCategory] = useState("bus_issue");
  const [description, setDescription] = useState("");

  const loadData = async () => {
    try {
      setError(null);
      const data = await getMyComplaints();
      setComplaints(data);
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

  const handleSubmit = async () => {
    if (!description.trim()) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please provide a description",
      });
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitComplaint({
        category,
        description: description.trim(),
      });
      
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Complaint submitted successfully",
      });
      
      setModalVisible(false);
      setDescription("");
      setCategory("bus_issue");
      loadData();
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading complaints..." />;
  }

  if (error && !complaints) {
    return <ErrorView message={error} onRetry={loadData} />;
  }

  const categories = [
    { value: "bus_issue", label: "Bus Issue" },
    { value: "rash_driving", label: "Rash Driving" },
    { value: "lost_found", label: "Lost & Found" },
    { value: "other", label: "Other" },
  ];

  return (
    <View style={styles.container}>
      {/* Header with Add Button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Complaints</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Complaints List */}
      {complaints.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No complaints submitted yet</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.emptyButtonText}>Submit Complaint</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <ComplaintCard complaint={item} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Submit Complaint Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Complaint</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Category Selection */}
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryButton,
                    category === cat.value && styles.categoryButtonActive,
                  ]}
                  onPress={() => setCategory(cat.value)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      category === cat.value && styles.categoryButtonTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Description */}
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe your complaint in detail..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Text style={styles.submitButtonText}>
                {submitting ? "Submitting..." : "Submit Complaint"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.color2,
  },
  addButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: Colors.color2,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#999",
    marginTop: 15,
    marginBottom: 25,
    textAlign: "center",
  },
  emptyButton: {
    backgroundColor: Colors.color2,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.color2,
  },
  label: {
    fontSize: 15,
    fontFamily: "Poppins_500Medium",
    color: "#333",
    marginBottom: 10,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  categoryButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  categoryButtonActive: {
    backgroundColor: Colors.color2,
  },
  categoryButtonText: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    color: "#666",
  },
  categoryButtonTextActive: {
    color: "#fff",
  },
  textArea: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    marginBottom: 20,
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  submitButton: {
    backgroundColor: Colors.color2,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
});
