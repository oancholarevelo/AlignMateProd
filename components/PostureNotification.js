import React, { useState, useEffect, useCallback, useMemo } from "react";
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

  // FIXED: Memoize notification content to prevent unnecessary re-renders
  const notificationContent = useMemo(() => {
    if (!["Warning", "Bad"].includes(postureState)) return null;

    const isWarning = postureState === "Warning";
    return {
      title: isWarning
        ? "Warning: Forward Tilt Detected!"
        : "Bad Posture Detected!",
      message: isWarning
        ? "Adjust your posture to reduce forward tilt and prevent strain."
        : "Sit upright immediately to avoid back strain and improve alignment.",
      backgroundColor: isWarning ? THEME.warning : THEME.danger,
      icon: isWarning ? "⚠️" : "❗",
    };
  }, [postureState]);

  // FIXED: Optimized animation with useCallback
  const animateIn = useCallback(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [animation]);

  const animateOut = useCallback(() => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 200, // Faster exit animation
      useNativeDriver: true,
    }).start();
  }, [animation]);

  useEffect(() => {
    if (isVisible && notificationContent) {
      animateIn();
    } else {
      animateOut();
    }
  }, [isVisible, notificationContent, animateIn, animateOut]);

  // FIXED: Debounced dismiss handler to prevent multiple rapid calls
  const handleDismiss = useCallback(() => {
    if (userUID && postureState) {
      // Fire and forget logging - don't wait for it
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
    
    // Animate out first, then call onDismiss
    animateOut();
    setTimeout(() => {
      onDismiss();
    }, 200); // Match animation duration
  }, [userUID, postureState, onDismiss, animateOut]);

  // Don't render if no valid content
  if (!isVisible || !notificationContent) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: notificationContent.backgroundColor,
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
          <Text style={styles.icon}>{notificationContent.icon}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{notificationContent.title}</Text>
          <Text style={styles.message}>{notificationContent.message}</Text>
        </View>
        <TouchableOpacity 
          style={styles.dismissButton} 
          onPress={handleDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Larger touch area
        >
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
    borderBottomLeftRadius: 10, // Added
    borderBottomRightRadius: 10, // Added
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16, // Adjusted padding
    paddingVertical: 12,   // Adjusted padding
  },
  iconContainer: {
    marginRight: 15, // Adjusted margin
    padding: 5,      // Added padding
    borderRadius: 20, // Make it circular if desired
    // backgroundColor: "rgba(255, 255, 255, 0.2)", // Optional: subtle background for icon
  },
  icon: {
    fontSize: 24,
    // color: "white", // Ensure icon color contrasts with its background if changed
  },
  textContainer: {
    flex: 1,
    marginRight: 10, // Add some space before the dismiss button
  },
  title: {
    color: "white",
    fontWeight: "bold",
    fontSize: 17, // Slightly larger title
  },
  message: {
    color: "white",
    fontSize: 14,
    marginTop: 4, // Increased spacing
  },
  dismissButton: {
    padding: 8,
    borderRadius: 15, // Make it circular
    // backgroundColor: "rgba(0, 0, 0, 0.1)", // Optional: subtle background for dismiss
    justifyContent: "center", // Center the 'x'
    alignItems: "center",     // Center the 'x'
    width: 30,                // Fixed width
    height: 30,               // Fixed height
  },
  dismissText: {
    color: "white",
    fontSize: 20, // Adjusted size
    fontWeight: "bold",
    lineHeight: 20, // Adjust line height for better centering
  },
});

export default PostureNotification;
