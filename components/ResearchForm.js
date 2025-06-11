import React, { useState, useCallback, useRef, useEffect } from "react"; // Added useRef, useEffect
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Linking,
  Platform,
} from "react-native";
import { ref, push, set, get } from "firebase/database"; // Added get
import { database } from "../firebase";
import { FEEDBACK_ICONS } from "../constants/AppIcons";
import { styles } from "../styles/ResearchFormStyles";

const ResearchForm = ({
  isVisible,
  onClose,
  userUID = null,
  userName = null,
  sequentialID = null, // ADDED: sequentialID prop
  isModal = true,
}) => {
  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [errors, setErrors] = useState({}); // ADDED: State for errors

  // Section I: Participant Information
  const [participantID, setParticipantID] = useState("");
  const [dateOfTesting, setDateOfTesting] = useState(
    new Date().toISOString().split("T")[0]
  );
  // MODIFIED: Change timeStarted and timeEnded to objects
  const [timeStarted, setTimeStarted] = useState({ time: "", period: "AM" });
  const [timeEnded, setTimeEnded] = useState({ time: "", period: "AM" });
  const [researcherName, setResearcherName] = useState("");

  // Section II: Demographic Information
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [yearSection, setYearSection] = useState("");
  const [email, setEmail] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [painExperience, setPainExperience] = useState([]);
  const [painDuration, setPainDuration] = useState("");
  const [sittingHours, setSittingHours] = useState("");
  const [previousDevices, setPreviousDevices] = useState("");
  const [previousDevicesDetail, setPreviousDevicesDetail] = useState("");
  const [conditions, setConditions] = useState("");
  const [conditionsDetail, setConditionsDetail] = useState("");

  // Section III: Pre-test Assessment
  const [prePostureRating, setPrePostureRating] = useState(0);
  const [preDiscomfortLevel, setPreDiscomfortLevel] = useState(0);
  const [prePosturalAwareness, setPrePosturalAwareness] = useState(0);

  // Section V: Post-test Assessment
  const [postPostureRating, setPostPostureRating] = useState(0);
  const [postDiscomfortLevel, setPostDiscomfortLevel] = useState(0);
  const [postPosturalAwareness, setPostPosturalAwareness] = useState(0);
  const [deviceAccuracy, setDeviceAccuracy] = useState(0);
  const [feedbackEffectiveness, setFeedbackEffectiveness] = useState(0);
  const [comfortLevel, setComfortLevel] = useState(0);

  // Section VI: Comprehensive Evaluation
  const [effectiveness, setEffectiveness] = useState({
    alertsPoorPosture: 0,
    realtimeFeedback: 0,
    reducedDiscomfort: 0,
    improvedAwareness: 0,
  });

  const [functionality, setFunctionality] = useState({
    sensorAccuracy: 0,
    appIntegration: 0,
    wearableDesign: 0,
    consistentFunction: 0,
  });

  const [reliability, setReliability] = useState({
    consistentAlerts: 0,
    noInterruptions: 0,
    effectiveAcrossActivities: 0,
    batteryLife: 0,
  });

  const [security, setSecurity] = useState({
    safeFromHacking: 0,
    authorizedAccess: 0,
    dataControl: 0,
    dataUsageUnderstanding: 0,
  });

  const [usability, setUsability] = useState({
    easySetup: 0,
    intuitiveInterface: 0,
    clearNotifications: 0,
    comfortableWear: 0,
  });

  const [sensitivity, setSensitivity] = useState({
    detectsSmallChanges: 0,
    differentiatesAdjustments: 0,
    adjustableSettings: 0,
    recognizesTransitions: 0,
  });

  // Section VII: Qualitative Feedback
  const [likedMost, setLikedMost] = useState("");
  const [needsImprovement, setNeedsImprovement] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState("");
  const [dailyRoutine, setDailyRoutine] = useState("");
  const [postureAwarenessImpact, setPostureAwarenessImpact] = useState("");
  const [futureFeatures, setFutureFeatures] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");

  const totalSteps = 7;
  const scrollViewRef = useRef(null); // ADDED: Ref for ScrollView

  // ADDED: useEffect to auto-fill participantID if user is logged in and sequentialID is available
  useEffect(() => {
    if (userUID && sequentialID) {
      setParticipantID(String(sequentialID)); // Ensure it's a string
    } else if (userUID && !sequentialID) {
      // If logged in but sequentialID prop isn't passed or is null,
      // try to fetch it. This is a fallback, ideally it should be passed as a prop.
      const userSeqIdRef = ref(database, `users/${userUID}/sequentialID`);
      get(userSeqIdRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            setParticipantID(String(snapshot.val()));
          } else {
            // If still not found, or user is anonymous
            setParticipantID("N/A");
          }
        })
        .catch(() => setParticipantID("N/A"));
    } else {
      setParticipantID(""); // Clear or set to default if not logged in / no ID
    }
  }, [userUID, sequentialID]);

  // ADDED: Input change handlers to clear errors
  const handleInputChange = (setter, fieldName, value) => {
    setter(value);
    if (errors[fieldName]) {
      setErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors[fieldName];
        return updatedErrors;
      });
    }
  };

  const handleTimeInputChange = (timeField, part, text) => {
    const setter = timeField === "timeStarted" ? setTimeStarted : setTimeEnded;
    const previousTime = (timeField === "timeStarted" ? timeStarted : timeEnded)
      .time;

    if (part === "time") {
      let newTime = text;

      // Rule 1: Automatically add colon when user types the second digit of HH
      // e.g., input "0", then types "9" -> text becomes "09" -> newTime becomes "09:"
      if (
        newTime.length === 2 &&
        previousTime.length === 1 &&
        /^\d\d$/.test(newTime)
      ) {
        newTime = newTime + ":";
      }
      // Rule 2: If user types a 3rd digit where a colon should be (e.g., "12" -> "123")
      // text is "123", previousTime is "12"
      else if (
        newTime.length === 3 &&
        previousTime.length === 2 &&
        /^\d\d$/.test(previousTime) &&
        /^\d\d\d$/.test(newTime)
      ) {
        newTime = newTime.slice(0, 2) + ":" + newTime[2];
      }
      // Rule 3: General sanitization and formatting for other cases (pasting, complex edits)
      else {
        let cleanInput = newTime.replace(/[^0-9:]/g, ""); // Remove unwanted characters
        const colonIndex = cleanInput.indexOf(":");
        let multipleColons = (cleanInput.match(/:/g) || []).length > 1;

        if (multipleColons) {
          // If multiple colons, keep only the first one's structure
          const parts = cleanInput.split(":");
          cleanInput =
            parts[0] + (parts.length > 1 ? ":" + parts.slice(1).join("") : "");
          // Now re-evaluate colonIndex after fixing multiple colons
          const firstColonIndex = cleanInput.indexOf(":");
          let hh_part = cleanInput
            .substring(0, firstColonIndex)
            .replace(/\D/g, "")
            .slice(0, 2);
          let mm_part = cleanInput
            .substring(firstColonIndex + 1)
            .replace(/[^0-9]/g, "")
            .slice(0, 2);
          newTime = hh_part + ":" + mm_part;
        } else if (colonIndex !== -1) {
          // Single colon is present
          let hh = cleanInput
            .substring(0, colonIndex)
            .replace(/\D/g, "")
            .slice(0, 2);
          let mm = cleanInput
            .substring(colonIndex + 1)
            .replace(/\D/g, "")
            .slice(0, 2);

          newTime = hh + ":" + mm;
          // If original input ended with ':' and mm is empty, restore the trailing colon.
          // e.g. user types "12:", cleanInput is "12:", hh="12", mm="". newTime should be "12:".
          if (cleanInput.endsWith(":") && mm.length === 0 && hh.length > 0) {
            newTime = hh + ":";
          } else if (hh.length === 0 && colonIndex === 0 && mm.length > 0) {
            // Input like ":30"
            newTime = ":" + mm; // Keep it as is, validation will catch if hh is required
          } else if (
            hh.length > 0 &&
            mm.length === 0 &&
            !cleanInput.endsWith(":") &&
            colonIndex === hh.length
          ) {
            // e.g. user had "12:", deleted ":" -> "12". newTime should be "12"
            newTime = hh;
          }
        } else {
          // No colon in the input
          let digits = cleanInput.replace(/\D/g, "").slice(0, 4); // Max 4 digits if no colon
          if (digits.length > 2) {
            // This handles pasting "1234" -> "12:34" or "123" -> "12:3"
            newTime = digits.slice(0, 2) + ":" + digits.slice(2);
          } else {
            newTime = digits; // "1" or "12"
          }
        }
      }

      // Final length clamp to HH:MM (5 characters)
      newTime = newTime.slice(0, 5);

      setter((prev) => ({ ...prev, time: newTime }));
    } else {
      // part === 'period'
      setter((prev) => ({ ...prev, [part]: text }));
    }

    // Clear errors logic
    if (errors[timeField] && part === "time") {
      setErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors[timeField];
        return updatedErrors;
      });
    }
  };

  const handleRadioChange = (setter, fieldName, value) => {
    setter(value);
    if (errors[fieldName]) {
      setErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors[fieldName];
        return updatedErrors;
      });
    }
  };

  const handleMultiSelectChange = (setter, fieldName, value) => {
    setter(value);
    if (errors[fieldName]) {
      setErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors[fieldName];
        return updatedErrors;
      });
    }
  };

  const handleRatingChange = (setter, fieldName, value) => {
    setter(value);
    if (errors[fieldName]) {
      setErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors[fieldName];
        return updatedErrors;
      });
    }
  };

  const handleLikertChange = (
    categorySetter,
    categoryName,
    fieldName,
    value
  ) => {
    categorySetter((prev) => ({ ...prev, [fieldName]: value }));
    // Use a unique error key, e.g., `${categoryName}.${fieldName}` or just fieldName if unique
    if (errors[fieldName]) {
      setErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors[fieldName];
        return updatedErrors;
      });
    }
  };

  // Reset form
  const resetForm = useCallback(() => {
    setCurrentStep(1);
    setShowThankYou(false);
    setErrors({}); // ADDED: Clear errors on reset
    // Reset all form fields to initial state
    setParticipantID("");
    setDateOfTesting(new Date().toISOString().split("T")[0]);
    // MODIFIED: Reset timeStarted and timeEnded to their new object structure
    setTimeStarted({ time: "", period: "AM" });
    setTimeEnded({ time: "", period: "AM" });
    setResearcherName("");
    setAge("");
    setSex("");
    setYearSection("");
    setEmail("");
    setHeight("");
    setWeight("");
    setPainExperience([]);
    setPainDuration("");
    setSittingHours("");
    setPreviousDevices("");
    setPreviousDevicesDetail("");
    setConditions("");
    setConditionsDetail("");
    setPrePostureRating(0);
    setPreDiscomfortLevel(0);
    setPrePosturalAwareness(0);
    setPostPostureRating(0);
    setPostDiscomfortLevel(0);
    setPostPosturalAwareness(0);
    setDeviceAccuracy(0);
    setFeedbackEffectiveness(0);
    setComfortLevel(0);
    setEffectiveness({
      alertsPoorPosture: 0,
      realtimeFeedback: 0,
      reducedDiscomfort: 0,
      improvedAwareness: 0,
    });
    setFunctionality({
      sensorAccuracy: 0,
      appIntegration: 0,
      wearableDesign: 0,
      consistentFunction: 0,
    });
    setReliability({
      consistentAlerts: 0,
      noInterruptions: 0,
      effectiveAcrossActivities: 0,
      batteryLife: 0,
    });
    setSecurity({
      safeFromHacking: 0,
      authorizedAccess: 0,
      dataControl: 0,
      dataUsageUnderstanding: 0,
    });
    setUsability({
      easySetup: 0,
      intuitiveInterface: 0,
      clearNotifications: 0,
      comfortableWear: 0,
    });
    setSensitivity({
      detectsSmallChanges: 0,
      differentiatesAdjustments: 0,
      adjustableSettings: 0,
      recognizesTransitions: 0,
    });
    setLikedMost("");
    setNeedsImprovement("");
    setWouldRecommend("");
    setDailyRoutine("");
    setPostureAwarenessImpact("");
    setFutureFeatures("");
    setAdditionalComments("");
  }, []);

  // ADDED: Validation function
  const validateStep = (step) => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
    // MODIFIED: Researcher name regex: must contain at least one letter, allows letters, spaces, dots, hyphens.
    const researcherNameRegex = /^(?=.*[a-zA-Z])[a-zA-Z\s.-]+$/;
    const participantIdRegex = /^[0-9]+$/; // Allows only numbers

    if (step === 1) {
      if (
        participantID.trim() &&
        !participantIdRegex.test(participantID.trim())
      ) {
        newErrors.participantID = "Participant ID must be a number.";
      }
      if (!dateOfTesting.trim()) {
        newErrors.dateOfTesting = "Date of testing is required.";
      } else if (!dateRegex.test(dateOfTesting)) {
        newErrors.dateOfTesting = "Date must be YYYY-MM-DD format.";
      }
      if (!timeStarted.time.trim()) {
        newErrors.timeStarted = "Time started is required.";
      } else if (!timeRegex.test(timeStarted.time)) {
        newErrors.timeStarted = "Time must be HH:MM format (e.g., 09:30).";
      }
      if (!timeEnded.time.trim()) {
        newErrors.timeEnded = "Time ended is required.";
      } else if (!timeRegex.test(timeEnded.time)) {
        newErrors.timeEnded = "Time must be HH:MM format (e.g., 17:00).";
      }
      if (
        timeStarted.time.trim() &&
        timeRegex.test(timeStarted.time) &&
        timeEnded.time.trim() &&
        timeRegex.test(timeEnded.time)
      ) {
        const startTimeStr = `${dateOfTesting}T${timeStarted.time}:00`;
        const endTimeStr = `${dateOfTesting}T${timeEnded.time}:00`;
        if (new Date(endTimeStr) <= new Date(startTimeStr)) {
          newErrors.timeEnded = "Time ended must be after time started.";
        }
      }
      if (!researcherName.trim()) {
        newErrors.researcherName = "Researcher name is required.";
      } else if (!researcherNameRegex.test(researcherName.trim())) {
        newErrors.researcherName =
          "Researcher name must contain letters and only use letters, spaces, '.', '-'.";
      }
    } else if (step === 2) {
      if (!age.trim()) {
        newErrors.age = "Age is required.";
      } else if (
        isNaN(parseInt(age)) ||
        parseInt(age) <= 0 ||
        parseInt(age) > 120
      ) {
        newErrors.age = "Please enter a valid age.";
      }
      if (!sex) newErrors.sex = "Sex is required.";
      if (!yearSection.trim())
        newErrors.yearSection = "Year & Section is required.";
      if (!email.trim()) {
        newErrors.email = "Email is required.";
      } else if (!emailRegex.test(email)) {
        newErrors.email = "Invalid email format.";
      }
      if (!height.trim()) {
        newErrors.height = "Height is required.";
      } else if (
        isNaN(parseFloat(height)) ||
        parseFloat(height) <= 0 ||
        parseFloat(height) > 300
      ) {
        newErrors.height = "Please enter a valid height in cm.";
      }
      if (!weight.trim()) {
        newErrors.weight = "Weight is required.";
      } else if (
        isNaN(parseFloat(weight)) ||
        parseFloat(weight) <= 0 ||
        parseFloat(weight) > 500
      ) {
        newErrors.weight = "Please enter a valid weight in kg.";
      }

      // MODIFIED: PainExperience and PainDuration validation
      if (painExperience.length === 0) {
        newErrors.painExperience =
          "Please select at least one option for pain experience.";
      } else {
        const noneIsSelected = painExperience.includes("None of the above");
        if (noneIsSelected) {
          if (painExperience.length > 1) {
            // This state should be corrected by the MultiSelect onChange handler.
            newErrors.painExperience =
              "'None of the above' cannot be selected with other pain options.";
          }
          // If "None of the above" is selected, painDuration must be "N/A".
          // This is enforced by the MultiSelect onChange handler.
          if (painDuration !== "N/A") {
            newErrors.painDuration = // Should ideally not trigger if logic is correct
              "Duration must be 'N/A' when 'None of the above' is selected for pain.";
          }
        } else {
          // Actual pain(s) are selected, and "None of the above" is NOT selected.
          if (!painDuration) { // Check if painDuration is empty (i.e., no selection made)
            newErrors.painDuration =
              "Please specify how long you've experienced this pain/discomfort.";
          }
        }
      }

      if (!sittingHours.trim()) {
        newErrors.sittingHours = "Daily sitting hours is required.";
      } else if (
        isNaN(parseFloat(sittingHours)) ||
        parseFloat(sittingHours) < 0 ||
        parseFloat(sittingHours) > 24
      ) {
        newErrors.sittingHours = "Please enter valid sitting hours (0-24).";
      }
      if (!previousDevices)
        newErrors.previousDevices = "This field is required.";
      if (previousDevices === "Yes" && !previousDevicesDetail.trim()) {
        newErrors.previousDevicesDetail =
          "Please provide details about previous devices.";
      }
      if (!conditions) newErrors.conditions = "This field is required.";
      if (conditions === "Yes" && !conditionsDetail.trim()) {
        newErrors.conditionsDetail =
          "Please provide details about medical conditions.";
      }
    } else if (step === 3) {
      if (prePostureRating === 0)
        newErrors.prePostureRating = "Please rate your current posture.";
      if (preDiscomfortLevel === 0)
        newErrors.preDiscomfortLevel = "Please rate your discomfort level.";
      if (prePosturalAwareness === 0)
        newErrors.prePosturalAwareness = "Please rate your postural awareness.";
    } else if (step === 4) {
      if (postPostureRating === 0)
        newErrors.postPostureRating = "Please rate your current posture.";
      if (postDiscomfortLevel === 0)
        newErrors.postDiscomfortLevel = "Please rate your discomfort level.";
      if (postPosturalAwareness === 0)
        newErrors.postPosturalAwareness =
          "Please rate your postural awareness.";
      if (deviceAccuracy === 0)
        newErrors.deviceAccuracy = "Please rate device accuracy.";
      if (feedbackEffectiveness === 0)
        newErrors.feedbackEffectiveness = "Please rate feedback effectiveness.";
      if (comfortLevel === 0)
        newErrors.comfortLevel = "Please rate comfort level.";
    } else if (step === 5) {
      if (effectiveness.alertsPoorPosture === 0)
        newErrors.alertsPoorPosture = "Please rate this item.";
      if (effectiveness.realtimeFeedback === 0)
        newErrors.realtimeFeedback = "Please rate this item.";
      if (effectiveness.reducedDiscomfort === 0)
        newErrors.reducedDiscomfort = "Please rate this item.";
      if (effectiveness.improvedAwareness === 0)
        newErrors.improvedAwareness = "Please rate this item.";

      if (functionality.sensorAccuracy === 0)
        newErrors.sensorAccuracy = "Please rate this item.";
      if (functionality.appIntegration === 0)
        newErrors.appIntegration = "Please rate this item.";
      if (functionality.wearableDesign === 0) // ADDED
        newErrors.wearableDesign = "Please rate this item.";
      if (functionality.consistentFunction === 0) // ADDED
        newErrors.consistentFunction = "Please rate this item.";

      if (reliability.consistentAlerts === 0) // ADDED
        newErrors.consistentAlerts = "Please rate this item.";
      if (reliability.noInterruptions === 0) // ADDED
        newErrors.noInterruptions = "Please rate this item.";
      if (reliability.effectiveAcrossActivities === 0) // ADDED
        newErrors.effectiveAcrossActivities = "Please rate this item.";
      if (reliability.batteryLife === 0) // ADDED
        newErrors.batteryLife = "Please rate this item.";

      if (security.safeFromHacking === 0) // ADDED
        newErrors.safeFromHacking = "Please rate this item.";
      if (security.authorizedAccess === 0) // ADDED
        newErrors.authorizedAccess = "Please rate this item.";
      if (security.dataControl === 0) // ADDED
        newErrors.dataControl = "Please rate this item.";
      if (security.dataUsageUnderstanding === 0) // ADDED
        newErrors.dataUsageUnderstanding = "Please rate this item.";

    } else if (step === 6) {
      if (usability.easySetup === 0)
        newErrors.easySetup = "Please rate this item.";
      if (usability.intuitiveInterface === 0)
        newErrors.intuitiveInterface = "Please rate this item.";
      if (usability.clearNotifications === 0)
        newErrors.clearNotifications = "Please rate this item.";
      if (usability.comfortableWear === 0)
        newErrors.comfortableWear = "Please rate this item.";

      if (sensitivity.detectsSmallChanges === 0)
        newErrors.detectsSmallChanges = "Please rate this item.";
      if (sensitivity.differentiatesAdjustments === 0)
        newErrors.differentiatesAdjustments = "Please rate this item.";
      if (sensitivity.adjustableSettings === 0) // ADDED
        newErrors.adjustableSettings = "Please rate this item.";
      if (sensitivity.recognizesTransitions === 0) // ADDED
        newErrors.recognizesTransitions = "Please rate this item.";
    } else if (step === 7) {
      // Qualitative feedback is optional, but if you want to make some required:
      // if (!likedMost.trim()) newErrors.likedMost = "This field is required.";
      // if (!needsImprovement.trim()) newErrors.needsImprovement = "This field is required.";
      // if (!wouldRecommend.trim()) newErrors.wouldRecommend = "This field is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // MODIFIED: Renamed original handleSubmit to actualSubmitLogic
  const actualSubmitLogic = useCallback(async () => {
    setIsSubmitting(true);

    try {
      const formData = {
        userUID: userUID || "anonymous",
        userName: userName || "Anonymous User",
        timestamp: Date.now(),
        date: new Date().toISOString(),

        // Participant Information
        participantInfo: {
          participantID,
          dateOfTesting,
          // MODIFIED: Combine time and period for timeStarted and timeEnded
          timeStarted: timeStarted.time
            ? `${timeStarted.time} ${timeStarted.period}`
            : "",
          timeEnded: timeEnded.time
            ? `${timeEnded.time} ${timeEnded.period}`
            : "",
          researcherName,
        },

        // Demographics
        demographics: {
          age: parseInt(age) || null,
          sex,
          yearSection,
          email,
          height: parseFloat(height) || null,
          weight: parseFloat(weight) || null,
          painExperience,
          painDuration,
          sittingHours: parseFloat(sittingHours) || null,
          previousDevices,
          previousDevicesDetail,
          conditions,
          conditionsDetail,
        },

        // Pre-test Assessment
        preTestAssessment: {
          postureRating: prePostureRating,
          discomfortLevel: preDiscomfortLevel,
          posturalAwareness: prePosturalAwareness,
        },

        // Post-test Assessment
        postTestAssessment: {
          postureRating: postPostureRating,
          discomfortLevel: postDiscomfortLevel,
          posturalAwareness: postPosturalAwareness,
          deviceAccuracy,
          feedbackEffectiveness,
          comfortLevel,
        },

        // Comprehensive Evaluation
        comprehensiveEvaluation: {
          effectiveness,
          functionality,
          reliability,
          security,
          usability,
          sensitivity,
        },

        // Qualitative Feedback
        qualitativeFeedback: {
          likedMost,
          needsImprovement,
          wouldRecommend,
          dailyRoutine, // Ensure these are included even if not strictly validated
          postureAwarenessImpact,
          futureFeatures,
          additionalComments,
        },

        appVersion: "1.0.0",
      };

      // Save to Firebase
      const feedbackRef = ref(database, "research-feedback");
      await push(feedbackRef, formData);

      // Show thank you message
      setShowThankYou(true);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      Alert.alert(
        "Submission Error",
        "Failed to submit feedback. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    userUID,
    userName,
    participantID,
    dateOfTesting,
    timeStarted,
    timeEnded,
    researcherName,
    age,
    sex,
    yearSection,
    email,
    height,
    weight,
    painExperience,
    painDuration,
    sittingHours,
    previousDevices,
    previousDevicesDetail,
    conditions,
    conditionsDetail,
    prePostureRating,
    preDiscomfortLevel,
    prePosturalAwareness,
    postPostureRating,
    postDiscomfortLevel,
    postPosturalAwareness,
    deviceAccuracy,
    feedbackEffectiveness,
    comfortLevel,
    effectiveness,
    functionality,
    reliability,
    security,
    usability,
    sensitivity,
    likedMost,
    needsImprovement,
    wouldRecommend,
    dailyRoutine,
    postureAwarenessImpact,
    futureFeatures,
    additionalComments,
  ]);

  // ADDED: Handlers for step navigation and final submission
  const handleNext = (nextStep) => {
    if (validateStep(currentStep)) {
      setCurrentStep(nextStep);
      // ADDED: Scroll to top
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    } else {
      Alert.alert(
        "Validation Error",
        "Please correct the errors on this page."
      );
    }
  };

  const handleFinalSubmit = async () => {
    if (validateStep(currentStep)) {
      // Validate the last step
      await actualSubmitLogic(); // Call the renamed submission function
    } else {
      Alert.alert(
        "Validation Error",
        "Please correct the errors before submitting."
      );
    }
  };

  // Handle closing with proper cleanup
  const handleActualClose = useCallback(() => {
    if (showThankYou) {
      resetForm();
      if (onClose) onClose(); // Call onClose only if it exists
      return;
    }
    resetForm();
    if (onClose) onClose(); // Call onClose only if it exists
  }, [showThankYou, resetForm, onClose]);

  // Utility components
  const ScaleRating = (
    { value, onChange, min = 1, max = 10, error } // ADDED error prop
  ) => (
    <View style={styles.scaleContainer}>
      <View style={styles.scaleNumbers}>
        {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.scaleNumber,
              value === num && styles.selectedScaleNumber,
            ]}
            onPress={() => onChange(num)}
          >
            <Text
              style={[
                styles.scaleNumberText,
                value === num && styles.selectedScaleNumberText,
              ]}
            >
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  const LikertScale = ({ value, onChange, error }) => {
    const options = [
      { value: 1, label: "Strongly Disagree" },
      { value: 2, label: "Disagree" },
      { value: 3, label: "Neutral" },
      { value: 4, label: "Agree" },
      { value: 5, label: "Strongly Agree" },
    ];

    return (
      <View style={styles.likertContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.likertOption,
              value === option.value && styles.selectedLikertOption,
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text
              style={[
                styles.likertText,
                value === option.value && styles.selectedLikertText,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
        {error && <Text style={styles.errorText}>{error}</Text>}{" "}
        {/* ADDED: Display error message */}
      </View>
    );
  };

  const MultiSelect = ({ options, selected, onChange, error }) => {
    // ADDED error prop
    const toggleOption = (option) => {
      const newSelected = selected.includes(option)
        ? selected.filter((item) => item !== option)
        : [...selected, option];
      onChange(newSelected);
    };

    return (
      <View style={styles.multiSelectContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.multiSelectOption,
              selected.includes(option) && styles.selectedMultiSelectOption,
            ]}
            onPress={() => toggleOption(option)}
          >
            <Text
              style={[
                styles.multiSelectText,
                selected.includes(option) && styles.selectedMultiSelectText,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  };

  // Step 1: Participant Information
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>I. Participant Information</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Participant ID:</Text>
        <TextInput
          style={[
            styles.textInput,
            errors.participantID && styles.inputError,
            userUID && sequentialID && styles.disabledInput, // Style for disabled
          ]}
          placeholder={userUID && sequentialID ? "" : "To be assigned by researcher (or N/A)"}
          value={participantID}
          onChangeText={(text) =>
            handleInputChange(setParticipantID, "participantID", text)
          }
          editable={!(userUID && sequentialID)} // Non-editable if auto-filled
        />
        {errors.participantID && (
          <Text style={styles.errorText}>{errors.participantID}</Text>
        )}
        {userUID && sequentialID && (
          <Text style={styles.infoText}>Your User ID is automatically used.</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Date of Testing:</Text>
        <TextInput
          style={[styles.textInput, errors.dateOfTesting && styles.inputError]}
          placeholder="YYYY-MM-DD"
          value={dateOfTesting}
          onChangeText={(text) =>
            handleInputChange(setDateOfTesting, "dateOfTesting", text)
          }
        />
        {errors.dateOfTesting && (
          <Text style={styles.errorText}>{errors.dateOfTesting}</Text>
        )}
      </View>

      {/* MODIFIED: Time Started Input with AM/PM */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Time Started:</Text>
        <View style={styles.timeInputRow}>
          <TextInput
            style={[
              styles.timeTextInput,
              errors.timeStarted && styles.inputError,
            ]}
            placeholder="HH:MM"
            value={timeStarted.time}
            onChangeText={(text) =>
              handleTimeInputChange("timeStarted", "time", text)
            }
            keyboardType="numbers-and-punctuation"
          />
          <View style={styles.ampmSelector}>
            {["AM", "PM"].map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.ampmOption,
                  timeStarted.period === p && styles.selectedAmpmOption,
                ]}
                onPress={() =>
                  handleTimeInputChange("timeStarted", "period", p)
                }
              >
                <Text
                  style={[
                    styles.ampmOptionText,
                    timeStarted.period === p && styles.selectedAmpmOptionText,
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {errors.timeStarted && (
          <Text style={styles.errorText}>{errors.timeStarted}</Text>
        )}
      </View>

      {/* MODIFIED: Time Ended Input with AM/PM */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Time Ended:</Text>
        <View style={styles.timeInputRow}>
          <TextInput
            style={[
              styles.timeTextInput,
              errors.timeEnded && styles.inputError,
            ]}
            placeholder="HH:MM"
            value={timeEnded.time}
            onChangeText={(text) =>
              handleTimeInputChange("timeEnded", "time", text)
            }
            keyboardType="numbers-and-punctuation"
          />
          <View style={styles.ampmSelector}>
            {["AM", "PM"].map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.ampmOption,
                  timeEnded.period === p && styles.selectedAmpmOption,
                ]}
                onPress={() => handleTimeInputChange("timeEnded", "period", p)}
              >
                <Text
                  style={[
                    styles.ampmOptionText,
                    timeEnded.period === p && styles.selectedAmpmOptionText,
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {errors.timeEnded && (
          <Text style={styles.errorText}>{errors.timeEnded}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Researcher Name:</Text>
        <TextInput
          style={[styles.textInput, errors.researcherName && styles.inputError]}
          placeholder="Enter researcher name"
          value={researcherName}
          onChangeText={(text) =>
            handleInputChange(setResearcherName, "researcherName", text)
          }
        />
        {errors.researcherName && (
          <Text style={styles.errorText}>{errors.researcherName}</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => handleNext(2)} // MODIFIED
      >
        <Text style={styles.nextButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  // Step 2: Demographics
  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>II. Demographic Information</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Age (years):</Text>
        <TextInput
          style={[styles.textInput, errors.age && styles.inputError]}
          placeholder="Enter age"
          value={age}
          onChangeText={(text) => handleInputChange(setAge, "age", text)}
          keyboardType="numeric"
        />
        {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Sex:</Text>
        <View style={styles.radioGroup}>
          {["Male", "Female", "Prefer not to say"].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.radioOption,
                sex === option && styles.selectedRadioOption,
                errors.sex && styles.inputError, // You might need a specific style for radio group error indication
              ]}
              onPress={() => handleRadioChange(setSex, "sex", option)}
            >
              <Text
                style={[
                  styles.radioText,
                  sex === option && styles.selectedRadioText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.sex && <Text style={styles.errorText}>{errors.sex}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Year & Section:</Text>
        <TextInput
          style={[styles.textInput, errors.yearSection && styles.inputError]}
          placeholder="e.g., 3rd Year Section A"
          value={yearSection}
          onChangeText={(text) =>
            handleInputChange(setYearSection, "yearSection", text)
          }
        />
        {errors.yearSection && (
          <Text style={styles.errorText}>{errors.yearSection}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email Address:</Text>
        <TextInput
          style={[styles.textInput, errors.email && styles.inputError]}
          placeholder="Enter email address"
          value={email}
          onChangeText={(text) => handleInputChange(setEmail, "email", text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <View style={styles.twoColumnRow}>
        <View style={styles.halfInputGroup}>
          <Text style={styles.inputLabel}>Height (cm):</Text>
          <TextInput
            style={[styles.textInput, errors.height && styles.inputError]}
            placeholder="Height"
            value={height}
            onChangeText={(text) =>
              handleInputChange(setHeight, "height", text)
            }
            keyboardType="numeric"
          />
          {errors.height && (
            <Text style={styles.errorText}>{errors.height}</Text>
          )}
        </View>
        <View style={styles.halfInputGroup}>
          <Text style={styles.inputLabel}>Weight (kg):</Text>
          <TextInput
            style={[styles.textInput, errors.weight && styles.inputError]}
            placeholder="Weight"
            value={weight}
            onChangeText={(text) =>
              handleInputChange(setWeight, "weight", text)
            }
            keyboardType="numeric"
          />
          {errors.weight && (
            <Text style={styles.errorText}>{errors.weight}</Text>
          )}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          Do you experience any of the following? (Check all that apply)
        </Text>
        <MultiSelect
          options={[
            "Neck pain",
            "Upper back pain",
            "Lower back pain",
            "Shoulder pain",
            "None of the above",
          ]}
          selected={painExperience}
          onChange={(value) => {
            // value is the new array of selected options from MultiSelect
            let newPainExperienceState = [...value];
            let newPainDurationState = painDuration; // Current painDuration from React state

            const noneIsNowSelected =
              newPainExperienceState.includes("None of the above");
            const noneWasPreviouslySelected =
              painExperience.includes("None of the above"); // painExperience from React state (old value)

            if (noneIsNowSelected) {
              // If "None of the above" is selected, it should be the only option.
              newPainExperienceState = ["None of the above"];
              // And painDuration should be "N/A".
              if (newPainDurationState.trim().toUpperCase() !== "N/A") {
                newPainDurationState = "N/A";
              }
            } else {
              // "None of the above" is NOT selected in the new value.
              // If it WAS selected previously, and duration was "N/A", clear duration.
              if (
                noneWasPreviouslySelected &&
                newPainDurationState.trim().toUpperCase() === "N/A"
              ) {
                newPainDurationState = "";
              }
            }

            // Update painExperience state
            // Check if newPainExperienceState is actually different from current painExperience state
            // This simple comparison works for array of strings if order doesn't matter and items are unique
            const painExperienceChanged = !(
              newPainExperienceState.length === painExperience.length &&
              newPainExperienceState.every((item) =>
                painExperience.includes(item)
              )
            );

            if (painExperienceChanged) {
              handleMultiSelectChange(
                setPainExperience,
                "painExperience",
                newPainExperienceState
              );
            }

            // MODIFIED: Logic for painDuration based on painExperience
            if (noneIsNowSelected) {
              // If "None of the above" is selected, painDuration MUST be "N/A".
              if (painDuration !== "N/A") { // Only update if not already "N/A"
                handleRadioChange(setPainDuration, "painDuration", "N/A");
              }
            } else {
              // "None of the above" is NOT selected.
              // If it WAS previously selected AND painDuration was "N/A", clear painDuration to force re-selection.
              if (
                painExperience.includes("None of the above") && // Check old painExperience state
                newPainDurationState === "N/A" // Check current painDuration state (which was newPainDurationState before this block)
              ) {
                handleRadioChange(setPainDuration, "painDuration", ""); // Clear to prompt selection
              }
            }
          }}
          error={errors.painExperience}
        />
      </View>

      {/* MODIFIED: Pain Duration Input Field to Multiple Choice Radio */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          {painExperience.includes("None of the above")
            ? "Pain/Discomfort Duration:"
            : "How long have you been experiencing this pain/discomfort (if any)?"}
        </Text>
        <View style={styles.radioGroup}>
          {[
            { label: "Less than 1 month", value: "Less than 1 month" },
            { label: "1-6 months", value: "1-6 months" },
            { label: "6-12 months", value: "6-12 months" },
            { label: "More than 1 year", value: "More than 1 year" },
            { label: "N/A", value: "N/A" },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.radioOption,
                painDuration === option.value && styles.selectedRadioOption,
                errors.painDuration && styles.inputError, // Apply error style to container or options
                painExperience.includes("None of the above") && option.value !== "N/A" && styles.disabledRadioOption, // Style non-"N/A" options as disabled
                painExperience.includes("None of the above") && option.value === "N/A" && styles.selectedRadioOption, // Ensure "N/A" is styled as selected
              ]}
              onPress={() => {
                if (!painExperience.includes("None of the above")) {
                  handleRadioChange(setPainDuration, "painDuration", option.value);
                }
                // If "None of the above" is selected for pain, only "N/A" for duration is effectively allowed (handled by painExperience onChange)
              }}
              disabled={painExperience.includes("None of the above") && option.value !== "N/A"}
            >
              <Text
                style={[
                  styles.radioText,
                  painDuration === option.value && styles.selectedRadioText,
                  painExperience.includes("None of the above") && option.value !== "N/A" && styles.disabledRadioText,
                  painExperience.includes("None of the above") && option.value === "N/A" && styles.selectedRadioText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.painDuration && (
          <Text style={styles.errorText}>{errors.painDuration}</Text>
        )}
        {painExperience.includes("None of the above") && (
          <Text style={styles.infoText}>Duration is set to N/A as no pain is selected.</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          Average hours spent sitting per day:
        </Text>
        <TextInput
          style={[styles.textInput, errors.sittingHours && styles.inputError]}
          placeholder="e.g., 8"
          value={sittingHours}
          onChangeText={(text) =>
            handleInputChange(setSittingHours, "sittingHours", text)
          }
          keyboardType="numeric"
        />
        {errors.sittingHours && (
          <Text style={styles.errorText}>{errors.sittingHours}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          Have you used any posture correction devices before?
        </Text>
        <View style={styles.radioGroup}>
          {["Yes", "No"].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.radioOption,
                previousDevices === option && styles.selectedRadioOption,
                errors.previousDevices && styles.inputError,
              ]}
              onPress={() =>
                handleRadioChange(setPreviousDevices, "previousDevices", option)
              }
            >
              <Text
                style={[
                  styles.radioText,
                  previousDevices === option && styles.selectedRadioText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.previousDevices && (
          <Text style={styles.errorText}>{errors.previousDevices}</Text>
        )}
      </View>

      {previousDevices === "Yes" && (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            If yes, please specify which device(s) and your experience:
          </Text>
          <TextInput
            style={[
              styles.textArea,
              errors.previousDevicesDetail && styles.inputError,
            ]}
            placeholder="Details about previous devices..."
            value={previousDevicesDetail}
            onChangeText={(text) =>
              handleInputChange(
                setPreviousDevicesDetail,
                "previousDevicesDetail",
                text
              )
            }
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          {errors.previousDevicesDetail && (
            <Text style={styles.errorText}>{errors.previousDevicesDetail}</Text>
          )}
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          Do you have any pre-existing medical conditions related to your spine
          or posture (e.g., scoliosis, herniated disc)?
        </Text>
        <View style={styles.radioGroup}>
          {["Yes", "No"].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.radioOption,
                conditions === option && styles.selectedRadioOption,
                errors.conditions && styles.inputError,
              ]}
              onPress={() =>
                handleRadioChange(setConditions, "conditions", option)
              }
            >
              <Text
                style={[
                  styles.radioText,
                  conditions === option && styles.selectedRadioText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.conditions && (
          <Text style={styles.errorText}>{errors.conditions}</Text>
        )}
      </View>

      {conditions === "Yes" && (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>If yes, please specify:</Text>
          <TextInput
            style={[
              styles.textArea,
              errors.conditionsDetail && styles.inputError,
            ]}
            placeholder="Details about medical conditions..."
            value={conditionsDetail}
            onChangeText={(text) =>
              handleInputChange(setConditionsDetail, "conditionsDetail", text)
            }
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          {errors.conditionsDetail && (
            <Text style={styles.errorText}>{errors.conditionsDetail}</Text>
          )}
        </View>
      )}

      <View style={styles.stepNavigation}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep(1)}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => handleNext(3)} // MODIFIED
        >
          <Text style={styles.nextButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Step 3: Pre-test Assessment
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>III. Pre-Test Assessment</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Current Posture Self-Assessment:</Text>
        <Text style={styles.scaleDescription}>
          On a scale of 1-10, how would you rate your current posture? (1 = very
          poor, 10 = excellent)
        </Text>
        <ScaleRating
          value={prePostureRating}
          onChange={(value) =>
            handleRatingChange(setPrePostureRating, "prePostureRating", value)
          }
          error={errors.prePostureRating} // Pass error
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Posture-Related Discomfort Level:</Text>
        <Text style={styles.scaleDescription}>
          On a scale of 1-10, how would you rate any discomfort related to your
          posture? (1 = no discomfort, 10 = severe discomfort)
        </Text>
        <ScaleRating
          value={preDiscomfortLevel}
          onChange={(value) =>
            handleRatingChange(
              setPreDiscomfortLevel,
              "preDiscomfortLevel",
              value
            )
          }
          error={errors.preDiscomfortLevel} // Pass error
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Postural Awareness:</Text>
        <Text style={styles.scaleDescription}>
          On a scale of 1-10, how aware are you of your posture throughout the
          day? (1 = not aware at all, 10 = constantly aware)
        </Text>
        <ScaleRating
          value={prePosturalAwareness}
          onChange={(value) =>
            handleRatingChange(
              setPrePosturalAwareness,
              "prePosturalAwareness",
              value
            )
          }
          error={errors.prePosturalAwareness} // Pass error
        />
      </View>

      <View style={styles.stepNavigation}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep(2)}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => handleNext(4)} // MODIFIED
        >
          <Text style={styles.nextButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Step 4: Post-test Assessment
  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>IV. Post-Test Assessment</Text> {/* CORRECTED ROMAN NUMERAL */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Current Posture Self-Assessment:</Text>
        <Text style={styles.scaleDescription}>
          On a scale of 1-10, how would you rate your posture now? (1 = very
          poor, 10 = excellent)
        </Text>
        <ScaleRating
          value={postPostureRating}
          onChange={(value) =>
            handleRatingChange(setPostPostureRating, "postPostureRating", value)
          }
          error={errors.postPostureRating}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Posture-Related Discomfort Level:</Text>
        <Text style={styles.scaleDescription}>
          On a scale of 1-10, how would you rate any discomfort related to your
          posture now? (1 = no discomfort, 10 = severe discomfort)
        </Text>
        <ScaleRating
          value={postDiscomfortLevel}
          onChange={(value) =>
            handleRatingChange(
              setPostDiscomfortLevel,
              "postDiscomfortLevel",
              value
            )
          }
          error={errors.postDiscomfortLevel}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Postural Awareness:</Text>
        <Text style={styles.scaleDescription}>
          On a scale of 1-10, how aware are you of your posture now? (1 = not
          aware at all, 10 = constantly aware)
        </Text>
        <ScaleRating
          value={postPosturalAwareness}
          onChange={(value) =>
            handleRatingChange(
              setPostPosturalAwareness,
              "postPosturalAwareness",
              value
            )
          }
          error={errors.postPosturalAwareness}
        />
      </View>
      <Text style={styles.subsectionTitle}>B. Device Ratings</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Device Accuracy:</Text>
        <Text style={styles.scaleDescription}>
          On a scale of 1-10, how accurate do you feel the device was at
          detecting poor posture? (1 = very inaccurate, 10 = very accurate)
        </Text>
        <ScaleRating
          value={deviceAccuracy}
          onChange={(value) =>
            handleRatingChange(setDeviceAccuracy, "deviceAccuracy", value)
          }
          error={errors.deviceAccuracy}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Feedback Effectiveness:</Text>
        <Text style={styles.scaleDescription}>
          On a scale of 1-10, how effective was the feedback at helping you
          correct your posture? (1 = not effective, 10 = very effective)
        </Text>
        <ScaleRating
          value={feedbackEffectiveness}
          onChange={(value) =>
            handleRatingChange(
              setFeedbackEffectiveness,
              "feedbackEffectiveness",
              value
            )
          }
          error={errors.feedbackEffectiveness}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Comfort Level:</Text>
        <Text style={styles.scaleDescription}>
          On a scale of 1-10, how comfortable was the device to wear? (1 = very
          uncomfortable, 10 = very comfortable)
        </Text>
        <ScaleRating
          value={comfortLevel}
          onChange={(value) =>
            handleRatingChange(setComfortLevel, "comfortLevel", value)
          }
          error={errors.comfortLevel}
        />
      </View>
      <View style={styles.stepNavigation}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep(3)}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => handleNext(5)} // MODIFIED
        >
          <Text style={styles.nextButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Step 5: Comprehensive Evaluation (Part 1)
  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>
        V. Comprehensive Evaluation (Part 1) {/* CORRECTED ROMAN NUMERAL */}
      </Text>

      <Text style={styles.subsectionTitle}>A. Effectiveness</Text>

      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>
          AlignMate effectively alerts me when I exhibit poor posture.
        </Text>
        <LikertScale
          value={effectiveness.alertsPoorPosture}
          onChange={(value) =>
            handleLikertChange(
              setEffectiveness,
              "effectiveness",
              "alertsPoorPosture",
              value
            )
          }
          error={errors.alertsPoorPosture}
        />
      </View>

      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>
          The real-time feedback helps me immediately correct my posture.
        </Text>
        <LikertScale
          value={effectiveness.realtimeFeedback}
          onChange={(value) =>
            handleLikertChange(
              setEffectiveness,
              "effectiveness",
              "realtimeFeedback",
              value
            )
          }
          error={errors.realtimeFeedback}
        />
      </View>

      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>
          After using AlignMate, I have experienced reduced discomfort due to
          poor posture.
        </Text>
        <LikertScale
          value={effectiveness.reducedDiscomfort}
          onChange={(value) =>
            handleLikertChange(
              setEffectiveness,
              "effectiveness",
              "reducedDiscomfort",
              value
            )
          }
          error={errors.reducedDiscomfort}
        />
      </View>

      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>
          AlignMate has improved my overall awareness of maintaining good
          posture.
        </Text>
        <LikertScale
          value={effectiveness.improvedAwareness}
          onChange={(value) =>
            handleLikertChange(
              setEffectiveness,
              "effectiveness",
              "improvedAwareness",
              value
            )
          }
          error={errors.improvedAwareness}
        />
      </View>

      <Text style={styles.subsectionTitle}>B. Functionality</Text>

      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>
          The sensors accurately detect my posture in different sitting and
          standing positions.
        </Text>
        <LikertScale
          value={functionality.sensorAccuracy}
          onChange={(value) =>
            handleLikertChange(
              setFunctionality,
              "functionality",
              "sensorAccuracy",
              value
            )
          }
          error={errors.sensorAccuracy}
        />
      </View>

      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>
          The device integrates well with its companion app for real-time
          monitoring.
        </Text>
        <LikertScale
          value={functionality.appIntegration}
          onChange={(value) =>
            handleLikertChange(
              setFunctionality,
              "functionality",
              "appIntegration",
              value
            )
          }
          error={errors.appIntegration}
        />
      </View>

      {/* ADDED: Missing Functionality Questions */}
      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>
          The wearable design does not interfere with my daily activities.
        </Text>
        <LikertScale
          value={functionality.wearableDesign}
          onChange={(value) =>
            handleLikertChange(
              setFunctionality,
              "functionality",
              "wearableDesign",
              value
            )
          }
          error={errors.wearableDesign}
        />
      </View>

      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>
          The device functions consistently across different environments (home, school, etc.).
        </Text>
        <LikertScale
          value={functionality.consistentFunction}
          onChange={(value) =>
            handleLikertChange(
              setFunctionality,
              "functionality",
              "consistentFunction",
              value
            )
          }
          error={errors.consistentFunction}
        />
      </View>

      {/* ADDED: C. Reliability Section */}
      <Text style={styles.subsectionTitle}>C. Reliability</Text>
      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>
          AlignMate consistently provides accurate posture alerts without errors.
        </Text>
        <LikertScale
          value={reliability.consistentAlerts}
          onChange={(value) =>
            handleLikertChange(
              setReliability,
              "reliability",
              "consistentAlerts",
              value
            )
          }
          error={errors.consistentAlerts}
        />
      </View>
      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>
          The device operates without interruptions during prolonged use.
        </Text>
        <LikertScale
          value={reliability.noInterruptions}
          onChange={(value) =>
            handleLikertChange(
              setReliability,
              "reliability",
              "noInterruptions",
              value
            )
          }
          error={errors.noInterruptions}
        />
      </View>
      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>
          The posture correction feedback remains effective across different activities (e.g., studying, working).
        </Text>
        <LikertScale
          value={reliability.effectiveAcrossActivities}
          onChange={(value) =>
            handleLikertChange(
              setReliability,
              "reliability",
              "effectiveAcrossActivities",
              value
            )
          }
          error={errors.effectiveAcrossActivities}
        />
      </View>
      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>
          The battery life is sufficient for daily use.
        </Text>
        <LikertScale
          value={reliability.batteryLife}
          onChange={(value) =>
            handleLikertChange(
              setReliability,
              "reliability",
              "batteryLife",
              value
            )
          }
          error={errors.batteryLife}
        />
      </View>

      {/* ADDED: D. Security Section */}
      <Text style={styles.subsectionTitle}>D. Security</Text>
      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>
          I feel safe using AlignMate without concerns about hacking or unauthorized access.
        </Text>
        <LikertScale
          value={security.safeFromHacking}
          onChange={(value) =>
            handleLikertChange(
              setSecurity,
              "security",
              "safeFromHacking",
              value
            )
          }
          error={errors.safeFromHacking}
        />
      </View>
      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>
          AlignMate ensures that only authorized users can access my posture tracking history.
        </Text>
        <LikertScale
          value={security.authorizedAccess}
          onChange={(value) =>
            handleLikertChange(
              setSecurity,
              "security",
              "authorizedAccess",
              value
            )
          }
          error={errors.authorizedAccess}
        />
      </View>
      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>
          The app allows me to control what data is collected and shared.
        </Text>
        <LikertScale
          value={security.dataControl}
          onChange={(value) =>
            handleLikertChange(
              setSecurity,
              "security",
              "dataControl",
              value
            )
          }
          error={errors.dataControl}
        />
      </View>
      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>
          I understand how my posture data is used and stored.
        </Text>
        <LikertScale
          value={security.dataUsageUnderstanding}
          onChange={(value) =>
            handleLikertChange(
              setSecurity,
              "security",
              "dataUsageUnderstanding",
              value
            )
          }
          error={errors.dataUsageUnderstanding}
        />
      </View>

      <View style={styles.stepNavigation}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep(4)}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => handleNext(6)} // MODIFIED
        >
          <Text style={styles.nextButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Step 6: Comprehensive Evaluation (Part 2)
  const renderStep6 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>
        V. Comprehensive Evaluation (Part 2) {/* CORRECTED ROMAN NUMERAL */}
      </Text>
      <Text style={styles.subsectionTitle}>E. Usability</Text>{" "}
      {/* Assuming C & D were on a previous unseen step or combined */}
      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>
          AlignMate is easy to set up and use, even for first-time users.
        </Text>
        <LikertScale
          value={usability.easySetup}
          onChange={(value) =>
            handleLikertChange(setUsability, "usability", "easySetup", value)
          }
          error={errors.easySetup}
        />
      </View>
      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>
          The user interface of the companion app is intuitive and simple to
          navigate.
        </Text>
        <LikertScale
          value={usability.intuitiveInterface}
          onChange={(value) =>
            handleLikertChange(
              setUsability,
              "usability",
              "intuitiveInterface",
              value
            )
          }
          error={errors.intuitiveInterface}
        />
      </View>
      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>
          The notifications are easy to understand and act upon.
        </Text>
        <LikertScale
          value={usability.clearNotifications}
          onChange={(value) =>
            handleLikertChange(
              setUsability,
              "usability",
              "clearNotifications",
              value
            )
          }
          error={errors.clearNotifications}
        />
      </View>
      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>
          AlignMate is comfortable to wear for long periods.
        </Text>
        <LikertScale
          value={usability.comfortableWear}
          onChange={(value) =>
            handleLikertChange(
              setUsability,
              "usability",
              "comfortableWear",
              value
            )
          }
          error={errors.comfortableWear}
        />
      </View>
      <Text style={styles.subsectionTitle}>F. Sensitivity</Text>
      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>
          The device accurately detects even small changes in my posture.
        </Text>
        <LikertScale
          value={sensitivity.detectsSmallChanges}
          onChange={(value) =>
            handleLikertChange(
              setSensitivity,
              "sensitivity",
              "detectsSmallChanges",
              value
            )
          }
          error={errors.detectsSmallChanges}
        />
      </View>
      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>
          The posture tracking system effectively differentiates between minor
          and major adjustments.
        </Text>
        <LikertScale
          value={sensitivity.differentiatesAdjustments}
          onChange={(value) =>
            handleLikertChange(
              setSensitivity,
              "sensitivity",
              "differentiatesAdjustments",
              value
            )
          }
          error={errors.differentiatesAdjustments}
        />
      </View>
      {/* ADDED: Missing Sensitivity Questions */}
      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>
          The sensitivity settings can be adjusted to my personal needs.
        </Text>
        <LikertScale
          value={sensitivity.adjustableSettings}
          onChange={(value) =>
            handleLikertChange(
              setSensitivity,
              "sensitivity",
              "adjustableSettings",
              value
            )
          }
          error={errors.adjustableSettings}
        />
      </View>
      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>
          The system appropriately recognizes when I'm in transition between positions.
        </Text>
        <LikertScale
          value={sensitivity.recognizesTransitions}
          onChange={(value) =>
            handleLikertChange(
              setSensitivity,
              "sensitivity",
              "recognizesTransitions",
              value
            )
          }
          error={errors.recognizesTransitions}
        />
      </View>
      <View style={styles.stepNavigation}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep(5)}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => handleNext(7)} // MODIFIED
        >
          <Text style={styles.nextButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Step 7: Qualitative Feedback
  const renderStep7 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>VII. Qualitative Feedback</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          What did you like most about the AlignMate system?
        </Text>
        <TextInput
          style={[styles.textArea, errors.likedMost && styles.inputError]}
          placeholder="Share what you enjoyed about using AlignMate..."
          value={likedMost}
          onChangeText={(text) =>
            handleInputChange(setLikedMost, "likedMost", text)
          }
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        {errors.likedMost && (
          <Text style={styles.errorText}>{errors.likedMost}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          What aspects of the AlignMate system need improvement?
        </Text>
        <TextInput
          style={[
            styles.textArea,
            errors.needsImprovement && styles.inputError,
          ]}
          placeholder="Tell us what could be improved..."
          value={needsImprovement}
          onChangeText={(text) =>
            handleInputChange(setNeedsImprovement, "needsImprovement", text)
          }
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        {errors.needsImprovement && (
          <Text style={styles.errorText}>{errors.needsImprovement}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          Would you continue to use AlignMate or recommend it to others? Why or
          why not?
        </Text>
        <TextInput
          style={[styles.textArea, errors.wouldRecommend && styles.inputError]}
          placeholder="Share your thoughts on recommending AlignMate..."
          value={wouldRecommend}
          onChangeText={(text) =>
            handleInputChange(setWouldRecommend, "wouldRecommend", text)
          }
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        {errors.wouldRecommend && (
          <Text style={styles.errorText}>{errors.wouldRecommend}</Text>
        )}
      </View>

      {/* Optional qualitative fields - add validation if they become required */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          How do you envision AlignMate fitting into your daily routine?
        </Text>
        <TextInput
          style={[styles.textArea, errors.dailyRoutine && styles.inputError]}
          placeholder="Describe its potential role in your day..."
          value={dailyRoutine}
          onChangeText={(text) =>
            handleInputChange(setDailyRoutine, "dailyRoutine", text)
          }
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        {errors.dailyRoutine && (
          <Text style={styles.errorText}>{errors.dailyRoutine}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          How has AlignMate impacted your awareness of your posture?
        </Text>
        <TextInput
          style={[
            styles.textArea,
            errors.postureAwarenessImpact && styles.inputError,
          ]}
          placeholder="Share any changes in your postural awareness..."
          value={postureAwarenessImpact}
          onChangeText={(text) =>
            handleInputChange(
              setPostureAwarenessImpact,
              "postureAwarenessImpact",
              text
            )
          }
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        {errors.postureAwarenessImpact && (
          <Text style={styles.errorText}>{errors.postureAwarenessImpact}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          What features would you like to see added to AlignMate in the future?
        </Text>
        <TextInput
          style={[styles.textArea, errors.futureFeatures && styles.inputError]}
          placeholder="Suggest future features or improvements..."
          value={futureFeatures}
          onChangeText={(text) =>
            handleInputChange(setFutureFeatures, "futureFeatures", text)
          }
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        {errors.futureFeatures && (
          <Text style={styles.errorText}>{errors.futureFeatures}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          Any additional comments or suggestions?
        </Text>
        <TextInput
          style={[
            styles.textArea,
            errors.additionalComments && styles.inputError,
          ]}
          placeholder="Share any other thoughts or feedback..."
          value={additionalComments}
          onChangeText={(text) =>
            handleInputChange(setAdditionalComments, "additionalComments", text)
          }
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        {errors.additionalComments && (
          <Text style={styles.errorText}>{errors.additionalComments}</Text>
        )}
      </View>

      <View style={styles.stepNavigation}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep(6)}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.disabledButton]}
          onPress={handleFinalSubmit} // MODIFIED
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // Thank you screen
  const renderThankYou = () => (
    <View style={styles.thankYouContainer}>
      <Image
        source={{ uri: FEEDBACK_ICONS.success }}
        style={styles.successIcon}
      />
      <Text style={styles.thankYouTitle}>Research Form Submitted! 🙏</Text>
      <Text style={styles.thankYouMessage}>
        Thank you for participating in our AlignMate research study. Your
        detailed feedback will help us improve the system and contribute to
        better posture monitoring solutions.
      </Text>
      <Text style={styles.thankYouSubMessage}>
        Your responses have been securely saved and will be used for research
        purposes only.
      </Text>

      <TouchableOpacity
        style={styles.thankYouButton}
        onPress={async () => {
          const isLoggedIn = !!userUID;
          const targetUrl = isLoggedIn
            ? "https://alignmate.vercel.app/app"
            : "https://alignmate.vercel.app/login";

          resetForm();
          if (onClose) {
            onClose();
          }

          if (Platform.OS === 'web') {
            // For web, use window.location.href to navigate in the same tab
            window.location.href = targetUrl;
          } else {
            // For native platforms, continue using Linking.openURL
            try {
              const supported = await Linking.canOpenURL(targetUrl);
              if (supported) {
                await Linking.openURL(targetUrl);
              } else {
                Alert.alert(`Don't know how to open this URL: ${targetUrl}`);
              }
            } catch (error) {
              console.error("Failed to open URL (native):", error);
              Alert.alert("Error", "Could not open the link (native).");
            }
          }
        }}
      >
        <Text style={styles.thankYouButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFormCore = () => (
    <View style={isModal ? styles.modalContainer : styles.pageFormContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={{ uri: FEEDBACK_ICONS.feedback }}
            style={styles.headerIcon}
          />
          <Text style={styles.headerTitle}>
            {showThankYou ? "Thank You" : "AlignMate Research Form"}
          </Text>
        </View>
        {/* Only show close button in modal mode and if onClose is provided */}
        {isModal && onClose && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleActualClose}
          >
            <Image
              source={{ uri: FEEDBACK_ICONS.close }}
              style={styles.closeIcon}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Progress indicator */}
      {!showThankYou && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(currentStep / totalSteps) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Section {currentStep} of {totalSteps}
          </Text>
        </View>
      )}

      {/* Content */}
      <ScrollView
        ref={scrollViewRef} // ADDED: Assign ref to ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {showThankYou ? (
          renderThankYou()
        ) : (
          <>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
            {currentStep === 6 && renderStep6()}
            {currentStep === 7 && renderStep7()}
          </>
        )}
      </ScrollView>
    </View>
  );

  // For modal, respect isVisible. For page, it's always "visible" if rendered.
  if (!isVisible && isModal) return null;

  if (isModal) {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={handleActualClose}
      >
        <View style={styles.modalOverlay}>{renderFormCore()}</View>
      </Modal>
    );
  } else {
    // Non-modal rendering for a page
    return <View style={styles.pageContainer}>{renderFormCore()}</View>;
  }
};

export default ResearchForm;
