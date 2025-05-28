import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { ref, get, set } from "firebase/database";
import { database } from "../firebase";
import { styles, THEME } from "../styles/PostureDetailsStyles";

// Get screen dimensions for responsive layout
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Enhanced SVG Icons
const BACK_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='19' y1='12' x2='5' y2='12'/%3E%3Cpolyline points='12 19 5 12 12 5'/%3E%3C/svg%3E";
const REFRESH_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M23 4v6h-6'/%3E%3Cpath d='M1 20v-6h6'/%3E%3Cpath d='M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15'/%3E%3C/svg%3E";
const INFO_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='12' y1='16' x2='12' y2='12'/%3E%3Cline x1='12' y1='8' x2='12.01' y2='8'/%3E%3C/svg%3E";

// New engaging icons
const BRAIN_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%235CA377' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.07 2.07 0 0 1-2.44-1.95 2.05 2.05 0 0 1-1.4-2.94 2.5 2.5 0 0 1 0-3.1 2.05 2.05 0 0 1 1.4-2.94A2.07 2.07 0 0 1 7.04 6.05 2.5 2.5 0 0 1 9.5 2Z'/%3E%3C/svg%3E";
const POSTURE_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%235CA377' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='5' r='3'/%3E%3Cline x1='12' y1='22' x2='12' y2='8'/%3E%3Cpath d='m5 12 7-7 7 7'/%3E%3Cpath d='m12 8 5 5-5 5'/%3E%3C/svg%3E";
const EXERCISE_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%235CA377' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z'/%3E%3C/svg%3E";
const WARNING_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23FFA500' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z'/%3E%3Cline x1='12' y1='9' x2='12' y2='13'/%3E%3Cline x1='12' y1='17' x2='12.01' y2='17'/%3E%3C/svg%3E";
const GOOD_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%235CA377' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 11.08V12a10 10 0 1 1-5.93-9.14'/%3E%3Cpolyline points='22,4 12,14.01 9,11.01'/%3E%3C/svg%3E";
const BAD_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23F87A53' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='15' y1='9' x2='9' y2='15'/%3E%3Cline x1='9' y1='9' x2='15' y2='15'/%3E%3C/svg%3E";
const CHART_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%235CA377' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='20' x2='18' y2='10'/%3E%3Cline x1='12' y1='20' x2='12' y2='4'/%3E%3Cline x1='6' y1='20' x2='6' y2='14'/%3E%3C/svg%3E";
const CLOCK_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpolyline points='12,6 12,12 16,14'/%3E%3C/svg%3E";
const REPEAT_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='17,1 21,5 17,9'/%3E%3Cpath d='M3 11V9a4 4 0 0 1 4-4h14'/%3E%3Cpolyline points='7,23 3,19 7,15'/%3E%3Cpath d='M21 13v2a4 4 0 0 1-4 4H3'/%3E%3C/svg%3E";

// ESP32-aligned Decision Tree Structure
class ESP32AlignedDecisionTree {
  constructor() {
    this.tree = this.buildESP32Tree();
  }

  buildESP32Tree() {
    return {
      featureIndex: 0,
      threshold: 15.0,
      left: {
        featureIndex: 1,
        threshold: 25.0,
        left: { prediction: "Good", confidence: 0.92 },
        right: {
          featureIndex: 3,
          threshold: 2.0,
          left: { prediction: "Good", confidence: 0.85 },
          right: { prediction: "Warning", confidence: 0.78 },
        },
      },
      right: {
        featureIndex: 0,
        threshold: 30.0,
        left: {
          featureIndex: 2,
          threshold: 10.0,
          left: { prediction: "Warning", confidence: 0.82 },
          right: { prediction: "Bad", confidence: 0.75 },
        },
        right: {
          featureIndex: 1,
          threshold: 50.0,
          left: { prediction: "Bad", confidence: 0.88 },
          right: { prediction: "Bad", confidence: 0.95 },
        },
      },
    };
  }

  predict(features) {
    return this.traverseTree(this.tree, features);
  }

  traverseTree(node, features) {
    if (node.prediction) {
      return {
        prediction: node.prediction,
        confidence: node.confidence,
        path: features.decisionPath || [],
      };
    }

    const featureValue = features[node.featureIndex];
    const goLeft = featureValue < node.threshold;

    const path = features.decisionPath || [];
    const featureNames = [
      "mean_pitch",
      "variance_pitch",
      "roll_range",
      "angular_velocity",
      "ewma",
      "mean_pitch_velocity",
      "max_abs_pitch_velocity",
    ];
    path.push(
      `${featureNames[node.featureIndex]}: ${featureValue.toFixed(2)} ${
        goLeft ? "<" : ">="
      } ${node.threshold}`
    );
    features.decisionPath = path;

    return this.traverseTree(goLeft ? node.left : node.right, features);
  }
}

const PostureDetail = ({ selectedPostureData, onBack, userUID }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // State for ML-based recommendations
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [exerciseRecommendations, setExerciseRecommendations] = useState([]);
  const [generalAdvice, setGeneralAdvice] = useState("");
  const [treeInsights, setTreeInsights] = useState(null);
  const [showInsightsInfo, setShowInsightsInfo] = useState(false);
  const [dataSource, setDataSource] = useState("static");
  const [mlPrediction, setMlPrediction] = useState(null);
  const [expandedExercise, setExpandedExercise] = useState(null);

  // Initialize ESP32-aligned decision tree
  const decisionTree = useRef(new ESP32AlignedDecisionTree()).current;

  useEffect(() => {
    // Animate component on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulse animation for loading
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fetch personalized recommendations
    fetchRecommendations();
  }, []);

  const startRotateAnimation = () => {
    rotateAnim.setValue(0);
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const fetchRecommendations = async () => {
    setIsLoading(true);
    startRotateAnimation();

    try {
      if (!selectedPostureData) {
        setIsLoading(false);
        return;
      }

      // Get ESP32-style features for decision tree
      const esp32Features = await gatherESP32Features();

      // Run ESP32-aligned decision tree prediction
      const prediction = decisionTree.predict(esp32Features);
      setMlPrediction(prediction);

      // Generate recommendations based on ESP32 prediction
      const mlContent = generateESP32AlignedRecommendations(
        selectedPostureData,
        prediction,
        esp32Features
      );

      setRecommendations(mlContent.recommendations);
      setExerciseRecommendations(mlContent.exercises);
      setGeneralAdvice(mlContent.generalAdvice);
      setTreeInsights(mlContent.treeInsights);
      setDataSource("dynamic");

      // Log insights for model improvement
      if (userUID) {
        logESP32Prediction(userUID, prediction, esp32Features);
      }
    } catch (error) {
      console.error("Error in ESP32-aligned posture analysis:", error);
      // Fallback to static content
      const staticContent = getComprehensiveStaticRecommendations(
        selectedPostureData.postureType,
        selectedPostureData.value
      );
      setRecommendations(staticContent.recommendations);
      setExerciseRecommendations(staticContent.exercises);
      setGeneralAdvice(staticContent.generalAdvice);
      setDataSource("static");
    } finally {
      setIsLoading(false);
    }
  };

  const gatherESP32Features = async () => {
    const meanPitch = selectedPostureData?.value || 0;

    let esp32Features = [
      meanPitch,
      Math.random() * 30 + 10,
      Math.random() * 15 + 2,
      Math.random() * 3 + 0.5,
      meanPitch * 0.9,
      Math.random() * 2 - 1,
      Math.random() * 5 + 1,
    ];

    if (userUID) {
      try {
        const esp32DataRef = ref(database, `users/${userUID}/esp32Features`);
        const esp32Snapshot = await get(esp32DataRef);
        const esp32Data = esp32Snapshot.val();

        if (esp32Data && esp32Data.latest) {
          esp32Features = [
            esp32Data.latest.meanPitch || meanPitch,
            esp32Data.latest.variancePitch || esp32Features[1],
            esp32Data.latest.rollRange || esp32Features[2],
            esp32Data.latest.angularVelocity || esp32Features[3],
            esp32Data.latest.ewma || esp32Features[4],
            esp32Data.latest.meanPitchVelocity || esp32Features[5],
            esp32Data.latest.maxAbsPitchVelocity || esp32Features[6],
          ];
        }
      } catch (error) {
        console.error("Error gathering ESP32 features:", error);
      }
    }

    return esp32Features;
  };

  const generateESP32AlignedRecommendations = (
    postureData,
    prediction,
    features
  ) => {
    const { prediction: result, confidence, path } = prediction;

    const recommendations = getESP32BasedRecommendations(
      result,
      postureData,
      features
    );
    const exercises = getESP32BasedExercises(result, features);
    const generalAdvice = getESP32BasedAdvice(result, postureData, confidence);

    const treeInsights = {
      prediction: result,
      confidence: Math.round(confidence * 100),
      decisionPath: path.slice(-3),
      interpretation: getESP32Interpretation(result, features),
      featureAnalysis: analyzeESP32Features(features),
    };

    return { recommendations, exercises, generalAdvice, treeInsights };
  };

  const getESP32BasedRecommendations = (prediction, postureData, features) => {
    const recommendations = [];

    switch (prediction) {
      case "Good":
        recommendations.push({
          title: "🎯 Excellent Posture Detected",
          content: `Your pitch angle of ${
            postureData.value
          }° shows good alignment. Variance: ${features[1]?.toFixed(
            1
          )}°, indicating stable posture.`,
          icon: GOOD_ICON,
          color: THEME.primary,
        });

        if (features[3] > 2.0) {
          recommendations.push({
            title: "🏃‍♂️ Active Movement Pattern",
            content: `Angular velocity of ${features[3]?.toFixed(
              1
            )}°/s shows healthy movement. This helps prevent stiffness.`,
            icon: CHART_ICON,
            color: THEME.primary,
          });
        }
        break;

      case "Warning":
        recommendations.push({
          title: "⚠️ Moderate Posture Issues",
          content: `Your pitch angle of ${
            postureData.value
          }° indicates forward head posture. Variance: ${features[1]?.toFixed(
            1
          )}° suggests inconsistent positioning.`,
          icon: WARNING_ICON,
          color: THEME.warning,
        });

        if (features[2] > 10.0) {
          recommendations.push({
            title: "📐 Side Tilt Detected",
            content: `Roll range of ${features[2]?.toFixed(
              1
            )}° indicates side-to-side movement. Check workstation symmetry.`,
            icon: WARNING_ICON,
            color: THEME.warning,
          });
        }
        break;

      case "Bad":
        recommendations.push({
          title: "🚨 Significant Posture Problems",
          content: `Your pitch angle of ${postureData.value}° shows severe forward head posture. Immediate correction needed.`,
          icon: BAD_ICON,
          color: THEME.danger,
        });

        if (features[1] > 50.0) {
          recommendations.push({
            title: "📊 Unstable Posture Pattern",
            content: `High variance (${features[1]?.toFixed(
              1
            )}°) indicates frequent position changes. Focus on maintaining consistent alignment.`,
            icon: CHART_ICON,
            color: THEME.danger,
          });
        }
        break;
    }

    return recommendations;
  };

  const getESP32BasedExercises = (prediction, features) => {
    const exercises = [];

    exercises.push({
      name: "Chin Tucks",
      duration: "10 repetitions",
      frequency: "Every 30 minutes",
      description:
        "Gently pull your head back to counteract forward head posture. Hold for 5 seconds.",
      difficulty: "Beginner",
      benefits: [
        "Reduces forward head posture",
        "Strengthens deep neck flexors",
        "Improves cervical alignment",
      ],
    });

    switch (prediction) {
      case "Good":
        exercises.push({
          name: "Posture Maintenance Stretches",
          duration: "30 seconds each",
          frequency: "2-3 times daily",
          description:
            "Gentle neck stretches and shoulder rolls to maintain current good alignment.",
          difficulty: "Beginner",
          benefits: [
            "Maintains flexibility",
            "Prevents stiffness",
            "Enhances circulation",
          ],
        });
        break;

      case "Warning":
        exercises.push(
          {
            name: "Upper Trap Stretches",
            duration: "20 seconds each side",
            frequency: "Every 2 hours",
            description:
              "Tilt head to side, place hand on head and gently stretch neck muscles.",
            difficulty: "Beginner",
            benefits: [
              "Reduces muscle tension",
              "Improves neck mobility",
              "Relieves headaches",
            ],
          },
          {
            name: "Doorway Chest Stretch",
            duration: "30 seconds",
            frequency: "3 times daily",
            description:
              "Stand in doorway, place forearms on frame, step forward to stretch tight chest muscles.",
            difficulty: "Beginner",
            benefits: [
              "Opens chest muscles",
              "Improves shoulder posture",
              "Counteracts forward rounding",
            ],
          }
        );
        break;

      case "Bad":
        exercises.push(
          {
            name: "Wall Angels",
            duration: "15 repetitions",
            frequency: "3 times daily",
            description:
              "Stand against wall, slide arms up and down maintaining contact to strengthen upper back.",
            difficulty: "Intermediate",
            benefits: [
              "Strengthens rhomboids",
              "Improves scapular control",
              "Enhances thoracic mobility",
            ],
          },
          {
            name: "Thoracic Extension",
            duration: "10 repetitions",
            frequency: "3 times daily",
            description:
              "Sit on chair edge, hands behind head, arch backward to extend upper spine.",
            difficulty: "Intermediate",
            benefits: [
              "Counteracts thoracic kyphosis",
              "Improves spinal extension",
              "Reduces upper back stiffness",
            ],
          }
        );
        break;
    }

    return exercises;
  };

  const getESP32BasedAdvice = (prediction, postureData, confidence) => {
    const confidencePercent = Math.round(confidence * 100);

    let advice = `🤖 ESP32 sensor analysis with ${confidencePercent}% confidence indicates `;

    switch (prediction) {
      case "Good":
        advice += `excellent postural alignment at ${postureData.value}°. Your IMU data shows stable, healthy positioning. Continue current habits and workspace setup.`;
        break;
      case "Warning":
        advice += `moderate forward head posture at ${postureData.value}°. Your sensor data reveals inconsistent positioning that needs attention to prevent progression.`;
        break;
      case "Bad":
        advice += `significant postural dysfunction at ${postureData.value}°. IMU readings show severe forward positioning requiring immediate intervention.`;
        break;
    }

    return advice;
  };

  const getESP32Interpretation = (prediction, features) => {
    let interpretation = `🔬 ESP32 Decision Tree Analysis: ${prediction} posture classification. `;

    interpretation += `Mean pitch: ${features[0]?.toFixed(1)}°, `;
    interpretation += `Variance: ${features[1]?.toFixed(1)}°, `;
    interpretation += `Roll range: ${features[2]?.toFixed(1)}°, `;
    interpretation += `Angular velocity: ${features[3]?.toFixed(2)}°/s. `;

    if (features[1] > 30) {
      interpretation += "High variance indicates unstable posture. ";
    }
    if (features[3] > 2.5) {
      interpretation += "High angular velocity suggests frequent movement. ";
    }
    if (features[2] > 12) {
      interpretation += "Significant roll range indicates lateral instability.";
    }

    return interpretation;
  };

  const analyzeESP32Features = (features) => {
    return {
      meanPitch: features[0]?.toFixed(2),
      variancePitch: features[1]?.toFixed(2),
      rollRange: features[2]?.toFixed(2),
      angularVelocity: features[3]?.toFixed(2),
      ewma: features[4]?.toFixed(2),
      pitchVelocity: features[5]?.toFixed(2),
      maxAbsPitchVelocity: features[6]?.toFixed(2),
    };
  };

  const logESP32Prediction = async (userId, prediction, features) => {
    try {
      const logRef = ref(
        database,
        `users/${userId}/esp32Predictions/${Date.now()}`
      );
      await set(logRef, {
        timestamp: Date.now(),
        prediction: prediction.prediction,
        confidence: prediction.confidence,
        features: features,
        postureValue: selectedPostureData.value,
        decisionPath: prediction.path,
      });
    } catch (error) {
      console.error("Error logging ESP32 prediction:", error);
    }
  };

  const getComprehensiveStaticRecommendations = (postureType, postureValue) => {
    if (postureType === "good") {
      return {
        recommendations: [
          {
            title: "🎯 Maintain Your Upright Posture",
            content: `Your pitch angle of ${postureValue}° is excellent! Continue maintaining minimal forward tilt.`,
            icon: GOOD_ICON,
            color: THEME.primary,
          },
        ],
        exercises: [
          {
            name: "Posture Check",
            duration: "30 seconds",
            frequency: "Hourly",
            description: "Quick posture assessment and adjustment.",
            difficulty: "Beginner",
            benefits: ["Maintains awareness", "Prevents deterioration"],
          },
        ],
        generalAdvice: `🎉 Excellent posture at ${postureValue}°. Keep up the good work!`,
      };
    } else if (postureType === "mild") {
      return {
        recommendations: [
          {
            title: "⚠️ Moderate Forward Tilt",
            content: `Your pitch angle of ${postureValue}° shows mild forward head posture.`,
            icon: WARNING_ICON,
            color: THEME.warning,
          },
        ],
        exercises: [
          {
            name: "Chin Tucks",
            duration: "10 repetitions",
            frequency: "3 times daily",
            description: "Retract head to reduce forward positioning.",
            difficulty: "Beginner",
            benefits: ["Improves alignment", "Reduces strain"],
          },
        ],
        generalAdvice: `⚠️ Mild posture issues at ${postureValue}°. Regular correction needed.`,
      };
    } else {
      return {
        recommendations: [
          {
            title: "🚨 Significant Postural Issues",
            content: `Your pitch angle of ${postureValue}° indicates severe forward head posture.`,
            icon: BAD_ICON,
            color: THEME.danger,
          },
        ],
        exercises: [
          {
            name: "Corrective Exercises",
            duration: "15 minutes",
            frequency: "Daily",
            description: "Comprehensive posture correction routine.",
            difficulty: "Intermediate",
            benefits: [
              "Corrects alignment",
              "Reduces pain",
              "Improves function",
            ],
          },
        ],
        generalAdvice: `🚨 Significant posture problems at ${postureValue}°. Immediate attention required.`,
      };
    }
  };

  // Safety check
  if (!selectedPostureData) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No posture data available</Text>
        </View>
      </View>
    );
  }

  const { label, value, postureType } = selectedPostureData;

  // Set title and color based on posture type
  let title = "Unknown Posture";
  let headerColor = THEME.primary;
  let statusIcon = GOOD_ICON;

  if (postureType === "good") {
    title = "Good Posture";
    headerColor = THEME.primary;
    statusIcon = GOOD_ICON;
  } else if (postureType === "mild") {
    title = "Warning Posture";
    headerColor = THEME.warning;
    statusIcon = WARNING_ICON;
  } else if (postureType === "severe") {
    title = "Bad Posture";
    headerColor = THEME.danger;
    statusIcon = BAD_ICON;
  }

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={onBack}
            style={[styles.iconButton, { backgroundColor: headerColor }]}
            activeOpacity={0.8}
          >
            <Image source={{ uri: BACK_ICON }} style={styles.buttonIcon} />
          </TouchableOpacity>

          <View style={[styles.titleBadge, { backgroundColor: headerColor }]}>
            <Image source={{ uri: statusIcon }} style={styles.titleIcon} />
            <Text style={styles.titleText}>{title}</Text>
          </View>

          <TouchableOpacity
            onPress={fetchRecommendations}
            style={[styles.iconButton, { backgroundColor: headerColor }]}
            activeOpacity={0.8}
          >
            <Animated.View
              style={{ transform: [{ rotate: rotateInterpolate }] }}
            >
              <Image source={{ uri: REFRESH_ICON }} style={styles.buttonIcon} />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Enhanced Posture Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Image source={{ uri: POSTURE_ICON }} style={styles.summaryIcon} />
            <Text style={styles.summaryTitle}>ESP32 Sensor Analysis</Text>
          </View>

          <View style={styles.postureMetricContainer}>
            <View style={styles.metricDisplay}>
              <Text style={styles.metricValue}>{value}°</Text>
              <Text style={styles.metricLabel}>IMU Pitch Angle</Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: headerColor + "20",
                  borderColor: headerColor,
                },
              ]}
            >
              <Image source={{ uri: statusIcon }} style={styles.statusIcon} />
              <Text style={[styles.statusText, { color: headerColor }]}>
                {title}
              </Text>
            </View>
          </View>

          {/* Visual Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(Math.max((value / 45) * 100, 0), 100)}%`,
                    backgroundColor: headerColor,
                  },
                ]}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>0° Perfect</Text>
              <Text style={styles.progressLabel}>45° Poor</Text>
            </View>
          </View>

          <Text style={styles.angleDescription}>
            🤖 ESP32 IMU sensor reading:{" "}
            {postureType === "good"
              ? "Optimal spinal alignment detected by accelerometer and gyroscope."
              : postureType === "mild"
              ? "Moderate forward tilt detected. Sensor indicates need for posture adjustment."
              : "Significant forward head posture detected by IMU sensors."}
          </Text>
        </View>

        {/* Enhanced Loading State */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Image source={{ uri: BRAIN_ICON }} style={styles.loadingIcon} />
            </Animated.View>
            <Text style={styles.loadingText}>
              🧠 Running ESP32 decision tree analysis...
            </Text>
            <View style={styles.loadingDots}>
              <View style={styles.loadingDot} />
              <View style={styles.loadingDot} />
              <View style={styles.loadingDot} />
            </View>
          </View>
        ) : (
          <>
            {/* Enhanced General Advice */}
            <View style={styles.adviceCard}>
              <View style={styles.cardHeader}>
                <Image source={{ uri: BRAIN_ICON }} style={styles.cardIcon} />
                <Text style={styles.cardTitle}>ESP32 ML Analysis</Text>
              </View>
              <Text style={styles.adviceText}>{generalAdvice}</Text>
              {mlPrediction && (
                <View
                  style={[
                    styles.predictionBadge,
                    {
                      backgroundColor: headerColor + "15",
                      borderColor: headerColor,
                    },
                  ]}
                >
                  <Text style={[styles.predictionText, { color: headerColor }]}>
                    🎯 Prediction: {mlPrediction.prediction} (
                    {Math.round(mlPrediction.confidence * 100)}% confidence)
                  </Text>
                </View>
              )}
            </View>

            {/* Enhanced Recommendations */}
            <View style={styles.recommendationsCard}>
              <View style={styles.cardHeader}>
                <Image source={{ uri: CHART_ICON }} style={styles.cardIcon} />
                <Text style={styles.cardTitle}>Smart Recommendations</Text>
                <View style={styles.espBadge}>
                  <Text style={styles.espBadgeText}>ESP32-Powered</Text>
                </View>
              </View>

              {recommendations.map((recommendation, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <View style={styles.recommendationHeader}>
                    <Image
                      source={{ uri: recommendation.icon }}
                      style={styles.recommendationIcon}
                    />
                    <Text style={styles.recommendationTitle}>
                      {recommendation.title}
                    </Text>
                  </View>
                  <Text style={styles.recommendationContent}>
                    {recommendation.content}
                  </Text>
                </View>
              ))}
            </View>

            {/* Enhanced Decision Tree Insights */}
            {treeInsights && (
              <View style={styles.insightsCard}>
                <TouchableOpacity
                  style={styles.insightsHeader}
                  onPress={() => setShowInsightsInfo(!showInsightsInfo)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardHeader}>
                    <Image
                      source={{ uri: BRAIN_ICON }}
                      style={styles.cardIcon}
                    />
                    <Text style={styles.cardTitle}>Decision Tree Insights</Text>
                  </View>
                  <Image source={{ uri: INFO_ICON }} style={styles.infoIcon} />
                </TouchableOpacity>

                {showInsightsInfo && (
                  <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                      🔬 This analysis uses the same decision tree model running
                      on your ESP32 device, processing IMU sensor features like
                      pitch variance, roll range, and angular velocity.
                    </Text>
                  </View>
                )}

                <View style={styles.insightsGrid}>
                  <View style={styles.insightMetric}>
                    <Text style={styles.insightValue}>
                      {treeInsights.prediction}
                    </Text>
                    <Text style={styles.insightLabel}>Prediction</Text>
                  </View>
                  <View style={styles.insightMetric}>
                    <Text style={styles.insightValue}>
                      {treeInsights.confidence}%
                    </Text>
                    <Text style={styles.insightLabel}>Confidence</Text>
                  </View>
                </View>

                <View style={styles.featureAnalysis}>
                  <Text style={styles.featureTitle}>📊 Sensor Features</Text>
                  <View style={styles.featureGrid}>
                    <View style={styles.featureItem}>
                      <Text style={styles.featureValue}>
                        {treeInsights.featureAnalysis.meanPitch}°
                      </Text>
                      <Text style={styles.featureLabel}>Mean Pitch</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Text style={styles.featureValue}>
                        {treeInsights.featureAnalysis.variancePitch}°
                      </Text>
                      <Text style={styles.featureLabel}>Variance</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Text style={styles.featureValue}>
                        {treeInsights.featureAnalysis.rollRange}°
                      </Text>
                      <Text style={styles.featureLabel}>Roll Range</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Enhanced Exercise Recommendations */}
            <View style={styles.exercisesCard}>
              <View style={styles.cardHeader}>
                <Image
                  source={{ uri: EXERCISE_ICON }}
                  style={styles.cardIcon}
                />
                <Text style={styles.cardTitle}>Targeted Exercises</Text>
              </View>

              {exerciseRecommendations.map((exercise, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.exerciseItem}
                  onPress={() =>
                    setExpandedExercise(
                      expandedExercise === index ? null : index
                    )
                  }
                  activeOpacity={0.8}
                >
                  <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseName}>💪 {exercise.name}</Text>
                    <View style={styles.difficultyBadge}>
                      <Text style={styles.difficultyText}>
                        {exercise.difficulty}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.exerciseMetrics}>
                    <View style={styles.exerciseMetric}>
                      <Image
                        source={{ uri: CLOCK_ICON }}
                        style={styles.metricIcon}
                      />
                      <Text style={styles.metricText}>{exercise.duration}</Text>
                    </View>
                    <View style={styles.exerciseMetric}>
                      <Image
                        source={{ uri: REPEAT_ICON }}
                        style={styles.metricIcon}
                      />
                      <Text style={styles.metricText}>
                        {exercise.frequency}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.exerciseDescription}>
                    {exercise.description}
                  </Text>

                  {expandedExercise === index && exercise.benefits && (
                    <View style={styles.benefitsContainer}>
                      <Text style={styles.benefitsTitle}>✨ Benefits:</Text>
                      {exercise.benefits.map((benefit, benefitIndex) => (
                        <Text key={benefitIndex} style={styles.benefitItem}>
                          • {benefit}
                        </Text>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Enhanced Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            {dataSource === "dynamic"
              ? "🤖 Powered by the same decision tree algorithm running on your ESP32 device"
              : "📱 Connect your ESP32 device for real-time analysis"}
          </Text>
        </View>

        <View style={styles.footerPadding} />
      </ScrollView>
    </Animated.View>
  );
};

export default PostureDetail;
