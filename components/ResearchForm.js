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
import { FEEDBACK_ICONS } from "../constants/AppIcons";
import { styles } from "../styles/ResearchFormStyles";

const ResearchForm = ({ isVisible, onClose, userUID = null, userName = null, isModal = true }) => {
  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  // Section I: Participant Information
  const [participantID, setParticipantID] = useState("");
  const [dateOfTesting, setDateOfTesting] = useState(new Date().toISOString().split('T')[0]);
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
          // MODIFIED: Combine time and period for timeStarted and timeEnded
          timeStarted: timeStarted.time ? `${timeStarted.time} ${timeStarted.period}` : "",
          timeEnded: timeEnded.time ? `${timeEnded.time} ${timeEnded.period}` : "",
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

      {/* MODIFIED: Time Started Input with AM/PM */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Time Started:</Text>
        <View style={styles.timeInputRow}>
          <TextInput
            style={styles.timeTextInput}
            placeholder="HH:MM"
            value={timeStarted.time}
            onChangeText={(text) => setTimeStarted(prev => ({ ...prev, time: text }))}
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
                onPress={() => setTimeStarted(prev => ({ ...prev, period: p }))}
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
      </View>

      {/* MODIFIED: Time Ended Input with AM/PM */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Time Ended:</Text>
        <View style={styles.timeInputRow}>
          <TextInput
            style={styles.timeTextInput}
            placeholder="HH:MM"
            value={timeEnded.time}
            onChangeText={(text) => setTimeEnded(prev => ({ ...prev, time: text }))}
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
                onPress={() => setTimeEnded(prev => ({ ...prev, period: p }))}
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
        <View style={styles.modalOverlay}>
          {renderFormCore()}
        </View>
      </Modal>
    );
  } else {
    // Non-modal rendering for a page
    return (
      <View style={styles.pageContainer}>
        {renderFormCore()}
      </View>
    );
  }
};

export default ResearchForm;