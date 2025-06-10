import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { ref, onValue } from "firebase/database";
import { database } from "../firebase";
import { styles } from "../styles/AchievementsStyles";
import { THEME_ICONS } from "../constants/AppIcons";

const { width: screenWidth } = Dimensions.get("window");

const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (e) {
    return dateString;
  }
};

const formatTime = (timeString) => {
  if (!timeString) return "";
  try {
    const date = new Date(`1970-01-01T${timeString}Z`);
    if (isNaN(date.getTime())) return timeString;
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (e) {
    return timeString;
  }
};

// Animated Achievement Display Component
const AnimatedAchievement = ({ theme, rewardCount, isVisible }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isVisible) {
      // Scale in animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Continuous pulse animation
      const pulseAnimation = Animated.loop(
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
      );
      pulseAnimation.start();

      // Gentle rotation
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        })
      );
      rotateAnimation.start();

      return () => {
        pulseAnimation.stop();
        rotateAnimation.stop();
      };
    }
  }, [isVisible, scaleAnim, rotateAnim, pulseAnim]);

  const getAchievementIcon = () => {
    if (theme === "pet") {
      if (rewardCount >= 20) return THEME_ICONS.pet.legendary;
      if (rewardCount >= 10) return THEME_ICONS.pet.adult;
      if (rewardCount >= 3) return THEME_ICONS.pet.baby;
      return THEME_ICONS.pet.egg;
    }
    if (theme === "city") {
      if (rewardCount >= 15) return THEME_ICONS.city.megacity;
      if (rewardCount >= 6) return THEME_ICONS.city.neighborhood;
      return THEME_ICONS.city.house;
    }
    if (theme === "fitness") {
      if (rewardCount >= 15) return THEME_ICONS.fitness.legendary;
      if (rewardCount >= 10) return THEME_ICONS.fitness.champion;
      if (rewardCount >= 6) return THEME_ICONS.fitness.knight;
      return THEME_ICONS.fitness.novice;
    }
    if (theme === "space") {
      if (rewardCount >= 15) return THEME_ICONS.space.mothership;
      if (rewardCount >= 10) return THEME_ICONS.space.station;
      if (rewardCount >= 6) return THEME_ICONS.space.shuttle;
      return THEME_ICONS.space.rocket;
    }
    if (theme === "trees") {
      if (rewardCount >= 15) return THEME_ICONS.trees.forest;
      if (rewardCount >= 10) return THEME_ICONS.trees.tree;
      if (rewardCount >= 6) return THEME_ICONS.trees.sapling;
      return THEME_ICONS.trees.seedling;
    }
    return THEME_ICONS[theme]?.[0] || THEME_ICONS.pet.egg;
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.animatedAchievementContainer}>
      <Animated.View
        style={[
          styles.achievementIconContainer,
          {
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) },
              { rotate: rotate },
            ],
          },
        ]}
      >
        <Image
          source={{ uri: getAchievementIcon() }}
          style={styles.largeAchievementIcon}
        />
      </Animated.View>

      {/* Floating particles effect */}
      <View style={styles.particlesContainer}>
        {[...Array(6)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 200} />
        ))}
      </View>
    </View>
  );
};

// Floating Particle Component
const FloatingParticle = ({ delay }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.parallel([
              Animated.timing(floatAnim, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true,
              }),
              Animated.sequence([
                Animated.timing(opacityAnim, {
                  toValue: 1,
                  duration: 500,
                  useNativeDriver: true,
                }),
                Animated.delay(2000),
                Animated.timing(opacityAnim, {
                  toValue: 0,
                  duration: 500,
                  useNativeDriver: true,
                }),
              ]),
            ]),
            Animated.timing(floatAnim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, delay);
    };

    startAnimation();
  }, [delay, floatAnim, opacityAnim]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -50],
  });

  const translateX = floatAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, Math.random() * 20 - 10, Math.random() * 30 - 15],
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          transform: [{ translateY }, { translateX }],
          opacity: opacityAnim,
        },
      ]}
    />
  );
};

// Progress Visualization Component
const ProgressVisualization = ({
  currentReward,
  nextReward,
  progress,
  rate,
  themeColor,
  currentCount,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Calculate actual progress toward next achievement
    const nextTarget = nextReward ? nextReward.at : 0;
    const currentTarget = currentReward ? currentReward.at : 0;
    const actualProgress =
      nextTarget > 0
        ? (currentCount - currentTarget) / (nextTarget - currentTarget)
        : 0;

    Animated.timing(progressAnim, {
      toValue: Math.max(0, Math.min(1, actualProgress)),
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress, rate, progressAnim, currentReward, nextReward, currentCount]);

  const animatedWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.progressVisualizationContainer}>
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            { backgroundColor: themeColor, width: animatedWidth },
          ]}
        />
        <View style={styles.progressLabels}>
          <Text style={styles.progressStart}>
            {currentReward?.reward || "Start"}
          </Text>
          <Text style={styles.progressEnd}>
            {nextReward?.reward || "Max Level"}
          </Text>
        </View>
      </View>
    </View>
  );
};

// Enhanced Gamification Themes Configuration
const GAMIFICATION_THEMES = {
  pet: {
    name: "Pet Care",
    unit: "Happiness Level",
    description: "Care for your virtual pet!",
    icon: THEME_ICONS.pet.egg,
    color: "#FF6B8A",
    rewards: [
      // Research Phase (0-20 minutes)
      {
        at: 1,
        reward: "Pet Egg",
        description: "Your first companion!",
        icon: THEME_ICONS.pet.egg,
        phase: "research",
      },
      {
        at: 3,
        reward: "Baby Pet",
        description: "Your pet hatched!",
        icon: THEME_ICONS.pet.baby,
        phase: "research",
      },
      {
        at: 6,
        reward: "Adult Pet",
        description: "Fully grown companion!",
        icon: THEME_ICONS.pet.adult,
        phase: "research",
      },
      {
        at: 10,
        reward: "Happy Pet",
        description: "Joyful companion!",
        icon: THEME_ICONS.pet.adult,
        phase: "research",
      },
      {
        at: 15,
        reward: "Legendary Pet",
        description: "Mythical evolution!",
        icon: THEME_ICONS.pet.legendary,
        phase: "research",
      },
      {
        at: 20,
        reward: "Pet Master",
        description: "Ultimate pet trainer!",
        icon: THEME_ICONS.pet.legendary,
        phase: "research",
      },
      // Extended Phase (21+ minutes) - For Full Release
      {
        at: 30,
        reward: "Pet Whisperer",
        description: "You understand all pets!",
        icon: THEME_ICONS.pet.legendary,
        phase: "extended",
      },
      {
        at: 45,
        reward: "Pet Sanctuary",
        description: "Home to many companions!",
        icon: THEME_ICONS.pet.legendary,
        phase: "extended",
      },
      {
        at: 60,
        reward: "Pet Kingdom",
        description: "Ruler of all pets!",
        icon: THEME_ICONS.pet.legendary,
        phase: "extended",
      },
      {
        at: 90,
        reward: "Pet Dimension",
        description: "Master of pet reality!",
        icon: THEME_ICONS.pet.legendary,
        phase: "extended",
      },
      {
        at: 120,
        reward: "Pet Universe",
        description: "Creator of pet worlds!",
        icon: THEME_ICONS.pet.legendary,
        phase: "extended",
      },
    ],
  },

  city: {
    name: "City Builder",
    unit: "Buildings Built",
    description: "Build your dream city!",
    icon: THEME_ICONS.city.house,
    color: "#4CAF50",
    rewards: [
      // Research Phase
      {
        at: 1,
        reward: "First House",
        description: "Welcome home!",
        icon: THEME_ICONS.city.house,
        phase: "research",
      },
      {
        at: 3,
        reward: "Neighborhood",
        description: "Community growing!",
        icon: THEME_ICONS.city.neighborhood,
        phase: "research",
      },
      {
        at: 6,
        reward: "Shopping District",
        description: "Commerce thrives!",
        icon: THEME_ICONS.city.neighborhood,
        phase: "research",
      },
      {
        at: 10,
        reward: "Business Center",
        description: "Economic hub!",
        icon: THEME_ICONS.city.megacity,
        phase: "research",
      },
      {
        at: 15,
        reward: "Bustling City",
        description: "Metropolitan area!",
        icon: THEME_ICONS.city.megacity,
        phase: "research",
      },
      {
        at: 20,
        reward: "Megacity",
        description: "Urban masterpiece!",
        icon: THEME_ICONS.city.megacity,
        phase: "research",
      },
      // Extended Phase
      {
        at: 30,
        reward: "Smart City",
        description: "Technology integrated!",
        icon: THEME_ICONS.city.megacity,
        phase: "extended",
      },
      {
        at: 45,
        reward: "Metropolitan Area",
        description: "Multiple cities connected!",
        icon: THEME_ICONS.city.megacity,
        phase: "extended",
      },
      {
        at: 60,
        reward: "Global Hub",
        description: "World trading center!",
        icon: THEME_ICONS.city.megacity,
        phase: "extended",
      },
      {
        at: 90,
        reward: "Floating Cities",
        description: "Defying gravity itself!",
        icon: THEME_ICONS.city.megacity,
        phase: "extended",
      },
      {
        at: 120,
        reward: "Planetary Capital",
        description: "Center of civilization!",
        icon: THEME_ICONS.city.megacity,
        phase: "extended",
      },
    ],
  },

  fitness: {
    name: "Posture Warrior",
    unit: "Strength Points",
    description: "Become a posture champion!",
    icon: THEME_ICONS.fitness.novice,
    color: "#FF9800",
    rewards: [
      // Research Phase
      {
        at: 1,
        reward: "Novice Warrior",
        description: "Your journey begins!",
        icon: THEME_ICONS.fitness.novice,
        phase: "research",
      },
      {
        at: 3,
        reward: "Skilled Fighter",
        description: "Gaining experience!",
        icon: THEME_ICONS.fitness.novice,
        phase: "research",
      },
      {
        at: 6,
        reward: "Posture Knight",
        description: "Noble protector!",
        icon: THEME_ICONS.fitness.knight,
        phase: "research",
      },
      {
        at: 10,
        reward: "Posture Champion",
        description: "Elite fighter!",
        icon: THEME_ICONS.fitness.champion,
        phase: "research",
      },
      {
        at: 15,
        reward: "Posture Master",
        description: "Supreme warrior!",
        icon: THEME_ICONS.fitness.legendary,
        phase: "research",
      },
      {
        at: 20,
        reward: "Legendary Hero",
        description: "Living legend!",
        icon: THEME_ICONS.fitness.legendary,
        phase: "research",
      },
      // Extended Phase
      {
        at: 30,
        reward: "Spine Guardian",
        description: "Protector of perfect posture!",
        icon: THEME_ICONS.fitness.legendary,
        phase: "extended",
      },
      {
        at: 45,
        reward: "Posture Sensei",
        description: "Master teacher of alignment!",
        icon: THEME_ICONS.fitness.legendary,
        phase: "extended",
      },
      {
        at: 60,
        reward: "Ergonomic Emperor",
        description: "Ruler of workplace wellness!",
        icon: THEME_ICONS.fitness.legendary,
        phase: "extended",
      },
      {
        at: 90,
        reward: "Alignment Avatar",
        description: "Perfect posture incarnate!",
        icon: THEME_ICONS.fitness.legendary,
        phase: "extended",
      },
      {
        at: 120,
        reward: "Posture Deity",
        description: "Divine spine alignment!",
        icon: THEME_ICONS.fitness.legendary,
        phase: "extended",
      },
    ],
  },

  space: {
    name: "Space Explorer",
    unit: "Planets Discovered",
    description: "Explore the universe!",
    icon: THEME_ICONS.space.rocket,
    color: "#3F51B5",
    rewards: [
      // Research Phase
      {
        at: 1,
        reward: "First Launch",
        description: "Blast off!",
        icon: THEME_ICONS.space.rocket,
        phase: "research",
      },
      {
        at: 3,
        reward: "Moon Landing",
        description: "One small step!",
        icon: THEME_ICONS.space.rocket,
        phase: "research",
      },
      {
        at: 6,
        reward: "Mars Colony",
        description: "Red planet conquered!",
        icon: THEME_ICONS.space.shuttle,
        phase: "research",
      },
      {
        at: 10,
        reward: "Space Station",
        description: "Orbital outpost!",
        icon: THEME_ICONS.space.station,
        phase: "research",
      },
      {
        at: 15,
        reward: "Galaxy Explorer",
        description: "Beyond our system!",
        icon: THEME_ICONS.space.mothership,
        phase: "research",
      },
      {
        at: 20,
        reward: "Universe Master",
        description: "Cosmic champion!",
        icon: THEME_ICONS.space.mothership,
        phase: "research",
      },
      // Extended Phase
      {
        at: 30,
        reward: "Interstellar Admiral",
        description: "Commander of star fleets!",
        icon: THEME_ICONS.space.mothership,
        phase: "extended",
      },
      {
        at: 45,
        reward: "Galactic Emperor",
        description: "Ruler of galaxies!",
        icon: THEME_ICONS.space.mothership,
        phase: "extended",
      },
      {
        at: 60,
        reward: "Dimension Walker",
        description: "Traveler between realities!",
        icon: THEME_ICONS.space.mothership,
        phase: "extended",
      },
      {
        at: 90,
        reward: "Cosmic Architect",
        description: "Builder of universes!",
        icon: THEME_ICONS.space.mothership,
        phase: "extended",
      },
      {
        at: 120,
        reward: "Multiverse God",
        description: "Creator of infinite realities!",
        icon: THEME_ICONS.space.mothership,
        phase: "extended",
      },
    ],
  },

  trees: {
    name: "Eco Warrior",
    unit: "Trees Planted",
    description: "Save the environment!",
    icon: THEME_ICONS.trees.seedling,
    color: "#4CAF50",
    rewards: [
      // Research Phase
      {
        at: 1,
        reward: "First Seedling",
        description: "Growth begins!",
        icon: THEME_ICONS.trees.seedling,
        phase: "research",
      },
      {
        at: 3,
        reward: "Small Grove",
        description: "Forest forming!",
        icon: THEME_ICONS.trees.seedling,
        phase: "research",
      },
      {
        at: 6,
        reward: "Young Tree",
        description: "Growing strong!",
        icon: THEME_ICONS.trees.sapling,
        phase: "research",
      },
      {
        at: 10,
        reward: "Forest Guardian",
        description: "Nature's protector!",
        icon: THEME_ICONS.trees.tree,
        phase: "research",
      },
      {
        at: 15,
        reward: "Amazon Guardian",
        description: "Rainforest protector!",
        icon: THEME_ICONS.trees.forest,
        phase: "research",
      },
      {
        at: 20,
        reward: "Planet Saver",
        description: "Earth's champion!",
        icon: THEME_ICONS.trees.forest,
        phase: "research",
      },
      // Extended Phase
      {
        at: 30,
        reward: "Forest Sage",
        description: "Wisdom of ancient trees!",
        icon: THEME_ICONS.trees.forest,
        phase: "extended",
      },
      {
        at: 45,
        reward: "Nature's Voice",
        description: "Speaker for all forests!",
        icon: THEME_ICONS.trees.forest,
        phase: "extended",
      },
      {
        at: 60,
        reward: "Gaia's Champion",
        description: "Earth's chosen protector!",
        icon: THEME_ICONS.trees.forest,
        phase: "extended",
      },
      {
        at: 90,
        reward: "World Tree",
        description: "Connection to all life!",
        icon: THEME_ICONS.trees.forest,
        phase: "extended",
      },
      {
        at: 120,
        reward: "Life Creator",
        description: "Source of all nature!",
        icon: THEME_ICONS.trees.forest,
        phase: "extended",
      },
    ],
  },
};

const Achievements = ({
  onBack,
  achievementsData: parentAchievementsData,
  userUID: parentUserUID,
}) => {
  const [achievementsData, setAchievementsData] = useState({
    points: 0,
    themeRewards: 0,
    history: [],
    streaks: {
      current: 0,
      longest: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [sensorConnected, setSensorConnected] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("pet");

  // Use userUID from parent or fallback to localStorage
  const userUID = parentUserUID || localStorage.getItem("userUID");
  const [isResearchMode, setIsResearchMode] = useState(true);

  // Point display configuration
  const POINT_DISPLAY_CONFIG = {
    pointsPerDisplayPoint: 9, // Changed from 18 to 16
    pointUnit: "minute",
    pointUnitPlural: "minutes",
    maxSessionPoints: isResearchMode ? 20 : 180,
  };

  // Theme-specific reward rates
  const THEME_REWARD_RATES = {
    pet: 1,
    city: 1,
    fitness: 1,
    space: 1,
    trees: 1,
  };

  // Helper functions
  const convertToDisplayPoints = (rawPoints) => {
    const displayPoints = Math.floor(
      (rawPoints || 0) / POINT_DISPLAY_CONFIG.pointsPerDisplayPoint
    );
    return Math.min(displayPoints, POINT_DISPLAY_CONFIG.maxSessionPoints);
  };

  const calculateThemeRewards = (displayPoints) => {
    const rate = THEME_REWARD_RATES[selectedTheme] || 1;
    return Math.floor(displayPoints / rate);
  };

  const getThemeProgress = (displayPoints) => {
    const rate = THEME_REWARD_RATES[selectedTheme] || 1;
    return displayPoints % rate;
  };

  const getAvailableRewards = (theme) => {
    const allRewards = GAMIFICATION_THEMES[theme].rewards;
    if (isResearchMode) {
      return allRewards.filter((reward) => reward.phase === "research");
    }
    return allRewards; // Show all rewards in full release
  };

  const getCurrentReward = (rewardCount) => {
    const theme = GAMIFICATION_THEMES[selectedTheme];
    const availableRewards = getAvailableRewards(selectedTheme);
    const sortedRewards = [...availableRewards].sort((a, b) => a.at - b.at);

    for (let i = sortedRewards.length - 1; i >= 0; i--) {
      if (rewardCount >= sortedRewards[i].at) {
        return sortedRewards[i];
      }
    }
    return null;
  };

  const getNextReward = (rewardCount) => {
    const theme = GAMIFICATION_THEMES[selectedTheme];
    const availableRewards = getAvailableRewards(selectedTheme);
    const sortedRewards = [...availableRewards].sort((a, b) => a.at - b.at);

    for (let reward of sortedRewards) {
      if (rewardCount < reward.at) {
        return reward;
      }
    }
    return null;
  };

  useEffect(() => {
    if (!userUID) {
      setLoading(false);
      setAchievementsData({
        points: 0,
        themeRewards: 0,
        history: [],
        streaks: { current: 0, longest: 0 },
      });
      return;
    }

    setLoading(true);
    // console.log("Achievements: Main useEffect triggered. userUID:", userUID, "isResearchMode:", isResearchMode, "parentProvided:", !!parentAchievementsData);

    const achievementsRef = ref(database, `users/${userUID}/achievements`);
    const unsubscribeAchievements = onValue(
      achievementsRef,
      (snapshot) => {
        const firebaseRawData = snapshot.val();
        // console.log("Achievements: Firebase raw data received:", firebaseRawData);

        let sourceRawPoints = 0;
        let sourceRawStreaks = { current: 0, longest: 0 };
        let sourceHistory = [];

        if (firebaseRawData) {
          sourceRawPoints = firebaseRawData.points || 0;
          sourceRawStreaks = {
            current: firebaseRawData.streaks?.current || 0,
            longest: firebaseRawData.streaks?.longest || 0,
          };
          sourceHistory = firebaseRawData.history || [];
        }

        // If parentAchievementsData is provided, it overrides the Firebase data for raw values.
        // This assumes parentAchievementsData is the more current/intended source when available.
        if (parentAchievementsData) {
          // console.log("Achievements: parentAchievementsData provided, using its values as source.", parentAchievementsData);
          sourceRawPoints =
            typeof parentAchievementsData.points === "number"
              ? parentAchievementsData.points
              : sourceRawPoints;
          if (parentAchievementsData.streaks) {
            sourceRawStreaks = {
              current:
                typeof parentAchievementsData.streaks.current === "number"
                  ? parentAchievementsData.streaks.current
                  : sourceRawStreaks.current,
              longest:
                typeof parentAchievementsData.streaks.longest === "number"
                  ? parentAchievementsData.streaks.longest
                  : sourceRawStreaks.longest,
            };
          }
          // For history, use parent's if it's explicitly provided and non-empty, otherwise stick with Firebase's or empty.
          if (
            parentAchievementsData.history &&
            parentAchievementsData.history.length > 0
          ) {
            sourceHistory = parentAchievementsData.history;
          }
        }

        const displayPoints = convertToDisplayPoints(sourceRawPoints);
        const displayStreaks = {
          current: convertToDisplayPoints(sourceRawStreaks.current),
          longest: convertToDisplayPoints(sourceRawStreaks.longest),
        };

        // Theme rewards will be calculated by the dedicated useEffect for it

        setAchievementsData((prevData) => ({
          ...prevData, // Keep other potential state parts
          points: displayPoints,
          // themeRewards will be updated by its own effect
          history: sourceHistory,
          streaks: displayStreaks,
        }));
        setLoading(false);
      },
      (error) => {
        console.error("Achievements: Firebase onValue error:", error);
        setLoading(false);
      }
    );

    const sensorStatusRef = ref(database, `users/${userUID}/sensorStatus`);
    const unsubscribeSensor = onValue(sensorStatusRef, (snapshot) => {
      const status = snapshot.val();
      setSensorConnected(status?.connected === true);
    });

    return () => {
      // console.log("Achievements: Cleaning up Firebase listeners.");
      unsubscribeAchievements();
      unsubscribeSensor();
    };
  }, [userUID, parentAchievementsData, isResearchMode]); // isResearchMode affects POINT_DISPLAY_CONFIG

  // Effect to re-calculate themeRewards ONLY if selectedTheme or display points change
  useEffect(() => {
    // console.log("Achievements: selectedTheme or points changed. Updating themeRewards.");
    // Ensure calculateThemeRewards and setAchievementsData are defined and accessible
    if (
      typeof calculateThemeRewards === "function" &&
      typeof setAchievementsData === "function"
    ) {
      setAchievementsData((prevData) => ({
        ...prevData,
        themeRewards: calculateThemeRewards(prevData.points), // prevData.points is display points
      }));
    }
  }, [selectedTheme, achievementsData.points]);

  // Enhanced Current Status Component
  const CurrentStatus = () => {
    const currentTheme = GAMIFICATION_THEMES[selectedTheme];
    const currentReward = getCurrentReward(achievementsData.themeRewards);
    const nextReward = getNextReward(achievementsData.themeRewards);
    const progress = getThemeProgress(achievementsData.points);
    const rate = THEME_REWARD_RATES[selectedTheme];

    // Calculate remaining minutes to next achievement
    const remainingMinutes = nextReward
      ? nextReward.at - achievementsData.themeRewards
      : 0;

    return (
      <View
        style={[
          styles.statusContainer,
          { backgroundColor: currentTheme.color + "15" },
        ]}
      >
        {/* Research Mode Indicator */}
        {isResearchMode && (
          <View style={styles.researchModeIndicator}>
            <Text style={styles.researchModeText}>
              🔬 Research Mode - 20 Min Max
            </Text>
            <Text style={styles.researchModeSubtext}>
              Full version will unlock extended achievements!
            </Text>
          </View>
        )}

        <View style={styles.statusHeader}>
          <Text style={[styles.statusTitle, { color: currentTheme.color }]}>
            {currentTheme.name}
          </Text>
          <Text style={styles.statusSubtitle}>
            {achievementsData.themeRewards} {currentTheme.unit}
          </Text>
        </View>

        {/* Large Animated Achievement Display */}
        <AnimatedAchievement
          theme={selectedTheme}
          rewardCount={achievementsData.themeRewards}
          isVisible={true}
        />

        {/* Current Achievement */}
        {currentReward && (
          <View
            style={[
              styles.currentAchievementBanner,
              { backgroundColor: currentTheme.color },
            ]}
          >
            <Text style={styles.currentAchievementTitle}>
              🎉 {currentReward.reward}
            </Text>
            <Text style={styles.currentAchievementDesc}>
              {currentReward.description}
            </Text>
          </View>
        )}

        {/* Progress to Next Achievement */}
        {nextReward && (
          <View style={styles.nextAchievementContainer}>
            <Text style={styles.nextAchievementTitle}>
              Next Goal: {nextReward.reward}
            </Text>
            <ProgressVisualization
              currentReward={currentReward}
              nextReward={nextReward}
              progress={progress}
              rate={rate}
              themeColor={currentTheme.color}
              currentCount={achievementsData.themeRewards}
            />
            <Text style={styles.progressText}>
              {remainingMinutes} {remainingMinutes === 1 ? "minute" : "minutes"}{" "}
              to next achievement
            </Text>
          </View>
        )}

        {/* Perfect Session or Max Research Achievement */}
        {achievementsData.points === POINT_DISPLAY_CONFIG.maxSessionPoints && (
          <View
            style={[
              styles.perfectSessionBanner,
              { borderColor: currentTheme.color },
            ]}
          >
            <Text style={styles.perfectSessionTitle}>
              {isResearchMode
                ? "⭐ Research Complete! ⭐"
                : "⭐ Perfect Session! ⭐"}
            </Text>
            <Text style={styles.perfectSessionDesc}>
              {isResearchMode
                ? "Thank you for participating in our research!"
                : "Maximum points achieved! You're a posture champion!"}
            </Text>
          </View>
        )}

        {/* Coming Soon Preview for Research Mode */}
        {isResearchMode && achievementsData.points >= 15 && (
          <View style={styles.comingSoonContainer}>
            <Text style={styles.comingSoonTitle}>
              🚀 Coming in Full Release!
            </Text>
            <Text style={styles.comingSoonText}>
              Extended achievements up to 2+ hours, new themes, and epic
              rewards!
            </Text>
          </View>
        )}
      </View>
    );
  };

  const MilestonesSection = () => {
    const availableRewards = getAvailableRewards(selectedTheme);

    return (
      <View style={styles.milestonesContainer}>
        <Text style={styles.milestonesTitle}>
          {isResearchMode
            ? "Research Phase Milestones"
            : "Achievement Milestones"}
        </Text>
        <View style={styles.milestonesGrid}>
          {availableRewards.map((reward, index) => {
            const unlocked = achievementsData.themeRewards >= reward.at;
            return (
              <View
                key={index}
                style={[
                  styles.milestone,
                  unlocked ? styles.milestoneUnlocked : styles.milestoneLocked,
                  unlocked && {
                    borderColor: GAMIFICATION_THEMES[selectedTheme].color,
                  },
                ]}
              >
                <Text style={styles.milestoneReward}>{reward.reward}</Text>
                <Text style={styles.milestoneDesc}>{reward.description}</Text>
                <View style={styles.milestoneRequirementContainer}>
                  {unlocked && (
                    <Image
                      source={{ uri: checkIcon }}
                      style={styles.checkIcon}
                    />
                  )}
                  <Text style={styles.milestoneRequirement}>
                    {unlocked
                      ? "Unlocked!"
                      : `Need ${reward.at} ${GAMIFICATION_THEMES[selectedTheme].unit}`}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Extended Achievements Preview */}
        {isResearchMode && (
          <View style={styles.extendedPreviewContainer}>
            <View style={styles.extendedPreviewHeader}>
              <Text style={styles.extendedPreviewTitle}>
                🔮 Extended Achievements Preview
              </Text>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonBadgeText}>COMING SOON</Text>
              </View>
            </View>

            <Text style={styles.extendedPreviewSubtitle}>
              Full release will unlock epic achievements up to 2+ hours!
            </Text>

            <View style={styles.previewCardsContainer}>
              {selectedTheme === "pet" && (
                <>
                  <View style={[styles.previewCard, styles.previewCardLocked]}>
                    <View style={styles.previewCardHeader}>
                      <Text style={styles.previewCardTitle}>Pet Whisperer</Text>
                      <Text style={styles.previewCardTime}>30 min</Text>
                    </View>
                    <Text style={styles.previewCardDesc}>
                      You understand all pets!
                    </Text>
                    <View style={styles.previewCardBadge}>
                      <Text style={styles.previewCardBadgeText}>🔒 LOCKED</Text>
                    </View>
                  </View>

                  <View style={[styles.previewCard, styles.previewCardLocked]}>
                    <View style={styles.previewCardHeader}>
                      <Text style={styles.previewCardTitle}>Pet Sanctuary</Text>
                      <Text style={styles.previewCardTime}>45 min</Text>
                    </View>
                    <Text style={styles.previewCardDesc}>
                      Home to many companions!
                    </Text>
                    <View style={styles.previewCardBadge}>
                      <Text style={styles.previewCardBadgeText}>🔒 LOCKED</Text>
                    </View>
                  </View>

                  <View style={[styles.previewCard, styles.previewCardEpic]}>
                    <View style={styles.previewCardHeader}>
                      <Text style={styles.previewCardTitle}>Pet Kingdom</Text>
                      <Text style={styles.previewCardTime}>60 min</Text>
                    </View>
                    <Text style={styles.previewCardDesc}>
                      Ruler of all pets!
                    </Text>
                    <View style={[styles.previewCardBadge, styles.epicBadge]}>
                      <Text style={styles.epicBadgeText}>👑 EPIC</Text>
                    </View>
                  </View>

                  <View
                    style={[styles.previewCard, styles.previewCardLegendary]}
                  >
                    <View style={styles.previewCardHeader}>
                      <Text style={styles.previewCardTitle}>Pet Dimension</Text>
                      <Text style={styles.previewCardTime}>90 min</Text>
                    </View>
                    <Text style={styles.previewCardDesc}>
                      Master of pet reality!
                    </Text>
                    <View
                      style={[styles.previewCardBadge, styles.legendaryBadge]}
                    >
                      <Text style={styles.legendaryBadgeText}>
                        ⭐ LEGENDARY
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.previewCard, styles.previewCardMythic]}>
                    <View style={styles.previewCardHeader}>
                      <Text style={styles.previewCardTitle}>
                        Pet Universe Creator
                      </Text>
                      <Text style={styles.previewCardTime}>120 min</Text>
                    </View>
                    <Text style={styles.previewCardDesc}>
                      Creator of pet worlds!
                    </Text>
                    <View style={[styles.previewCardBadge, styles.mythicBadge]}>
                      <Text style={styles.mythicBadgeText}>💎 MYTHIC</Text>
                    </View>
                  </View>
                </>
              )}

              {selectedTheme === "city" && (
                <>
                  <View style={[styles.previewCard, styles.previewCardLocked]}>
                    <View style={styles.previewCardHeader}>
                      <Text style={styles.previewCardTitle}>Smart City</Text>
                      <Text style={styles.previewCardTime}>30 min</Text>
                    </View>
                    <Text style={styles.previewCardDesc}>
                      Technology integrated!
                    </Text>
                    <View style={styles.previewCardBadge}>
                      <Text style={styles.previewCardBadgeText}>🔒 LOCKED</Text>
                    </View>
                  </View>

                  <View style={[styles.previewCard, styles.previewCardLocked]}>
                    <View style={styles.previewCardHeader}>
                      <Text style={styles.previewCardTitle}>
                        Metropolitan Area
                      </Text>
                      <Text style={styles.previewCardTime}>45 min</Text>
                    </View>
                    <Text style={styles.previewCardDesc}>
                      Multiple cities connected!
                    </Text>
                    <View style={styles.previewCardBadge}>
                      <Text style={styles.previewCardBadgeText}>🔒 LOCKED</Text>
                    </View>
                  </View>

                  <View style={[styles.previewCard, styles.previewCardEpic]}>
                    <View style={styles.previewCardHeader}>
                      <Text style={styles.previewCardTitle}>Global Hub</Text>
                      <Text style={styles.previewCardTime}>60 min</Text>
                    </View>
                    <Text style={styles.previewCardDesc}>
                      World trading center!
                    </Text>
                    <View style={[styles.previewCardBadge, styles.epicBadge]}>
                      <Text style={styles.epicBadgeText}>👑 EPIC</Text>
                    </View>
                  </View>

                  <View
                    style={[styles.previewCard, styles.previewCardLegendary]}
                  >
                    <View style={styles.previewCardHeader}>
                      <Text style={styles.previewCardTitle}>
                        Floating Cities
                      </Text>
                      <Text style={styles.previewCardTime}>90 min</Text>
                    </View>
                    <Text style={styles.previewCardDesc}>
                      Defying gravity itself!
                    </Text>
                    <View
                      style={[styles.previewCardBadge, styles.legendaryBadge]}
                    >
                      <Text style={styles.legendaryBadgeText}>
                        ⭐ LEGENDARY
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.previewCard, styles.previewCardMythic]}>
                    <View style={styles.previewCardHeader}>
                      <Text style={styles.previewCardTitle}>
                        Planetary Capital
                      </Text>
                      <Text style={styles.previewCardTime}>120 min</Text>
                    </View>
                    <Text style={styles.previewCardDesc}>
                      Center of civilization!
                    </Text>
                    <View style={[styles.previewCardBadge, styles.mythicBadge]}>
                      <Text style={styles.mythicBadgeText}>💎 MYTHIC</Text>
                    </View>
                  </View>
                </>
              )}

              {selectedTheme === "fitness" && (
                <>
                  <View style={[styles.previewCard, styles.previewCardLocked]}>
                    <View style={styles.previewCardHeader}>
                      <Text style={styles.previewCardTitle}>
                        Spine Guardian
                      </Text>
                      <Text style={styles.previewCardTime}>30 min</Text>
                    </View>
                    <Text style={styles.previewCardDesc}>
                      Protector of perfect posture!
                    </Text>
                    <View style={styles.previewCardBadge}>
                      <Text style={styles.previewCardBadgeText}>🔒 LOCKED</Text>
                    </View>
                  </View>

                  <View style={[styles.previewCard, styles.previewCardLocked]}>
                    <View style={styles.previewCardHeader}>
                      <Text style={styles.previewCardTitle}>
                        Posture Sensei
                      </Text>
                      <Text style={styles.previewCardTime}>45 min</Text>
                    </View>
                    <Text style={styles.previewCardDesc}>
                      Master teacher of alignment!
                    </Text>
                    <View style={styles.previewCardBadge}>
                      <Text style={styles.previewCardBadgeText}>🔒 LOCKED</Text>
                    </View>
                  </View>

                  <View style={[styles.previewCard, styles.previewCardEpic]}>
                    <View style={styles.previewCardHeader}>
                      <Text style={styles.previewCardTitle}>
                        Ergonomic Emperor
                      </Text>
                      <Text style={styles.previewCardTime}>60 min</Text>
                    </View>
                    <Text style={styles.previewCardDesc}>
                      Ruler of workplace wellness!
                    </Text>
                    <View style={[styles.previewCardBadge, styles.epicBadge]}>
                      <Text style={styles.epicBadgeText}>👑 EPIC</Text>
                    </View>
                  </View>

                  <View
                    style={[styles.previewCard, styles.previewCardLegendary]}
                  >
                    <View style={styles.previewCardHeader}>
                      <Text style={styles.previewCardTitle}>
                        Alignment Avatar
                      </Text>
                      <Text style={styles.previewCardTime}>90 min</Text>
                    </View>
                    <Text style={styles.previewCardDesc}>
                      Perfect posture incarnate!
                    </Text>
                    <View
                      style={[styles.previewCardBadge, styles.legendaryBadge]}
                    >
                      <Text style={styles.legendaryBadgeText}>
                        ⭐ LEGENDARY
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.previewCard, styles.previewCardMythic]}>
                    <View style={styles.previewCardHeader}>
                      <Text style={styles.previewCardTitle}>Posture Deity</Text>
                      <Text style={styles.previewCardTime}>120 min</Text>
                    </View>
                    <Text style={styles.previewCardDesc}>
                      Divine spine alignment!
                    </Text>
                    <View style={[styles.previewCardBadge, styles.mythicBadge]}>
                      <Text style={styles.mythicBadgeText}>💎 MYTHIC</Text>
                    </View>
                  </View>
                </>
              )}

              {selectedTheme === "space" && (
                <>
                  <View style={[styles.previewCard, styles.previewCardLocked]}>
                    <View style={styles.previewCardHeader}>
                      <Text style={styles.previewCardTitle}>
                        Interstellar Admiral
                      </Text>
                      <Text style={styles.previewCardTime}>30 min</Text>
                    </View>
                    <Text style={styles.previewCardDesc}>
                      Commander of star fleets!
                    </Text>
                    <View style={styles.previewCardBadge}>
                      <Text style={styles.previewCardBadgeText}>🔒 LOCKED</Text>
                    </View>
                  </View>

                  <View style={[styles.previewCard, styles.previewCardLocked]}>
                    <View style={styles.previewCardHeader}>
                      <Text style={styles.previewCardTitle}>
                        Galactic Emperor
                      </Text>
                      <Text style={styles.previewCardTime}>45 min</Text>
                    </View>
                    <Text style={styles.previewCardDesc}>
                      Ruler of galaxies!
                    </Text>
                    <View style={styles.previewCardBadge}>
                      <Text style={styles.previewCardBadgeText}>🔒 LOCKED</Text>
                    </View>
                  </View>

                  <View style={[styles.previewCard, styles.previewCardEpic]}>
                    <View style={styles.previewCardHeader}>
                      <Text style={styles.previewCardTitle}>
                        Dimension Walker
                      </Text>
                      <Text style={styles.previewCardTime}>60 min</Text>
                    </View>
                    <Text style={styles.previewCardDesc}>
                      Traveler between realities!
                    </Text>
                    <View style={[styles.previewCardBadge, styles.epicBadge]}>
                      <Text style={styles.epicBadgeText}>👑 EPIC</Text>
                    </View>
                  </View>

                  <View
                    style={[styles.previewCard, styles.previewCardLegendary]}
                  >
                    <View style={styles.previewCardHeader}>
                      <Text style={styles.previewCardTitle}>
                        Cosmic Architect
                      </Text>
                      <Text style={styles.previewCardTime}>90 min</Text>
                    </View>
                    <Text style={styles.previewCardDesc}>
                      Builder of universes!
                    </Text>
                    <View
                      style={[styles.previewCardBadge, styles.legendaryBadge]}
                    >
                      <Text style={styles.legendaryBadgeText}>
                        ⭐ LEGENDARY
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.previewCard, styles.previewCardMythic]}>
                    <View style={styles.previewCardHeader}>
                      <Text style={styles.previewCardTitle}>
                        Multiverse God
                      </Text>
                      <Text style={styles.previewCardTime}>120 min</Text>
                    </View>
                    <Text style={styles.previewCardDesc}>
                      Creator of infinite realities!
                    </Text>
                    <View style={[styles.previewCardBadge, styles.mythicBadge]}>
                      <Text style={styles.mythicBadgeText}>💎 MYTHIC</Text>
                    </View>
                  </View>
                </>
              )}

              {selectedTheme === "trees" && (
                <>
                  <View style={[styles.previewCard, styles.previewCardLocked]}>
                    <View style={styles.previewCardHeader}>
                      <Text style={styles.previewCardTitle}>Forest Sage</Text>
                      <Text style={styles.previewCardTime}>30 min</Text>
                    </View>
                    <Text style={styles.previewCardDesc}>
                      Wisdom of ancient trees!
                    </Text>
                    <View style={styles.previewCardBadge}>
                      <Text style={styles.previewCardBadgeText}>🔒 LOCKED</Text>
                    </View>
                  </View>

                  <View style={[styles.previewCard, styles.previewCardLocked]}>
                    <View style={styles.previewCardHeader}>
                      <Text style={styles.previewCardTitle}>
                        Nature's Voice
                      </Text>
                      <Text style={styles.previewCardTime}>45 min</Text>
                    </View>
                    <Text style={styles.previewCardDesc}>
                      Speaker for all forests!
                    </Text>
                    <View style={styles.previewCardBadge}>
                      <Text style={styles.previewCardBadgeText}>🔒 LOCKED</Text>
                    </View>
                  </View>

                  <View style={[styles.previewCard, styles.previewCardEpic]}>
                    <View style={styles.previewCardHeader}>
                      <Text style={styles.previewCardTitle}>
                        Gaia's Champion
                      </Text>
                      <Text style={styles.previewCardTime}>60 min</Text>
                    </View>
                    <Text style={styles.previewCardDesc}>
                      Earth's chosen protector!
                    </Text>
                    <View style={[styles.previewCardBadge, styles.epicBadge]}>
                      <Text style={styles.epicBadgeText}>👑 EPIC</Text>
                    </View>
                  </View>

                  <View
                    style={[styles.previewCard, styles.previewCardLegendary]}
                  >
                    <View style={styles.previewCardHeader}>
                      <Text style={styles.previewCardTitle}>World Tree</Text>
                      <Text style={styles.previewCardTime}>90 min</Text>
                    </View>
                    <Text style={styles.previewCardDesc}>
                      Connection to all life!
                    </Text>
                    <View
                      style={[styles.previewCardBadge, styles.legendaryBadge]}
                    >
                      <Text style={styles.legendaryBadgeText}>
                        ⭐ LEGENDARY
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.previewCard, styles.previewCardMythic]}>
                    <View style={styles.previewCardHeader}>
                      <Text style={styles.previewCardTitle}>Life Creator</Text>
                      <Text style={styles.previewCardTime}>120 min</Text>
                    </View>
                    <Text style={styles.previewCardDesc}>
                      Source of all nature!
                    </Text>
                    <View style={[styles.previewCardBadge, styles.mythicBadge]}>
                      <Text style={styles.mythicBadgeText}>💎 MYTHIC</Text>
                    </View>
                  </View>
                </>
              )}
            </View>

            <View style={styles.fullReleaseTeaser}>
              <Text style={styles.fullReleaseTeaserTitle}>
                🚀 Full Release Features
              </Text>
              <View style={styles.featuresList}>
                <Text style={styles.featureItem}>
                  ✨ Extended sessions up to 3+ hours
                </Text>
                <Text style={styles.featureItem}>
                  🎮 Interactive mini-games
                </Text>
                <Text style={styles.featureItem}>🏆 Global leaderboards</Text>
                <Text style={styles.featureItem}>👥 Social challenges</Text>
                <Text style={styles.featureItem}>🎨 Customizable themes</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  // Theme Selector Component
  const ThemeSelector = () => {
    const scrollViewRef = useRef(null);
    const [scrollPosition, setScrollPosition] = useState(0);
    const cardWidth = 120 + 12; // card width + marginRight
    const totalThemes = Object.keys(GAMIFICATION_THEMES).length;

    // Arrow icons
    const leftArrowIcon =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 100 100'%3E%3Cpath d='M60 20 L30 50 L60 80' stroke='%23666' stroke-width='8' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";
    const rightArrowIcon =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 100 100'%3E%3Cpath d='M40 20 L70 50 L40 80' stroke='%23666' stroke-width='8' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

    const scrollLeft = () => {
      const newPosition = Math.max(0, scrollPosition - cardWidth);
      scrollViewRef.current?.scrollTo({ x: newPosition, animated: true });
    };

    const scrollRight = () => {
      const maxScroll = Math.max(0, (totalThemes - 2) * cardWidth); // Show 2 cards at a time
      const newPosition = Math.min(maxScroll, scrollPosition + cardWidth);
      scrollViewRef.current?.scrollTo({ x: newPosition, animated: true });
    };

    const handleScroll = (event) => {
      const newScrollPosition = event.nativeEvent.contentOffset.x;
      setScrollPosition(newScrollPosition);
    };

    // Effect to scroll to selected theme when theme changes
    useEffect(() => {
      const themeKeys = Object.keys(GAMIFICATION_THEMES);
      const selectedIndex = themeKeys.indexOf(selectedTheme);

      if (selectedIndex !== -1 && scrollViewRef.current) {
        // Calculate the position to center the selected theme
        const targetPosition = Math.max(
          0,
          Math.min(
            selectedIndex * cardWidth - cardWidth / 2, // Try to center
            (totalThemes - 2) * cardWidth // Don't scroll past the max
          )
        );

        scrollViewRef.current.scrollTo({ x: targetPosition, animated: true });
        setScrollPosition(targetPosition);
      }
    }, [selectedTheme]);

    return (
      <View style={styles.themeSelectorContainer}>
        <Text style={styles.themeSelectorTitle}>Choose Your Adventure:</Text>
        <View style={styles.themeSelectorWrapper}>
          <TouchableOpacity
            style={[
              styles.leftArrowButton,
              scrollPosition <= 10 && styles.arrowDisabled, // Small threshold for better UX
            ]}
            onPress={scrollLeft}
            activeOpacity={0.7}
            disabled={scrollPosition <= 10}
          >
            <Image
              source={{ uri: leftArrowIcon }}
              style={[
                styles.arrowIcon,
                scrollPosition <= 10 && styles.arrowIconDisabled,
              ]}
            />
          </TouchableOpacity>

          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.themeScrollView}
            contentContainerStyle={styles.themeScrollContent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            pagingEnabled={false}
            decelerationRate="fast"
          >
            {Object.entries(GAMIFICATION_THEMES).map(([key, theme]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.themeCard,
                  selectedTheme === key && [
                    styles.themeCardSelected,
                    { borderColor: theme.color },
                  ],
                ]}
                onPress={() => setSelectedTheme(key)}
              >
                <Image source={{ uri: theme.icon }} style={styles.themeIcon} />
                <Text style={styles.themeCardTitle}>{theme.name}</Text>
                <Text style={styles.themeCardDesc}>{theme.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.rightArrowButton,
              scrollPosition >=
                Math.max(0, (totalThemes - 2) * cardWidth - 10) &&
                styles.arrowDisabled,
            ]}
            onPress={scrollRight}
            activeOpacity={0.7}
            disabled={
              scrollPosition >= Math.max(0, (totalThemes - 2) * cardWidth - 10)
            }
          >
            <Image
              source={{ uri: rightArrowIcon }}
              style={[
                styles.arrowIcon,
                scrollPosition >=
                  Math.max(0, (totalThemes - 2) * cardWidth - 10) &&
                  styles.arrowIconDisabled,
              ]}
            />
          </TouchableOpacity>
        </View>

        {/* Scroll indicator dots */}
        <View style={styles.scrollIndicator}>
          {Object.keys(GAMIFICATION_THEMES).map((themeKey, index) => {
            const isActive = selectedTheme === themeKey;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.indicatorDot,
                  isActive && styles.indicatorDotActive,
                ]}
                onPress={() => setSelectedTheme(themeKey)}
              />
            );
          })}
        </View>
      </View>
    );
  };

  // SVG Icons for other components
  const trophyIcon =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 100 100'%3E%3Cg fill='%23FFD700'%3E%3Cpath d='M30 20 L70 20 L70 45 Q70 60 50 60 Q30 60 30 45 Z'/%3E%3Cpath d='M25 25 Q20 25 20 35 Q20 45 25 45 L30 45 L30 35 Z'/%3E%3Cpath d='M75 25 Q80 25 80 35 Q80 45 75 45 L70 45 L70 35 Z'/%3E%3Crect x='45' y='60' width='10' height='15'/%3E%3Crect x='35' y='75' width='30' height='5'/%3E%3Ccircle cx='50' cy='40' r='8' fill='%23FFF'/%3E%3C/g%3E%3C/svg%3E";

  const fireIcon =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 100 100'%3E%3Cg%3E%3Cpath d='M50 10 Q40 30 45 50 Q35 45 30 60 Q25 75 40 85 Q55 90 70 85 Q85 75 80 60 Q75 45 65 50 Q70 30 60 10 Q55 20 50 10' fill='%23FF4500'/%3E%3Cpath d='M50 20 Q45 35 48 50 Q42 47 38 57 Q35 67 45 75 Q55 78 65 75 Q75 67 72 57 Q68 47 62 50 Q65 35 60 20 Q55 25 50 20' fill='%23FF6B00'/%3E%3Cpath d='M50 30 Q47 40 49 50 Q46 48 44 54 Q42 60 48 65 Q52 67 56 65 Q62 60 60 54 Q58 48 55 50 Q57 40 54 30 Q52 32 50 30' fill='%23FFD700'/%3E%3C/g%3E%3C/svg%3E";

  const checkIcon =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 100 100'%3E%3Cpath d='M20 50 L40 70 L80 20' stroke='%234CAF50' stroke-width='12' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Loading Achievements...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContentContainer}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Your Achievements</Text>
      </View>

      {/* Enhanced Current Status */}
      <CurrentStatus />

      {/* Theme Selector */}
      <ThemeSelector />

      {/* Points Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.pointsCard}>
          <Image source={{ uri: trophyIcon }} style={styles.cardIcon} />
          <Text style={styles.pointsTitle}>Session Minutes</Text>
          <Text style={styles.pointsValue}>{achievementsData.points}/20</Text>
          <Text style={styles.pointsDescription}>
            Perfect posture time in your current session
          </Text>
        </View>

        <View
          style={[
            styles.rewardsCard,
            {
              backgroundColor: GAMIFICATION_THEMES[selectedTheme].color + "20",
            },
          ]}
        >
          <Image
            source={{ uri: GAMIFICATION_THEMES[selectedTheme].icon }}
            style={styles.rewardsIcon}
          />
          <Text
            style={[
              styles.rewardsTitle,
              { color: GAMIFICATION_THEMES[selectedTheme].color },
            ]}
          >
            {GAMIFICATION_THEMES[selectedTheme].name}
          </Text>
          <Text
            style={[
              styles.rewardsValue,
              { color: GAMIFICATION_THEMES[selectedTheme].color },
            ]}
          >
            {achievementsData.themeRewards}
          </Text>
          <Text style={styles.rewardsDescription}>
            {GAMIFICATION_THEMES[selectedTheme].unit}
          </Text>
        </View>
      </View>

      {/* Streaks */}
      <View style={styles.streakContainer}>
        <Image source={{ uri: fireIcon }} style={styles.streakIcon} />
        <View style={styles.streakTextContainer}>
          <Text style={styles.streakTitle}>Current Streak</Text>
          <Text style={styles.streakValue}>
            {achievementsData.streaks.current}{" "}
            {achievementsData.streaks.current === 1 ? "Minute" : "Minutes"}
          </Text>
        </View>
        <View style={styles.streakTextContainer}>
          <Text style={styles.streakTitle}>Best Streak</Text>
          <Text style={styles.streakValue}>
            {achievementsData.streaks.longest}{" "}
            {achievementsData.streaks.longest === 1 ? "Minute" : "Minutes"}
          </Text>
        </View>
      </View>

      <MilestonesSection />

      {/* Recent History */}
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Recent Activity</Text>
        {achievementsData.history.length > 0 ? (
          <View style={styles.historyContentContainer}>
            {achievementsData.history
              .slice(-5)
              .reverse()
              .map((entry, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyIconContainer}>
                    <Image
                      source={{
                        uri: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%234CAF50'/%3E%3Cpath d='M30 50 L45 65 L70 35' stroke='%23FFFFFF' stroke-width='6' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E",
                      }}
                      style={styles.historyItemIcon}
                    />
                  </View>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyText}>
                      Good Posture Period Completed
                    </Text>
                    <Text style={styles.historyDate}>
                      {formatDate(entry.date)} at {formatTime(entry.time)}
                    </Text>
                  </View>
                  <View style={styles.historyBadge}>
                    <Text style={styles.historyBadgeText}>+1 min</Text>
                  </View>
                </View>
              ))}
          </View>
        ) : (
          <View style={styles.noHistoryContainer}>
            <View style={styles.noHistoryIconContainer}>
              <Image
                source={{
                  uri: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 100 100'%3E%3Cg fill='%23E0E0E0'%3E%3Ccircle cx='50' cy='50' r='40' stroke='%23BDBDBD' stroke-width='2' fill='none'/%3E%3Cpath d='M35 40 Q50 30 65 40 Q50 50 35 40' fill='%23BDBDBD'/%3E%3Ccircle cx='40' cy='42' r='3' fill='%23757575'/%3E%3Ccircle cx='60' cy='42' r='3' fill='%23757575'/%3E%3Cpath d='M40 60 Q50 70 60 60' stroke='%23BDBDBD' stroke-width='2' fill='none'/%3E%3C/g%3E%3C/svg%3E",
                }}
                style={styles.noHistoryIcon}
              />
            </View>
            <Text style={styles.noHistoryTitle}>No Activity Yet</Text>
            <Text style={styles.noHistoryText}>
              Maintain good posture to earn points and see your progress here!
            </Text>
            <View style={styles.noHistoryTip}>
              <Text style={styles.noHistoryTipText}>
                💡 Tip: Connect your IMU sensor and start a session
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default Achievements;
