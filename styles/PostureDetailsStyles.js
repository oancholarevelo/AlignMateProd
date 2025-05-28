import { StyleSheet, Dimensions } from "react-native";

// Get screen dimensions for responsive design
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const THEME = {
  primary: "#5CA377", // Good posture green
  warning: "#FFA500", // Warning orange
  danger: "#F87A53", // Bad posture red
  background: "#FAF9F6", // Off-white background
  text: "#1B1212", // Main text color
  textLight: "#666666", // Secondary text color
  border: "rgba(27, 18, 18, 0.1)", // Border color
  shadow: "rgba(0, 0, 0, 0.1)", // Shadow color
  cardBackground: "#FFFFFF", // Card background
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },

  // Enhanced Header
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonIcon: {
    width: 20,
    height: 20,
  },
  titleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  titleIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: "white",
  },
  titleText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },

  // Enhanced Summary Card
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  summaryIcon: {
    width: 28,
    height: 28,
    marginRight: 12,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: THEME.text,
  },
  postureMetricContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  metricDisplay: {
    alignItems: "center",
  },
  postureMetric: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  metricLabel: {
    fontSize: 14,
    color: THEME.textLight,
    marginTop: 4,
  },
  metricValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: THEME.text,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Enhanced Progress Bar
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E5E5",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontSize: 12,
    color: THEME.textLight,
  },

  // Legacy angle range (keeping for compatibility)
  angleRangeContainer: {
    marginBottom: 16,
  },
  angleRange: {
    width: "100%",
  },
  rangeBar: {
    height: 6,
    backgroundColor: "#E5E5E5",
    borderRadius: 3,
    marginBottom: 8,
    position: "relative",
  },
  rangeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: "absolute",
    top: -3,
    marginLeft: -6,
  },
  rangeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rangeLabel: {
    fontSize: 12,
    color: THEME.textLight,
  },
  rangeLabelPoor: {
    color: THEME.danger,
  },
  rangeLabelModerate: {
    color: THEME.warning,
  },
  rangeLabelGood: {
    color: THEME.primary,
  },
  angleDescription: {
    fontSize: 15,
    color: THEME.text,
    lineHeight: 22,
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 10,
  },

  // Enhanced Loading State
  loadingContainer: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "white",
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  loadingIcon: {
    width: 60,
    height: 60,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: THEME.text,
    textAlign: "center",
    marginBottom: 16,
  },
  loadingDots: {
    flexDirection: "row",
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.primary,
    marginHorizontal: 4,
  },

  // Enhanced Card Styling
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: THEME.text,
    flex: 1,
  },
  dataSourceBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 10,
  },
  dataSourceText: {
    fontSize: 12,
    color: "#1565C0",
    fontWeight: "500",
  },
  espBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  espBadgeText: {
    fontSize: 12,
    color: "#1565C0",
    fontWeight: "600",
  },

  // Enhanced Advice Card
  adviceCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  adviceText: {
    fontSize: 15,
    lineHeight: 24,
    color: THEME.text,
  },
  predictionBadge: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  predictionText: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Enhanced Recommendations Card
  recommendationsCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  recommendationItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  recommendationIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: THEME.text,
    flex: 1,
  },
  recommendationContent: {
    fontSize: 14,
    lineHeight: 20,
    color: THEME.text,
  },

  // Empty state
  emptyStateContainer: {
    padding: 12,
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
  },
  emptyStateText: {
    fontSize: 15,
    lineHeight: 22,
    color: THEME.text,
    fontStyle: "italic",
  },

  // Enhanced ML Insights Card
  insightsCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  insightsTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  insightsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  infoIcon: {
    width: 20,
    height: 20,
  },
  infoBox: {
    backgroundColor: "#E8F5E8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: THEME.primary,
  },
  infoText: {
    fontSize: 14,
    color: THEME.text,
    lineHeight: 20,
  },
  insightsGrid: {
    flexDirection: "row",
    marginBottom: 20,
  },
  insightMetric: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    marginHorizontal: 4,
  },
  insightItem: {
    marginBottom: 12,
  },
  insightLabel: {
    fontSize: 12,
    color: THEME.textLight,
    textAlign: "center",
  },
  insightValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: THEME.primary,
    marginBottom: 4,
  },
  featureAnalysis: {
    marginTop: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: THEME.text,
    marginBottom: 12,
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  featureItem: {
    width: "33.33%",
    alignItems: "center",
    marginBottom: 12,
  },
  featureValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: THEME.text,
  },
  featureLabel: {
    fontSize: 11,
    color: THEME.textLight,
    textAlign: "center",
  },

  // Enhanced Exercises Card
  exercisesCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  exerciseItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "bold",
    color: THEME.text,
    flex: 1,
  },
  difficultyBadge: {
    backgroundColor: THEME.primary + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    color: THEME.primary,
    fontWeight: "600",
  },
  exerciseMetrics: {
    flexDirection: "row",
    marginBottom: 12,
  },
  exerciseMetric: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metricIcon: {
    width: 14,
    height: 14,
    marginRight: 4,
  },
  metricText: {
    fontSize: 12,
    color: THEME.textLight,
  },
  exerciseDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: THEME.text,
  },
  benefitsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "white",
    borderRadius: 8,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: THEME.text,
    marginBottom: 8,
  },
  benefitItem: {
    fontSize: 13,
    color: THEME.textLight,
    marginBottom: 4,
  },

  // Enhanced Disclaimer
  disclaimerContainer: {
    backgroundColor: "#F0F9F4",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: THEME.primary,
  },
  disclaimerText: {
    fontSize: 13,
    color: THEME.text,
    textAlign: "center",
    fontStyle: "italic",
  },

  footerPadding: {
    height: 90,
  },
});

export { styles, THEME };
