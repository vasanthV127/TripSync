import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../theme/appcolors";
import { useStudentStore } from "../../store/studentStore";
import {
  getBusChatMessages,
  sendBusMessage,
  getDriverMessages,
} from "../../api/studentService";
import { useUserStore } from "../../store/userStore";
import LoadingSpinner from "../../components/LoadingSpinner";
import MessageBubble from "../../components/MessageBubble";
import Toast from "react-native-toast-message";

export default function StudentMessagesScreen() {
  const { busChatMessages, setBusChatMessages, addBusChatMessage } =
    useStudentStore();
  const { user } = useUserStore();
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState("bus_chat"); // bus_chat or driver
  const [driverMessages, setDriverMessages] = useState([]);

  const loadBusChatData = async () => {
    try {
      const data = await getBusChatMessages(50, 0);
      setBusChatMessages(data.messages || []);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDriverMessages = async () => {
    try {
      const data = await getDriverMessages(50, 0);
      setDriverMessages(data.messages || []);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.message,
      });
    }
  };

  useEffect(() => {
    if (activeTab === "bus_chat") {
      loadBusChatData();
    } else {
      loadDriverMessages();
    }
  }, [activeTab]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const messageText = message.trim();
    setMessage("");
    setSending(true);

    try {
      await sendBusMessage(messageText);
      
      // Add message optimistically to UI
      const newMessage = {
        content: messageText,
        sender: {
          id: user?._id,
          name: user?.name,
          rollNo: user?.roll_no,
        },
        timestamp: new Date().toISOString(),
      };
      addBusChatMessage(newMessage);
      
      Toast.show({
        type: "success",
        text1: "Message sent",
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Failed to send message",
        text2: err.message,
      });
      setMessage(messageText); // Restore message
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading messages..." />;
  }

  const messages = activeTab === "bus_chat" ? busChatMessages : driverMessages;
  const canSendMessages = activeTab === "bus_chat";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "bus_chat" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("bus_chat")}
        >
          <Ionicons
            name="chatbubbles"
            size={20}
            color={activeTab === "bus_chat" ? "#fff" : Colors.color2}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "bus_chat" && styles.activeTabText,
            ]}
          >
            Bus Chat
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "driver" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("driver")}
        >
          <Ionicons
            name="person"
            size={20}
            color={activeTab === "driver" ? "#fff" : Colors.color2}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "driver" && styles.activeTabText,
            ]}
          >
            Driver
          </Text>
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      {messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>
            {activeTab === "bus_chat"
              ? "No messages yet. Start the conversation!"
              : "No messages from driver yet"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isOwnMessage={
                item.sender?.id === user?._id ||
                item.sender?.rollNo === user?.roll_no
              }
            />
          )}
          inverted
          contentContainerStyle={styles.messagesList}
        />
      )}

      {/* Input Box - Only for bus chat */}
      {canSendMessages && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!message.trim() || sending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!message.trim() || sending}
          >
            <Ionicons
              name={sending ? "hourglass" : "send"}
              size={22}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    gap: 8,
  },
  activeTab: {
    backgroundColor: Colors.color2,
  },
  tabText: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: Colors.color2,
  },
  activeTabText: {
    color: "#fff",
  },
  messagesList: {
    paddingVertical: 10,
    flexGrow: 1,
    justifyContent: "flex-end",
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
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.color2,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
