import React, { useState, useCallback } from "react";
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
} from "react-native";
import { ref, push, set } from "firebase/database";
import { database } from "../firebase";

// Theme constants to match your app
const THEME = {
  primary: '#5CA377',
  cardBackground: '#FFFFFF',
  border: '#E5E7EB',
  text: '#1F2937',
  textLight: '#6B7280',
};

// Icons for the feedback form
const FEEDBACK_ICONS = {
  close: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='6' x2='6' y2='18'/%3E%3Cline x1='6' y1='6' x2='18' y2='18'/%3E%3C/svg%3E",
  success: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%235CA377' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 11.08V12a10 10 0 1 1-5.93-9.14'/%3E%3Cpolyline points='22 4 12 14.01 9 11.01'/%3E%3C/svg%3E",
  feedback: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%235CA377' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'/%3E%3C/svg%3E",
};

const ResearchForm = ({ isVisible, onClose, userUID, userName }) => {
  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  // Section I: Participant Information
  const [participantID, setParticipantID] = useState("");
  const [dateOfTesting, setDateOfTesting] = useState(new Date().toISOString().split('T')[0]);
  const [timeStarted, setTimeStarted] = useState("");
  const [timeEnded, setTimeEnded] = useState("");
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
    improvedAwareness: 0
  });

  const [functionality, setFunctionality] = useState({
    sensorAccuracy: 0,
    appIntegration: 0,
    wearableDesign: 0,
    consistentFunction: 0
  });

  const [reliability, setReliability] = useState({
    consistentAlerts: 0,
    noInterruptions: 0,
    effectiveAcrossActivities: 0,
    batteryLife: 0
  });

  const [security, setSecurity] = useState({
    safeFromHacking: 0,
    authorizedAccess: 0,
    dataControl: 0,
    dataUsageUnderstanding: 0
  });

  const [usability, setUsability] = useState({
    easySetup: 0,
    intuitiveInterface: 0,
    clearNotifications: 0,
    comfortableWear: 0
  });

  const [sensitivity, setSensitivity] = useState({
    detectsSmallChanges: 0,
    differentiatesAdjustments: 0,
    adjustableSettings: 0,
    recognizesTransitions: 0
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

  // Reset form
  const resetForm = useCallback(() => {
    setCurrentStep(1);
    setShowThankYou(false);
    // Reset all form fields to initial state
    setParticipantID("");
    setDateOfTesting(new Date().toISOString().split('T')[0]);
    setTimeStarted("");
    setTimeEnded("");
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
      improvedAwareness: 0
    });
    setFunctionality({
      sensorAccuracy: 0,
      appIntegration: 0,
      wearableDesign: 0,
      consistentFunction: 0
    });
    setReliability({
      consistentAlerts: 0,
      noInterruptions: 0,
      effectiveAcrossActivities: 0,
      batteryLife: 0
    });
    setSecurity({
      safeFromHacking: 0,
      authorizedAccess: 0,
      dataControl: 0,
      dataUsageUnderstanding: 0
    });
    setUsability({
      easySetup: 0,
      intuitiveInterface: 0,
      clearNotifications: 0,
      comfortableWear: 0
    });
    setSensitivity({
      detectsSmallChanges: 0,
      differentiatesAdjustments: 0,
      adjustableSettings: 0,
      recognizesTransitions: 0
    });
    setLikedMost("");
    setNeedsImprovement("");
    setWouldRecommend("");
    setDailyRoutine("");
    setPostureAwarenessImpact("");
    setFutureFeatures("");
    setAdditionalComments("");
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
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
          timeStarted,
          timeEnded,
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
          dailyRoutine,
          postureAwarenessImpact,
          futureFeatures,
          additionalComments,
        },

        appVersion: "1.0.0",
      };

      // Save to Firebase
      const feedbackRef = ref(database, 'research-feedback');
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
    userUID, userName, participantID, dateOfTesting, timeStarted, timeEnded, researcherName,
    age, sex, yearSection, email, height, weight, painExperience, painDuration, sittingHours,
    previousDevices, previousDevicesDetail, conditions, conditionsDetail,
    prePostureRating, preDiscomfortLevel, prePosturalAwareness,
    postPostureRating, postDiscomfortLevel, postPosturalAwareness,
    deviceAccuracy, feedbackEffectiveness, comfortLevel,
    effectiveness, functionality, reliability, security, usability, sensitivity,
    likedMost, needsImprovement, wouldRecommend, dailyRoutine, postureAwarenessImpact,
    futureFeatures, additionalComments
  ]);

  // Handle closing with proper cleanup
  const handleClose = useCallback(() => {
    if (showThankYou) {
      resetForm();
      onClose();
      return;
    }

    // Simple direct close without Alert - you can uncomment the Alert version if needed
    resetForm();
    onClose();

    // Alternative with Alert (comment out the above two lines and uncomment below if you want confirmation)
    /*
    Alert.alert(
      "Close Form?",
      "Are you sure you want to close? Your progress will be lost.",
      [
        { text: "Continue", style: "cancel" },
        { 
          text: "Close", 
          style: "destructive",
          onPress: () => {
            resetForm();
            onClose();
          }
        }
      ]
    );
    */
  }, [showThankYou, resetForm, onClose]);

  // Utility components
  const ScaleRating = ({ value, onChange, min = 1, max = 10 }) => (
    <View style={styles.scaleContainer}>
      <View style={styles.scaleNumbers}>
        {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.scaleNumber,
              value === num && styles.selectedScaleNumber
            ]}
            onPress={() => onChange(num)}
          >
            <Text style={[
              styles.scaleNumberText,
              value === num && styles.selectedScaleNumberText
            ]}>
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const LikertScale = ({ value, onChange }) => {
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
              value === option.value && styles.selectedLikertOption
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[
              styles.likertText,
              value === option.value && styles.selectedLikertText
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const MultiSelect = ({ options, selected, onChange }) => {
    const toggleOption = (option) => {
      const newSelected = selected.includes(option)
        ? selected.filter(item => item !== option)
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
              selected.includes(option) && styles.selectedMultiSelectOption
            ]}
            onPress={() => toggleOption(option)}
          >
            <Text style={[
              styles.multiSelectText,
              selected.includes(option) && styles.selectedMultiSelectText
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
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
          style={styles.textInput}
          placeholder="To be assigned by researcher"
          value={participantID}
          onChangeText={setParticipantID}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Date of Testing:</Text>
        <TextInput
          style={styles.textInput}
          placeholder="YYYY-MM-DD"
          value={dateOfTesting}
          onChangeText={setDateOfTesting}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Time Started:</Text>
        <TextInput
          style={styles.textInput}
          placeholder="HH:MM"
          value={timeStarted}
          onChangeText={setTimeStarted}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Time Ended:</Text>
        <TextInput
          style={styles.textInput}
          placeholder="HH:MM"
          value={timeEnded}
          onChangeText={setTimeEnded}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Researcher Name:</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter researcher name"
          value={researcherName}
          onChangeText={setResearcherName}
        />
      </View>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => setCurrentStep(2)}
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
          style={styles.textInput}
          placeholder="Enter age"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Sex:</Text>
        <View style={styles.radioGroup}>
          {["Male", "Female", "Prefer not to say"].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.radioOption,
                sex === option && styles.selectedRadioOption
              ]}
              onPress={() => setSex(option)}
            >
              <Text style={[
                styles.radioText,
                sex === option && styles.selectedRadioText
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Year & Section:</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., 3rd Year Section A"
          value={yearSection}
          onChangeText={setYearSection}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email Address:</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.twoColumnRow}>
        <View style={styles.halfInputGroup}>
          <Text style={styles.inputLabel}>Height (cm):</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Height"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.halfInputGroup}>
          <Text style={styles.inputLabel}>Weight (kg):</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Weight"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Do you experience any of the following? (Check all that apply)</Text>
        <MultiSelect
          options={["Neck pain", "Upper back pain", "Lower back pain", "Shoulder pain", "None of the above"]}
          selected={painExperience}
          onChange={setPainExperience}
        />
      </View>

      <View style={styles.stepNavigation}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep(1)}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => setCurrentStep(3)}
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
          On a scale of 1-10, how would you rate your current posture? (1 = very poor, 10 = excellent)
        </Text>
        <ScaleRating value={prePostureRating} onChange={setPrePostureRating} />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Posture-Related Discomfort Level:</Text>
        <Text style={styles.scaleDescription}>
          On a scale of 1-10, how would you rate any discomfort related to your posture? (1 = no discomfort, 10 = severe discomfort)
        </Text>
        <ScaleRating value={preDiscomfortLevel} onChange={setPreDiscomfortLevel} />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Postural Awareness:</Text>
        <Text style={styles.scaleDescription}>
          On a scale of 1-10, how aware are you of your posture throughout the day? (1 = not aware at all, 10 = constantly aware)
        </Text>
        <ScaleRating value={prePosturalAwareness} onChange={setPrePosturalAwareness} />
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
          onPress={() => setCurrentStep(4)}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Step 4: Post-test Assessment
  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>V. Post-Test Assessment</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Current Posture Self-Assessment:</Text>
        <Text style={styles.scaleDescription}>
          On a scale of 1-10, how would you rate your posture now? (1 = very poor, 10 = excellent)
        </Text>
        <ScaleRating value={postPostureRating} onChange={setPostPostureRating} />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Posture-Related Discomfort Level:</Text>
        <Text style={styles.scaleDescription}>
          On a scale of 1-10, how would you rate any discomfort related to your posture now? (1 = no discomfort, 10 = severe discomfort)
        </Text>
        <ScaleRating value={postDiscomfortLevel} onChange={setPostDiscomfortLevel} />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Postural Awareness:</Text>
        <Text style={styles.scaleDescription}>
          On a scale of 1-10, how aware are you of your posture now? (1 = not aware at all, 10 = constantly aware)
        </Text>
        <ScaleRating value={postPosturalAwareness} onChange={setPostPosturalAwareness} />
      </View>

      <Text style={styles.subsectionTitle}>B. Device Ratings</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Device Accuracy:</Text>
        <Text style={styles.scaleDescription}>
          On a scale of 1-10, how accurate do you feel the device was at detecting poor posture? (1 = very inaccurate, 10 = very accurate)
        </Text>
        <ScaleRating value={deviceAccuracy} onChange={setDeviceAccuracy} />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Feedback Effectiveness:</Text>
        <Text style={styles.scaleDescription}>
          On a scale of 1-10, how effective was the feedback at helping you correct your posture? (1 = not effective, 10 = very effective)
        </Text>
        <ScaleRating value={feedbackEffectiveness} onChange={setFeedbackEffectiveness} />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Comfort Level:</Text>
        <Text style={styles.scaleDescription}>
          On a scale of 1-10, how comfortable was the device to wear? (1 = very uncomfortable, 10 = very comfortable)
        </Text>
        <ScaleRating value={comfortLevel} onChange={setComfortLevel} />
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
          onPress={() => setCurrentStep(5)}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Step 5: Comprehensive Evaluation (Part 1)
  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>VI. Comprehensive Evaluation (Part 1)</Text>
      
      <Text style={styles.subsectionTitle}>A. Effectiveness</Text>
      
      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>AlignMate effectively alerts me when I exhibit poor posture.</Text>
        <LikertScale 
          value={effectiveness.alertsPoorPosture} 
          onChange={(value) => setEffectiveness({...effectiveness, alertsPoorPosture: value})} 
        />
      </View>

      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>The real-time feedback helps me immediately correct my posture.</Text>
        <LikertScale 
          value={effectiveness.realtimeFeedback} 
          onChange={(value) => setEffectiveness({...effectiveness, realtimeFeedback: value})} 
        />
      </View>

      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>After using AlignMate, I have experienced reduced discomfort due to poor posture.</Text>
        <LikertScale 
          value={effectiveness.reducedDiscomfort} 
          onChange={(value) => setEffectiveness({...effectiveness, reducedDiscomfort: value})} 
        />
      </View>

      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>AlignMate has improved my overall awareness of maintaining good posture.</Text>
        <LikertScale 
          value={effectiveness.improvedAwareness} 
          onChange={(value) => setEffectiveness({...effectiveness, improvedAwareness: value})} 
        />
      </View>

      <Text style={styles.subsectionTitle}>B. Functionality</Text>
      
      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>The sensors accurately detect my posture in different sitting and standing positions.</Text>
        <LikertScale 
          value={functionality.sensorAccuracy} 
          onChange={(value) => setFunctionality({...functionality, sensorAccuracy: value})} 
        />
      </View>

      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>The device integrates well with its companion app for real-time monitoring.</Text>
        <LikertScale 
          value={functionality.appIntegration} 
          onChange={(value) => setFunctionality({...functionality, appIntegration: value})} 
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
          onPress={() => setCurrentStep(6)}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Step 6: Comprehensive Evaluation (Part 2)
  const renderStep6 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>VI. Comprehensive Evaluation (Part 2)</Text>
      
      <Text style={styles.subsectionTitle}>E. Usability</Text>
      
      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>AlignMate is easy to set up and use, even for first-time users.</Text>
        <LikertScale 
          value={usability.easySetup} 
          onChange={(value) => setUsability({...usability, easySetup: value})} 
        />
      </View>

      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>The user interface of the companion app is intuitive and simple to navigate.</Text>
        <LikertScale 
          value={usability.intuitiveInterface} 
          onChange={(value) => setUsability({...usability, intuitiveInterface: value})} 
        />
      </View>

      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>The notifications are easy to understand and act upon.</Text>
        <LikertScale 
          value={usability.clearNotifications} 
          onChange={(value) => setUsability({...usability, clearNotifications: value})} 
        />
      </View>

      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>AlignMate is comfortable to wear for long periods.</Text>
        <LikertScale 
          value={usability.comfortableWear} 
          onChange={(value) => setUsability({...usability, comfortableWear: value})} 
        />
      </View>

      <Text style={styles.subsectionTitle}>F. Sensitivity</Text>
      
      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>The device accurately detects even small changes in my posture.</Text>
        <LikertScale 
          value={sensitivity.detectsSmallChanges} 
          onChange={(value) => setSensitivity({...sensitivity, detectsSmallChanges: value})} 
        />
      </View>

      <View style={styles.likertGroup}>
        <Text style={styles.likertStatement}>The posture tracking system effectively differentiates between minor and major adjustments.</Text>
        <LikertScale 
          value={sensitivity.differentiatesAdjustments} 
          onChange={(value) => setSensitivity({...sensitivity, differentiatesAdjustments: value})} 
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
          onPress={() => setCurrentStep(7)}
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
        <Text style={styles.inputLabel}>What did you like most about the AlignMate system?</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Share what you enjoyed about using AlignMate..."
          value={likedMost}
          onChangeText={setLikedMost}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>What aspects of the AlignMate system need improvement?</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Tell us what could be improved..."
          value={needsImprovement}
          onChangeText={setNeedsImprovement}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Would you continue to use AlignMate or recommend it to others? Why or why not?</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Share your thoughts on recommending AlignMate..."
          value={wouldRecommend}
          onChangeText={setWouldRecommend}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>What features would you like to see added to AlignMate in the future?</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Suggest future features or improvements..."
          value={futureFeatures}
          onChangeText={setFutureFeatures}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Any additional comments or suggestions?</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Share any other thoughts or feedback..."
          value={additionalComments}
          onChangeText={setAdditionalComments}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.stepNavigation}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep(6)}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.disabledButton
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Research Form</Text>
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
        Thank you for participating in our AlignMate research study. Your detailed feedback will help us improve the system and contribute to better posture monitoring solutions.
      </Text>
      <Text style={styles.thankYouSubMessage}>
        Your responses have been securely saved and will be used for research purposes only.
      </Text>
      
      <TouchableOpacity
        style={styles.thankYouButton}
        onPress={() => {
          resetForm();
          onClose();
        }}
      >
        <Text style={styles.thankYouButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  if (!isVisible) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <View 
        style={styles.modalOverlay}
      >
        <View 
          style={styles.modalContainer}
        >
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
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Image 
                source={{ uri: FEEDBACK_ICONS.close }} 
                style={styles.closeIcon} 
              />
            </TouchableOpacity>
          </View>

          {/* Progress indicator */}
          {!showThankYou && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(currentStep / totalSteps) * 100}%` }
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
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {showThankYou ? renderThankYou() : (
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
      </View>
    </Modal>
  );
};

// Styles
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: THEME.cardBackground,
    borderRadius: 16,
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    backgroundColor: THEME.primary,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    tintColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  progressContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: THEME.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME.primary,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 12,
    color: THEME.textLight,
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  stepContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.text,
    marginBottom: 20,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.primary,
    marginTop: 20,
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  halfInputGroup: {
    flex: 1,
    marginRight: 10,
  },
  twoColumnRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 2,
    borderColor: THEME.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: THEME.text,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    borderWidth: 2,
    borderColor: THEME.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: THEME.text,
    backgroundColor: '#FFFFFF',
    minHeight: 100,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radioOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: THEME.border,
    backgroundColor: '#FFFFFF',
  },
  selectedRadioOption: {
    borderColor: THEME.primary,
    backgroundColor: `${THEME.primary}15`,
  },
  radioText: {
    fontSize: 14,
    color: THEME.text,
  },
  selectedRadioText: {
    color: THEME.primary,
    fontWeight: '600',
  },
  multiSelectContainer: {
    gap: 8,
  },
  multiSelectOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: THEME.border,
    backgroundColor: '#FFFFFF',
  },
  selectedMultiSelectOption: {
    borderColor: THEME.primary,
    backgroundColor: `${THEME.primary}15`,
  },
  multiSelectText: {
    fontSize: 14,
    color: THEME.text,
  },
  selectedMultiSelectText: {
    color: THEME.primary,
    fontWeight: '600',
  },
  scaleContainer: {
    marginVertical: 10,
  },
  scaleNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  scaleNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: THEME.border,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedScaleNumber: {
    borderColor: THEME.primary,
    backgroundColor: THEME.primary,
  },
  scaleNumberText: {
    fontSize: 14,
    color: THEME.text,
    fontWeight: '600',
  },
  selectedScaleNumberText: {
    color: '#FFFFFF',
  },
  scaleDescription: {
    fontSize: 12,
    color: THEME.textLight,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  likertGroup: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  likertStatement: {
    fontSize: 14,
    color: THEME.text,
    marginBottom: 12,
    fontWeight: '500',
  },
  likertContainer: {
    gap: 8,
  },
  likertOption: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#FFFFFF',
  },
  selectedLikertOption: {
    borderColor: THEME.primary,
    backgroundColor: `${THEME.primary}15`,
  },
  likertText: {
    fontSize: 12,
    color: THEME.text,
    textAlign: 'center',
  },
  selectedLikertText: {
    color: THEME.primary,
    fontWeight: '600',
  },
  stepNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  backButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: THEME.border,
    backgroundColor: '#FFFFFF',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text,
    textAlign: 'center',
  },
  nextButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: THEME.primary,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  submitButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: THEME.primary,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  thankYouContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIcon: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  thankYouTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  thankYouMessage: {
    fontSize: 16,
    color: THEME.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  thankYouSubMessage: {
    fontSize: 14,
    color: THEME.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  thankYouButton: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 120,
  },
  thankYouButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default ResearchForm;