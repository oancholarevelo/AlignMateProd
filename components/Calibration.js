import React, { useEffect, useState } from "react";
import { ref, set, get, onValue } from "firebase/database";
import { database } from "../firebase";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import LogViewer from "./LogViewer";
import { styles, THEME } from "../styles/CalibrationStyles";

const Calibration = () => {
  const userUID = localStorage.getItem("userUID");
  const [isCalibrated, setIsCalibrated] = useState(null);
  const [isRecalibrating, setIsRecalibrating] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showLogViewer, setShowLogViewer] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [calibrationCompleted, setCalibrationCompleted] = useState(false);
  const [stepInProgress, setStepInProgress] = useState(false);
  const [stepLock, setStepLock] = useState(false);

  // Get screen dimensions for responsive layout
  const windowWidth = Dimensions.get("window").width;
  const isSmallScreen = windowWidth < 350;

  useEffect(() => {
    if (!userUID) return;

    // Reference to calibration status
    const calibrationRef = ref(database, `/users/${userUID}/calibrated`);

    // Listen for calibration status changes
    const calibrationListener = onValue(calibrationRef, (snapshot) => {
      if (snapshot.exists()) {
        const isCalib = snapshot.val();
        setIsCalibrated(isCalib);

        // When the ESP32 sets calibrated=true, update our UI
        if (isCalib === true) {
          setCalibrationCompleted(true);
          setIsRecalibrating(false);

          // Only update to the final step if we were in the processing state
          if (currentStep === 3.5) {
            setCurrentStep(4);
            logToFirebase(
              "IMU calibration completed successfully! Your device is now ready to use.",
              "success"
            );

            // Auto-close modal after a delay
            setTimeout(() => {
              setModalVisible(false);
            }, 3000);
          }
        }
      } else {
        setIsCalibrated(false);
        setCalibrationCompleted(false);
      }
    });

    // Reference to completed steps
    const completedStepsRef = ref(
      database,
      `/users/${userUID}/completedCalibrationSteps`
    );

    // Listen for completed steps changes
    const stepsListener = onValue(completedStepsRef, (snapshot) => {
      if (snapshot.exists()) {
        setCompletedSteps(snapshot.val() || []);
      } else {
        setCompletedSteps([]);
      }
    });

    // Clean up listeners on unmount
    return () => {
      calibrationListener();
      stepsListener();
    };
  }, [userUID, currentStep]);

  // Countdown timer effect for visual feedback
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (
      countdown === 0 &&
      stepInProgress &&
      currentStep > 0 &&
      currentStep <= 3
    ) {
      // THIS is now the only place where calibration steps can be marked as complete
      logToFirebase(
        `Step ${currentStep} pitch data collection completed!`,
        "success"
      );
      markStepAsCompleted(currentStep);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, currentStep, stepInProgress]);

  useEffect(() => {
    return () => {
      // This function runs when the component unmounts
      if (userUID) {
        // Clear any outstanding commands
        const commandRef = ref(
          database,
          `/users/${userUID}/calibrationCommand`
        );
        set(commandRef, 0).catch((err) =>
          console.error("Error clearing command:", err)
        );
      }
    };
  }, [userUID]);

  // Log message to Firebase
  const logToFirebase = (message, type = "info") => {
    if (!userUID) return;

    const logsRef = ref(database, `users/${userUID}/deviceLogs`);
    const timestamp = new Date().getTime();
    const logEntry = {
      message,
      timestamp,
      type, // "info", "error", "success", "warning"
    };

    // Create a unique key based on timestamp
    const logKey = `app_${timestamp}`;

    // Add log to Firebase
    const updates = {};
    updates[logKey] = logEntry;

    import("firebase/database").then(({ update }) => {
      update(logsRef, updates).catch((error) =>
        console.error("Error logging to Firebase:", error)
      );
    });
  };

  const sendCalibrationCommand = async (step) => {
    if (!userUID) {
      alert("No user logged in");
      return;
    }

    // Prevent starting a new step while one is in progress
    if (stepInProgress && step !== currentStep) {
      console.log(
        "A step is already in progress. Please wait for it to complete."
      );
      return;
    }

    // Prevent double-clicking the same step
    if (stepLock) {
      return;
    }
    setStepLock(true);
    setTimeout(() => setStepLock(false), 1000); // Prevent rapid clicks

    // Store the step we're requesting
    setCurrentStep(step);

    // For calibration steps (1-3), enforce countdown behavior
    if (step > 0 && step <= 3) {
      setStepInProgress(true); // Mark step as in progress

      // Set countdown duration - MUST complete before step can be marked as done
      setCountdown(15);

      // Log the start of this calibration step
      const stepMessages = {
        1: "Starting IMU calibration: Collecting Upright Posture samples",
        2: "Starting IMU calibration: Collecting Slight Slouch samples",
        3: "Starting IMU calibration: Collecting Severe Slouch samples",
      };

      logToFirebase(
        stepMessages[step] || `Starting calibration step ${step}`,
        "info"
      );
    }

    // Open modal for detailed instructions
    if (!modalVisible) {
      setModalVisible(true);
      setShowLogViewer(true);
    }

    try {
      // Send the command to Firebase
      const commandRef = ref(database, `/users/${userUID}/calibrationCommand`);
      await set(commandRef, step);
      console.log(`Sent calibration step ${step}`);

      // If this is the first step and we're recalibrating, reset state
      if (step === 1 && isCalibrated && !isRecalibrating) {
        const calibratedRef = ref(database, `/users/${userUID}/calibrated`);
        await set(calibratedRef, false);

        setIsCalibrated(false);
        setCalibrationCompleted(false);
        setIsRecalibrating(true);

        // Reset completed steps
        const completedStepsRef = ref(
          database,
          `/users/${userUID}/completedCalibrationSteps`
        );
        await set(completedStepsRef, []);
        console.log("Reset completed steps");
      }

      // Update completed steps, but ONLY if not a calibration step
      // For calibration steps, this will be handled by the countdown effect
      if (step <= 0 || step > 3) {
        markStepAsCompleted(step);
      }
    } catch (error) {
      console.error("Error sending calibration command:", error);
      logToFirebase(
        "Error sending calibration command: " + error.message,
        "error"
      );
      setStepInProgress(false); // Reset progress state on error
    }
  };

  const markStepAsCompleted = async (step) => {
    if (!userUID) return;

    try {
      // Update completed steps in Firebase
      const completedStepsRef = ref(
        database,
        `/users/${userUID}/completedCalibrationSteps`
      );
      const snapshot = await get(completedStepsRef);

      let currentSteps = [];
      if (snapshot.exists()) {
        currentSteps = snapshot.val() || [];
      }

      // Only add if not already in the array
      if (!currentSteps.includes(step)) {
        const updatedSteps = [...currentSteps, step];
        await set(completedStepsRef, updatedSteps);
        console.log(`Marked step ${step} as completed`);

        // If this is the final step, DON'T set calibration status
        // Let the ESP32 handle that
        if (step === 3) {
          logToFirebase(
            "All pitch data collected! Building decision tree model...",
            "info"
          );
          setCurrentStep(3.5);
        }
      }
    } catch (error) {
      console.error("Error marking step as completed:", error);
      logToFirebase(
        "Error updating calibration progress: " + error.message,
        "error"
      );
    } finally {
      setStepInProgress(false); // Reset step progress state
    }
  };

  const startRecalibration = () => {
    setIsRecalibrating(true);
    setModalVisible(true);
    setShowLogViewer(true);
    sendCalibrationCommand(1);
  };

  const isStepCompleted = (step) => {
    return completedSteps.includes(step);
  };

  const getStepButtonStyle = (step) => {
    return isStepCompleted(step)
      ? [styles.stepButton, styles.completedStepButton]
      : styles.stepButton;
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setCurrentStep(0);
    setCountdown(0);
  };

  // Get the instruction text based on current step
  const getStepInstructions = () => {
    switch (currentStep) {
      case 0:
        return "Welcome to IMU calibration! This process will help your device learn to recognize your posture patterns by measuring spinal tilt. It will take about 2 minutes. Click 'Start Calibration' to begin.";
      case 1:
        return "Step 1: Sit with UPRIGHT POSTURE. Sit up straight with your back against the chair, shoulders relaxed, and head aligned with your spine. Keep still to ensure accurate pitch measurements. Hold this position until the timer completes.";
      case 2:
        return "Step 2: Sit with SLIGHT SLOUCH. Lean forward slightly or hunch your shoulders a bit, creating a mild slouch. Keep still to capture consistent pitch data. Hold this position until the timer completes.";
      case 3:
        return "Step 3: Sit with SEVERE SLOUCH. Slouch forward significantly, as if hunching over a desk, to create a pronounced spinal tilt. Keep still for accurate measurements. Hold this position until the timer completes.";
      case 3.5:
        return "Processing... Please wait while the device analyzes your posture data and builds the machine learning model. This may take up to 30 seconds.";
      case 4:
        return "Calibration complete! Your device is now calibrated to your specific posture patterns using IMU data. It can accurately detect when you're sitting upright or need a reminder to correct your posture.";
      default:
        return "Preparing for IMU calibration...";
    }
  };

  // Icons
  const uprightPostureIcon =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%235CA377' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 4v16'/%3E%3Ccircle cx='12' cy='5' r='2.5'/%3E%3Cpath d='M9 20h6'/%3E%3C/svg%3E";
  const slightSlouchPostureIcon = // New icon for Step 2 (Slight Slouch) with a warning color
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23FFC107' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 4c-2 3-2 6 0 9s0 7 0 7'/%3E%3Ccircle cx='12' cy='5' r='2.5'/%3E%3Cpath d='M9 20h6'/%3E%3C/svg%3E";
  const slouchPostureIcon = // Original icon for Step 3 (Severe Slouch)
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23F87A53' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 4c-2 3-2 6 0 9s0 7 0 7'/%3E%3Ccircle cx='12' cy='5' r='2.5'/%3E%3Cpath d='M9 20h6'/%3E%3C/svg%3E";
  const calibrationIcon = // Sliders/Adjustment Icon
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234299E1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='4' y1='21' x2='4' y2='14'%3E%3C/line%3E%3Cline x1='4' y1='10' x2='4' y2='3'%3E%3C/line%3E%3Cline x1='12' y1='21' x2='12' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='8' x2='12' y2='3'%3E%3C/line%3E%3Cline x1='20' y1='21' x2='20' y2='16'%3E%3C/line%3E%3Cline x1='20' y1='12' x2='20' y2='3'%3E%3C/line%3E%3Cline x1='1' y1='14' x2='7' y2='14'%3E%3C/line%3E%3Cline x1='9' y1='8' x2='15' y2='8'%3E%3C/line%3E%3Cline x1='17' y1='16' x2='23' y2='16'%3E%3C/line%3E%3C/svg%3E";
  const completeIcon = // Bolder checkmark in a lightly filled circle
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10' fill='rgba(92,163,119,0.1)' stroke='%235CA377' stroke-width='2'/%3E%3Cpath d='M8 12l3 3l5-6' stroke='%235CA377' stroke-width='2.5'/%3E%3C/svg%3E";
  const processingIcon = // Modern circular loader
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234299E1' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 12a9 9 0 1 1-6.219-8.56'/%3E%3C/svg%3E";

  // Get step icon
  const getStepIcon = () => {
    switch (currentStep) {
      case 1:
        return uprightPostureIcon;
      case 2:
        return slightSlouchPostureIcon; // Use new icon for slight slouch
      case 3:
        return slouchPostureIcon; // Keep original for severe slouch
      case 3.5:
        return processingIcon;
      case 4:
        return completeIcon;
      default:
        return calibrationIcon;
    }
  };

  // Don't render anything if calibration is completed and we're not recalibrating
  if (calibrationCompleted && !isRecalibrating && !modalVisible) {
    return null;
  }

  return (
    <View style={styles.container}>
      {isCalibrated === null ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : isCalibrated && !isRecalibrating ? (
        <TouchableOpacity
          style={styles.recalibrateButton}
          onPress={startRecalibration}
        >
          <Text style={styles.buttonText}>Recalibrate IMU</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.calibrationContainer}>
          <View style={styles.stepsContainer}>
            <TouchableOpacity
              style={getStepButtonStyle(1)}
              onPress={() => sendCalibrationCommand(1)}
            >
              <Text style={styles.buttonText}>
                {isSmallScreen ? "1" : "Step 1"}
              </Text>
              {isStepCompleted(1) && (
                <Text style={styles.completedText}>✓</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={getStepButtonStyle(2)}
              onPress={() => sendCalibrationCommand(2)}
            >
              <Text style={styles.buttonText}>
                {isSmallScreen ? "2" : "Step 2"}
              </Text>
              {isStepCompleted(2) && (
                <Text style={styles.completedText}>✓</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={getStepButtonStyle(3)}
              onPress={() => sendCalibrationCommand(3)}
            >
              <Text style={styles.buttonText}>
                {isSmallScreen ? "3" : "Step 3"}
              </Text>
              {isStepCompleted(3) && (
                <Text style={styles.completedText}>✓</Text>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.instructionText}>
            {isCalibrated
              ? "IMU calibration complete!"
              : "Complete all three steps in order"}
          </Text>

          <TouchableOpacity
            style={styles.toggleLogButton}
            onPress={() => setShowLogViewer(!showLogViewer)}
          >
            <Text style={styles.toggleLogText}>
              {showLogViewer ? "Hide Device Logs" : "Show Device Logs"}
            </Text>
          </TouchableOpacity>

          {showLogViewer && (
            <LogViewer userUID={userUID} visible={true} maxLogs={10} />
          )}
        </View>
      )}

      {/* Detailed calibration modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>IMU Calibration</Text>
                <TouchableOpacity onPress={handleCloseModal}>
                  <Text style={styles.closeButton}>×</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.stepIconContainer}>
                <Image
                  source={{ uri: getStepIcon() }}
                  style={styles.stepIcon}
                />
              </View>

              <Text style={styles.instructions}>{getStepInstructions()}</Text>

              {currentStep === 0 ? (
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() => sendCalibrationCommand(1)}
                >
                  <Text style={styles.startButtonText}>Start Calibration</Text>
                </TouchableOpacity>
              ) : currentStep === 3.5 ? (
                <View style={styles.processingContainer}>
                  <Text style={styles.processingText}>
                    ML Model Building in Progress
                  </Text>
                </View>
              ) : currentStep === 4 ? (
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={handleCloseModal}
                >
                  <Text style={styles.startButtonText}>Done</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.countdownContainer}>
                  <Text style={styles.countdownText}>
                    Hold position: {countdown} seconds remaining
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${(countdown / 15) * 100}%` },
                      ]}
                    />
                  </View>
                </View>
              )}

              <View style={styles.stepIndicator}>
                {[1, 2, 3, 3.5].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.stepDot,
                      completedSteps.includes(i) ||
                      (i === 3.5 && completedSteps.includes(3))
                        ? styles.activeStepDot
                        : null,
                      currentStep === i ? styles.currentStepDot : null,
                    ]}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={styles.toggleLogButton}
                onPress={() => setShowLogViewer(!showLogViewer)}
              >
                <Text style={styles.toggleLogText}>
                  {showLogViewer ? "Hide Device Logs" : "Show Device Logs"}
                </Text>
              </TouchableOpacity>

              {showLogViewer && (
                <LogViewer userUID={userUID} visible={true} maxLogs={15} />
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Calibration;
