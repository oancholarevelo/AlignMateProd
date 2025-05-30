import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated, // Add this import
} from "react-native";
import { styles, THEME } from "../styles/HistoryDetailStyles";

// Icons
const ICONS = {
  back: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='19' y1='12' x2='5' y2='12'/%3E%3Cpolyline points='12 19 5 12 12 5'/%3E%3C/svg%3E",
};

// Card component for consistent styling
const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

// Format hour for display
const formatHourAmPm = (hour) => {
  const h = hour % 12 || 12;
  const ampm = hour < 12 || hour === 24 ? "AM" : "PM";
  return `${h}${ampm}`;
};

// Helper function to format history dates
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
  
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
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

const HistoryDetail = ({ 
  selectedHistoryData, 
  onBack 
}) => {
  // Add animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Add animation effect on mount
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
  }, [fadeAnim, slideAnim]);

  if (!selectedHistoryData) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>No history data available</Text>
        </View>
      </View>
    );
  }

  return (
    // Wrap the ScrollView with Animated.View
    <Animated.View
      style={[
        styles.container,
        { 
          opacity: fadeAnim, 
          transform: [{ translateY: slideAnim }] 
        },
      ]}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header (matching PostureDetail style) */}
        <View style={styles.detailHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
          >
            <Image source={{ uri: ICONS.back }} style={styles.backIcon} />
          </TouchableOpacity>
          <View style={styles.detailTitleContainer}>
            <Text style={styles.detailTitle}>Posture History</Text>
            <Text style={styles.detailSubtitle}>
              {formatHistoryDate(selectedHistoryData.date)}
            </Text>
          </View>
        </View>

        {/* Daily Summary Card */}
        <Card style={styles.historySummaryCard}>
          <Text style={styles.cardTitle}>📊 Daily Summary</Text>
          
          <View style={styles.summaryStatsContainer}>
            <View style={styles.summaryStatItem}>
              <Text style={[styles.summaryStatValue, { color: THEME.primary }]}>
                {selectedHistoryData.good.toFixed(1)}%
              </Text>
              <Text style={[styles.summaryStatLabel, { color: THEME.primary }]}>
                Excellent Posture
              </Text>
            </View>
            
            <View style={styles.summaryStatItem}>
              <Text style={[styles.summaryStatValue, { color: THEME.warning }]}>
                {selectedHistoryData.warning.toFixed(1)}%
              </Text>
              <Text style={[styles.summaryStatLabel, { color: THEME.warning }]}>
                Needs Work
              </Text>
            </View>
            
            <View style={styles.summaryStatItem}>
              <Text style={[styles.summaryStatValue, { color: THEME.danger }]}>
                {selectedHistoryData.bad.toFixed(1)}%
              </Text>
              <Text style={[styles.summaryStatLabel, { color: THEME.danger }]}>
                Poor Posture
              </Text>
            </View>
          </View>
          
          {selectedHistoryData.dataCount && (
            <Text style={styles.dataCountText}>
              Based on {selectedHistoryData.dataCount} readings
            </Text>
          )}
        </Card>

        {/* ML Decision Tree Insights */}
        {selectedHistoryData.mlInsights && selectedHistoryData.mlInsights.totalReadings > 0 && (
          <Card style={styles.mlInsightsCard}>
            <Text style={styles.cardTitle}>🤖 ML Decision Tree Analysis</Text>
            
            {/* Info Box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Our machine learning model analyzes your posture patterns to provide personalized insights and recommendations.
              </Text>
            </View>
            
            {/* Dominant Feature */}
            <View style={styles.insightSection}>
              <Text style={styles.insightSectionTitle}>Primary Decision Factor</Text>
              <Text style={styles.insightText}>
                <Text style={styles.insightLabel}>Main Feature: </Text>
                {getPrimaryFeatureDisplay(selectedHistoryData.mlInsights.dominantFeature)}
              </Text>
              <Text style={styles.insightSubtext}>
                This was the most influential factor in your posture classifications
              </Text>
            </View>
            
            {/* Confidence Analysis */}
            <View style={styles.insightSection}>
              <Text style={styles.insightSectionTitle}>Model Confidence</Text>
              <Text style={styles.insightText}>
                <Text style={styles.insightLabel}>Average Confidence: </Text>
                {(selectedHistoryData.mlInsights.averageConfidence * 100).toFixed(1)}%
              </Text>
              <Text style={styles.insightSubtext}>
                {selectedHistoryData.mlInsights.confidencePattern === "high" 
                  ? "🎯 High confidence - very reliable predictions"
                  : selectedHistoryData.mlInsights.confidencePattern === "low"
                  ? "⚠️ Lower confidence - may need recalibration"
                  : "📊 Moderate confidence - good prediction reliability"}
              </Text>
            </View>
            
            {/* Stability Score */}
            <View style={styles.insightSection}>
              <Text style={styles.insightSectionTitle}>Posture Stability</Text>
              <View style={styles.stabilityContainer}>
                <View style={styles.stabilityBarContainer}>
                  <View 
                    style={[
                      styles.stabilityBar, 
                      { 
                        width: `${selectedHistoryData.mlInsights.stabilityScore}%`,
                        backgroundColor: selectedHistoryData.mlInsights.stabilityScore > 70 
                          ? THEME.primary 
                          : selectedHistoryData.mlInsights.stabilityScore > 40 
                          ? THEME.warning 
                          : THEME.danger
                      }
                    ]}
                  />
                </View>
                <Text style={styles.stabilityScore}>
                  {selectedHistoryData.mlInsights.stabilityScore}%
                </Text>
              </View>
              <Text style={styles.insightText}>
                <Text style={styles.insightLabel}>Transitions: </Text>
                {selectedHistoryData.mlInsights.postureTransitions} posture changes
              </Text>
              <Text style={styles.insightSubtext}>
                {selectedHistoryData.mlInsights.stabilityScore > 70 
                  ? "🟢 Very stable posture throughout the day"
                  : selectedHistoryData.mlInsights.stabilityScore > 40 
                  ? "🟡 Moderate stability with some position changes"
                  : "🔴 Frequent posture changes - focus on consistency"}
              </Text>
            </View>
            
            {/* Feature Distribution */}
            {Object.keys(selectedHistoryData.mlInsights.featureDistribution).length > 0 && (
              <View style={styles.insightSection}>
                <Text style={styles.insightSectionTitle}>Decision Tree Feature Usage</Text>
                {Object.entries(selectedHistoryData.mlInsights.featureDistribution).map(([feature, count]) => (
                  <View key={feature} style={styles.featureUsageItem}>
                    <Text style={styles.featureUsageLabel}>
                      {getPrimaryFeatureDisplay(feature)}
                    </Text>
                    <View style={styles.featureUsageBarContainer}>
                      <View 
                        style={[
                          styles.featureUsageBar, 
                          { 
                            width: `${(count / selectedHistoryData.mlInsights.totalReadings * 100)}%` 
                          }
                        ]}
                      />
                      <Text style={styles.featureUsageText}>
                        {((count / selectedHistoryData.mlInsights.totalReadings) * 100).toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                ))}
                <Text style={styles.insightSubtext}>
                  Shows which features the decision tree used most for classifications
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Trend Analysis */}
        {selectedHistoryData.trendAnalysis && selectedHistoryData.trendAnalysis.comparison !== "no_data" && (
          <Card style={styles.trendAnalysisCard}>
            <Text style={styles.cardTitle}>📈 Trend Analysis</Text>
            
            <View style={styles.trendSection}>
              <Text style={styles.trendValue}>
                {selectedHistoryData.trendAnalysis.improvement > 0 ? "+" : ""}
                {selectedHistoryData.trendAnalysis.improvement.toFixed(1)}%
              </Text>
              <Text style={styles.trendLabel}>
                {selectedHistoryData.trendAnalysis.improvement > 0 ? "Improvement" : "Change"}
              </Text>
              <Text style={styles.trendComparison}>vs. previous day</Text>
            </View>
            
            {selectedHistoryData.trendAnalysis.weeklyComparison && (
              <View style={styles.trendSection}>
                <Text style={styles.trendWeekly}>
                  {selectedHistoryData.trendAnalysis.weeklyComparison}
                </Text>
              </View>
            )}
            
            <View style={styles.recommendationSection}>
              <Text style={styles.recommendationTitle}>💡 Recommendation</Text>
              <Text style={styles.recommendationText}>
                {selectedHistoryData.trendAnalysis.recommendation}
              </Text>
            </View>
          </Card>
        )}

        {/* Hourly Breakdown */}
        {selectedHistoryData.mlInsights && Object.keys(selectedHistoryData.mlInsights.hourlyBreakdown).length > 0 && (
          <Card style={styles.hourlyBreakdownCard}>
            <Text style={styles.cardTitle}>⏰ Hourly Performance</Text>
            <Text style={styles.cardSubtitle}>
              Best and worst hours for posture
            </Text>
            
            <View style={styles.hourlyGrid}>
              {Object.entries(selectedHistoryData.mlInsights.hourlyBreakdown)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([hour, data]) => {
                  const goodPercent = (data.good / data.total) * 100;
                  return (
                    <View key={hour} style={styles.hourlyItem}>
                      <Text style={styles.hourlyTime}>
                        {formatHourAmPm(parseInt(hour))}
                      </Text>
                      <View style={styles.hourlyBarContainer}>
                        <View 
                          style={[
                            styles.hourlyBar,
                            { 
                              height: `${Math.max(10, goodPercent)}%`,
                              backgroundColor: goodPercent > 70 ? THEME.primary : goodPercent > 40 ? THEME.warning : THEME.danger
                            }
                          ]}
                        />
                      </View>
                      <Text style={styles.hourlyPercent}>
                        {goodPercent.toFixed(0)}%
                      </Text>
                    </View>
                  );
                })}
            </View>
            
            <View style={styles.hourlyHint}>
              <Text style={styles.infoText}>
                Height shows percentage of good posture during each hour
              </Text>
            </View>
          </Card>
        )}

        <View style={styles.footerPadding} />
      </ScrollView>
    </Animated.View>
  );
};

export default HistoryDetail;