import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Animated,
  Modal,
} from "react-native";
import { BarChart, StackedBarChart, LineChart } from "react-native-chart-kit";
import { ref, onValue, get, remove, set, off } from "firebase/database";
import { database, auth } from "../firebase";
import Calibration from "./Calibration";
import { useNavigate } from "react-router-dom";
import Logout from "./Logout";
import PostureNotification from "./PostureNotification";
import Achievements from "./Achievements";
import PostureDetail from "./PostureDetail";
import HistoryDetail from "./HistoryDetail";
import LogViewer from "./LogViewer";
import ResearchForm from "./ResearchForm";
import ContactUs from "./ContactUs";
import { styles, THEME } from "../styles/PostureGraphStyles";

// Constants based on IMU sensor and ML model
const PITCH_MIN = -90; // Minimum pitch angle (degrees)
const PITCH_MAX = 90; // Maximum pitch angle (degrees)
const PITCH_GOOD_THRESHOLD = 8; // Good posture threshold (degrees)
const PITCH_WARNING_THRESHOLD = 15; // Warning posture threshold (degrees)
const PITCH_BAD_THRESHOLD = 25; // Bad posture threshold (degrees)
const FLEX_VALUE_SCALE = 4095 / 90; // Scale factor from ESP32 (4095 / 90°)
const NOTIFICATION_DURATION = 5000;

// Get screen dimensions for responsive design
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_WIDTH = Math.min(SCREEN_WIDTH - 64, 326); // Responsive chart width with max

// Function to convert scaled flexValue to pitch angle
const mapToPitchAngle = (flexValue) => {
  // Reverse the ESP32 scaling: flexValue = pitch * (4095 / 90)
  let pitch = flexValue / FLEX_VALUE_SCALE;
  return Math.max(PITCH_MIN, Math.min(pitch, PITCH_MAX));
};

// SVG icons as constants to reduce re-renders
const ICONS = {
  defaultAvatar:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3Cpath d='M5 21v-2a7 7 0 0 1 14 0v2'/%3E%3C/svg%3E",
  home: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/%3E%3Cpolyline points='9 22 9 12 15 12 15 22'/%3E%3C/svg%3E",
  achievement:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='8' r='7'/%3E%3Cpolyline points='8.21 13.89 7 23 12 20 17 23 15.79 13.88'/%3E%3C/svg%3E",
  settings:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='3'/%3E%3Cpath d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z'/%3E%3C/svg%3E",
  logs: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/%3E%3Cpolyline points='14 2 14 8 20 8'/%3E%3Cline x1='16' y1='13' x2='8' y2='13'/%3E%3Cline x1='16' y1='17' x2='8' y2='17'/%3E%3Cpolyline points='10 9 9 9 8 9'/%3E%3C/svg%3E",
  back: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='19' y1='12' x2='5' y2='12'/%3E%3Cpolyline points='12 19 5 12 12 5'/%3E%3C/svg%3E",
  alert:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23856404' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'/%3E%3Cline x1='12' y1='9' x2='12' y2='13'/%3E%3Cline x1='12' y1='17' x2='12.01' y2='17'/%3E%3C/svg%3E",
  close:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='6' x2='6' y2='18'/%3E%3Cline x1='6' y1='6' x2='18' y2='18'/%3E%3C/svg%3E",
  calibration:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%235CA377' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='3'/%3E%3Cpath d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z'/%3E%3C/svg%3E",
  defaultSetup:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234299E1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E",
  feedback:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%235CA377' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'/%3E%3C/svg%3E",
  brainIcon:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234A5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9.5 2A2.5 2.5 0 0 0 7 4.5V7H4.5A2.5 2.5 0 0 0 2 9.5v5A2.5 2.5 0 0 0 4.5 17H7v2.5A2.5 2.5 0 0 0 9.5 22h5a2.5 2.5 0 0 0 2.5-2.5V17h2.5a2.5 2.5 0 0 0 2.5-2.5v-5A2.5 2.5 0 0 0 19.5 7H17V4.5A2.5 2.5 0 0 0 14.5 2h-5zM12 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4z'/%3E%3C/svg%3E",
  thinkingLayersIcon:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234A5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='3' y1='12' x2='21' y2='12'/%3E%3Cline x1='3' y1='6' x2='21' y2='6'/%3E%3Cline x1='3' y1='18' x2='21' y2='18'/%3E%3C/svg%3E",
  decisionPointsIcon:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234A5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='3'/%3E%3Cpath d='M12 15v6M12 3v6M17.6 14.4l4.2-2.4M6.4 9.6l-4.2 2.4M17.6 9.6l4.2 2.4M6.4 14.4l-4.2-2.4'/%3E%3C/svg%3E",
  finalAnswersIcon:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234A5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 11.08V12a10 10 0 1 1-5.93-9.14'/%3E%3Cpolyline points='22 4 12 14.01 9 11.01'/%3E%3C/svg%3E",
  trainedDateIcon:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234A5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'/%3E%3Cline x1='16' y1='2' x2='16' y2='6'/%3E%3Cline x1='8' y1='2' x2='8' y2='6'/%3E%3Cline x1='3' y1='10' x2='21' y2='10'/%3E%3C/svg%3E",
  decisionTreeIcon:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234A5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2v6M12 12v10M5 5l-3 3 3 3M19 5l3 3-3 3M3 11h18M3 17h18'/%3E%3C/svg%3E",
  funFactIcon:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234A5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 19c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5zM15 19c2.8 0 5-2.2 5-5s-2.2-5-5-5-5 2.2-5 5 2.2 5 5 5zM12 5V2M4.22 7.22l-2-2M19.78 7.22l2-2'/%3E%3Cpath d='M12 12a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 001-1v-2z'/%3E%3C/svg%3E", // Simplified lightbulb
  performanceIcon:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234A5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 14a4 4 0 100-8 4 4 0 000 8z'/%3E%3Cpath d='M12 6v2M12 16v2M16 12h2M6 12h2'/%3E%3C/svg%3E", // Gauge-like
  infoIcon:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23A0AEC0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='12' y1='16' x2='12' y2='12'/%3E%3Cline x1='12' y1='8' x2='12.01' y2='8'/%3E%3C/svg%3E",
};

// Card component for consistent styling
const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

// Button component for consistent styling
const Button = ({
  title,
  onPress,
  type = "primary",
  icon,
  style,
  disabled,
}) => {
  const buttonStyles = {
    primary: styles.primaryButton,
    secondary: styles.secondaryButton,
    danger: styles.dangerButton,
  };

  const textStyles = {
    primary: styles.primaryButtonText,
    secondary: styles.secondaryButtonText,
    danger: styles.dangerButtonText,
  };

  return (
    <TouchableOpacity
      style={[buttonStyles[type], style, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon && <Image source={{ uri: icon }} style={styles.buttonIcon} />}
      <Text style={textStyles[type]}>{title}</Text>
    </TouchableOpacity>
  );
};

// Section header component for consistent styling
const SectionHeader = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

// Format hour for display
const formatHourAmPm = (hour) => {
  const h = hour % 12 || 12;
  const ampm = hour < 12 || hour === 24 ? "AM" : "PM";
  return `${h}${ampm}`;
};

// Format date for display
const formatChartDate = (dateString, isToday = false) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const date = new Date(dateString);
    const today = new Date();

    // Check if it's today
    const actuallyToday = date.toDateString() === today.toDateString();

    if (actuallyToday) {
      return "Today";
    }

    // Check if it's yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yest";
    }

    // Use short day names for other days
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return dayNames[date.getDay()];
  }
  return dateString;
};

const PostureGraph = () => {
  // State variables
  const [data, setData] = useState([]);
  const [mlData, setMlData] = useState([]);
  const [aggregatedData, setAggregatedData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isViewingToday, setIsViewingToday] = useState(true);
  const [selectedHistoryData, setSelectedHistoryData] = useState(null);
  const [goodPosturePercentage, setGoodPosturePercentage] = useState(0);
  const [badPosturePercentage, setBadPosturePercentage] = useState(0);
  const [latestPrediction, setLatestPrediction] = useState("Unknown");
  const [predictionConfidence, setPredictionConfidence] = useState(0);
  const [primaryFeature, setPrimaryFeature] = useState("none");
  const [showMlFeatures, setShowMlFeatures] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userName, setUserName] = useState("");
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNotification, setShowNotification] = useState(false);
  const notificationTimeoutRef = useRef(null);
  const [selectedPostureData, setSelectedPostureData] = useState(null);
  const [sensorConnected, setSensorConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showDeviceLogs, setShowDeviceLogs] = useState(false);
  const [showQuickLogs, setShowQuickLogs] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [recentImportantLogs, setRecentImportantLogs] = useState([]);
  const [showLogAlert, setShowLogAlert] = useState(false);
  const [showResearchForm, setShowResearchForm] = useState(false);
  const [featureImportance, setFeatureImportance] = useState({
    pitch_mean: 45,
    pitch_variance: 5,
    roll_range: 15,
    angularVelocity: 25,
    ewma: 10,
  });
  const [treeMetadata, setTreeMetadata] = useState(null);
  const [showTreeModal, setShowTreeModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0)); // Animation for transitions

  // NEW: First-time user setup modal state
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isCheckingUserStatus, setIsCheckingUserStatus] = useState(true);

  const userUID = localStorage.getItem("userUID");
  const navigate = useNavigate();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  const [profilePicture, setProfilePicture] = useState(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [achievementsData, setAchievementsData] = useState({
    points: 0,
    treeCount: 0,
    history: [],
    streaks: {
      current: 0,
      longest: 0,
    },
  });

  // Add this state variable with your other useState declarations
  const [setupType, setSetupType] = useState("unknown"); // Add this line

  // Add this useEffect to get the actual setup type from Firebase
  useEffect(() => {
    if (!userUID) return;

    const setupTypeRef = ref(database, `users/${userUID}/setupType`);
    const unsubscribe = onValue(setupTypeRef, (snapshot) => {
      if (snapshot.exists()) {
        setSetupType(snapshot.val());
        console.log("Setup type detected:", snapshot.val());
      } else {
        // Fallback: check other indicators
        const checkSetupType = async () => {
          try {
            // Check if useDefaultModel flag exists
            const defaultModelRef = ref(
              database,
              `users/${userUID}/useDefaultModel`
            );
            const defaultModelSnapshot = await get(defaultModelRef);

            if (
              defaultModelSnapshot.exists() &&
              defaultModelSnapshot.val() === true
            ) {
              setSetupType("default");
              console.log(
                "Setup type detected via useDefaultModel flag: default"
              );
              return;
            }

            // Check calibration timestamp vs setup timestamp
            const calibratedRef = ref(database, `users/${userUID}/calibrated`);
            const setupTimestampRef = ref(
              database,
              `users/${userUID}/setupTimestamp`
            );

            const [calibratedSnapshot, timestampSnapshot] = await Promise.all([
              get(calibratedRef),
              get(setupTimestampRef),
            ]);

            if (
              calibratedSnapshot.exists() &&
              calibratedSnapshot.val() === true
            ) {
              if (timestampSnapshot.exists()) {
                // If setup was recent and user is calibrated, likely went through calibration
                const setupTime = timestampSnapshot.val() * 1000;
                const now = Date.now();
                const timeDiff = now - setupTime;

                // If setup was more than 5 minutes ago and user is calibrated, probably calibrated
                if (timeDiff > 300000) {
                  // 5 minutes
                  setSetupType("calibration");
                  console.log(
                    "Setup type inferred as calibration (calibrated + time delay)"
                  );
                } else {
                  setSetupType("default");
                  console.log("Setup type inferred as default (recent setup)");
                }
              } else {
                setSetupType("calibration");
                console.log(
                  "Setup type inferred as calibration (user is calibrated)"
                );
              }
            } else {
              setSetupType("default");
              console.log("Setup type inferred as default (not calibrated)");
            }
          } catch (error) {
            console.error("Error determining setup type:", error);
            setSetupType("default"); // Safe default
          }
        };

        checkSetupType();
      }
    });

    return () => unsubscribe();
  }, [userUID]);

  // Add these state variables with your other useState declarations
  const [customThresholds, setCustomThresholds] = useState({
    good: PITCH_GOOD_THRESHOLD,
    warning: PITCH_WARNING_THRESHOLD,
    bad: PITCH_BAD_THRESHOLD,
  });

  // Add this useEffect to fetch custom thresholds from Firebase
  useEffect(() => {
    if (!userUID) return;

    const fetchCustomThresholds = async () => {
      try {
        const goodRef = ref(database, `users/${userUID}/PITCH_GOOD_THRESHOLD`);
        const warningRef = ref(
          database,
          `users/${userUID}/PITCH_WARNING_THRESHOLD`
        );
        const badRef = ref(database, `users/${userUID}/PITCH_BAD_THRESHOLD`);

        const [goodSnapshot, warningSnapshot, badSnapshot] = await Promise.all([
          get(goodRef),
          get(warningRef),
          get(badRef),
        ]);

        const customGood = goodSnapshot.exists()
          ? goodSnapshot.val()
          : PITCH_GOOD_THRESHOLD;
        const customWarning = warningSnapshot.exists()
          ? warningSnapshot.val()
          : PITCH_WARNING_THRESHOLD;
        const customBad = badSnapshot.exists()
          ? badSnapshot.val()
          : PITCH_BAD_THRESHOLD;

        setCustomThresholds({
          good: customGood,
          warning: customWarning,
          bad: customBad,
        });

        console.log("Custom thresholds loaded:", {
          good: customGood,
          warning: customWarning,
          bad: customBad,
        });
      } catch (error) {
        console.error("Error fetching custom thresholds:", error);
        // Keep default values on error
      }
    };

    fetchCustomThresholds();

    // Also listen for real-time updates to thresholds
    const goodRef = ref(database, `users/${userUID}/PITCH_GOOD_THRESHOLD`);
    const warningRef = ref(
      database,
      `users/${userUID}/PITCH_WARNING_THRESHOLD`
    );
    const badRef = ref(database, `users/${userUID}/PITCH_BAD_THRESHOLD`);

    const unsubscribeGood = onValue(goodRef, (snapshot) => {
      if (snapshot.exists()) {
        setCustomThresholds((prev) => ({
          ...prev,
          good: snapshot.val(),
        }));
      }
    });

    const unsubscribeWarning = onValue(warningRef, (snapshot) => {
      if (snapshot.exists()) {
        setCustomThresholds((prev) => ({
          ...prev,
          warning: snapshot.val(),
        }));
      }
    });

    const unsubscribeBad = onValue(badRef, (snapshot) => {
      if (snapshot.exists()) {
        setCustomThresholds((prev) => ({
          ...prev,
          bad: snapshot.val(),
        }));
      }
    });

    return () => {
      unsubscribeGood();
      unsubscribeWarning();
      unsubscribeBad();
    };
  }, [userUID]);

  // Animate component on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [fadeAnim]);

  // Add this helper function near the top of your component
  const isDataFresh = useCallback((timestamp, maxAgeMs = 120000) => {
    const now = Date.now();
    const dataTime = parseInt(timestamp) * 1000;
    const age = now - dataTime;
    return age <= maxAgeMs;
  }, []);

  // NEW: Check if user is new and needs setup
  const checkUserSetupStatus = useCallback(async () => {
    if (!userUID) {
      setIsCheckingUserStatus(false);
      return;
    }

    try {

      // Check if ANY of these fields exist to determine if user has been set up
      const userRef = ref(database, `users/${userUID}`);
      const userSnapshot = await get(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();

        // Check for any indication that setup has been completed
        const hasSetupCompleted = userData.setupCompleted === true;
        const hasCalibrated = userData.calibrated === true;
        const hasThreshold = userData.threshold !== undefined;
        const hasMLModel = userData.mlModel !== undefined;

        // If user has NONE of these, they're definitely new
        const isDefinitelyNew =
          !hasSetupCompleted && !hasCalibrated && !hasThreshold && !hasMLModel;

        console.log("User data analysis:", {
          hasSetupCompleted,
          hasCalibrated,
          hasThreshold,
          hasMLModel,
          isDefinitelyNew,
        });

        if (isDefinitelyNew) {
          console.log("NEW USER DETECTED - showing modal");
          setIsNewUser(true);
          setIsCalibrated(false);
          setTimeout(() => {
            setShowFirstTimeModal(true);
          }, 200);
        } else {
          console.log("EXISTING USER DETECTED");
          setIsNewUser(false);
          setIsCalibrated(hasCalibrated);
          setShowFirstTimeModal(false);
        }
      } else {
        // User node doesn't exist at all - definitely new
        console.log("USER NODE DOESN'T EXIST - definitely new user");
        setIsNewUser(true);
        setIsCalibrated(false);
        setTimeout(() => {
          setShowFirstTimeModal(true);
        }, 200);
      }
    } catch (error) {
      console.error("Error checking user setup status:", error);
      // On error, assume new user
      setIsNewUser(true);
      setIsCalibrated(false);
      setTimeout(() => {
        setShowFirstTimeModal(true);
      }, 200);
    }

    setIsCheckingUserStatus(false);
  }, [userUID]);

  const handleEditName = useCallback(() => {
    setEditedName(userName || "");
    setIsEditingName(true);
  }, [userName]);

  const handleCancelNameEdit = useCallback(() => {
    setIsEditingName(false);
    setEditedName("");
  }, []);

  const sanitizeInput = (input) => {
    if (typeof input !== "string") return "";
    return input
      .replace(/[<>]/g, "") // Remove potential XSS characters
      .trim()
      .substring(0, 100); // Limit length
  };

  // Update your name saving function
  const handleSaveName = useCallback(async () => {
    if (!userUID || !editedName.trim()) {
      alert("Please enter a valid name");
      return;
    }

    setIsSavingName(true);

    try {
      // SECURITY: Sanitize input before saving
      const sanitizedName = sanitizeInput(editedName.trim());

      if (sanitizedName.length < 1) {
        alert("Please enter a valid name");
        return;
      }

      // Save to Firebase
      await set(ref(database, `users/${userUID}/name`), sanitizedName);

      // Update local state and storage
      setUserName(sanitizedName);
      localStorage.setItem("userName", sanitizedName);

      // Close editing mode
      setIsEditingName(false);
      setEditedName("");

      console.log("Name updated successfully:", sanitizedName);
    } catch (error) {
      console.error("Error updating name:", error);
      alert("Failed to update name. Please try again.");
    } finally {
      setIsSavingName(false);
    }
  }, [userUID, editedName]);

  useEffect(() => {
    const loadProfilePicture = async () => {
      if (userUID) {
        try {
          // Try to get from Firebase first
          const pictureRef = ref(database, `users/${userUID}/profilePicture`);
          const snapshot = await get(pictureRef);

          if (snapshot.exists()) {
            setProfilePicture(snapshot.val());
          } else {
            // Fallback to localStorage
            const savedPicture = localStorage.getItem(
              `profilePicture_${userUID}`
            );
            if (savedPicture) {
              setProfilePicture(savedPicture);
            }
          }
        } catch (error) {
          console.error("Error loading profile picture:", error);
          // Try localStorage as fallback
          const savedPicture = localStorage.getItem(
            `profilePicture_${userUID}`
          );
          if (savedPicture) {
            setProfilePicture(savedPicture);
          }
        }
      }
    };

    loadProfilePicture();
  }, [userUID]);

  const initializeAchievements = useCallback(async () => {
    if (!userUID) return;

    try {
      const achievementsRef = ref(database, `users/${userUID}/achievements`);
      const snapshot = await get(achievementsRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        setAchievementsData({
          points: data.points || 0,
          treeCount: Math.floor((data.points || 0) / 20),
          history: data.history || [],
          streaks: data.streaks || { current: 0, longest: 0 },
        });
      } else {
        // Initialize achievements data if it doesn't exist
        const initialData = {
          points: 0,
          history: [],
          streaks: {
            current: 0,
            longest: 0,
          },
        };
        await set(achievementsRef, initialData);
        setAchievementsData({
          ...initialData,
          treeCount: 0,
        });
        console.log("Achievements initialized for new user");
      }
    } catch (error) {
      console.error("Error initializing achievements:", error);
    }
  }, [userUID]);

  const awardGoodPosturePoint = useCallback(async () => {
    if (!userUID) {
      console.error("Cannot award point: userUID is missing");
      return;
    }

    console.log("🎉 Awarding good posture point!");

    try {
      // Get current achievements data
      const achievementsRef = ref(database, `users/${userUID}/achievements`);
      const snapshot = await get(achievementsRef);
      const currentData = snapshot.val() || {
        points: 0,
        history: [],
        streaks: { current: 0, longest: 0 },
      };

      // Update points
      const newPoints = (currentData.points || 0) + 1;
      console.log(`Updating points from ${currentData.points} to ${newPoints}`);

      // Update streak and history
      const now = new Date();
      const today = now.toISOString().split("T")[0];

      const history = Array.isArray(currentData.history)
        ? [...currentData.history]
        : [];
      const newEntry = {
        date: today,
        time: now.toISOString(),
        points: 1,
        type: "good_posture_minute",
      };
      history.push(newEntry);

      const streaks = currentData.streaks || { current: 0, longest: 0 };
      streaks.current += 1;
      if (streaks.current > streaks.longest) {
        streaks.longest = streaks.current;
      }

      // Save updated data
      const updatedData = {
        points: newPoints,
        history: history,
        streaks: streaks,
      };

      await set(achievementsRef, updatedData);

      // Update local state
      setAchievementsData({
        points: newPoints,
        treeCount: Math.floor(newPoints / 20),
        history: history,
        streaks: streaks,
      });

      console.log("✅ Point successfully awarded for good posture!");
    } catch (error) {
      console.error("Error awarding point:", error);
    }
  }, [userUID]);

  const trackPostureForAchievements = useCallback(() => {
    if (!userUID) return () => {};

    console.log("Starting posture tracking for achievements");

    let goodPostureReadingsCount = 0;
    let lastProcessedTimestamp = null;

    const postureRef = ref(database, `users/${userUID}/postureData`);

    const postureListener = onValue(postureRef, (snapshot) => {
      const postureData = snapshot.val();

      if (!postureData) return;

      // Get all entries and sort by timestamp
      const entries = Object.entries(postureData);
      if (entries.length === 0) return;

      entries.sort((a, b) => parseInt(b[0]) - parseInt(a[0]));
      const [timestamp, latestData] = entries[0];

      // Skip if already processed
      if (timestamp === lastProcessedTimestamp) return;
      lastProcessedTimestamp = timestamp;

      // 🔧 FIX: More strict freshness check for achievements (within 3 minutes)
      const now = Date.now();
      const dataTime = parseInt(timestamp) * 1000;
      const dataAge = now - dataTime;
      if (dataAge > 180000) {
        // 3 minutes
        console.log(
          `Skipping stale data for achievements. Age: ${dataAge / 1000}s`
        );
        return;
      }

      // Check posture prediction
      const hasValidPrediction =
        latestData && typeof latestData.finalPrediction === "string";
      const isGoodPosture =
        hasValidPrediction && latestData.finalPrediction === "Good";
      const isBadPosture =
        hasValidPrediction && latestData.finalPrediction === "Bad";

      console.log("Posture tracking:", {
        prediction: hasValidPrediction
          ? latestData.finalPrediction
          : "undefined",
        goodCount: goodPostureReadingsCount,
      });

      if (isGoodPosture) {
        goodPostureReadingsCount++;
        console.log(
          `Good posture reading! Count: ${goodPostureReadingsCount}/30`
        );

        // Award point after 30 good readings (approximately 1 minute)
        if (goodPostureReadingsCount >= 30) {
          awardGoodPosturePoint();
          goodPostureReadingsCount = 0; // Reset counter
        }
      } else if (isBadPosture) {
        // Reset counter on bad posture
        console.log(
          `Bad posture detected. Resetting count from ${goodPostureReadingsCount} to 0`
        );
        goodPostureReadingsCount = 0;
      }
      // Warning posture maintains the count without incrementing
    });

    return () => {
      console.log("Cleaning up posture tracking for achievements");
      postureListener();
    };
  }, [userUID, awardGoodPosturePoint]);

  // Initialize achievements when component mounts
  useEffect(() => {
    if (userUID) {
      initializeAchievements();
    }
  }, [userUID, initializeAchievements]);

  // Start achievements tracking when user is set up
  useEffect(() => {
    if (!userUID || isCheckingUserStatus || isNewUser) return;

    console.log("Starting achievements tracking in PostureGraph");
    const cleanupAchievementsTracking = trackPostureForAchievements();

    return () => {
      console.log("Cleaning up achievements tracking in PostureGraph");
      cleanupAchievementsTracking();
    };
  }, [userUID, isCheckingUserStatus, isNewUser, trackPostureForAchievements]);

  // NEW: Handle profile picture upload
  const handleProfilePictureUpload = useCallback(
    (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file (JPG, PNG, GIF, etc.)");
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert("Please select an image smaller than 5MB");
        return;
      }

      setIsUploadingPicture(true);

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const imageDataUrl = e.target.result;

          // Save to Firebase
          if (userUID) {
            await set(
              ref(database, `users/${userUID}/profilePicture`),
              imageDataUrl
            );
          }

          // Save to localStorage as backup
          localStorage.setItem(`profilePicture_${userUID}`, imageDataUrl);

          // Update state
          setProfilePicture(imageDataUrl);

          console.log("Profile picture updated successfully");
        } catch (error) {
          console.error("Error saving profile picture:", error);
          alert("Failed to save profile picture. Please try again.");
        } finally {
          setIsUploadingPicture(false);
        }
      };

      reader.onerror = () => {
        console.error("Error reading file");
        alert("Failed to read the image file. Please try again.");
        setIsUploadingPicture(false);
      };

      reader.readAsDataURL(file);
    },
    [userUID]
  );

  // NEW: Handle profile picture removal
  const handleRemoveProfilePicture = useCallback(async () => {
    if (!userUID) return;

    setIsUploadingPicture(true);

    try {
      // Remove from Firebase
      await set(ref(database, `users/${userUID}/profilePicture`), null);

      // Remove from localStorage
      localStorage.removeItem(`profilePicture_${userUID}`);

      // Update state
      setProfilePicture(null);

      console.log("Profile picture removed successfully");
    } catch (error) {
      console.error("Error removing profile picture:", error);
      alert("Failed to remove profile picture. Please try again.");
    } finally {
      setIsUploadingPicture(false);
    }
  }, [userUID]);

  const ProfilePictureModal = () =>
    showProfileModal && (
      <View style={styles.modalOverlay}>
        <View style={styles.profileModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Profile Picture</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowProfileModal(false)}
            >
              <Image
                source={{ uri: ICONS.close }}
                style={styles.modalCloseIcon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.profilePreviewContainer}>
              <Image
                source={{ uri: profilePicture || ICONS.defaultAvatar }}
                style={styles.profilePreview}
              />
              {isUploadingPicture && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                </View>
              )}
            </View>

            <View style={styles.modalActions}>
              <label
                htmlFor="profile-picture-upload"
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>
                  {profilePicture ? "Change Picture" : "Upload Picture"}
                </Text>
              </label>
              <input
                id="profile-picture-upload"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                style={styles.hiddenInput}
                disabled={isUploadingPicture}
              />

              {profilePicture && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonDanger]}
                  onPress={handleRemoveProfilePicture}
                  disabled={isUploadingPicture}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      styles.modalButtonDangerText,
                    ]}
                  >
                    Remove Picture
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowProfileModal(false)}
                disabled={isUploadingPicture}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    styles.modalButtonSecondaryText,
                  ]}
                >
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );

  const getTimeBasedGreeting = useCallback(() => {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
      return "Good Morning";
    } else if (currentHour < 17) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  }, []);

  // NEW: Handle default setup selection
  const handleDefaultSetup = useCallback(async () => {
    if (!userUID) return;

    try {
      console.log("Setting up default configuration for user:", userUID);

      // FIXED: Much more sensitive thresholds for forward slouching
      const defaultMLModel = {
        meanThreshold: 8.0, // Lowered from 15.0 - more sensitive to forward slouch
        varianceThreshold: 25.0,
        rangeThreshold: 10.0,
        meanGoodPosture: 2.0, // Lowered from 5.0 - stricter good posture requirement
        angularVelocityThreshold: 5.0,
        ewmaFactor: 0.3,
        consecutiveBadThreshold: 3,
        consecutiveWarningThreshold: 5,
        stdDev: 3.0, // Lowered from 5.0 - more sensitive
        stabilityPeriod: 3,
        // Add feature importance for display
        featureImportance: {
          pitch_mean: 60, // Increased importance of pitch
          pitch_variance: 10,
          roll_range: 5, // Decreased importance of roll
          angularVelocity: 15,
          ewma: 10,
        },
      };

      // FIXED: Much more sensitive decision tree for forward slouching
      const defaultDecisionTree = {
        isLeaf: false,
        featureIndex: 0, // pitch_mean
        threshold: 8.0, // LOWERED from 15.0 - first threshold at 8 degrees
        leftChild: {
          // Left child: pitch <= 8 degrees = GOOD posture (upright)
          isLeaf: true,
          prediction: "Good",
          confidence: 0.9,
        },
        rightChild: {
          // Right child: pitch > 8 degrees, check further
          isLeaf: false,
          featureIndex: 0, // pitch_mean
          threshold: 15.0, // LOWERED from 30.0 - second threshold at 15 degrees
          leftChild: {
            // pitch between 8-15 degrees = WARNING (slight forward slouch)
            isLeaf: true,
            prediction: "Warning",
            confidence: 0.8,
          },
          rightChild: {
            // pitch > 15 degrees = BAD posture (significant forward slouch)
            isLeaf: true,
            prediction: "Bad",
            confidence: 0.85,
          },
        },
        // Include metadata as part of the decision tree object
        metadata: {
          actualDepth: 2,
          maxDepth: 4,
          totalNodes: 5,
          leafNodes: 3,
          trainingTimestamp: Math.floor(Date.now() / 1000),
        },
      };

      // FIXED: Much more sensitive default thresholds for forward slouching
      const defaultThresholds = {
        PITCH_GOOD_THRESHOLD: 8.0, // 0-8° = Good posture (upright)
        PITCH_WARNING_THRESHOLD: 15.0, // 8-15° = Warning posture (slight forward slouch)
        PITCH_BAD_THRESHOLD: 25.0, // >15° = Bad posture (significant forward slouch)
      };

      console.log("Preparing updates for Firebase...");

      // CRITICAL: Add the calibration flags that the ESP32 is waiting for
      const updates = {
        [`users/${userUID}/threshold`]: 800, // LOWERED from 1500 - more sensitive raw threshold
        [`users/${userUID}/mlModel`]: defaultMLModel,
        [`users/${userUID}/decisionTree`]: defaultDecisionTree,
        [`users/${userUID}/calibrated`]: true,
        [`users/${userUID}/setupCompleted`]: true,
        [`users/${userUID}/setupType`]: "default",
        [`users/${userUID}/setupTimestamp`]: Math.floor(Date.now() / 1000),
        [`users/${userUID}/PITCH_GOOD_THRESHOLD`]:
          defaultThresholds.PITCH_GOOD_THRESHOLD,
        [`users/${userUID}/PITCH_WARNING_THRESHOLD`]:
          defaultThresholds.PITCH_WARNING_THRESHOLD,
        [`users/${userUID}/PITCH_BAD_THRESHOLD`]:
          defaultThresholds.PITCH_BAD_THRESHOLD,
        // ADD THESE CRITICAL FLAGS that ESP32 is checking for:
        [`users/${userUID}/calibrationStep`]: "completed", // Tell ESP32 calibration is done
        [`users/${userUID}/mlModelTrained`]: true, // Indicate ML model is ready
        [`users/${userUID}/useDefaultModel`]: true, // Flag for using default model
        [`users/${userUID}/calibrationCompleted`]: true, // Another flag ESP32 might check
      };

      console.log("Updates prepared:", updates);

      // Use Firebase's update method to set all values atomically
      const { update } = await import("firebase/database");
      await update(ref(database), updates);

      console.log("Default configuration saved successfully!");

      // Update local state
      setIsCalibrated(true);
      setIsNewUser(false);
      setShowFirstTimeModal(false);

      // Show success message
      alert(
        "✅ Default settings applied with sensitive forward slouch detection! Try slouching forward now."
      );
    } catch (error) {
      console.error("Error setting up default configuration:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
      alert(
        "❌ Error setting up default configuration. Please check console for details and try again."
      );
    }
  }, [userUID]);

  // NEW: Handle calibration setup selection
  const handleCalibrationSetup = useCallback(async () => {
    if (!userUID) return;

    try {
      // Mark setup as completed but not calibrated yet
      const updates = {
        [`users/${userUID}/setupCompleted`]: true,
        [`users/${userUID}/setupType`]: "calibration",
        [`users/${userUID}/setupTimestamp`]: Math.floor(Date.now() / 1000),
        [`users/${userUID}/calibrated`]: false,
      };

      const { update } = await import("firebase/database");
      await update(ref(database), updates);

      // Close modal and go to settings
      setShowFirstTimeModal(false);
      setIsNewUser(false);
      setActiveTab("settings");

      // Show message
      alert(
        "📱 Great choice! You'll be taken to the calibration settings for the most accurate posture detection."
      );
    } catch (error) {
      console.error("Error preparing calibration setup:", error);
      alert("❌ Error preparing calibration. Please try again.");
    }
  }, [userUID]);

  // Handle notification display
  const showBadPostureNotification = useCallback(() => {
    // Clear any existing timeout first
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
      notificationTimeoutRef.current = null;
    }

    setShowNotification(true);

    // Set new timeout with ref tracking
    notificationTimeoutRef.current = setTimeout(() => {
      setShowNotification(false);
      notificationTimeoutRef.current = null;
    }, NOTIFICATION_DURATION);
  }, []);

  const hideBadPostureNotification = useCallback(() => {
    // Clear timeout immediately
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
      notificationTimeoutRef.current = null;
    }
    setShowNotification(false);
  }, []);

  const dismissNotification = useCallback(() => {
    // Clear timeout immediately
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
      notificationTimeoutRef.current = null;
    }
    setShowNotification(false);
  }, []);

  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  const notificationDebounceRef = useRef(null);

  const handlePosturePrediction = useCallback(
    (latestPredictionValue, latestConfidence, dataTimestamp = null) => {
      // 🔧 FIX: Double-check data freshness if timestamp provided
      if (dataTimestamp && !isDataFresh(dataTimestamp)) {
        console.log("Notification blocked: data too old");
        return;
      }

      // Clear any pending debounced notification
      if (notificationDebounceRef.current) {
        clearTimeout(notificationDebounceRef.current);
      }

      // Debounce notification changes by 100ms to prevent rapid updates
      notificationDebounceRef.current = setTimeout(() => {
        if (latestPredictionValue === "Bad") {
          console.log("Triggering notification for Bad posture");
          showBadPostureNotification();
        } else if (
          latestPredictionValue === "Warning" &&
          latestConfidence > 0.7
        ) {
          console.log("Triggering notification for high-confidence Warning");
          showBadPostureNotification();
        } else {
          console.log("Hiding notification for Good posture");
          hideBadPostureNotification();
        }
      }, 100);
    },
    [showBadPostureNotification, hideBadPostureNotification, isDataFresh]
  );

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isDateToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // NEW: Navigation functions
  const goToPreviousDay = useCallback(() => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(selectedDate.getDate() - 1);
    setSelectedDate(previousDay);
    setIsViewingToday(isDateToday(previousDay));
  }, [selectedDate]);

  const goToNextDay = useCallback(() => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(selectedDate.getDate() + 1);
    const today = new Date();

    // Don't allow going beyond today
    if (nextDay <= today) {
      setSelectedDate(nextDay);
      setIsViewingToday(isDateToday(nextDay));
    }
  }, [selectedDate]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setSelectedDate(today);
    setIsViewingToday(true);
  }, []);

  // Aggregate data into time blocks for the chart
  const aggregateDataIntoTimeBlocks = useCallback(
    (hourlyData, targetDate = new Date()) => {
      if (!hourlyData || hourlyData.length === 0) {
        setAggregatedData([]);
        return;
      }

      // Filter data to only include the selected date's readings
      const selectedDateData = hourlyData.filter(
        (dataPoint) =>
          dataPoint &&
          dataPoint.hour &&
          dataPoint.hour.getDate() === targetDate.getDate() &&
          dataPoint.hour.getMonth() === targetDate.getMonth() &&
          dataPoint.hour.getFullYear() === targetDate.getFullYear()
      );

      if (selectedDateData.length === 0) {
        setAggregatedData([]);
        return;
      }

      // Define 4 simple time blocks with ultra-short labels
      const timeBlocks = [
        { start: 6, end: 11, label: "AM" }, // Morning
        { start: 11, end: 15, label: "Noon" }, // Midday
        { start: 15, end: 19, label: "PM" }, // Afternoon
        { start: 19, end: 24, label: "Eve" }, // Evening
      ];

      // Create buckets for each time block
      const hourBuckets = timeBlocks.map(() => []);

      // Assign each selected date's data point to the appropriate bucket
      selectedDateData.forEach((dataPoint) => {
        const hour = dataPoint.hour.getHours();

        // Find which time block this hour belongs to
        const blockIndex = timeBlocks.findIndex(
          (block) => hour >= block.start && hour < block.end
        );

        if (blockIndex !== -1) {
          hourBuckets[blockIndex].push(dataPoint.pitch);
        }
      });

      // Create the aggregated data with the time blocks
      const aggregated = timeBlocks.map((block, index) => {
        const average =
          hourBuckets[index].length > 0
            ? hourBuckets[index].reduce((sum, pitch) => sum + pitch, 0) /
              hourBuckets[index].length
            : 0;

        return {
          label: block.label,
          value: parseFloat(average.toFixed(1)),
          rawPitches: hourBuckets[index],
          timeRange: { start: block.start, end: block.end },
          dataCount: hourBuckets[index].length,
        };
      });

      setAggregatedData(aggregated);
    },
    []
  );

  useEffect(() => {
    if (data.length > 0) {
      aggregateDataIntoTimeBlocks(data, selectedDate);
    }
  }, [data, selectedDate, aggregateDataIntoTimeBlocks]);

  // NEW: Function to format the selected date for display
  const formatSelectedDate = useCallback(() => {
    if (isViewingToday) {
      return "Today";
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (selectedDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    // FIXED: Capitalize the day and month
    const formattedDate = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

    // Capitalize first letter of each word (day and month)
    return formattedDate.replace(/\b\w/g, (l) => l.toUpperCase());
  }, [selectedDate, isViewingToday]);

  // NEW: Function to check if there's data for the selected date
  const hasDataForSelectedDate = useCallback(() => {
    return data.some(
      (entry) =>
        entry &&
        entry.hour &&
        entry.hour.getDate() === selectedDate.getDate() &&
        entry.hour.getMonth() === selectedDate.getMonth() &&
        entry.hour.getFullYear() === selectedDate.getFullYear()
    );
  }, [data, selectedDate]);

  const getEnhancedChartConfig = (type = "bar") => {
    const baseConfig = {
      backgroundColor: THEME.cardBackground,
      backgroundGradientFrom: THEME.cardBackground,
      backgroundGradientFromOpacity: 1,
      backgroundGradientTo: THEME.cardBackground,
      backgroundGradientToOpacity: 1,
      fillShadowGradientFromOpacity: 0.8,
      fillShadowGradientTo: THEME.primary,
      fillShadowGradientToOpacity: 0.1,
      color: (opacity = 1) => `rgba(92, 163, 119, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(27, 18, 18, ${opacity})`,
      strokeWidth: 3,
      barPercentage: 0.6, // UPDATED: Better bar width
      categoryPercentage: 0.9, // UPDATED: Better category spacing
      useShadowColorFromDataset: false,
      decimalPlaces: 1,
      propsForLabels: {
        fontSize: 12,
        fontWeight: "600",
        rotation: 0,
        fontFamily: "System", // Or your app's default font
      },
      propsForVerticalLabels: {
        fontSize: 11,
        fontWeight: "500",
        fontFamily: "System", // Or your app's default font
      },
      propsForHorizontalLabels: {
        fontSize: 11,
        fontWeight: "500",
        fontFamily: "System", // Or your app's default font
      },
      style: {
        borderRadius: 16,
      },
      propsForBackgroundLines: {
        strokeDasharray: "",
        stroke: THEME.border,
        strokeWidth: 1,
        strokeOpacity: 0.3,
      },
      // ADDED: Better spacing configuration
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 10,
      paddingBottom: 10,
    };

    if (type === "line") {
      return {
        ...baseConfig,
        propsForDots: {
          r: "5",
          strokeWidth: "3",
          stroke: THEME.primary,
          fill: "#FFFFFF",
          strokeDasharray: "",
        },
        propsForBackgroundLines: {
          strokeDasharray: "5,5",
          stroke: "rgba(0,0,0,0.1)",
          strokeWidth: 1,
        },
      };
    }

    return baseConfig;
  };

  const getHistoryChartConfig = () => ({
    backgroundColor: THEME.cardBackground,
    backgroundGradientFrom: THEME.cardBackground,
    backgroundGradientFromOpacity: 1,
    backgroundGradientTo: THEME.cardBackground,
    backgroundGradientToOpacity: 1,
    color: (opacity = 1) => `rgba(27, 18, 18, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(27, 18, 18, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.8,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    style: {
      borderRadius: 12,
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: THEME.border,
      strokeWidth: 1,
      strokeOpacity: 0.2,
    },
    propsForLabels: {
      fontSize: 0, // Hide default labels completely
      fontWeight: "500",
      fill: "transparent", // Make them invisible
    },
    propsForVerticalLabels: {
      fontSize: 0, // Hide vertical labels
      fill: "transparent",
    },
    propsForHorizontalLabels: {
      fontSize: 0, // Hide horizontal labels
      fill: "transparent",
    },
    formatXLabel: () => "", // Return empty string for all labels
    formatYLabel: (value) => value + "%",
  });

  // Enhanced color function for posture bars
  const getPostureBarColor = (value, opacity = 1, animated = false) => {
    let baseColor;

    if (value <= PITCH_GOOD_THRESHOLD) {
      baseColor = `rgba(92, 163, 119, ${opacity})`; // Green
    } else if (value <= PITCH_WARNING_THRESHOLD) {
      baseColor = `rgba(255, 193, 7, ${opacity})`; // Amber
    } else {
      baseColor = `rgba(248, 122, 83, ${opacity})`; // Red
    }

    return baseColor;
  };

  // Enhanced gradient colors for history chart
  const getHistoryChartColors = () => ({
    good: [
      "rgba(92, 163, 119, 0.9)", // Solid green
      "rgba(92, 163, 119, 0.7)", // Medium green
      "rgba(92, 163, 119, 0.5)", // Light green
    ],
    warning: [
      "rgba(255, 193, 7, 0.9)", // Solid amber
      "rgba(255, 193, 7, 0.7)", // Medium amber
      "rgba(255, 193, 7, 0.5)", // Light amber
    ],
    bad: [
      "rgba(248, 122, 83, 0.9)", // Solid red
      "rgba(248, 122, 83, 0.7)", // Medium red
      "rgba(248, 122, 83, 0.5)", // Light red
    ],
  });

  // Add animation state
  const [chartAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (aggregatedData.length > 0) {
      Animated.timing(chartAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }
  }, [aggregatedData, chartAnimation]);

  const toggleQuickLogs = useCallback(() => {
    setShowQuickLogs(!showQuickLogs);
    // Close other panels if logs are being shown
    if (!showQuickLogs) {
      setActiveTab("dashboard");
    }
  }, [showQuickLogs]);

  // Monitor device logs for important messages
  useEffect(() => {
    if (!userUID) return;

    // Listen for logs, specifically errors and warnings
    const logsRef = ref(database, `users/${userUID}/deviceLogs`);
    const unsubscribe = onValue(logsRef, (snapshot) => {
      const logsData = snapshot.val();
      if (logsData) {
        // Convert logs object to array and sort by timestamp
        const logsArray = Object.entries(logsData).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        // Sort by timestamp (newest first)
        logsArray.sort((a, b) => b.timestamp - a.timestamp);

        // Get only important logs (errors and warnings) from last 5 minutes
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        const importantLogs = logsArray.filter(
          (log) =>
            (log.type === "error" || log.type === "warning") &&
            log.timestamp > fiveMinutesAgo
        );

        // Take only the 3 most recent important logs
        const recentLogs = importantLogs.slice(0, 3);

        setRecentImportantLogs(recentLogs);
        setShowLogAlert(recentLogs.length > 0);
      }
    });

    return () => off(logsRef);
  }, [userUID]);

  // Check sensor connection status
  useEffect(() => {
    if (!userUID) return;

    const sensorStatusRef = ref(database, `users/${userUID}/sensorStatus`);
    const unsubscribe = onValue(sensorStatusRef, (snapshot) => {
      const statusData = snapshot.val();
      if (statusData) {
        setSensorConnected(statusData.connected || false);
        setLastUpdated(
          statusData.lastChecked ? new Date(statusData.lastChecked) : null
        );
      } else {
        setSensorConnected(false);
      }
    });

    return () => unsubscribe();
  }, [userUID]);

  // Get ML model tree metadata
  useEffect(() => {
    if (!userUID) return;

    const treeMetadataRef = ref(
      database,
      `users/${userUID}/decisionTree/metadata`
    );
    const unsubscribe = onValue(treeMetadataRef, (snapshot) => {
      if (snapshot.exists()) {
        setTreeMetadata(snapshot.val());
      }
    });

    return () => unsubscribe();
  }, [userUID]);

  // NEW: Check user setup status on mount
  useEffect(() => {
    if (userUID) {
      checkUserSetupStatus();
    } else {
      console.log("No userUID found"); // Debug log
      setIsCheckingUserStatus(false);
    }
  }, [userUID, checkUserSetupStatus]);

  // Fetch user data and initialize app
  useEffect(() => {
    if (!userUID) {
      setUserName("");
      setIsLoadingUser(false);
      return;
    }

    setIsLoadingUser(true);

    // Improved user name retrieval with multiple fallback paths
    const getUserName = async () => {
      try {
        setUserName(""); // Clear previous name

        console.log("Attempting to get user name from Firebase...");

        // Try multiple paths in order of preference
        const pathsToTry = [
          `users/${userUID}/name`,
          `users/${userUID}/userInfo/name`,
          `users/${userUID}/profile/displayName`,
          `users/${userUID}/userInfo/displayName`,
        ];

        let foundName = null;

        // Check each path until we find a name
        for (const path of pathsToTry) {
          try {
            const nameRef = ref(database, path);
            const snapshot = await get(nameRef);

            if (snapshot.exists() && snapshot.val()) {
              foundName = snapshot.val().toString().trim();
              break;
            }
          } catch (pathError) {
            console.warn(`Error checking path ${path}:`, pathError);
            continue;
          }
        }

        if (foundName) {
          setUserName(foundName);
          localStorage.setItem("userName", foundName);
        } else {
          // If no name found in Firebase, check localStorage as fallback
          const localName = localStorage.getItem("userName");
          if (localName && localName.trim()) {
            console.log(`Using localStorage name: ${localName}`);
            setUserName(localName.trim());
          } else {
            // Final fallback - check if we can get it from auth
            const currentUser = auth.currentUser;
            if (currentUser && currentUser.displayName) {
              const authName = currentUser.displayName.trim();
              console.log(`Using auth displayName: ${authName}`);
              setUserName(authName);
              localStorage.setItem("userName", authName);

              // Save to Firebase for future use
              try {
                await set(ref(database, `users/${userUID}/name`), authName);
                console.log("Saved auth name to Firebase");
              } catch (saveError) {
                console.warn(
                  "Could not save auth name to Firebase:",
                  saveError
                );
              }
            } else {
              console.log("No name found anywhere, using default");
              setUserName("AlignMate User");
              localStorage.removeItem("userName");
            }
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);

        // Try localStorage as final fallback
        const localName = localStorage.getItem("userName");
        if (localName && localName.trim()) {
          setUserName(localName.trim());
          console.log("Using localStorage fallback name:", localName);
        } else {
          setUserName("AlignMate User");
          localStorage.removeItem("userName");
        }
      } finally {
        setIsLoadingUser(false);
      }
    };

    getUserName();

    // Get ML feature importance if available
    const mlModelRef = ref(
      database,
      `users/${userUID}/mlModel/featureImportance`
    );
    get(mlModelRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          setFeatureImportance(snapshot.val());
        }
      })
      .catch((error) => {
        console.error("Error getting feature importance:", error);
      });

    // Subscribe to posture data
    // Subscribe to posture data
    const sensorRef = ref(database, `users/${userUID}/postureData`);
    const postureDataUnsubscribe = onValue(sensorRef, (snapshot) => {
      const firebaseData = snapshot.val();

      if (firebaseData) {
        const processedData = [];
        const mlProcessedData = [];
        let latestPredictionValue = null;
        let latestConfidence = 0;
        let latestPrimaryFeature = "none";

        Object.entries(firebaseData).forEach(([key, value]) => {
          const timestamp = parseInt(key) * 1000;
          const date = new Date(timestamp);

          if (typeof value === "number") {
            processedData.push({
              timestamp,
              hour: date,
              pitch: mapToPitchAngle(value),
              rawValue: value,
            });
          } else if (typeof value === "object") {
            // Add raw value to processed data
            const rawValue =
              typeof value === "number" ? value : value.value || value;
            const pitch = mapToPitchAngle(
              typeof rawValue === "number" ? rawValue : 0
            );

            processedData.push({
              timestamp,
              hour: date,
              pitch,
              rawValue: typeof rawValue === "number" ? rawValue : 0,
            });

            // Handle ML data - use the enhanced feature set from ESP32
            if (value.mean !== undefined) {
              const mlEntry = {
                timestamp,
                hour: date,
                mean: value.mean || 0,
                variance: value.variance || 0,
                range: value.range || 0,
                angularVelocity: value.angularVelocity || 0,
                ewma: value.ewma || 0,
                prediction:
                  value.prediction || value.finalPrediction || "Unknown",
                confidence: value.confidence || 0,
                primaryFeature: value.primaryFeature || "none",
              };

              mlProcessedData.push(mlEntry);

              // Get latest prediction info for notification and display
              const newPrediction = value.finalPrediction || value.prediction;
              if (newPrediction) {
                latestPredictionValue = newPrediction;
                latestConfidence = value.confidence || 0;
                latestPrimaryFeature = value.primaryFeature || "none";
              }
            }
          }
        });

        // Sort data chronologically
        processedData.sort((a, b) => a.timestamp - b.timestamp);
        mlProcessedData.sort((a, b) => a.timestamp - b.timestamp);

        setData(processedData);
        setMlData(mlProcessedData);

        // Update aggregated chart data
        aggregateDataIntoTimeBlocks(processedData);

        // 🔧 FIX: Better notification logic with freshness check
        if (latestPredictionValue) {
          setLatestPrediction(latestPredictionValue);
          setPredictionConfidence(latestConfidence);
          setPrimaryFeature(latestPrimaryFeature);

          // 🔧 FIX: Only trigger notifications for fresh data (within last 2 minutes)
          const latestDataTimestamp = Math.max(
            ...Object.keys(firebaseData).map((k) => parseInt(k))
          );
          const latestDataTime = latestDataTimestamp * 1000; // Convert to milliseconds
          const now = Date.now();
          const dataAge = now - latestDataTime;
          const isFreshData = dataAge <= 120000; // 2 minutes = 120,000 ms

          console.log("Data freshness check:", {
            latestDataTime: new Date(latestDataTime),
            now: new Date(now),
            dataAge: dataAge / 1000 + " seconds",
            isFreshData,
            prediction: latestPredictionValue,
          });

          // Only show notifications for fresh data
          if (isFreshData) {
            handlePosturePrediction(
              latestPredictionValue,
              latestConfidence,
              latestDataTimestamp
            );
          } else {
            console.log("Skipping notification for stale data");
            // Still hide any existing notifications since data is old
            hideBadPostureNotification();
          }
        } else if (processedData.length > 0) {
          // Fallback to simple threshold when no ML data is available
          const latestReading = processedData[processedData.length - 1];

          // 🔧 FIX: Also check freshness for threshold-based predictions
          const latestTimestamp = latestReading.timestamp / 1000; // Convert back to seconds
          const now = Date.now();
          const dataAge = now - latestReading.timestamp;
          const isFreshData = dataAge <= 120000; // 2 minutes

          if (isFreshData) {
            if (latestReading.pitch > PITCH_BAD_THRESHOLD) {
              setLatestPrediction("Bad");
              handlePosturePrediction("Bad", 0.8, latestTimestamp);
            } else if (latestReading.pitch > PITCH_WARNING_THRESHOLD) {
              setLatestPrediction("Warning");
              handlePosturePrediction("Warning", 0.6, latestTimestamp);
            } else {
              setLatestPrediction("Good");
              handlePosturePrediction("Good", 0.9, latestTimestamp);
            }
          } else {
            console.log("Skipping threshold-based notification for stale data");
            hideBadPostureNotification();
          }
        }
      } else {
        setData([]);
        setMlData([]);
        setAggregatedData([]);
        hideBadPostureNotification();
      }
    });

    // Subscribe to posture history data
    const historyRef = ref(database, `users/${userUID}/postureHistory`);
    const historyUnsubscribe = onValue(historyRef, (snapshot) => {
      const firebaseHistory = snapshot.val();

      if (firebaseHistory) {
        const dailyData = Object.entries(firebaseHistory).map(
          ([date, values]) => {
            let goodCount = 0;
            let badCount = 0;
            let warningCount = 0;

            if (values.good) {
              goodCount = Object.keys(values.good).length;
            }

            if (values.bad) {
              badCount = Object.keys(values.bad).length;
            }

            if (values.warning) {
              warningCount = Object.keys(values.warning).length;
            }

            const total = goodCount + badCount + warningCount;
            if (total === 0) return { date, good: 0, bad: 0, warning: 0 };

            return {
              date,
              good: (goodCount / total) * 100,
              warning: (warningCount / total) * 100,
              bad: (badCount / total) * 100,
            };
          }
        );

        setHistoryData(dailyData);
      } else {
        setHistoryData([]);
      }
    });

    // Cleanup subscriptions
    return () => {
      postureDataUnsubscribe();
      historyUnsubscribe();

      // Clear all notification timeouts
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
      if (notificationDebounceRef.current) {
        clearTimeout(notificationDebounceRef.current);
      }
    };
  }, [
    userUID,
    aggregateDataIntoTimeBlocks,
    hideBadPostureNotification,
    handlePosturePrediction, // Add the debounced handler to dependencies
  ]);

  useEffect(() => {
    if (!userUID) return;

    const calibrationRef = ref(database, `users/${userUID}/calibrated`);
    const unsubscribe = onValue(calibrationRef, (snapshot) => {
      if (snapshot.exists()) {
        // Update local state so the Settings screen will reflect the new calibration status
        setIsCalibrated(snapshot.val() === true);
      }
    });

    return () => {
      off(calibrationRef);
    };
  }, [userUID]);

  // Calculate posture percentages
  useEffect(() => {
    if (data.length === 0) return;

    // 🔧 CHANGED: Filter data to include the selected date's readings instead of just today
    const selectedDateData = data.filter(
      (entry) =>
        entry &&
        entry.hour &&
        entry.hour.getDate() === selectedDate.getDate() &&
        entry.hour.getMonth() === selectedDate.getMonth() &&
        entry.hour.getFullYear() === selectedDate.getFullYear()
    );

    if (selectedDateData.length === 0) {
      setGoodPosturePercentage("0.0");
      setBadPosturePercentage("0.0");
      return;
    }

    let goodCount = 0;
    let badCount = 0;
    let warningCount = 0;

    // 🔧 CHANGED: Use selected date's ML data if available
    const selectedDateMlData = mlData.filter(
      (entry) =>
        entry &&
        entry.hour &&
        entry.hour.getDate() === selectedDate.getDate() &&
        entry.hour.getMonth() === selectedDate.getMonth() &&
        entry.hour.getFullYear() === selectedDate.getFullYear()
    );

    if (selectedDateMlData.length > 0) {
      // Use ML predictions if available
      selectedDateMlData.forEach((entry) => {
        if (entry.prediction === "Good") {
          goodCount++;
        } else if (entry.prediction === "Warning") {
          warningCount++;
        } else if (entry.prediction === "Bad") {
          badCount++;
        }
      });
    } else {
      // Fall back to simple threshold using selected date's data
      selectedDateData.forEach((entry) => {
        if (entry.pitch <= PITCH_GOOD_THRESHOLD) {
          goodCount++;
        } else if (entry.pitch <= PITCH_WARNING_THRESHOLD) {
          warningCount++;
        } else {
          badCount++;
        }
      });
    }

    const total = goodCount + badCount + warningCount;
    if (total === 0) {
      setGoodPosturePercentage("0.0");
      setBadPosturePercentage("0.0");
      return;
    }

    setGoodPosturePercentage(((goodCount / total) * 100).toFixed(1));
    setBadPosturePercentage(
      (((badCount + warningCount) / total) * 100).toFixed(1)
    );
  }, [data, mlData, selectedDate]);

  useEffect(() => {
    if (!userUID) return;

    // Listen for real-time name changes
    const nameRef = ref(database, `users/${userUID}/name`);
    const unsubscribe = onValue(
      nameRef,
      (snapshot) => {
        if (snapshot.exists() && snapshot.val()) {
          const newName = snapshot.val().toString().trim();
          setUserName(newName);
          localStorage.setItem("userName", newName);
        }
      },
      (error) => {
        console.warn("Error listening for name changes:", error);
      }
    );

    return () => off(nameRef, "value", unsubscribe);
  }, [userUID]);

  // Prepare ML feature data for visualization with updated features
  const getMlFeatureData = useCallback(() => {
    if (mlData.length === 0) return null;

    const recentReadings = mlData.slice(-10);

    return {
      labels: recentReadings.map((_, index) => `${index + 1}`),
      datasets: [
        {
          // Mean (pitch)
          data: recentReadings.map((item) => item.mean),
          color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
          strokeWidth: 3,
        },
        {
          // Range (roll)
          data: recentReadings.map((item) => Math.min(item.range, 100)),
          color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
          strokeWidth: 2,
        },
        {
          // Variance (scaled)
          data: recentReadings.map((item) =>
            Math.min(item.variance / 1000, 100)
          ),
          color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`,
          strokeWidth: 2,
        },
        {
          // Angular Velocity (scaled)
          data: recentReadings.map((item) =>
            item.angularVelocity ? Math.min(item.angularVelocity, 50) : 0
          ),
          color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`,
          strokeWidth: 2,
          dashed: true,
        },
        {
          // EWMA
          data: recentReadings.map((item) => item.ewma || 0),
          color: (opacity = 1) => `rgba(128, 0, 128, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  }, [mlData]);

  const getLastUpdateText = () => {
    if (!lastUpdated) return "never"; // Changed from lastUpdate to lastUpdated

    const now = new Date();
    const lastUpdateDate = new Date(lastUpdated); // Changed from lastUpdate to lastUpdated
    const diffMs = now - lastUpdateDate;

    // Check if the date is valid
    if (isNaN(lastUpdateDate.getTime())) {
      return "invalid time";
    }

    // If difference is negative or too large, there's likely an error
    if (diffMs < 0 || diffMs > 24 * 60 * 60 * 1000) {
      // More than 24 hours
      return "long ago";
    }

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffSeconds < 30) {
      return "just now";
    } else if (diffSeconds < 60) {
      return `${diffSeconds}s ago`;
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return "long ago";
    }
  };

  // Get primary feature display name
  const getPrimaryFeatureDisplay = (feature) => {
    const featureDisplayNames = {
      pitch_mean: "Mean Pitch",
      pitch_variance: "Pitch Variance",
      roll_range: "Roll Range",
      angularVelocity: "Angular Velocity",
      ewma: "Trend (EWMA)",
      none: "None",
    };

    return featureDisplayNames[feature] || feature;
  };

  // Format confidence percentage
  const formatConfidence = (confidence) => {
    return (confidence * 100).toFixed(1) + "%";
  };

  // Calculate time since last update
  const lastUpdateText = useMemo(() => {
    if (!lastUpdated) return "No data";

    const now = new Date();
    const diffSeconds = Math.floor((now - lastUpdated) / 1000);

    if (diffSeconds < 60) {
      return `${diffSeconds} seconds ago`;
    } else if (diffSeconds < 3600) {
      return `${Math.floor(diffSeconds / 60)} minutes ago`;
    } else {
      return `${Math.floor(diffSeconds / 3600)} hours ago`;
    }
  }, [lastUpdated]);

  // UI handlers
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setShowQuickLogs(false);
  };

  const handleBarClick = (index) => {
    const clickedData = aggregatedData[index];
    if (!clickedData) return;

    let postureType;
    if (clickedData.value <= PITCH_GOOD_THRESHOLD) {
      postureType = "good";
    } else if (clickedData.value <= PITCH_WARNING_THRESHOLD) {
      postureType = "mild";
    } else {
      postureType = "severe";
    }

    setSelectedPostureData({
      ...clickedData,
      postureType,
    });

    setActiveTab("postureDetail");
  };

  const handleHistoryBarClick = useCallback(
    (index) => {
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);

      const clickedDate = new Date(sevenDaysAgo);
      clickedDate.setDate(sevenDaysAgo.getDate() + index);
      const dateString = clickedDate.toISOString().split("T")[0];
      const isToday = dateString === today.toISOString().split("T")[0];

      // Find existing data for this date
      let dayData = historyData.find((item) => item.date === dateString);

      // If it's today and no historical data exists, calculate from current data
      if (!dayData && isToday && data.length > 0) {
        const todaysData = data.filter(
          (entry) =>
            entry &&
            entry.hour &&
            entry.hour.toISOString().split("T")[0] === dateString
        );

        if (todaysData.length > 0) {
          let goodCount = 0;
          let warningCount = 0;
          let badCount = 0;

          const todaysMlData = mlData.filter(
            (entry) =>
              entry &&
              entry.hour &&
              entry.hour.toISOString().split("T")[0] === dateString
          );

          if (todaysMlData.length > 0) {
            // Use ML predictions
            todaysMlData.forEach((entry) => {
              if (entry.prediction === "Good") goodCount++;
              else if (entry.prediction === "Warning") warningCount++;
              else if (entry.prediction === "Bad") badCount++;
            });
          } else {
            // Fallback to threshold-based calculation
            todaysData.forEach((entry) => {
              if (entry.pitch <= PITCH_GOOD_THRESHOLD) goodCount++;
              else if (entry.pitch <= PITCH_WARNING_THRESHOLD) warningCount++;
              else badCount++;
            });
          }

          const total = goodCount + warningCount + badCount;
          if (total > 0) {
            dayData = {
              date: dateString,
              good: (goodCount / total) * 100,
              warning: (warningCount / total) * 100,
              bad: (badCount / total) * 100,
              dataCount: total,
              isToday: true,
            };
          }
        }
      }

      // If we have data for this day, show detailed view
      if (dayData) {
        // Add additional ML-based insights
        const enhancedData = {
          ...dayData,
          date: dateString,
          formattedDate: formatHistoryDate(dateString),
          isToday: isToday,
          // Calculate ML decision tree insights
          mlInsights: calculateMLInsights(dateString, isToday),
          // Calculate improvement trends
          trendAnalysis: calculateTrendAnalysis(dateString, index),
        };

        setSelectedHistoryData(enhancedData);
        setActiveTab("historyDetail");
      }
    },
    [historyData, data, mlData]
  );

  // Add helper function to format history dates
  const formatHistoryDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    const options = { weekday: "long", month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  // Add function to calculate ML-based insights for the selected day
  const calculateMLInsights = useCallback(
    (dateString, isToday) => {
      let insights = {
        dominantFeature: "none",
        featureDistribution: {},
        confidencePattern: "unknown",
        averageConfidence: 0,
        decisionTreePath: [],
        hourlyBreakdown: {},
        postureTransitions: 0,
        stabilityScore: 0,
        totalReadings: 0,
      };

      // Get ML data for this specific day
      const dayMlData = mlData.filter(
        (entry) =>
          entry &&
          entry.hour &&
          entry.hour.toISOString().split("T")[0] === dateString
      );

      if (dayMlData.length === 0) return insights;

      // Analyze dominant features
      const featureCount = {};
      let totalConfidence = 0;
      let confidenceReadings = 0;
      const hourlyData = {};
      let transitions = 0;
      let lastPrediction = null;

      dayMlData.forEach((entry, index) => {
        // Count primary features
        if (entry.primaryFeature && entry.primaryFeature !== "none") {
          featureCount[entry.primaryFeature] =
            (featureCount[entry.primaryFeature] || 0) + 1;
        }

        // Calculate confidence
        if (entry.confidence && entry.confidence > 0) {
          totalConfidence += entry.confidence;
          confidenceReadings++;
        }

        // Track hourly breakdown
        const hour = entry.hour.getHours();
        if (!hourlyData[hour]) {
          hourlyData[hour] = { good: 0, warning: 0, bad: 0, total: 0 };
        }
        hourlyData[hour][entry.prediction.toLowerCase()]++;
        hourlyData[hour].total++;

        // Count posture transitions
        if (lastPrediction && lastPrediction !== entry.prediction) {
          transitions++;
        }
        lastPrediction = entry.prediction;
      });

      // Determine dominant feature
      const dominantFeature = Object.keys(featureCount).reduce(
        (a, b) => (featureCount[a] > featureCount[b] ? a : b),
        "none"
      );

      // Calculate average confidence
      const avgConfidence =
        confidenceReadings > 0 ? totalConfidence / confidenceReadings : 0;

      // Determine confidence pattern
      let confidencePattern = "stable";
      if (avgConfidence > 0.8) confidencePattern = "high";
      else if (avgConfidence < 0.6) confidencePattern = "low";

      // Calculate stability score (fewer transitions = more stable)
      const stabilityScore = Math.max(
        0,
        100 - (transitions / dayMlData.length) * 100
      );

      return {
        dominantFeature,
        featureDistribution: featureCount,
        confidencePattern,
        averageConfidence: avgConfidence,
        hourlyBreakdown: hourlyData,
        postureTransitions: transitions,
        stabilityScore: Math.round(stabilityScore),
        totalReadings: dayMlData.length,
      };
    },
    [mlData]
  );

  // Add function to calculate trend analysis
  const calculateTrendAnalysis = useCallback(
    (dateString, dayIndex) => {
      const analysis = {
        trend: "stable",
        improvement: 0,
        comparison: "no_data",
        recommendation: "",
      };

      // Find current day data
      const currentDay = historyData.find((item) => item.date === dateString);
      if (!currentDay) return analysis;

      // Compare with previous day if available
      const previousDay = historyData.find((item) => {
        const prevDate = new Date(dateString);
        prevDate.setDate(prevDate.getDate() - 1);
        return item.date === prevDate.toISOString().split("T")[0];
      });

      if (previousDay) {
        analysis.improvement = currentDay.good - previousDay.good;
        analysis.comparison = "previous_day";

        if (analysis.improvement > 5) {
          analysis.trend = "improving";
          analysis.recommendation = "Great progress! Keep up the good work.";
        } else if (analysis.improvement < -5) {
          analysis.trend = "declining";
          analysis.recommendation =
            "Focus on maintaining good posture throughout the day.";
        } else {
          analysis.trend = "stable";
          analysis.recommendation =
            "Consistent performance. Try to improve gradually.";
        }
      }

      // Compare with weekly average
      const weeklyAverage =
        historyData.reduce((sum, day) => sum + day.good, 0) /
        historyData.length;
      const weeklyComparison = currentDay.good - weeklyAverage;

      if (weeklyComparison > 0) {
        analysis.weeklyComparison = `${weeklyComparison.toFixed(
          1
        )}% above weekly average`;
      } else {
        analysis.weeklyComparison = `${Math.abs(weeklyComparison).toFixed(
          1
        )}% below weekly average`;
      }

      return analysis;
    },
    [historyData]
  );

  // Add the HistoryDetail render function
  const renderHistoryDetail = () => (
    <HistoryDetail
      selectedHistoryData={selectedHistoryData}
      onBack={() => {
        setSelectedHistoryData(null);
        setActiveTab("dashboard");
      }}
    />
  );

  const handleRetrainModel = () => {
    if (!userUID) return;

    const retrainRef = ref(database, `users/${userUID}/retrainModel`);
    set(retrainRef, true)
      .then(() => {
        // Use a toast notification instead of alert for better UX
        showToast("Retraining request sent to device");
      })
      .catch((err) => {
        showToast("Error: " + err.message, "error");
      });
  };

  // Simple toast notification function (can be expanded)
  const showToast = (message, type = "success") => {
    // This is a placeholder - in a real app, implement a proper toast notification
    alert(message);
  };

  // NEW: First-time user setup modal component
  const renderFirstTimeModal = () => {
    console.log("Rendering first time modal, visible:", showFirstTimeModal); // Debug log

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFirstTimeModal}
      >
        <View style={styles.firstTimeModalOverlay}>
          <View style={styles.firstTimeModalContent}>
            <ScrollView contentContainerStyle={styles.firstTimeScrollContent}>
              {/* Header */}
              <View style={styles.firstTimeHeader}>
                <Text style={styles.firstTimeTitle}>Welcome to AlignMate!</Text>
                <Text style={styles.firstTimeSubtitle}>
                  Let's set up your posture monitoring
                </Text>
              </View>

              {/* Setup Options */}
              <View style={styles.setupOptionsContainer}>
                {/* Option 1: Default Setup */}
                <TouchableOpacity
                  style={styles.setupOption}
                  onPress={handleDefaultSetup}
                >
                  <View style={styles.setupOptionHeader}>
                    <Image
                      source={{ uri: ICONS.defaultSetup }}
                      style={styles.setupOptionIcon}
                    />
                    <Text style={styles.setupOptionTitle}>
                      Use Default Settings
                    </Text>
                  </View>

                  <Text style={styles.setupOptionDescription}>
                    Start monitoring right away with general posture thresholds.
                    Quick setup, but may be less accurate for your specific
                    posture.
                  </Text>

                  <View style={styles.setupOptionPros}>
                    <Text style={styles.prosConsTitle}>✅ Pros:</Text>
                    <Text style={styles.prosConsText}>
                      • Ready to use immediately
                    </Text>
                    <Text style={styles.prosConsText}>
                      • No calibration needed
                    </Text>
                    <Text style={styles.prosConsText}>
                      • Basic posture detection
                    </Text>
                  </View>

                  <View style={styles.setupOptionCons}>
                    <Text style={styles.prosConsTitle}>⚠️ Limitations:</Text>
                    <Text style={styles.prosConsText}>
                      • May not be perfectly tuned to you
                    </Text>
                    <Text style={styles.prosConsText}>
                      • Less personalized accuracy
                    </Text>
                  </View>

                  <View style={styles.setupOptionFooter}>
                    <Text style={styles.setupOptionFooterText}>
                      You can always calibrate later in Settings
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Option 2: Calibration Setup */}
                <TouchableOpacity
                  style={[styles.setupOption, styles.recommendedOption]}
                  onPress={handleCalibrationSetup}
                >
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>RECOMMENDED</Text>
                  </View>

                  <View style={styles.setupOptionHeader}>
                    <Image
                      source={{ uri: ICONS.calibration }}
                      style={styles.setupOptionIcon}
                    />
                    <Text style={styles.setupOptionTitle}>
                      Calibrate for Me
                    </Text>
                  </View>

                  <Text style={styles.setupOptionDescription}>
                    Take 2 minutes to train the device specifically for your
                    posture patterns. Provides the most accurate and
                    personalized monitoring.
                  </Text>

                  <View style={styles.setupOptionPros}>
                    <Text style={styles.prosConsTitle}>✅ Pros:</Text>
                    <Text style={styles.prosConsText}>
                      • Highly personalized accuracy
                    </Text>
                    <Text style={styles.prosConsText}>
                      • Custom ML model for your posture
                    </Text>
                    <Text style={styles.prosConsText}>
                      • Better detection precision
                    </Text>
                  </View>

                  <View style={styles.setupOptionCons}>
                    <Text style={styles.prosConsTitle}>📋 Requirements:</Text>
                    <Text style={styles.prosConsText}>
                      • 2 minutes calibration time
                    </Text>
                    <Text style={styles.prosConsText}>
                      • Follow 3 simple posture steps
                    </Text>
                  </View>

                  <View style={styles.setupOptionFooter}>
                    <Text style={styles.setupOptionFooterText}>
                      Best choice for accurate posture monitoring
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Bottom Info */}
              <View style={styles.firstTimeFooter}>
                <Text style={styles.firstTimeFooterText}>
                  💡 Both options will get you started with posture monitoring.
                  Choose what works best for you right now!
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Show loading screen while checking user status
  if (isCheckingUserStatus) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text style={styles.loadingText}>
          Setting up your AlignMate experience...
        </Text>
      </View>
    );
  }

  // Dashboard content
  const renderDashboard = () => (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* User Greeting - UPDATED */}
      <Card style={styles.userGreeting}>
        <TouchableOpacity
          onPress={() => setActiveTab("settings")} // Navigate to settings when tapped
          style={styles.userAvatarContainer}
        >
          <Image
            source={{ uri: profilePicture || ICONS.defaultAvatar }}
            style={styles.userAvatar}
          />
        </TouchableOpacity>
        <View style={styles.greetingText}>
          <Text style={styles.greetingName}>{getTimeBasedGreeting()}!</Text>
          {isLoadingUser ? (
            <ActivityIndicator size="small" color={THEME.primary} />
          ) : (
            <Text style={styles.userNameText}>
              {userName || "AlignMate User"}
            </Text>
          )}
        </View>
      </Card>

      {/* Log Alert */}
      {showLogAlert && (
        <TouchableOpacity
          style={styles.logAlertContainer}
          onPress={() => toggleQuickLogs()}
        >
          <View style={styles.logAlertHeader}>
            <View style={styles.logAlertTitleContainer}>
              <Image
                source={{ uri: ICONS.alert }}
                style={styles.logAlertIcon}
              />
              <Text style={styles.logAlertTitle}>
                {recentImportantLogs.length > 1
                  ? `${recentImportantLogs.length} Device Alerts`
                  : "Device Alert"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                setShowLogAlert(false);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Image
                source={{ uri: ICONS.close }}
                style={styles.logAlertCloseIcon}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.logAlertContent}>
            {recentImportantLogs.slice(0, 1).map((log) => (
              <Text key={log.id} style={styles.logAlertMessage}>
                {log.message}
              </Text>
            ))}
            {recentImportantLogs.length > 1 && (
              <Text style={styles.logAlertMore}>
                +{recentImportantLogs.length - 1} more alert
                {recentImportantLogs.length > 2 ? "s" : ""}
              </Text>
            )}
          </View>
          <Text style={styles.logAlertTap}>Tap to view logs</Text>
        </TouchableOpacity>
      )}

      {/* Sensor Status - FIXED */}
      <View style={styles.sensorStatusContainer}>
        <View
          style={[
            styles.sensorStatusIndicator,
            { backgroundColor: sensorConnected ? THEME.primary : THEME.danger },
          ]}
        />
        <Text style={styles.sensorStatusText}>
          Sensor: {sensorConnected ? "Connected" : "Disconnected"}
          {sensorConnected &&
            lastUpdated &&
            ` • Updated ${getLastUpdateText()}`}{" "}
          {/* Changed from lastUpdate to lastUpdated */}
        </Text>
      </View>

      {/* Enhanced Posture Pitch Chart with Navigation */}
      <SectionHeader title="Posture Analysis" />

      {/* Date Navigation Header */}
      <Card style={styles.dateNavigationCard}>
        <View style={styles.dateNavigationContainer}>
          <TouchableOpacity
            style={styles.dateNavButton}
            onPress={goToPreviousDay}
            disabled={false} // Allow going back indefinitely
          >
            <Image source={{ uri: ICONS.back }} style={styles.dateNavIcon} />
            <Text style={styles.dateNavText}>Previous</Text>
          </TouchableOpacity>

          <View style={styles.dateDisplayContainer}>
            <Text style={styles.dateDisplayText}>{formatSelectedDate()}</Text>
            {!isViewingToday && (
              <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
                <Text style={styles.todayButtonText}>Today</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.dateNavButton,
              isViewingToday ? styles.dateNavButtonDisabled : null,
            ]}
            onPress={goToNextDay}
            disabled={isViewingToday}
          >
            <Image
              source={{ uri: ICONS.back }}
              style={[
                styles.dateNavIcon,
                styles.dateNavIconRight,
                isViewingToday ? styles.dateNavIconDisabled : null,
              ]}
            />
          </TouchableOpacity>
        </View>
      </Card>

      {data.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No posture data recorded yet</Text>
          <Text style={styles.noDataSubtext}>
            Data will appear here once your sensor starts sending measurements
          </Text>
        </View>
      ) : !hasDataForSelectedDate() ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            No data for {formatSelectedDate()}
          </Text>
          <Text style={styles.noDataSubtext}>
            {isViewingToday
              ? "Start using your posture sensor to see today's measurements"
              : "Use the navigation above to browse other days with data"}
          </Text>

          {/* Quick navigation to recent days with data */}
          <View style={styles.quickNavContainer}>
            <Text style={styles.quickNavTitle}>
              Jump to recent days with data:
            </Text>
            <View style={styles.quickNavButtons}>
              {(() => {
                const daysWithData = [];
                const today = new Date();

                // Check last 7 days for data
                for (let i = 0; i < 7; i++) {
                  const checkDate = new Date(today);
                  checkDate.setDate(today.getDate() - i);

                  const hasData = data.some(
                    (entry) =>
                      entry &&
                      entry.hour &&
                      entry.hour.getDate() === checkDate.getDate() &&
                      entry.hour.getMonth() === checkDate.getMonth() &&
                      entry.hour.getFullYear() === checkDate.getFullYear()
                  );

                  if (hasData) {
                    daysWithData.push(checkDate);
                  }
                }

                return daysWithData.slice(0, 3).map((date, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickNavButton}
                    onPress={() => {
                      setSelectedDate(date);
                      setIsViewingToday(isDateToday(date));
                    }}
                  >
                    <Text style={styles.quickNavButtonText}>
                      {isDateToday(date)
                        ? "Today"
                        : date.toDateString() ===
                          new Date(Date.now() - 86400000).toDateString()
                        ? "Yesterday"
                        : date.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                    </Text>
                  </TouchableOpacity>
                ));
              })()}
            </View>
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.chartHint}>
            📊 Tap any bar to explore detailed posture insights
          </Text>

          <Animated.View
            style={[
              styles.enhancedChartCard,
              {
                opacity: chartAnimation,
                transform: [
                  {
                    translateY: chartAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Chart Header with Legend */}
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>
                Posture Pitch Angles - {formatSelectedDate()}
              </Text>
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendColor,
                      { backgroundColor: THEME.primary },
                    ]}
                  />
                  <Text style={styles.legendText}>
                    Good (≤{PITCH_GOOD_THRESHOLD}°)
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendColor,
                      { backgroundColor: THEME.warning },
                    ]}
                  />
                  <Text style={styles.legendText}>
                    Warning ({PITCH_GOOD_THRESHOLD}-{PITCH_WARNING_THRESHOLD}°)
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendColor,
                      { backgroundColor: THEME.danger },
                    ]}
                  />
                  <Text style={styles.legendText}>
                    Poor ({PITCH_WARNING_THRESHOLD}°)
                  </Text>
                </View>
              </View>
            </View>

            {/* Enhanced Bar Chart */}
            <View style={styles.chartContainer}>
              <BarChart
                data={{
                  labels: aggregatedData.map((item) => item.label),
                  datasets: [
                    {
                      data: aggregatedData.map((item) => item.value),
                      colors: aggregatedData.map(
                        (item, index) => () =>
                          getPostureBarColor(item.value, 0.8)
                      ),
                    },
                  ],
                }}
                width={CHART_WIDTH}
                height={240}
                chartConfig={{
                  ...getEnhancedChartConfig("bar"),
                  barPercentage: 0.6, // Reduced from 0.7 for better spacing
                  categoryPercentage: 0.8, // Added for better distribution
                  color: (opacity = 1, index) => {
                    if (!aggregatedData[index])
                      return `rgba(92, 163, 119, ${opacity})`;
                    return getPostureBarColor(
                      aggregatedData[index].value,
                      opacity
                    );
                  },
                }}
                style={styles.enhancedChart}
                yAxisLabel=""
                yAxisSuffix="°"
                fromZero={true}
                showValuesOnTopOfBars={true}
                withCustomBarColorFromData={true}
              />

              {/* Interactive overlay for bar clicks - FIXED: Better alignment */}
              <View style={styles.barClickOverlay}>
                {aggregatedData.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.barClickArea,
                      {
                        marginLeft: index === 0 ? 8 : 4,
                        marginRight:
                          index === aggregatedData.length - 1 ? 8 : 4,
                      },
                    ]}
                    onPress={() => handleBarClick(index)}
                    activeOpacity={0.7}
                  />
                ))}
              </View>
            </View>

            {/* Chart Footer with Stats */}
            <View style={styles.chartFooter}>
              <View style={styles.chartStats}>
                <View style={styles.chartStatItem}>
                  <Text style={styles.chartStatLabel}>Avg Angle</Text>
                  <Text style={styles.chartStatValue}>
                    {aggregatedData.length > 0
                      ? (
                          aggregatedData.reduce(
                            (sum, item) => sum + item.value,
                            0
                          ) / aggregatedData.length
                        ).toFixed(1)
                      : "0.0"}
                    °
                  </Text>
                </View>
                <View style={styles.chartStatItem}>
                  <Text style={styles.chartStatLabel}>Best Period</Text>
                  <Text style={styles.chartStatValue}>
                    {aggregatedData.length > 0
                      ? aggregatedData.reduce((min, item) =>
                          item.value < min.value ? item : min
                        ).label
                      : "N/A"}
                  </Text>
                </View>
                <View style={styles.chartStatItem}>
                  <Text style={styles.chartStatLabel}>Data Points</Text>
                  <Text style={styles.chartStatValue}>
                    {aggregatedData.reduce(
                      (sum, item) => sum + item.dataCount,
                      0
                    )}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </>
      )}

      {/* Today's Summary - UPDATED to reflect selected date */}
      <SectionHeader
        title={
          isViewingToday
            ? "Today's Summary"
            : `${formatSelectedDate()}'s Summary`
        }
      />

      <View style={styles.statsContainer}>
        <Card style={[styles.statsBox, { backgroundColor: THEME.primary }]}>
          <Text style={styles.statsLabel}>Good Posture</Text>
          <Text style={styles.statsPercentage}>{goodPosturePercentage}%</Text>
        </Card>
        <Card style={[styles.statsBox, { backgroundColor: THEME.danger }]}>
          <Text style={styles.statsLabel}>Poor Posture</Text>
          <Text style={styles.statsPercentage}>{badPosturePercentage}%</Text>
        </Card>
      </View>

      {/* 🔧 ADDED: Additional summary info for selected date */}
      {!isViewingToday && (
        <Card style={styles.dateContextCard}>
          <View style={styles.dateContextHeader}>
            <Text style={styles.dateContextTitle}>
              📊 {formatSelectedDate()} Overview
            </Text>
          </View>
          <View style={styles.dateContextStats}>
            {(() => {
              const selectedDateData = data.filter(
                (entry) =>
                  entry &&
                  entry.hour &&
                  entry.hour.getDate() === selectedDate.getDate() &&
                  entry.hour.getMonth() === selectedDate.getMonth() &&
                  entry.hour.getFullYear() === selectedDate.getFullYear()
              );

              if (selectedDateData.length === 0) {
                return (
                  <Text style={styles.dateContextNoData}>
                    No posture data recorded for this date
                  </Text>
                );
              }

              const selectedDateMlData = mlData.filter(
                (entry) =>
                  entry &&
                  entry.hour &&
                  entry.hour.getDate() === selectedDate.getDate() &&
                  entry.hour.getMonth() === selectedDate.getMonth() &&
                  entry.hour.getFullYear() === selectedDate.getFullYear()
              );

              const dataCount =
                selectedDateMlData.length > 0
                  ? selectedDateMlData.length
                  : selectedDateData.length;
              const avgAngle =
                selectedDateData.reduce((sum, entry) => sum + entry.pitch, 0) /
                selectedDateData.length;

              return (
                <View style={styles.dateContextDetails}>
                  <View style={styles.dateContextStat}>
                    <Text style={styles.dateContextLabel}>Total Readings:</Text>
                    <Text style={styles.dateContextValue}>{dataCount}</Text>
                  </View>
                  <View style={styles.dateContextStat}>
                    <Text style={styles.dateContextLabel}>Average Angle:</Text>
                    <Text style={styles.dateContextValue}>
                      {avgAngle.toFixed(1)}°
                    </Text>
                  </View>
                  <View style={styles.dateContextStat}>
                    <Text style={styles.dateContextLabel}>Data Quality:</Text>
                    <Text
                      style={[
                        styles.dateContextValue,
                        {
                          color:
                            selectedDateMlData.length > 0
                              ? THEME.primary
                              : THEME.warning,
                        },
                      ]}
                    >
                      {selectedDateMlData.length > 0
                        ? "ML Enhanced"
                        : "Basic Threshold"}
                    </Text>
                  </View>
                </View>
              );
            })()}
          </View>
        </Card>
      )}

      {/* ML Status */}
      {mlData.length > 0 && (
        <Card style={styles.mlStatusContainer}>
          <Text style={styles.cardTitle}>ML Model Status</Text>
          <View style={styles.mlStatusRow}>
            <Text style={styles.mlStatusLabel}>Latest Prediction:</Text>
            <Text
              style={
                latestPrediction === "Good"
                  ? styles.goodText
                  : latestPrediction === "Warning"
                  ? styles.warningText
                  : styles.badText
              }
            >
              {latestPrediction}
              {predictionConfidence > 0 &&
                ` (${formatConfidence(predictionConfidence)})`}
            </Text>
          </View>

          {primaryFeature !== "none" && (
            <View style={styles.mlStatusRow}>
              <Text style={styles.mlStatusLabel}>Primary Feature:</Text>
              <Text style={styles.mlStatusValue}>
                {getPrimaryFeatureDisplay(primaryFeature)}
              </Text>
            </View>
          )}

          {/* Compact ML Actions */}
          <View style={styles.mlActionsContainer}>
            <TouchableOpacity
              style={styles.mlActionButton}
              onPress={() => setShowMlFeatures(!showMlFeatures)}
            >
              <Text style={styles.mlActionButtonText}>
                {showMlFeatures ? "Hide" : "Show"} ML Features
              </Text>
            </TouchableOpacity>

            {treeMetadata && (
              <TouchableOpacity
                style={[styles.mlActionButton, styles.mlActionButtonSecondary]}
                onPress={() => setShowTreeModal(true)}
              >
                <Text style={styles.mlActionButtonTextSecondary}>
                  🧠 AI Brain Info
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>
      )}

      {/* ML Features */}
      {showMlFeatures && mlData.length > 0 && (
        <Card style={styles.mlFeatureContainer}>
          <Text style={[styles.cardTitle, { textAlign: 'center' }]}>ML Features Analysis</Text>
          <Text style={styles.mlFeatureSubtitle}>
            Last 10 readings trend analysis
          </Text>

          <LineChart
            data={getMlFeatureData()}
            width={CHART_WIDTH}
            height={220}
            chartConfig={{
              backgroundColor: THEME.cardBackground,
              backgroundGradientFrom: THEME.cardBackground,
              backgroundGradientTo: THEME.cardBackground,
              backgroundGradientFromOpacity: 1,
              backgroundGradientToOpacity: 1,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(27, 18, 18, ${opacity})`,
              strokeWidth: 2,
              propsForDots: {
                r: "4",
                strokeWidth: "2",
              },
              propsForLabels: {
                fontSize: 11,
                fontWeight: "500",
              },
              style: {
                borderRadius: 12,
              },
              propsForBackgroundLines: {
                strokeDasharray: "",
                stroke: THEME.border,
                strokeWidth: 1,
                strokeOpacity: 0.3,
              },
            }}
            style={styles.enhancedChart}
            bezier
            fromZero={false}
            withDots={true}
            withShadow={false}
            withInnerLines={true}
            withOuterLines={true}
            withHorizontalLabels={true}
            yAxisLabel=""
            yAxisSuffix=""
            hideLegend={true}
            withLegend={false}
            renderLegend={() => null}
          />

          {/* UPDATED: Chart Explanation instead of Feature Importance */}
          <View style={styles.chartExplanationContainer}>
            <Text style={styles.chartExplanationTitle}>
              📊 Understanding Your Posture Data
            </Text>
            <Text style={styles.chartExplanationSubtitle}>
              What each line in the chart tells us about your posture:
            </Text>
            
            <View style={styles.explanationList}>
              <View style={styles.explanationItem}>
                <View style={[styles.explanationDot, { backgroundColor: "rgba(0, 0, 255, 1)" }]} />
                <View style={styles.explanationContent}>
                  <Text style={styles.explanationLabel}>Pitch Mean (Blue)</Text>
                  <Text style={styles.explanationText}>
                    Your forward/backward lean angle. Lower is better - shows how upright you're sitting.
                  </Text>
                </View>
              </View>

              <View style={styles.explanationItem}>
                <View style={[styles.explanationDot, { backgroundColor: "rgba(255, 0, 0, 1)" }]} />
                <View style={styles.explanationContent}>
                  <Text style={styles.explanationLabel}>Roll Range (Red)</Text>
                  <Text style={styles.explanationText}>
                    How much you lean left/right. Steady values mean you're sitting balanced.
                  </Text>
                </View>
              </View>

              <View style={styles.explanationItem}>
                <View style={[styles.explanationDot, { backgroundColor: "rgba(0, 255, 0, 1)" }]} />
                <View style={styles.explanationContent}>
                  <Text style={styles.explanationLabel}>Variance (Green)</Text>
                  <Text style={styles.explanationText}>
                    How much your posture changes. Low variance = stable sitting position.
                  </Text>
                </View>
              </View>

              <View style={styles.explanationItem}>
                <View style={[styles.explanationDot, { backgroundColor: "rgba(255, 165, 0, 1)" }]} />
                <View style={styles.explanationContent}>
                  <Text style={styles.explanationLabel}>Angular Velocity (Orange)</Text>
                  <Text style={styles.explanationText}>
                    How fast you're moving. Spikes show when you adjust your position.
                  </Text>
                </View>
              </View>

              <View style={styles.explanationItem}>
                <View style={[styles.explanationDot, { backgroundColor: "rgba(128, 0, 128, 1)" }]} />
                <View style={styles.explanationContent}>
                  <Text style={styles.explanationLabel}>EWMA Trend (Purple)</Text>
                  <Text style={styles.explanationText}>
                    Smoothed trend line that shows your overall posture direction over time.
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.chartInsightBox}>
              <Text style={styles.chartInsightTitle}>💡 Quick Insight:</Text>
              <Text style={styles.chartInsightText}>
                {(() => {
                  if (mlData.length === 0) return "Start using your sensor to see personalized insights!";
                  
                  const recentData = mlData.slice(-5);
                  const avgPitch = recentData.reduce((sum, item) => sum + (item.mean || 0), 0) / recentData.length;
                  const avgVariance = recentData.reduce((sum, item) => sum + (item.variance || 0), 0) / recentData.length;
                  
                  if (avgPitch <= customThresholds.good && avgVariance < 50) {
                    return "Excellent! You're maintaining steady, upright posture. Keep it up! 🎉";
                  } else if (avgPitch <= customThresholds.warning) {
                    return "Good posture overall. Try to keep that blue line (pitch) as low as possible. 👍";
                  } else if (avgVariance > 100) {
                    return "You're moving around a lot. Try to find a comfortable, stable position. 🪑";
                  } else {
                    return "Focus on reducing that blue line - it shows you're leaning forward. Sit back and straighten up! 💪";
                  }
                })()}
              </Text>
            </View>
          </View>
        </Card>
      )}

      <SectionHeader title="7-Day Posture Trends" />

      {(() => {
        // FIXED: Use different variable name to avoid collision with state
        const currentSelectedDate = new Date(selectedDate);
        const startDate = new Date(currentSelectedDate);
        startDate.setDate(currentSelectedDate.getDate() - 6); // 6 days before selected date

        // Check if we have any data in this 7-day window
        let hasAnyDataInWindow = false;

        for (let i = 0; i < 7; i++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + i);
          const dateString = currentDate.toISOString().split("T")[0];

          // Check if this date has data in historyData
          const hasDataForThisDate = historyData.some(
            (item) => item.date === dateString
          );

          // Check if this date has current data (for any date, not just today)
          const hasCurrentData = data.some(
            (entry) =>
              entry &&
              entry.hour &&
              entry.hour.getDate() === currentDate.getDate() &&
              entry.hour.getMonth() === currentDate.getMonth() &&
              entry.hour.getFullYear() === currentDate.getFullYear()
          );

          if (hasDataForThisDate || hasCurrentData) {
            hasAnyDataInWindow = true;
            break;
          }
        }

        return hasAnyDataInWindow ? (
          <Animated.View
            style={[
              styles.enhancedChartCard,
              {
                opacity: chartAnimation,
                transform: [
                  {
                    scale: chartAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* History Chart Header */}
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>
                7-Day Window: {formatSelectedDate()}
              </Text>
              <Text style={styles.chartSubtitle}>
                Posture trends for the 7 days ending on {formatSelectedDate()}
              </Text>

              {/* Clickable Hint - FIXED: Added proper spacing */}
              <Text style={[styles.chartHint, styles.chartHintWithTopMargin]}>
                📊 Tap any day's bar to see detailed ML insights and trends
              </Text>

              {/* Enhanced Legend */}
              <View style={styles.historyLegendContainer}>
                <View style={styles.historyLegendItem}>
                  <View
                    style={[
                      styles.historyLegendDot,
                      { backgroundColor: THEME.primary },
                    ]}
                  />
                  <Text style={styles.historyLegendText}>Excellent</Text>
                </View>
                <View style={styles.historyLegendItem}>
                  <View
                    style={[
                      styles.historyLegendDot,
                      { backgroundColor: THEME.warning },
                    ]}
                  />
                  <Text style={styles.historyLegendText}>Needs Work</Text>
                </View>
                <View style={styles.historyLegendItem}>
                  <View
                    style={[
                      styles.historyLegendDot,
                      { backgroundColor: THEME.danger },
                    ]}
                  />
                  <Text style={styles.historyLegendText}>Poor</Text>
                </View>
              </View>
            </View>

            {/* Enhanced Chart Container */}
            <View style={styles.historyChartContainer}>
              <StackedBarChart
                data={{
                  labels: (() => {
                    // Show 7 days ending on the selected date
                    const labels = [];
                    for (let i = 0; i < 7; i++) {
                      labels.push(""); // Empty labels - we'll use custom ones below
                    }
                    return labels;
                  })(),
                  legend: ["Excellent", "Needs Work", "Poor"],
                  data: (() => {
                    const chartData = [];
                    const endDate = new Date(currentSelectedDate);
                    const startDate = new Date(endDate);
                    startDate.setDate(endDate.getDate() - 6);

                    // Generate data for 7 days ending on selected date
                    for (let i = 0; i < 7; i++) {
                      const currentDate = new Date(startDate);
                      currentDate.setDate(startDate.getDate() + i);
                      const dateString = currentDate
                        .toISOString()
                        .split("T")[0];

                      // Find existing data for this date
                      const existingData = historyData.find(
                        (item) => item.date === dateString
                      );

                      if (existingData) {
                        // Use actual historical data
                        chartData.push([
                          Math.round(existingData.good),
                          Math.round(existingData.warning || 0),
                          Math.round(existingData.bad),
                        ]);
                      } else {
                        // Check if we have current data for this date
                        const dateData = data.filter(
                          (entry) =>
                            entry &&
                            entry.hour &&
                            entry.hour.getDate() === currentDate.getDate() &&
                            entry.hour.getMonth() === currentDate.getMonth() &&
                            entry.hour.getFullYear() ===
                              currentDate.getFullYear()
                        );

                        if (dateData.length > 0) {
                          // Calculate percentages from current data
                          let goodCount = 0;
                          let warningCount = 0;
                          let badCount = 0;

                          const dateMlData = mlData.filter(
                            (entry) =>
                              entry &&
                              entry.hour &&
                              entry.hour.getDate() === currentDate.getDate() &&
                              entry.hour.getMonth() ===
                                currentDate.getMonth() &&
                              entry.hour.getFullYear() ===
                                currentDate.getFullYear()
                          );

                          if (dateMlData.length > 0) {
                            // Use ML predictions
                            dateMlData.forEach((entry) => {
                              if (entry.prediction === "Good") goodCount++;
                              else if (entry.prediction === "Warning")
                                warningCount++;
                              else if (entry.prediction === "Bad") badCount++;
                            });
                          } else {
                            // Fallback to threshold-based calculation
                            dateData.forEach((entry) => {
                              if (entry.pitch <= PITCH_GOOD_THRESHOLD)
                                goodCount++;
                              else if (entry.pitch <= PITCH_WARNING_THRESHOLD)
                                warningCount++;
                              else badCount++;
                            });
                          }

                          const total = goodCount + warningCount + badCount;
                          if (total > 0) {
                            chartData.push([
                              Math.round((goodCount / total) * 100),
                              Math.round((warningCount / total) * 100),
                              Math.round((badCount / total) * 100),
                            ]);
                          } else {
                            chartData.push([0, 0, 0]);
                          }
                        } else {
                          // No data for this day
                          chartData.push([0, 0, 0]);
                        }
                      }
                    }

                    return chartData;
                  })(),
                  barColors: [
                    THEME.primary, // Good - Green
                    THEME.warning, // Warning - Amber
                    THEME.danger, // Bad - Red
                  ],
                }}
                width={CHART_WIDTH}
                height={220}
                chartConfig={{
                  ...getHistoryChartConfig(),
                  barPercentage: 0.7,
                  categoryPercentage: 1.0,
                }}
                style={styles.historyChart}
                hideLegend={true}
                withHorizontalLabels={false}
                withVerticalLabels={true}
                fromZero={true}
              />

              {/* Interactive overlay for history bar clicks */}
              <View style={styles.historyBarClickOverlay}>
                {Array.from({ length: 7 }, (_, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.historyBarClickArea}
                    onPress={() => {
                      // FIXED: Calculate correct date based on selected date window
                      const endDate = new Date(currentSelectedDate);
                      const clickDate = new Date(endDate);
                      clickDate.setDate(endDate.getDate() - 6 + index);

                      // Navigate to that date
                      setSelectedDate(clickDate);
                      setIsViewingToday(isDateToday(clickDate));

                      // Also show history detail if there's data
                      const dateString = clickDate.toISOString().split("T")[0];
                      const dayData = historyData.find(
                        (item) => item.date === dateString
                      );

                      if (
                        dayData ||
                        (isDateToday(clickDate) && data.length > 0)
                      ) {
                        // Create enhanced data for history detail
                        let enhancedData = dayData;

                        if (
                          !dayData &&
                          isDateToday(clickDate) &&
                          data.length > 0
                        ) {
                          // Calculate today's data if not in history yet
                          const todaysData = data.filter(
                            (entry) =>
                              entry &&
                              entry.hour &&
                              entry.hour.toISOString().split("T")[0] ===
                                dateString
                          );

                          if (todaysData.length > 0) {
                            let goodCount = 0;
                            let warningCount = 0;
                            let badCount = 0;

                            const todaysMlData = mlData.filter(
                              (entry) =>
                                entry &&
                                entry.hour &&
                                entry.hour.toISOString().split("T")[0] ===
                                  dateString
                            );

                            if (todaysMlData.length > 0) {
                              todaysMlData.forEach((entry) => {
                                if (entry.prediction === "Good") goodCount++;
                                else if (entry.prediction === "Warning")
                                  warningCount++;
                                else if (entry.prediction === "Bad") badCount++;
                              });
                            } else {
                              todaysData.forEach((entry) => {
                                if (entry.pitch <= PITCH_GOOD_THRESHOLD)
                                  goodCount++;
                                else if (entry.pitch <= PITCH_WARNING_THRESHOLD)
                                  warningCount++;
                                else badCount++;
                              });
                            }

                            const total = goodCount + warningCount + badCount;
                            if (total > 0) {
                              enhancedData = {
                                date: dateString,
                                good: (goodCount / total) * 100,
                                warning: (warningCount / total) * 100,
                                bad: (badCount / total) * 100,
                                dataCount: total,
                                isToday: true,
                              };
                            }
                          }
                        }

                        if (enhancedData) {
                          setSelectedHistoryData({
                            ...enhancedData,
                            formattedDate: formatHistoryDate(dateString),
                            isToday: isDateToday(clickDate),
                            mlInsights: calculateMLInsights(
                              dateString,
                              isDateToday(clickDate)
                            ),
                            trendAnalysis: calculateTrendAnalysis(
                              dateString,
                              index
                            ),
                          });
                          setActiveTab("historyDetail");
                        }
                      }
                    }}
                    activeOpacity={0.7}
                  />
                ))}
              </View>

              {/* Custom Date Labels - Based on selected date window */}
              <View style={styles.customDateLabels}>
                {(() => {
                  const labels = [];
                  const endDate = new Date(currentSelectedDate);
                  const startDate = new Date(endDate);
                  startDate.setDate(endDate.getDate() - 6);

                  for (let i = 0; i < 7; i++) {
                    const currentDate = new Date(startDate);
                    currentDate.setDate(startDate.getDate() + i);
                    const dateString = currentDate.toISOString().split("T")[0];
                    const isToday = isDateToday(currentDate);
                    const isSelectedDate =
                      currentDate.toDateString() ===
                      selectedDate.toDateString();

                    // Check if this day has data
                    const hasHistoryData = historyData.some(
                      (item) => item.date === dateString
                    );
                    const hasCurrentData = data.some(
                      (entry) =>
                        entry &&
                        entry.hour &&
                        entry.hour.getDate() === currentDate.getDate() &&
                        entry.hour.getMonth() === currentDate.getMonth() &&
                        entry.hour.getFullYear() === currentDate.getFullYear()
                    );
                    const hasData = hasHistoryData || hasCurrentData;

                    labels.push(
                      <TouchableOpacity
                        key={i}
                        onPress={() => {
                          setSelectedDate(currentDate);
                          setIsViewingToday(isToday);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.dateLabel,
                            isToday && styles.todayDateLabel,
                            isSelectedDate && styles.selectedDateLabel, // Highlight selected date
                            !hasData && styles.noDataDateLabel,
                            hasData && styles.clickableDateLabel,
                          ]}
                        >
                          {formatChartDate(dateString, isToday)}
                        </Text>
                      </TouchableOpacity>
                    );
                  }
                  return labels;
                })()}
              </View>
            </View>

            {/* History Chart Footer with Insights for the selected window */}
            <View style={styles.chartFooter}>
              <View style={styles.historyInsights}>
                <Text style={styles.insightsTitle}>📈 Week Insights</Text>
                <View style={styles.insightsList}>
                  {(() => {
                    // Calculate insights for the 7-day window ending on selected date
                    const endDate = new Date(currentSelectedDate);
                    const startDate = new Date(endDate);
                    startDate.setDate(endDate.getDate() - 6);

                    const windowData = [];
                    for (let i = 0; i < 7; i++) {
                      const currentDate = new Date(startDate);
                      currentDate.setDate(startDate.getDate() + i);
                      const dateString = currentDate
                        .toISOString()
                        .split("T")[0];

                      const dayData = historyData.find(
                        (item) => item.date === dateString
                      );
                      if (dayData) {
                        windowData.push(dayData);
                      }
                    }

                    if (windowData.length === 0) {
                      return (
                        <Text style={styles.insightText}>
                          📊 Track more days to see weekly trends and insights
                        </Text>
                      );
                    }

                    if (windowData.length === 1) {
                      return (
                        <Text style={styles.insightText}>
                          🎯 Good start! Track more days to see your progress
                          trends.
                        </Text>
                      );
                    }

                    // Find best and worst days in the window
                    const bestDay = windowData.reduce((best, day) =>
                      day.good > best.good ? day : best
                    );

                    const avgGood =
                      windowData.reduce((sum, day) => sum + day.good, 0) /
                      windowData.length;

                    return (
                      <>
                        <Text style={styles.insightText}>
                          🎯 Best day in window: {formatChartDate(bestDay.date)}
                          ({bestDay.good.toFixed(0)}% good posture)
                        </Text>
                        <Text style={styles.insightText}>
                          📊 Week average: {avgGood.toFixed(1)}% good posture
                        </Text>
                        {windowData.length >= 2 && (
                          <Text style={styles.insightText}>
                            📈 {windowData.length} days tracked in this window
                          </Text>
                        )}
                      </>
                    );
                  })()}
                </View>
              </View>
            </View>
          </Animated.View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No data for this 7-day window</Text>
            <Text style={styles.noDataSubtext}>
              📊 Navigate to dates with posture data to see trends
            </Text>
            <Text style={styles.noDataSubtext}>
              💡 The 7-day window shows the week ending on{" "}
              {formatSelectedDate()}
            </Text>
          </View>
        );
      })()}

      {/* AI Brain Details Modal */}
      {treeMetadata && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showTreeModal}
          onRequestClose={() => setShowTreeModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.treeModalContent}>
              <ScrollView
                style={styles.treeModalScroll}
                contentContainerStyle={styles.treeModalScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Modal Header */}
                <View style={styles.treeModalHeader}>
                  <Text style={styles.treeModalTitle}>🤖 Your AI Brain</Text>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setShowTreeModal(false)}
                  >
                    <Image
                      source={{ uri: ICONS.close }}
                      style={styles.modalCloseIcon}
                    />
                  </TouchableOpacity>
                </View>

                {/* Modal Content */}
                <View style={styles.treeModalBody}>
                  <Text style={styles.treeModalExplanation}>
                    🎯 Your personal AI posture detective! Here's how your smart
                    sensor thinks:
                  </Text>

                  {/* FIXED: Setup Type Indicator using actual setupType */}
                  <View style={styles.setupTypeIndicator}>
                    <Text style={styles.setupTypeTitle}>
                      {setupType === "default"
                        ? "🚀 Default Setup"
                        : "🧠 Calibrated Setup"}
                    </Text>
                    <Text style={styles.setupTypeDescription}>
                      {setupType === "default"
                        ? "Using optimized general posture detection - fast and efficient!"
                        : "Using your personalized AI model - trained specifically for your posture patterns!"}
                    </Text>
                  </View>

                  <View style={styles.treeModalGrid}>
                    <View style={styles.treeModalItem}>
                      <Text style={styles.treeModalLabel}>
                        🌲 Thinking Layers:
                      </Text>
                      <Text style={styles.treeModalValue}>
                        {treeMetadata.actualDepth}
                      </Text>
                      <Text style={styles.treeModalHelp}>
                        {setupType === "default"
                          ? `Quick ${treeMetadata.actualDepth}-step decision process - gets to the answer fast!`
                          : `Deep ${treeMetadata.actualDepth}-step analysis - considers your unique patterns!`}
                      </Text>
                    </View>

                    <View style={styles.treeModalItem}>
                      <Text style={styles.treeModalLabel}>
                        🧠 Decision Points:
                      </Text>
                      <Text style={styles.treeModalValue}>
                        {treeMetadata.totalNodes}
                      </Text>
                      <Text style={styles.treeModalHelp}>
                        {setupType === "default"
                          ? "Streamlined decision making with essential questions only"
                          : `${treeMetadata.totalNodes} sophisticated questions tailored to your posture habits`}
                      </Text>
                    </View>

                    <View style={styles.treeModalItem}>
                      <Text style={styles.treeModalLabel}>
                        🎯 Final Answers:
                      </Text>
                      <Text style={styles.treeModalValue}>
                        {treeMetadata.leafNodes}
                      </Text>
                      <Text style={styles.treeModalHelp}>
                        {setupType === "default"
                          ? "Standard posture categories - Good, Warning, Bad"
                          : `${treeMetadata.leafNodes} personalized posture classifications based on your calibration`}
                      </Text>
                    </View>

                    <View style={styles.treeModalItem}>
                      <Text style={styles.treeModalLabel}>📅 Trained:</Text>
                      <Text style={styles.treeModalValue}>
                        {new Date(
                          treeMetadata.trainingTimestamp * 1000
                        ).toLocaleDateString()}
                      </Text>
                      <Text style={styles.treeModalHelp}>
                        {setupType === "default"
                          ? "When your AI was set up with default settings"
                          : "When your AI learned your personal posture patterns"}
                      </Text>
                    </View>
                  </View>

                  {/* Enhanced AI Decision Process with Setup-Specific Content */}
                  <View style={styles.aiDecisionProcess}>
                    <Text style={styles.aiDecisionTitle}>
                      🔍 How Your AI Makes Decisions:
                    </Text>
                    <Text style={styles.aiDecisionSubtitle}>
                      {setupType === "default"
                        ? "Your default AI uses this streamlined decision process:"
                        : "Your calibrated AI uses this personalized decision process:"}
                    </Text>

                    {/* Setup-specific decision explanations */}
                    {setupType === "default" ? (
                      // DEFAULT SETUP QUESTIONS
                      <View style={styles.decisionQuestions}>
                        <View style={styles.questionStep}>
                          <View style={styles.questionNumber}>
                            <Text style={styles.questionNumberText}>1</Text>
                          </View>
                          <View style={styles.questionContent}>
                            <Text style={styles.questionText}>
                              "Is your forward lean ≤ 8 degrees?"
                            </Text>
                            <Text style={styles.questionExplanation}>
                              🚀 Quick check: If YES → Good posture! If NO →
                              Check severity...
                              {"\n"}💡 Default threshold: 8° is the standard
                              upright posture limit
                            </Text>
                          </View>
                        </View>

                        <View style={styles.questionStep}>
                          <View style={styles.questionNumber}>
                            <Text style={styles.questionNumberText}>2</Text>
                          </View>
                          <View style={styles.questionContent}>
                            <Text style={styles.questionText}>
                              "Is your forward lean ≤ 15 degrees?"
                            </Text>
                            <Text style={styles.questionExplanation}>
                              ⚡ Final decision: Warning vs Bad posture
                              {"\n"}🎯 8-15° = Warning, {">"}15° = Bad posture
                            </Text>
                          </View>
                        </View>

                        {/* Default threshold summary */}
                        <View style={styles.thresholdSummary}>
                          <Text style={styles.thresholdTitle}>
                            📏 Default Angle Thresholds:
                          </Text>
                          <View style={styles.thresholdList}>
                            <Text style={styles.thresholdItem}>
                              🟢 Good Posture: 0° to 8° (upright to slight lean)
                            </Text>
                            <Text style={styles.thresholdItem}>
                              🟡 Warning: 8° to 15° (noticeable forward slouch)
                            </Text>
                            <Text style={styles.thresholdItem}>
                              🔴 Bad Posture: {">"}15° (significant slouching)
                            </Text>
                          </View>
                          <Text style={styles.thresholdNote}>
                            💡 These are general thresholds that work for most
                            people
                          </Text>
                        </View>
                      </View>
                    ) : (
                      // CALIBRATED SETUP QUESTIONS
                      <View style={styles.decisionQuestions}>
                        <View style={styles.questionStep}>
                          <View style={styles.questionNumber}>
                            <Text style={styles.questionNumberText}>1</Text>
                          </View>
                          <View style={styles.questionContent}>
                            <Text style={styles.questionText}>
                              "Is your pitch ≤{" "}
                              {Math.round(customThresholds.good)}° (your good
                              posture baseline)?"
                            </Text>
                            <Text style={styles.questionExplanation}>
                              🎯 Personalized check based on YOUR calibration
                              data
                              {"\n"}📊 Your unique "good posture" threshold:{" "}
                              {Math.round(customThresholds.good)}°
                              {customThresholds.good !== PITCH_GOOD_THRESHOLD &&
                                ` (vs default: ${PITCH_GOOD_THRESHOLD}°)`}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.questionStep}>
                          <View style={styles.questionNumber}>
                            <Text style={styles.questionNumberText}>2</Text>
                          </View>
                          <View style={styles.questionContent}>
                            <Text style={styles.questionText}>
                              "Is your pitch ≤{" "}
                              {Math.round(customThresholds.warning)}° (your
                              warning threshold)?"
                            </Text>
                            <Text style={styles.questionExplanation}>
                              ⚡ Final check: If NO → Poor posture detected
                              {"\n"}🎯 Your warning limit:{" "}
                              {Math.round(customThresholds.warning)}°
                              {customThresholds.warning !==
                                PITCH_WARNING_THRESHOLD &&
                                ` (vs default: ${PITCH_WARNING_THRESHOLD}°)`}
                            </Text>
                          </View>
                        </View>

                        {treeMetadata.actualDepth > 2 && (
                          <View style={styles.questionStep}>
                            <View style={styles.questionNumber}>
                              <Text style={styles.questionNumberText}>3+</Text>
                            </View>
                            <View style={styles.questionContent}>
                              <Text style={styles.questionText}>
                                "Advanced multi-factor personal analysis..."
                              </Text>
                              <Text style={styles.questionExplanation}>
                                🧠 Uses {treeMetadata.actualDepth} levels of
                                analysis specific to YOUR posture patterns
                                {"\n"}🔬 Considers roll (side tilt), variance,
                                movement patterns, and stability
                              </Text>
                            </View>
                          </View>
                        )}

                        {/* Calibrated threshold summary with ACTUAL user's thresholds */}
                        <View style={styles.thresholdSummary}>
                          <Text style={styles.thresholdTitle}>
                            🎯 Your Personal Thresholds:
                          </Text>
                          <View style={styles.thresholdList}>
                            <Text style={styles.thresholdItem}>
                              🟢 Your Good Posture: 0° to{" "}
                              {Math.round(customThresholds.good)}° (your
                              personal upright range)
                            </Text>
                            <Text style={styles.thresholdItem}>
                              🟡 Your Warning Zone:{" "}
                              {Math.round(customThresholds.good)}° to{" "}
                              {Math.round(customThresholds.warning)}° (when you
                              start slouching)
                            </Text>
                            <Text style={styles.thresholdItem}>
                              🔴 Your Poor Posture: {">"}
                              {Math.round(customThresholds.warning)}°
                              (significant deviation from your baseline)
                            </Text>
                          </View>
                          <Text style={styles.thresholdNote}>
                            ✨ These thresholds were learned from YOUR
                            calibration session!
                          </Text>

                          {/* Show comparison with default thresholds */}
                          <View style={styles.thresholdComparison}>
                            <Text style={styles.thresholdComparisonTitle}>
                              📊 vs Default Thresholds:
                            </Text>
                            <Text style={styles.thresholdComparisonText}>
                              Your Good: {Math.round(customThresholds.good)}° vs
                              Default: {PITCH_GOOD_THRESHOLD}°
                              {customThresholds.good !== PITCH_GOOD_THRESHOLD &&
                                ` (${
                                  customThresholds.good > PITCH_GOOD_THRESHOLD
                                    ? "+"
                                    : ""
                                }${Math.round(
                                  customThresholds.good - PITCH_GOOD_THRESHOLD
                                )}°)`}
                            </Text>
                            <Text style={styles.thresholdComparisonText}>
                              Your Warning:{" "}
                              {Math.round(customThresholds.warning)}° vs
                              Default: {PITCH_WARNING_THRESHOLD}°
                              {customThresholds.warning !==
                                PITCH_WARNING_THRESHOLD &&
                                ` (${
                                  customThresholds.warning >
                                  PITCH_WARNING_THRESHOLD
                                    ? "+"
                                    : ""
                                }${Math.round(
                                  customThresholds.warning -
                                    PITCH_WARNING_THRESHOLD
                                )}°)`}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Real-time example with setup-specific interpretation */}
                    <View style={styles.realTimeExample}>
                      <Text style={styles.realTimeTitle}>
                        📊 Latest AI Decision:
                      </Text>
                      <Text style={styles.realTimeSubtitle}>
                        Here's what your{" "}
                        {setupType === "default" ? "default" : "calibrated"} AI
                        just decided:
                      </Text>

                      <View style={styles.latestDecision}>
                        <View style={styles.decisionItem}>
                          <Text style={styles.decisionLabel}>
                            {setupType === "default"
                              ? "Quick Check:"
                              : "Personal Analysis:"}
                          </Text>
                          <Text style={styles.decisionAnswer}>
                            {setupType === "default"
                              ? `Forward lean: ${
                                  mlData.length > 0
                                    ? Math.round(
                                        mlData[mlData.length - 1]?.mean
                                      ) || "N/A"
                                    : "N/A"
                                }° - ${
                                  mlData.length > 0 &&
                                  mlData[mlData.length - 1]?.mean <= 8
                                    ? " ✅ Within 8° limit!"
                                    : " ❌ Above 8° threshold"
                                }`
                              : `Posture angle: ${
                                  mlData.length > 0
                                    ? Math.round(
                                        mlData[mlData.length - 1]?.mean
                                      ) || "N/A"
                                    : "N/A"
                                }° - ${(() => {
                                  if (mlData.length === 0)
                                    return "❌ Analyzing...";
                                  const currentAngle =
                                    mlData[mlData.length - 1]?.mean || 0;
                                  if (currentAngle <= customThresholds.good)
                                    return `✅ Within your ${Math.round(
                                      customThresholds.good
                                    )}° good range!`;
                                  if (currentAngle <= customThresholds.warning)
                                    return `⚠️ In your warning zone (${Math.round(
                                      customThresholds.good
                                    )}-${Math.round(
                                      customThresholds.warning
                                    )}°)`;
                                  return `❌ Above your ${Math.round(
                                    customThresholds.warning
                                  )}° threshold`;
                                })()}`}
                          </Text>
                        </View>

                        <View style={styles.decisionItem}>
                          <Text style={styles.decisionLabel}>
                            Final Answer:
                          </Text>
                          <Text
                            style={[
                              styles.decisionFinal,
                              latestPrediction === "Good"
                                ? styles.goodDecision
                                : latestPrediction === "Warning"
                                ? styles.warningDecision
                                : styles.badDecision,
                            ]}
                          >
                            "{latestPrediction} Posture"
                            {predictionConfidence > 0 &&
                              ` (${(predictionConfidence * 100).toFixed(
                                0
                              )}% confident)`}
                          </Text>
                        </View>

                        <View style={styles.decisionItem}>
                          <Text style={styles.decisionLabel}>
                            {setupType === "default"
                              ? "Key Threshold:"
                              : "Key Factor:"}
                          </Text>
                          <Text style={styles.decisionAnswer}>
                            {setupType === "default"
                              ? "Standard angle thresholds (8°/15°)"
                              : primaryFeature !== "none"
                              ? getPrimaryFeatureDisplay(primaryFeature)
                              : "Your personalized patterns"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Setup-specific Fun Facts */}
                  <View style={styles.treeModalFunFacts}>
                    <Text style={styles.treeModalFunTitle}>
                      {setupType === "default"
                        ? "⚡ Default Setup Benefits:"
                        : "🎯 Calibration Benefits:"}
                    </Text>
                    <View style={styles.treeModalFunList}>
                      {setupType === "default" ? (
                        <>
                          <Text style={styles.treeModalFunFact}>
                            🚀 Lightning-fast decisions - perfect for immediate
                            posture monitoring!
                          </Text>
                          <Text style={styles.treeModalFunFact}>
                            ⚡ Uses proven 8°/15° thresholds that work for most
                            people
                          </Text>
                          <Text style={styles.treeModalFunFact}>
                            📊 Simple but effective - focuses on forward
                            slouching detection
                          </Text>
                          <Text style={styles.treeModalFunFact}>
                            🔧 Can upgrade to calibrated mode anytime in
                            Settings!
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text style={styles.treeModalFunFact}>
                            🎯 Your AI uses YOUR calibrated thresholds:{" "}
                            {Math.round(customThresholds.good)}°/
                            {Math.round(customThresholds.warning)}° vs default{" "}
                            {PITCH_GOOD_THRESHOLD}°/{PITCH_WARNING_THRESHOLD}°!
                          </Text>
                          <Text style={styles.treeModalFunFact}>
                            🧠 Uses {treeMetadata.leafNodes} different ways to
                            classify YOUR unique posture patterns
                          </Text>
                          <Text style={styles.treeModalFunFact}>
                            📈 Adapts to your specific sitting habits and body
                            mechanics
                          </Text>
                          <Text style={styles.treeModalFunFact}>
                            🔬 Considers multiple factors: pitch, roll,
                            variance, movement patterns!
                          </Text>
                        </>
                      )}
                    </View>
                  </View>

                  {/* Enhanced Performance Insight */}
                  <View style={styles.treeModalPerformance}>
                    <Text style={styles.treeModalPerformanceTitle}>
                      ⚡ Performance Analysis:
                    </Text>
                    <Text style={styles.treeModalPerformanceDesc}>
                      {(() => {
                        const efficiency = Math.round(
                          (treeMetadata.leafNodes / treeMetadata.totalNodes) *
                            100
                        );
                        const complexity = treeMetadata.actualDepth;

                        if (setupType === "default") {
                          return "🚀 Default Mode: Ultra-fast decisions with proven accuracy for general posture detection!";
                        } else if (efficiency > 60 && complexity <= 5) {
                          return "⚖️ Calibrated Mode: Optimally balanced for your personal posture patterns!";
                        } else if (complexity > 5) {
                          return "🧠 Advanced Calibrated Mode: Deep analysis customized for your unique sitting style!";
                        } else {
                          return "🎯 Precision Calibrated Mode: Fine-tuned specifically for your posture habits!";
                        }
                      })()}
                    </Text>
                    <Text style={styles.performanceStats}>
                      📈 Decision efficiency:{" "}
                      {Math.round(
                        (treeMetadata.leafNodes / treeMetadata.totalNodes) * 100
                      )}
                      %{"\n"}⏱️ Average questions asked:{" "}
                      {Math.round(treeMetadata.actualDepth * 0.75)} out of{" "}
                      {treeMetadata.actualDepth}
                      {"\n"}🎯 Setup type:{" "}
                      {setupType === "default"
                        ? "Default (General)"
                        : "Calibrated (Personal)"}
                      {setupType === "calibration" &&
                        `\n🔧 Your thresholds: Good ≤${Math.round(
                          customThresholds.good
                        )}°, Warning ≤${Math.round(customThresholds.warning)}°`}
                    </Text>
                  </View>

                  {/* Close Button */}
                  <TouchableOpacity
                    style={styles.treeModalCloseButton}
                    onPress={() => setShowTreeModal(false)}
                  >
                    <Text style={styles.treeModalCloseButtonText}>
                      Got it! 👍
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Quick Logs */}
      {showQuickLogs && (
        <Card style={styles.quickLogsContainer}>
          <View style={styles.quickLogsHeader}>
            <Text style={styles.cardTitle}>Device Logs</Text>
            <TouchableOpacity
              onPress={toggleQuickLogs}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Image source={{ uri: ICONS.close }} style={styles.closeIcon} />
            </TouchableOpacity>
          </View>
          <LogViewer userUID={userUID} visible={true} maxLogs={6} />
          <Text style={styles.quickLogsHint}>
            See more logs in Settings → Device Logs
          </Text>
        </Card>
      )}

      {/* Footer padding */}
      <View style={styles.footerPadding} />
    </ScrollView>
  );

  // Settings Tab content
  const renderSettings = () => (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.pageTitleContainer}>
  <Text style={styles.pageTitle}>Settings</Text>
</View>

      {/* Profile Section - SIMPLIFIED */}
      <Card style={styles.profileSection}>
        <TouchableOpacity
          style={styles.profileClickArea}
          onPress={() => setShowProfileModal(true)}
        >
          <Image
            source={{ uri: profilePicture || ICONS.defaultAvatar }}
            style={styles.profileAvatar}
          />
          <View style={styles.profileOverlay}>
            <Image
              source={{ uri: ICONS.settings }}
              style={styles.profileEditIcon}
            />
          </View>
        </TouchableOpacity>

        {/* Name Section */}
        {isEditingName ? (
          <View style={styles.nameEditContainer}>
            <input
              type="text"
              style={styles.nameInput}
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              placeholder="Enter your name"
              maxLength={50}
              autoFocus={true}
            />
            <View style={styles.nameEditButtons}>
              <TouchableOpacity
                style={styles.nameEditButton}
                onPress={handleCancelNameEdit}
                disabled={isSavingName}
              >
                <Text style={styles.nameEditButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.nameEditButton, styles.nameEditButtonSave]}
                onPress={handleSaveName}
                disabled={isSavingName || !editedName.trim()}
              >
                {isSavingName ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.nameEditButtonTextSave}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.nameDisplayContainer}>
            <Text style={styles.profileName}>
              {userName || "AlignMate User"}
            </Text>
            <TouchableOpacity
              style={styles.editNameButton}
              onPress={handleEditName}
            >
              <Image
                source={{ uri: ICONS.settings }}
                style={styles.editNameIcon}
              />
              <Text style={styles.editNameText}>Edit Name</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>

      {/* Device Calibration */}
      <Card style={styles.settingsCard}>
        <Text style={styles.settingsCardTitle}>Device Calibration</Text>
        <View style={styles.calibrationStatus}>
          <Text style={styles.settingsText}>Status: </Text>
          <Text
            style={{
              color: isCalibrated ? THEME.primary : THEME.danger,
              fontWeight: "bold",
            }}
          >
            {isCalibrated ? "Calibrated" : "Not Calibrated"}
          </Text>
        </View>

        <Text style={styles.settingsDescription}>
          {isCalibrated
            ? "You can recalibrate if you need to adjust settings."
            : "Please calibrate your device for accurate posture detection."}
        </Text>

        <View style={styles.calibrationButtonContainer}>
          <Calibration />
        </View>
      </Card>

      {/* Device Logs */}
      <Card style={styles.settingsCard}>
        <Text style={styles.settingsCardTitle}>Device Logs</Text>
        <Text style={styles.settingsDescription}>
          View real-time logs from your device for troubleshooting and
          monitoring.
        </Text>

        <Button
          title={showDeviceLogs ? "Hide Device Logs" : "Show Device Logs"}
          type="secondary"
          onPress={() => setShowDeviceLogs(!showDeviceLogs)}
          style={styles.settingsButton}
        />

        {showDeviceLogs && (
          <View style={styles.logViewerContainer}>
            <LogViewer userUID={userUID} visible={true} maxLogs={10} />
          </View>
        )}
      </Card>

      {/* ML Model */}
      <Card style={styles.settingsCard}>
        <Text style={styles.settingsCardTitle}>Machine Learning Model</Text>
        <Text style={styles.settingsDescription}>
          Your device is using an enhanced ML model to detect posture with high
          accuracy.
        </Text>

        <Button
          title="Retrain ML Model"
          type="primary"
          onPress={handleRetrainModel}
          style={styles.settingsButton}
        />
      </Card>

      {/* Research Section */}
      <Card style={styles.settingsCard}>
        <Text style={styles.settingsCardTitle}>Research & Support</Text>
        <Text style={styles.settingsDescription}>
          Help us improve AlignMate by sharing your experience, suggestions, or
          reporting issues.
        </Text>

        <Button
          title="Answer Research Questions"
          type="primary"
          icon={ICONS.feedback}
          onPress={() => setShowResearchForm(true)}
          style={styles.settingsButton}
        />
      </Card>

      {/* Contact Us Section */}
      <Card style={styles.settingsCard}>
        <Text style={styles.settingsCardTitle}>Contact & Support</Text>
        <Text style={styles.settingsDescription}>
          Need help? Have questions? Found a bug? We're here to help you get the
          most out of AlignMate.
        </Text>

        <Button
          title="Contact Support"
          type="primary"
          icon={ICONS.email}
          onPress={() => setShowContactModal(true)}
          style={styles.settingsButton}
        />
      </Card>

      {/* Logout */}
      <View style={styles.logoutContainer}>
        <Logout />
      </View>

      {/* Footer padding */}
      <View style={styles.footerPadding} />

      {/* Profile Picture Modal */}
      <ProfilePictureModal />
    </ScrollView>
  );

  // Achievements Tab content
  const renderAchievements = () => (
    <Achievements
      onBack={() => handleTabChange("dashboard")}
      achievementsData={achievementsData}
      userUID={userUID}
    />
  );

  // Posture Detail content
  const renderPostureDetail = () => (
    <PostureDetail
      selectedPostureData={selectedPostureData}
      onBack={() => handleTabChange("dashboard")}
    />
  );

  return (
    <Animated.View style={[styles.mainContainer, { opacity: fadeAnim }]}>
      {/* First-time user setup modal */}
      {renderFirstTimeModal()}

      {showNotification && (
        <PostureNotification
          isVisible={showNotification}
          postureState={latestPrediction} // Add this missing prop
          userUID={userUID} // Add this missing prop
          onDismiss={dismissNotification}
        />
      )}

      {/* Main Content */}
      {activeTab === "dashboard" && renderDashboard()}
      {activeTab === "settings" && renderSettings()}
      {activeTab === "achievements" && renderAchievements()}
      {activeTab === "postureDetail" && renderPostureDetail()}
      {activeTab === "historyDetail" && renderHistoryDetail()}

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.footerButton,
            activeTab === "dashboard" ? styles.activeFooterButton : null,
          ]}
          onPress={() => handleTabChange("dashboard")}
          accessibilityRole="button"
          accessibilityLabel="Dashboard"
        >
          <Image
            source={{ uri: ICONS.home }}
            style={[
              styles.footerIcon,
              activeTab === "dashboard" ? styles.activeFooterIcon : null,
            ]}
          />
          <Text
            style={[
              styles.footerButtonText,
              activeTab === "dashboard" ? styles.activeFooterButtonText : null,
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.footerButton,
            activeTab === "achievements" ? styles.activeFooterButton : null,
          ]}
          onPress={() => handleTabChange("achievements")}
          accessibilityRole="button"
          accessibilityLabel="Achievements"
        >
          <Image
            source={{ uri: ICONS.achievement }}
            style={[
              styles.footerIcon,
              activeTab === "achievements" ? styles.activeFooterIcon : null,
            ]}
          />
          <Text
            style={[
              styles.footerButtonText,
              activeTab === "achievements"
                ? styles.activeFooterButtonText
                : null,
            ]}
          >
            Achievements
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.footerButton,
            activeTab === "settings" ? styles.activeFooterButton : null,
          ]}
          onPress={() => handleTabChange("settings")}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Image
            source={{ uri: ICONS.settings }}
            style={[
              styles.footerIcon,
              activeTab === "settings" ? styles.activeFooterIcon : null,
            ]}
          />
          <Text
            style={[
              styles.footerButtonText,
              activeTab === "settings" ? styles.activeFooterButtonText : null,
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Research Form Modal */}
      <ResearchForm
        isVisible={showResearchForm}
        onClose={() => setShowResearchForm(false)}
        userUID={userUID}
        userName={userName}
      />

      {/* Contact Us Modal */}
      <ContactUs
        isVisible={showContactModal}
        onClose={() => setShowContactModal(false)}
        userUID={userUID}
        userName={userName}
        isModal={true}
      />
    </Animated.View>
  );
};

export default PostureGraph;
