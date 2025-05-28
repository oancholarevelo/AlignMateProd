import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { ref, onValue, off, set } from "firebase/database";
import { database } from "../firebase";

const LogViewer = ({ userUID, visible = true, maxLogs = 20 }) => {
  const [logs, setLogs] = useState([]);
  const scrollViewRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const windowWidth = Dimensions.get("window").width;

  useEffect(() => {
    if (!userUID || !visible) return;

    // Reference to the IMU device logs in Firebase
    const logsRef = ref(database, `users/${userUID}/deviceLogs`);

    // Subscribe to log updates from IMU sensor
    const unsubscribe = onValue(
      logsRef,
      (snapshot) => {
        const logsData = snapshot.val();
        if (logsData) {
          // Convert logs object to array and sort by timestamp
          const logsArray = Object.entries(logsData).map(([key, value]) => ({
            id: key,
            ...value,
          }));

          // Sort by timestamp (newest first)
          logsArray.sort((a, b) => b.timestamp - a.timestamp);
          const trimmedLogs = logsArray.slice(0, maxLogs);

          // Sort again to display oldest first for the view
          trimmedLogs.reverse();

          setLogs(trimmedLogs);

          // Scroll to bottom if auto-scroll is enabled
          if (autoScroll && scrollViewRef.current) {
            setTimeout(() => {
              scrollViewRef.current.scrollToEnd({ animated: true });
            }, 100);
          }
        }
      },
      (error) => {
        console.error("Error fetching IMU device logs:", error);
      }
    );

    // Cleanup subscription
    return () => off(logsRef);
  }, [userUID, visible, maxLogs, autoScroll]);

  // Get appropriate style based on log type
  const getLogStyle = (type) => {
    switch (type) {
      case "error":
        return styles.errorLog;
      case "success":
        return styles.successLog;
      case "warning":
        return styles.warningLog;
      case "info":
      default:
        return styles.infoLog; // Fallback for unrecognized types
    }
  };

  // Clear logs from Firebase
  const clearLogs = () => {
    if (!userUID) return;
    const logsRef = ref(database, `users/${userUID}/deviceLogs`);

    // Clear logs but keep a single "IMU logs cleared" entry
    const now = new Date().getTime();
    const clearMessage = {
      message: "IMU sensor logs cleared",
      timestamp: now,
      type: "info",
    };

    // Reset logs with just the clear message
    const updates = {};
    updates[`clear_${now}`] = clearMessage;

    // Update Firebase
    set(logsRef, updates)
      .then(() => console.log("IMU sensor logs cleared"))
      .catch((error) =>
        console.error("Error clearing IMU sensor logs:", error)
      );
  };

  // Get timestamp display based on device width
  const getTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    // For narrow screens, only show time (no date)
    if (windowWidth < 400) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleTimeString();
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>IMU Device Logs</Text>
        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              autoScroll ? styles.activeButton : null,
            ]}
            onPress={() => setAutoScroll(!autoScroll)}
          >
            <Text style={styles.buttonText}>
              {windowWidth < 350 ? "Auto" : "Auto-scroll"}:{" "}
              {autoScroll ? "ON" : "OFF"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearButton} onPress={clearLogs}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.logContainer}
        onScrollBeginDrag={() => setAutoScroll(false)}
      >
        {logs.length === 0 ? (
          <Text style={styles.emptyText}>No IMU logs available</Text>
        ) : (
          logs.map((log) => (
            <View key={log.id} style={[styles.logEntry, getLogStyle(log.type)]}>
              <Text style={styles.timestamp}>
                {getTimestamp(log.timestamp)}
              </Text>
              <Text
                style={styles.logMessage}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {log.message}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    maxHeight: 250,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  controls: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  controlButton: {
    backgroundColor: "#333333",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  activeButton: {
    backgroundColor: "#2C5282",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  clearButton: {
    backgroundColor: "#7B341E",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  clearButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  logContainer: {
    flex: 1,
  },
  logEntry: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  timestamp: {
    color: "#CCCCCC",
    fontSize: 11,
    marginRight: 8,
    minWidth: 45,
    maxWidth: 75,
  },
  logMessage: {
    color: "#FFFFFF",
    fontSize: 12,
    flex: 1,
  },
  infoLog: {
    backgroundColor: "#2A4365",
  },
  errorLog: {
    backgroundColor: "#742A2A",
  },
  successLog: {
    backgroundColor: "#22543D",
  },
  warningLog: {
    backgroundColor: "#744210",
  },
  emptyText: {
    color: "#999999",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
  },
});

export default LogViewer;
