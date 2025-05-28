import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { ref, onValue, get, set } from "firebase/database";
import { database } from "../firebase";

const Achievements = ({ onBack }) => {
  const [achievementsData, setAchievementsData] = useState({
    points: 0,
    treeCount: 0,
    history: [],
    streaks: {
      current: 0,
      longest: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [sensorConnected, setSensorConnected] = useState(false);
  const userUID = localStorage.getItem("userUID");

  useEffect(() => {
    if (!userUID) return;

    console.log("Achievements component mounted");

    // Fetch achievements data
    const achievementsRef = ref(database, `users/${userUID}/achievements`);

    onValue(achievementsRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        setAchievementsData({
          points: data.points || 0,
          treeCount: Math.floor((data.points || 0) / 50),
          history: data.history || [],
          streaks: data.streaks || { current: 0, longest: 0 },
        });
      } else {
        // Initialize achievements data if it doesn't exist
        initializeAchievements();
      }

      setLoading(false);
    });

    // Check IMU sensor connectivity
    const cleanupSensorConnectivity = checkSensorConnectivity();

    // Start tracking good posture for achievements
    const cleanupPostureTracking = trackPostureForAchievements();

    return () => {
      // Clean up timers or listeners
      cleanupSensorConnectivity();
      cleanupPostureTracking();
    };
  }, [userUID]);

  // Fixed function to check sensor connectivity
  const checkSensorConnectivity = () => {
    if (!userUID) return () => {};

    const connectivityRef = ref(database, `users/${userUID}/sensorStatus`);

    // Check IMU sensor status immediately at component mount
    get(connectivityRef)
      .then((snapshot) => {
        const status = snapshot.val();
        setSensorConnected(status?.connected === true);
        console.log("Initial IMU sensor status:", status);

        if (!snapshot.exists()) {
          set(connectivityRef, {
            connected: false,
            lastConnected: null,
            lastChecked: Date.now(),
          })
            .then(() => {
              console.log("IMU sensor status initialized in Firebase");
            })
            .catch((error) => {
              console.error("Error initializing IMU sensor status:", error);
            });
        }
      })
      .catch((error) => {
        console.error("Error checking IMU sensor status:", error);
      });

    // Listen for sensor connectivity changes with debouncing
    let debounceTimer;
    const sensorListener = onValue(connectivityRef, (snapshot) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const status = snapshot.val();
        console.log("IMU sensor status from Firebase:", status);
        setSensorConnected(status?.connected === true);
      }, 300); // Reduced debounce time for faster response
    });

    // Heartbeat interval to check data freshness but not override status
    const heartbeatInterval = setInterval(() => {
      const postureRef = ref(database, `users/${userUID}/postureData`);
      get(postureRef).then((snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        const entries = Object.entries(data);
        if (entries.length === 0) return;

        entries.sort((a, b) => parseInt(b[0]) - parseInt(a[0]));
        const [timestamp, _] = entries[0];

        // 3-minute threshold for data freshness
        const now = Date.now();
        const lastDataTime = parseInt(timestamp);
        const isDataStale = now - lastDataTime > 180000; // 3 minutes

        if (isDataStale) {
          console.log(
            "IMU posture data is stale, may need to check the sensor connection"
          );
        } else {
          console.log(
            "Recent IMU posture data detected, timestamp:",
            new Date(lastDataTime).toLocaleTimeString()
          );
        }
      });
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(heartbeatInterval);
      sensorListener(); // Remove the Firebase listener
    };
  };

  // Update sensor status function
  const updateSensorStatus = (isConnected) => {
    if (!userUID) return;

    const connectivityRef = ref(database, `users/${userUID}/sensorStatus`);
    set(connectivityRef, {
      connected: isConnected,
      lastConnected: isConnected ? Date.now() : null,
      lastChecked: Date.now(),
    })
      .then(() => {
        console.log(
          "IMU sensor status updated in Firebase to:",
          isConnected ? "connected" : "disconnected"
        );
      })
      .catch((error) => {
        console.error("Error updating IMU sensor status:", error);
      });

    setSensorConnected(isConnected);
  };

  const initializeAchievements = () => {
    if (!userUID) return;

    const achievementsRef = ref(database, `users/${userUID}/achievements`);
    set(achievementsRef, {
      points: 0,
      history: [],
      streaks: {
        current: 0,
        longest: 0,
      },
    })
      .then(() => {
        console.log("Achievements initialized");
      })
      .catch((error) => {
        console.error("Error initializing achievements:", error);
      });
  };

  // Fixed posture tracking function
  const trackPostureForAchievements = () => {
    if (!userUID) {
      console.error("Cannot track posture: userUID is missing");
      return () => {};
    }

    console.log(
      "Starting IMU posture tracking for achievements with userUID:",
      userUID
    );

    // Reference to the posture data
    const postureRef = ref(database, `users/${userUID}/postureData`);

    // Counter for good posture readings
    let goodPostureReadingsCount = 0;
    let lastDataTimestamp = null;
    let lastProcessedTimestamp = null; // Track last processed timestamp to avoid duplicates

    console.log("Initial goodPostureReadingsCount:", goodPostureReadingsCount);

    // Add a separate interval to check for data freshness
    const freshnessCheckInterval = setInterval(() => {
      if (lastDataTimestamp) {
        const now = Date.now();
        if (now - lastDataTimestamp > 180000) {
          // 3 minutes threshold
          console.log(
            "IMU posture data is stale, but not changing sensor connection status"
          );
        } else {
          console.log(
            "Fresh IMU posture data available as of:",
            new Date(lastDataTimestamp).toLocaleTimeString()
          );
        }
      }
    }, 10000);

    const postureListener = onValue(postureRef, (snapshot) => {
      const postureData = snapshot.val();

      console.log("Received IMU posture data update");

      if (!postureData) {
        console.log("No IMU posture data available");
        return;
      }

      // Log the full posture data for debugging
      console.log(
        "Full IMU posture data keys:",
        Object.keys(postureData).length
      );

      // Get all entries (key-value pairs) from postureData
      const entries = Object.entries(postureData);
      if (entries.length === 0) {
        console.log("No entries in IMU posture data");
        return;
      }

      // Sort entries by timestamp (key) in descending order
      entries.sort((a, b) => parseInt(b[0]) - parseInt(a[0]));

      // Get the most recent entry
      const [timestamp, latestData] = entries[0];

      // Log the latest entry for debugging
      console.log("Latest IMU posture data:", {
        timestamp,
        entryTime: new Date(parseInt(timestamp) * 1000).toLocaleTimeString(),
        data: latestData,
      });

      // Skip if we've already processed this reading
      if (timestamp === lastProcessedTimestamp) {
        console.log("Skipping already processed timestamp:", timestamp);
        return;
      }

      lastProcessedTimestamp = timestamp;

      // Update the last data timestamp
      lastDataTimestamp = parseInt(timestamp) * 1000; // Convert to milliseconds

      // If the most recent data is older than 3 minutes, don't count it
      const now = Date.now();
      if (now - lastDataTimestamp > 180000) {
        // 3 minutes
        console.log("IMU data is stale, not processing further");
        return; // Skip processing stale data
      }

      // Ensure sensor is recognized as connected since we have fresh data
      if (!sensorConnected) {
        console.log(
          "Fresh IMU data received - updating sensor status to connected"
        );
        updateSensorStatus(true);
      }

      // Explicitly check if finalPrediction is defined and handle 'Good', 'Warning', 'Bad'
      const hasValidPrediction =
        latestData && typeof latestData.finalPrediction === "string";
      const isGoodPosture =
        hasValidPrediction && latestData.finalPrediction === "Good";
      const isBadPosture =
        hasValidPrediction && latestData.finalPrediction === "Bad";
      const isWarningPosture =
        hasValidPrediction && latestData.finalPrediction === "Warning";

      console.log("IMU prediction details:", {
        hasValidPrediction,
        finalPrediction: hasValidPrediction
          ? latestData.finalPrediction
          : "undefined",
        isGoodPosture,
        isWarningPosture,
        isBadPosture,
      });

      if (isGoodPosture) {
        goodPostureReadingsCount++;
        console.log(
          `Good posture reading detected! Count now: ${goodPostureReadingsCount}/30`
        );

        // Award point after 30 good readings (approximately 1 minute at 100ms intervals)
        if (goodPostureReadingsCount >= 30) {
          console.log(
            `🎉 ${goodPostureReadingsCount} good posture readings achieved! Awarding point.`
          );
          awardGoodPosturePoint();
          // Reset counter after awarding
          goodPostureReadingsCount = 0;
          console.log("Reset good posture reading count to 0");
        }
      } else if (isBadPosture) {
        // Reset on explicit 'Bad' reading
        console.log(
          `Bad posture detected. Resetting count from ${goodPostureReadingsCount} to 0`
        );
        goodPostureReadingsCount = 0;
      } else if (isWarningPosture) {
        // Do not reset count on 'Warning', but don't increment either
        console.log(
          `Warning posture detected. Maintaining count at ${goodPostureReadingsCount}`
        );
      } else {
        console.log(
          `Unrecognized posture value: "${
            hasValidPrediction ? latestData.finalPrediction : "undefined"
          }". Not changing count.`
        );
      }
    });

    console.log("IMU posture tracking listener established");

    return () => {
      console.log("Cleaning up IMU posture tracking...");
      if (freshnessCheckInterval) clearInterval(freshnessCheckInterval);
      postureListener(); // Remove the Firebase listener
      console.log("IMU posture tracking cleaned up");
    };
  };

  // Fixed award point function
  const awardGoodPosturePoint = async () => {
    if (!userUID) {
      console.error("Cannot award point: userUID is missing");
      return;
    }

    console.log("Starting point award process with userUID:", userUID);

    try {
      // Get current achievements data
      const achievementsRef = ref(database, `users/${userUID}/achievements`);
      console.log("Fetching current achievements data...");

      const snapshot = await get(achievementsRef);
      const currentData = snapshot.val() || {
        points: 0,
        history: [],
        streaks: { current: 0, longest: 0 },
      };

      console.log("Current achievements data:", currentData);

      // Update points
      const newPoints = (currentData.points || 0) + 1;
      console.log(`Updating points from ${currentData.points} to ${newPoints}`);

      // Update streak
      const now = new Date();
      const today = now.toISOString().split("T")[0];

      // Add to history
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

      console.log("Added new history entry:", newEntry);

      // Update streaks
      const streaks = currentData.streaks || { current: 0, longest: 0 };
      streaks.current += 1;

      if (streaks.current > streaks.longest) {
        streaks.longest = streaks.current;
      }

      console.log("Updated streaks:", streaks);

      // Prepare the updated data
      const updatedData = {
        points: newPoints,
        history: history,
        streaks: streaks,
      };

      console.log("Saving updated achievements data to Firebase:", updatedData);

      // Save updated data
      await set(achievementsRef, updatedData);

      console.log("✅ Point successfully awarded for good posture!");

      // Update local state
      setAchievementsData({
        points: newPoints,
        treeCount: Math.floor(newPoints / 50),
        history: history,
        streaks: streaks,
      });

      console.log("Local state updated with new achievements data");
    } catch (error) {
      console.error("Error awarding point:", error);
      console.error("Error details:", error.message, error.code);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Trophy SVG for achievements
  const trophyIcon =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23FFD700' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M8 21h8'/%3E%3Cpath d='M12 17v4'/%3E%3Cpath d='M19 10c.34.3.5.7.5 1.1M4 10c-.34.3-.5.7-.5 1.1'/%3E%3Cpath d='M4 10V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2'/%3E%3Cpath d='M5 21h14'/%3E%3Cpath d='M4.5 11a5.5 5.5 0 0 0 5 5.5H12'/%3E%3Cpath d='M19.5 11a5.5 5.5 0 0 1-5 5.5H12'/%3E%3Cpath d='M12 12a4 4 0 0 0 4-4V6H8v2a4 4 0 0 0 4 4z' fill='%23FFD700'/%3E%3C/svg%3E";

  // Tree SVG for environmental impact
  const treeIcon =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2356a64b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2c.7.6 1.2 1.8 1.5 3.5.3 1.5.5 3.5.5 6v10'/%3E%3Cpath d='M12 22v-3a2 2 0 0 1 2-2h2'/%3E%3Cpath d='M17 17c-1 0-1.5-.5-2-2'/%3E%3Cpath d='M12 22v-3a2 2 0 0 0-2-2H8'/%3E%3Cpath d='M7 17c1 0 1.5-.5 2-2'/%3E%3Cpath d='M15.1 2.8C14 1.8 12.4 1.3 10.9 1c-1.3-.3-2.8 0-4 .8-1.5 1-2.6 2.7-2.8 4.5-.2 1.9.3 3.9 1.5 5.5' stroke='%2356a64b'/%3E%3Cpath d='M19.9 2.8C21 1.8 22.6 1.3 24.1 1c1.3-.3 2.8 0 4 .8 1.5 1 2.6 2.7 2.8 4.5.2 1.9-.3 3.9-1.5 5.5' stroke='%2356a64b'/%3E%3Cpath d='M9.1 21.9c-1.7.3-2.9-1.4-2-2.8.6-.9 1.9-1 2.8-.4' fill='%23522'/%3E%3C/svg%3E";

  // Fire SVG for streaks
  const fireIcon =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23FF4500' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z' fill='%23FF4500'/%3E%3C/svg%3E";

  // Sensor icon
  const sensorIcon =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23" +
    (sensorConnected ? "56a64b" : "ff3b30") +
    "' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z'/%3E%3Cpath d='M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' fill='%23" +
    (sensorConnected ? "56a64b" : "ff3b30") +
    "'/%3E%3Cpath d='M4 12a8 8 0 0 1 16 0'/%3E%3C/svg%3E";

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Loading achievements...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Your Achievements</Text>

      {/* Sensor Status */}
      <View style={styles.sensorStatusContainer}>
        <Image source={{ uri: sensorIcon }} style={styles.sensorIcon} />
        <Text
          style={[
            styles.sensorStatusText,
            sensorConnected
              ? styles.sensorConnected
              : styles.sensorDisconnected,
          ]}
        >
          IMU Sensor is {sensorConnected ? "connected" : "disconnected"}
        </Text>
        {!sensorConnected && (
          <Text style={styles.sensorWarning}>
            Please connect your IMU sensor to continue earning points.
          </Text>
        )}
      </View>

      {/* Points and Tree Count */}
      <View style={styles.summaryContainer}>
        <View style={styles.pointsCard}>
          <Image source={{ uri: trophyIcon }} style={styles.cardIcon} />
          <Text style={styles.pointsTitle}>Total Points</Text>
          <Text style={styles.pointsValue}>{achievementsData.points}</Text>
          <Text style={styles.pointsDescription}>
            1 point for each minute of good posture detected by your IMU sensor
          </Text>
        </View>

        <View style={styles.treesCard}>
          <Image source={{ uri: treeIcon }} style={styles.cardIcon} />
          <Text style={styles.treesTitle}>Trees Planted</Text>
          <Text style={styles.treesValue}>{achievementsData.treeCount}</Text>
          <Text style={styles.treesDescription}>
            We plant a tree for every 50 points
          </Text>
        </View>
      </View>

      {/* Streaks */}
      <View style={styles.streakContainer}>
        <Image source={{ uri: fireIcon }} style={styles.streakIcon} />
        <View style={styles.streakTextContainer}>
          <Text style={styles.streakTitle}>Current Streak</Text>
          <Text style={styles.streakValue}>
            {achievementsData.streaks.current} minutes
          </Text>
        </View>
        <View style={styles.streakTextContainer}>
          <Text style={styles.streakTitle}>Longest Streak</Text>
          <Text style={styles.streakValue}>
            {achievementsData.streaks.longest} minutes
          </Text>
        </View>
      </View>

      {/* Progress to Next Tree */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>
          Progress to next tree: {achievementsData.points % 50}/50 points
        </Text>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${((achievementsData.points % 50) / 50) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Achievement Badges */}
      <View style={styles.badgesContainer}>
        <Text style={styles.badgesTitle}>Achievement Badges</Text>
        <View style={styles.badgesGrid}>
          <View
            style={[
              styles.badge,
              achievementsData.points >= 10
                ? styles.badgeUnlocked
                : styles.badgeLocked,
            ]}
          >
            <Text style={styles.badgeTitle}>Beginner</Text>
            <Text style={styles.badgeDesc}>Earn 10 points</Text>
          </View>

          <View
            style={[
              styles.badge,
              achievementsData.points >= 50
                ? styles.badgeUnlocked
                : styles.badgeLocked,
            ]}
          >
            <Text style={styles.badgeTitle}>Tree Planter</Text>
            <Text style={styles.badgeDesc}>First tree planted</Text>
          </View>

          <View
            style={[
              styles.badge,
              achievementsData.points >= 100
                ? styles.badgeUnlocked
                : styles.badgeLocked,
            ]}
          >
            <Text style={styles.badgeTitle}>Posture Pro</Text>
            <Text style={styles.badgeDesc}>Earn 100 points</Text>
          </View>

          <View
            style={[
              styles.badge,
              achievementsData.streaks.longest >= 10
                ? styles.badgeUnlocked
                : styles.badgeLocked,
            ]}
          >
            <Text style={styles.badgeTitle}>Streak Master</Text>
            <Text style={styles.badgeDesc}>10 min streak</Text>
          </View>
        </View>
      </View>

      {/* Recent History */}
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Recent Activity</Text>
        {achievementsData.history.length > 0 ? (
          achievementsData.history
            .slice(-5)
            .reverse()
            .map((entry, index) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.historyPoint} />
                <View style={styles.historyContent}>
                  <Text style={styles.historyText}>
                    Earned {entry.points} point for good posture
                  </Text>
                  <Text style={styles.historyDate}>
                    {formatDate(entry.date)} at {formatTime(entry.time)}
                  </Text>
                </View>
              </View>
            ))
        ) : (
          <Text style={styles.noHistoryText}>
            No activity yet. Maintain good posture to earn points!
          </Text>
        )}
      </View>

      {/* Environmental Impact Section */}
      <View style={styles.impactContainer}>
        <Text style={styles.impactTitle}>Your Environmental Impact</Text>
        <Text style={styles.impactDescription}>
          Good posture doesn't just benefit you—it helps the planet too! For
          every 50 points you earn, we plant a tree to combat deforestation and
          climate change.
        </Text>

        <View style={styles.impactStats}>
          <View style={styles.impactStat}>
            <Text style={styles.impactStatValue}>
              {achievementsData.treeCount}
            </Text>
            <Text style={styles.impactStatLabel}>Trees Planted</Text>
          </View>

          <View style={styles.impactStat}>
            <Text style={styles.impactStatValue}>
              {(achievementsData.treeCount * 48).toFixed(1)}kg
            </Text>
            <Text style={styles.impactStatLabel}>CO₂ Absorbed/Year</Text>
          </View>
        </View>
      </View>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Back to Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  sensorStatusContainer: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
    flexDirection: "column",
  },
  sensorIcon: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  sensorStatusText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  sensorConnected: {
    color: "#56a64b",
  },
  sensorDisconnected: {
    color: "#ff3b30",
  },
  sensorWarning: {
    fontSize: 14,
    color: "#ff3b30",
    textAlign: "center",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  pointsCard: {
    backgroundColor: "#FFF8E1",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  treesCard: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  cardIcon: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  pointsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#BF9B30",
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#BF9B30",
    marginBottom: 4,
  },
  pointsDescription: {
    fontSize: 12,
    color: "#78655C",
    textAlign: "center",
  },
  treesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 4,
  },
  treesValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 4,
  },
  treesDescription: {
    fontSize: 12,
    color: "#4B6455",
    textAlign: "center",
  },
  streakContainer: {
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  streakIcon: {
    width: 36,
    height: 36,
    marginRight: 16,
  },
  streakTextContainer: {
    marginRight: 24,
  },
  streakTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#D84315",
  },
  streakValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#D84315",
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 16,
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#56a64b",
    borderRadius: 8,
  },
  badgesContainer: {
    marginBottom: 24,
  },
  badgesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  badge: {
    width: "48%",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  badgeUnlocked: {
    backgroundColor: "#E3F2FD",
    borderWidth: 1,
    borderColor: "#2196F3",
  },
  badgeLocked: {
    backgroundColor: "#EEEEEE",
    borderWidth: 1,
    borderColor: "#BDBDBD",
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  badgeDesc: {
    fontSize: 12,
    color: "#666",
  },
  historyContainer: {
    marginBottom: 24,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  historyPoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#56a64b",
    marginTop: 4,
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyText: {
    fontSize: 14,
    color: "#333",
  },
  historyDate: {
    fontSize: 12,
    color: "#757575",
  },
  noHistoryText: {
    fontSize: 14,
    color: "#757575",
    fontStyle: "italic",
    textAlign: "center",
    padding: 16,
  },
  impactContainer: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  impactTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 8,
  },
  impactDescription: {
    fontSize: 14,
    color: "#4B6455",
    marginBottom: 16,
    lineHeight: 20,
  },
  impactStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  impactStat: {
    alignItems: "center",
  },
  impactStatValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  impactStatLabel: {
    fontSize: 12,
    color: "#4B6455",
  },
  backButton: {
    paddingVertical: 12,
    marginBottom: 32,
  },
  backButtonText: {
    fontSize: 16,
    color: "#2196F3",
    fontWeight: "600",
  },
});

export default Achievements;
