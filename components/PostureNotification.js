import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import { ref, set } from "firebase/database";
import { database } from "../firebase";

// Theme colors (consistent with PostureDetail.js)
const THEME = {
  warning: "#FFA500", // Warning orange
  danger: "#F87A53", // Bad posture red
};

const PostureNotification = ({
  isVisible,
  postureState,
  onDismiss,
  userUID,
}) => {
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isVisible) {
      // Slide in from top
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide out to top
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  // Log dismissal to Firebase deviceLogs
  const handleDismiss = () => {
    if (userUID) {
      const logRef = ref(
        database,
        `users/${userUID}/deviceLogs/notification_${Date.now()}`
      );
      set(logRef, {
        message: `IMU posture notification dismissed (${postureState})`,
        timestamp: Date.now(),
        type: "info",
      }).catch((error) =>
        console.error("Error logging IMU notification dismissal:", error)
      );
    }
    onDismiss();
  };

  // If not visible or invalid posture state, don't render
  if (!isVisible || !["Warning", "Bad"].includes(postureState)) return null;

  // Determine notification content based on posture state
  const isWarning = postureState === "Warning";
  const title = isWarning
    ? "Warning: Forward Tilt Detected!"
    : "Bad Posture Detected!";
  const message = isWarning
    ? "Adjust your posture to reduce forward tilt and prevent strain."
    : "Sit upright immediately to avoid back strain and improve alignment.";
  const backgroundColor = isWarning ? THEME.warning : THEME.danger;
  const icon = isWarning ? "⚠️" : "❗";

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          transform: [
            {
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0],
              }),
            },
          ],
          opacity: animation,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
        <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
          <Text style={styles.dismissText}>×</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 40, // Account for status bar
    zIndex: 999,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  iconContainer: {
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  message: {
    color: "white",
    fontSize: 14,
    marginTop: 2,
  },
  dismissButton: {
    padding: 8,
  },
  dismissText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default PostureNotification;
