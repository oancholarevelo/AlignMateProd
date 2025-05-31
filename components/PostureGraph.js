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
  const [notificationTimeout, setNotificationTimeout] = useState(null);
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

  // Animate component on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // NEW: Check if user is new and needs setup
  const checkUserSetupStatus = useCallback(async () => {
    if (!userUID) {
      setIsCheckingUserStatus(false);
      return;
    }

    try {
      console.log("Checking user setup status for:", userUID);

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
          treeCount: Math.floor((data.points || 0) / 50),
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
        treeCount: Math.floor(newPoints / 50),
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

      // Check if data is fresh (within 3 minutes)
      const now = Date.now();
      const dataTime = parseInt(timestamp) * 1000;
      if (now - dataTime > 180000) return; // Skip stale data

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
    (latestPredictionValue, latestConfidence) => {
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
    [showBadPostureNotification, hideBadPostureNotification]
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
      backgroundColor: THEME.cardBackground, // Use white background
      backgroundGradientFrom: THEME.cardBackground, // White
      backgroundGradientFromOpacity: 1,
      backgroundGradientTo: THEME.cardBackground, // Same white to prevent gradient
      backgroundGradientToOpacity: 1,
      fillShadowGradientFromOpacity: 0.8,
      fillShadowGradientTo: THEME.primary,
      fillShadowGradientToOpacity: 0.1,
      color: (opacity = 1) => `rgba(92, 163, 119, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(27, 18, 18, ${opacity})`,
      strokeWidth: 3,
      barPercentage: 0.7,
      useShadowColorFromDataset: false,
      decimalPlaces: 1,
      propsForLabels: {
        fontSize: 12,
        fontWeight: "600",
        rotation: 0,
      },
      propsForVerticalLabels: {
        fontSize: 11,
        fontWeight: "500",
      },
      propsForHorizontalLabels: {
        fontSize: 11,
        fontWeight: "500",
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
      console.log("UserUID found, checking setup status:", userUID); // Debug log
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

    console.log(`Fetching data for user: ${userUID}`);
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
            console.log(`Checking path: ${path}`);
            const nameRef = ref(database, path);
            const snapshot = await get(nameRef);

            if (snapshot.exists() && snapshot.val()) {
              foundName = snapshot.val().toString().trim();
              console.log(`Found name at ${path}: ${foundName}`);
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
          console.log(`User name successfully loaded: ${foundName}`);
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

        // IMPROVED: Better notification logic
        if (latestPredictionValue) {
          setLatestPrediction(latestPredictionValue);
          setPredictionConfidence(latestConfidence);
          setPrimaryFeature(latestPrimaryFeature);

          // Use debounced notification handler
          handlePosturePrediction(latestPredictionValue, latestConfidence);
        } else if (processedData.length > 0) {
          // Fallback to simple threshold when no ML data is available
          const latestReading = processedData[processedData.length - 1];

          if (latestReading.pitch > PITCH_BAD_THRESHOLD) {
            setLatestPrediction("Bad");
            handlePosturePrediction("Bad", 0.8);
          } else if (latestReading.pitch > PITCH_WARNING_THRESHOLD) {
            setLatestPrediction("Warning");
            handlePosturePrediction("Warning", 0.6);
          } else {
            setLatestPrediction("Good");
            handlePosturePrediction("Good", 0.9);
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

    // FIXED: Filter data to only include today's readings
    const todaysData = data.filter(
      (entry) => entry && entry.hour && isToday(entry.hour)
    );

    if (todaysData.length === 0) {
      setGoodPosturePercentage("0.0");
      setBadPosturePercentage("0.0");
      return;
    }

    let goodCount = 0;
    let badCount = 0;
    let warningCount = 0;

    // Use today's ML data if available
    const todaysMlData = mlData.filter(
      (entry) => entry && entry.hour && isToday(entry.hour)
    );

    if (todaysMlData.length > 0) {
      // Use ML predictions if available
      todaysMlData.forEach((entry) => {
        if (entry.prediction === "Good") {
          goodCount++;
        } else if (entry.prediction === "Warning") {
          warningCount++;
        } else if (entry.prediction === "Bad") {
          badCount++;
        }
      });
    } else {
      // Fall back to simple threshold using today's data
      todaysData.forEach((entry) => {
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
  }, [data, mlData]); // Keep the same dependencies

  useEffect(() => {
    if (!userUID) return;

    // Listen for real-time name changes
    const nameRef = ref(database, `users/${userUID}/name`);
    const unsubscribe = onValue(
      nameRef,
      (snapshot) => {
        if (snapshot.exists() && snapshot.val()) {
          const newName = snapshot.val().toString().trim();
          console.log("Name updated in real-time:", newName);
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
      legend: [
        "Pitch Mean",
        "Roll Range",
        "Variance/1000",
        "Angular Velocity",
        "EWMA",
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

              {/* Interactive overlay for bar clicks */}
              <View style={styles.barClickOverlay}>
                {aggregatedData.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.barClickArea}
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

      {/* Today's Summary */}
      <SectionHeader title="Today's Summary" />

      <View style={styles.statsContainer}>
        <Card style={[styles.statsBox, { backgroundColor: THEME.primary }]}>
          <Text style={styles.statsLabel}>Good Posture</Text>
          <Text style={styles.statsPercentage}>{goodPosturePercentage}%</Text>
        </Card>
        <Card style={[styles.statsBox, { backgroundColor: THEME.danger }]}>
          <Text style={styles.statsLabel}>Bad Posture</Text>
          <Text style={styles.statsPercentage}>{badPosturePercentage}%</Text>
        </Card>
      </View>

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

          <Button
            title={showMlFeatures ? "Hide ML Features" : "Show ML Features"}
            type="secondary"
            onPress={() => setShowMlFeatures(!showMlFeatures)}
            style={styles.mlToggleButton}
          />
        </Card>
      )}

      {/* ML Features */}
      {showMlFeatures && mlData.length > 0 && (
        <Card style={styles.mlFeatureContainer}>
          <Text style={styles.cardTitle}>ML Features Analysis</Text>
          <Text style={styles.mlFeatureSubtitle}>
            Last 10 readings trend analysis
          </Text>

          {/* Custom Legend */}
          <View style={styles.mlFeatureLegend}>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: "rgba(0, 0, 255, 1)" },
                  ]}
                />
                <Text style={styles.legendLabel}>Pitch Mean</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: "rgba(255, 0, 0, 1)" },
                  ]}
                />
                <Text style={styles.legendLabel}>Roll Range</Text>
              </View>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: "rgba(0, 255, 0, 1)" },
                  ]}
                />
                <Text style={styles.legendLabel}>Variance/1000</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: "rgba(255, 165, 0, 1)" },
                  ]}
                />
                <Text style={styles.legendLabel}>Angular Velocity</Text>
              </View>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: "rgba(128, 0, 128, 1)" },
                  ]}
                />
                <Text style={styles.legendLabel}>EWMA Trend</Text>
              </View>
            </View>
          </View>

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
            withLegend={false} // Additional property to hide legend
            renderLegend={() => null} // Force no legend rendering
          />

          {/* Feature Importance Section */}
          <View style={styles.featureImportanceContainer}>
            <Text style={styles.featureImportanceTitle}>
              🎯 Feature Importance in ML Model
            </Text>
            <Text style={styles.featureImportanceSubtitle}>
              How much each feature influences posture classification
            </Text>
            <View style={styles.featureImportanceBars}>
              {Object.entries(featureImportance).map(([feature, value]) => (
                <View key={feature} style={styles.featureBar}>
                  <Text style={styles.featureBarLabel}>
                    {getPrimaryFeatureDisplay(feature)}
                  </Text>
                  <View style={styles.featureBarContainer}>
                    <View style={styles.featureBarOuter}>
                      <View
                        style={[styles.featureBarInner, { width: `${value}%` }]}
                      />
                    </View>
                    <Text style={styles.featureBarValue}>{value}%</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Card>
      )}

      {/* Decision Tree Details */}
      {treeMetadata && (
        <Card style={styles.treeMetadataContainer}>
          <Text style={styles.cardTitle}>Decision Tree Details</Text>
          <View style={styles.treeMetadataGrid}>
            <View style={styles.treeMetadataItem}>
              <Text style={styles.treeMetadataLabel}>Tree Depth:</Text>
              <Text style={styles.treeMetadataValue}>
                {treeMetadata.actualDepth}/{treeMetadata.maxDepth}
              </Text>
            </View>
            <View style={styles.treeMetadataItem}>
              <Text style={styles.treeMetadataLabel}>Total Nodes:</Text>
              <Text style={styles.treeMetadataValue}>
                {treeMetadata.totalNodes}
              </Text>
            </View>
            <View style={styles.treeMetadataItem}>
              <Text style={styles.treeMetadataLabel}>Leaf Nodes:</Text>
              <Text style={styles.treeMetadataValue}>
                {treeMetadata.leafNodes}
              </Text>
            </View>
            <View style={styles.treeMetadataItem}>
              <Text style={styles.treeMetadataLabel}>Training Date:</Text>
              <Text style={styles.treeMetadataValue}>
                {new Date(
                  treeMetadata.trainingTimestamp * 1000
                ).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </Card>
      )}

      <SectionHeader title="7-Day Posture Trends" />

      {(() => {
        // FIXED: More comprehensive check for displaying the chart
        const hasHistoricalData = historyData.length > 0;
        const hasTodaysData = data.length > 0;

        // Create the 7-day dataset to check if we have any meaningful data
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6);

        let hasAnyDataInLast7Days = false;

        // Check if we have data for any of the last 7 days
        for (let i = 0; i < 7; i++) {
          const currentDate = new Date(sevenDaysAgo);
          currentDate.setDate(sevenDaysAgo.getDate() + i);
          const dateString = currentDate.toISOString().split("T")[0];

          // Check if this date has data in historyData
          const hasDataForThisDate = historyData.some(
            (item) => item.date === dateString
          );

          // Check if this date is today and has current data
          const isToday = dateString === today.toISOString().split("T")[0];
          const todayHasData = isToday && hasTodaysData;

          if (hasDataForThisDate || todayHasData) {
            hasAnyDataInLast7Days = true;
            break;
          }
        }

        // Show chart if we have any data in the last 7 days OR historical data
        const shouldShowChart = hasAnyDataInLast7Days || hasHistoricalData;

        return shouldShowChart ? (
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
              <Text style={styles.chartTitle}>Weekly Progress Overview</Text>
              <Text style={styles.chartSubtitle}>
                Track your posture improvement over time
              </Text>

              {/* Clickable Hint */}
              <Text style={styles.chartHint}>
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
                    // Always show all 7 days to ensure proper left alignment
                    const today = new Date();
                    const sevenDaysAgo = new Date(today);
                    sevenDaysAgo.setDate(today.getDate() - 6);

                    const labels = [];
                    for (let i = 0; i < 7; i++) {
                      labels.push(""); // Empty labels - we'll use custom ones below
                    }
                    return labels;
                  })(),
                  legend: ["Excellent", "Needs Work", "Poor"],
                  data: (() => {
                    const chartData = [];
                    const today = new Date();
                    const sevenDaysAgo = new Date(today);
                    sevenDaysAgo.setDate(today.getDate() - 6);

                    // Always generate all 7 days to maintain left alignment
                    for (let i = 0; i < 7; i++) {
                      const currentDate = new Date(sevenDaysAgo);
                      currentDate.setDate(sevenDaysAgo.getDate() + i);
                      const dateString = currentDate
                        .toISOString()
                        .split("T")[0];
                      const isToday =
                        dateString === today.toISOString().split("T")[0];

                      // Find existing data for this date
                      const existingData = historyData.find(
                        (item) => item.date === dateString
                      );

                      if (existingData) {
                        // Use actual data
                        chartData.push([
                          Math.round(existingData.good),
                          Math.round(existingData.warning || 0),
                          Math.round(existingData.bad),
                        ]);
                      } else if (isToday && data.length > 0) {
                        // For today, calculate from current data if available
                        const todaysData = data.filter(
                          (entry) => entry && entry.hour && isToday
                        );

                        if (todaysData.length > 0) {
                          // Calculate today's percentages from current data
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
                            // Use ML predictions
                            todaysMlData.forEach((entry) => {
                              if (entry.prediction === "Good") goodCount++;
                              else if (entry.prediction === "Warning")
                                warningCount++;
                              else if (entry.prediction === "Bad") badCount++;
                            });
                          } else {
                            // Fallback to threshold-based calculation
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
                            chartData.push([
                              Math.round((goodCount / total) * 100),
                              Math.round((warningCount / total) * 100),
                              Math.round((badCount / total) * 100),
                            ]);
                          } else {
                            chartData.push([0, 0, 0]);
                          }
                        } else {
                          chartData.push([0, 0, 0]);
                        }
                      } else {
                        // No data for this day - use placeholder that won't be visible
                        chartData.push([0, 0, 0]);
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
                  // Force minimum bar width and proper spacing
                  barPercentage: 0.7, // Slightly thinner bars
                  categoryPercentage: 1.0, // Full category width
                }}
                style={styles.historyChart}
                hideLegend={true}
                withHorizontalLabels={false}
                withVerticalLabels={true}
                fromZero={true}
              />

              {/* Interactive overlay for history bar clicks - THIS IS THE KEY ADDITION */}
              <View style={styles.historyBarClickOverlay}>
                {Array.from({ length: 7 }, (_, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.historyBarClickArea}
                    onPress={() => handleHistoryBarClick(index)}
                    activeOpacity={0.7}
                  />
                ))}
              </View>

              {/* Custom Date Labels - Enhanced to show data availability */}
              <View style={styles.customDateLabels}>
                {(() => {
                  const labels = [];
                  const today = new Date();
                  const sevenDaysAgo = new Date(today);
                  sevenDaysAgo.setDate(today.getDate() - 6);

                  for (let i = 0; i < 7; i++) {
                    const currentDate = new Date(sevenDaysAgo);
                    currentDate.setDate(sevenDaysAgo.getDate() + i);
                    const dateString = currentDate.toISOString().split("T")[0];
                    const isToday =
                      dateString === today.toISOString().split("T")[0];

                    // Check if this day has data
                    const hasHistoryData = historyData.some(
                      (item) => item.date === dateString
                    );
                    const hasTodayData = isToday && data.length > 0;
                    const hasData = hasHistoryData || hasTodayData;

                    labels.push(
                      <TouchableOpacity
                        key={i}
                        onPress={() => handleHistoryBarClick(i)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.dateLabel,
                            isToday && styles.todayDateLabel,
                            !hasData && styles.noDataDateLabel,
                            hasData && styles.clickableDateLabel, // Add clickable styling
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

            {/* History Chart Footer with Insights */}
            <View style={styles.chartFooter}>
              <View style={styles.historyInsights}>
                <Text style={styles.insightsTitle}>📈 Weekly Insights</Text>
                <View style={styles.insightsList}>
                  {(() => {
                    if (historyData.length === 0) {
                      return (
                        <Text style={styles.insightText}>
                          🆕 Start your posture tracking journey! Data will
                          appear as you use your sensor.
                        </Text>
                      );
                    }

                    const latest = historyData[historyData.length - 1];
                    const previous = historyData[historyData.length - 2];

                    if (latest && previous) {
                      const improvement = latest.good - previous.good;
                      return (
                        <Text
                          style={[
                            styles.insightText,
                            {
                              color:
                                improvement > 0 ? THEME.primary : THEME.danger,
                            },
                          ]}
                        >
                          {improvement > 0
                            ? `🎉 ${improvement.toFixed(
                                1
                              )}% improvement from yesterday!`
                            : `⚠️ ${Math.abs(improvement).toFixed(
                                1
                              )}% decline from yesterday`}
                        </Text>
                      );
                    }

                    if (historyData.length === 1) {
                      return (
                        <Text style={styles.insightText}>
                          🎯 Great start! Keep tracking to see your progress
                          trends.
                        </Text>
                      );
                    }

                    return (
                      <Text style={styles.insightText}>
                        Keep tracking to see your progress trends!
                      </Text>
                    );
                  })()}

                  {historyData.length > 0 && (
                    <Text style={styles.insightText}>
                      🎯 Best day:{" "}
                      {formatChartDate(
                        historyData.reduce((best, day) =>
                          day.good > best.good ? day : best
                        ).date
                      )}{" "}
                      (
                      {historyData
                        .reduce((best, day) =>
                          day.good > best.good ? day : best
                        )
                        .good.toFixed(0)}
                      % good posture)
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </Animated.View>
        ) : (
          // Only show this when there's truly no data at all
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Building your posture history</Text>
            <Text style={styles.noDataSubtext}>
              📊 Your weekly trends will appear here as you use AlignMate
            </Text>
            <Text style={styles.noDataSubtext}>
              💡 Use your sensor throughout the day to start tracking progress
            </Text>
          </View>
        );
      })()}

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
      <Text style={styles.pageTitle}>Settings</Text>

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
