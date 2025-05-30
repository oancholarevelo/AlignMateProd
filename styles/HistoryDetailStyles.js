import { StyleSheet, Dimensions } from "react-native";

// Get screen dimensions for responsive design
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const THEME = {
  primary: "#5CA377", // Good posture green
  warning: "#FFA500", // Warning orange
  danger: "#F87A53", // Bad posture red
  background: "#FAF9F6", // Off-white background
  text: "#1B1212", // Main text color
  textPrimary: "#1B1212", // Alias for consistency
  textSecondary: "#666666", // Secondary text color
  textLight: "#666666", // Alias for consistency
  border: "rgba(27, 18, 18, 0.1)", // Border color
  shadow: "rgba(0, 0, 0, 0.1)", // Shadow color
  cardBackground: "#FFFFFF", // Card background
};

const styles = StyleSheet.create({
  // Main containers
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  footerPadding: {
    height: 90,
  },

  // Enhanced Header (matching PostureDetail)
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: THEME.cardBackground,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  detailTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: THEME.primary,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginRight: 8,
  },
  detailSubtitle: {
    fontSize: 14,
    color: "white",
    opacity: 0.9,
  },

  // Enhanced Card Styling (matching PostureDetail)
  card: {
    backgroundColor: THEME.cardBackground,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: THEME.text,
    marginBottom: 16,
  },
  cardSubtitle: {
    fontSize: 14,
    color: THEME.textLight,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 16,
  },

  // Daily Summary Card
  historySummaryCard: {
    marginBottom: 16,
  },
  summaryStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  summaryStatItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryStatValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: THEME.textPrimary,
  },
  summaryStatLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
  },
  dataCountText: {
    fontSize: 12,
    color: THEME.textSecondary,
    textAlign: "center",
    marginTop: 12,
    fontStyle: "italic",
  },

  // ML Insights Card (enhanced styling)
  mlInsightsCard: {
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: THEME.primary,
  },
  insightSection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  insightSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: THEME.textPrimary,
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: THEME.textPrimary,
    marginBottom: 4,
    lineHeight: 20,
  },
  insightLabel: {
    fontWeight: "600",
  },
  insightSubtext: {
    fontSize: 12,
    color: THEME.textSecondary,
    fontStyle: "italic",
    marginTop: 4,
    lineHeight: 18,
  },

  // Stability visualization
  stabilityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  stabilityBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: "#E5E5E5",
    borderRadius: 6,
    marginRight: 12,
    overflow: "hidden",
  },
  stabilityBar: {
    height: "100%",
    borderRadius: 6,
  },
  stabilityScore: {
    fontSize: 16,
    fontWeight: "bold",
    color: THEME.textPrimary,
    minWidth: 45,
  },

  // Feature usage visualization
  featureUsageItem: {
    marginBottom: 12,
  },
  featureUsageLabel: {
    fontSize: 13,
    color: THEME.textPrimary,
    marginBottom: 6,
    fontWeight: "500",
  },
  featureUsageBarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureUsageBar: {
    height: 8,
    backgroundColor: THEME.primary,
    borderRadius: 4,
    marginRight: 12,
    flex: 1,
  },
  featureUsageText: {
    fontSize: 12,
    color: THEME.textSecondary,
    minWidth: 35,
    fontWeight: "500",
  },

  // Trend Analysis Card
  trendAnalysisCard: {
    marginBottom: 16,
    backgroundColor: "#F0F9F4",
    borderLeftWidth: 4,
    borderLeftColor: THEME.primary,
  },
  trendSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  trendValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: THEME.primary,
  },
  trendLabel: {
    fontSize: 16,
    color: THEME.textPrimary,
    marginTop: 4,
    fontWeight: "600",
  },
  trendComparison: {
    fontSize: 13,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  trendWeekly: {
    fontSize: 14,
    color: THEME.textPrimary,
    textAlign: "center",
    fontWeight: "500",
  },
  recommendationSection: {
    backgroundColor: "#E8F5E8",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: THEME.primary,
  },
  recommendationTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: THEME.textPrimary,
    marginBottom: 6,
  },
  recommendationText: {
    fontSize: 14,
    color: THEME.textPrimary,
    lineHeight: 20,
  },

  // Hourly Breakdown Card
  hourlyBreakdownCard: {
    marginBottom: 16,
  },
  hourlyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 16,
    paddingHorizontal: 8,
  },
  hourlyItem: {
    alignItems: "center",
    width: "12%",
    marginBottom: 12,
  },
  hourlyTime: {
    fontSize: 10,
    color: THEME.textSecondary,
    marginBottom: 6,
    fontWeight: "500",
  },
  hourlyBarContainer: {
    height: 50,
    width: 18,
    backgroundColor: "#E5E5E5",
    borderRadius: 9,
    justifyContent: "flex-end",
    overflow: "hidden",
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  hourlyBar: {
    width: "100%",
    borderRadius: 9,
  },
  hourlyPercent: {
    fontSize: 9,
    color: THEME.textSecondary,
    marginTop: 6,
    fontWeight: "500",
  },
  hourlyHint: {
    fontSize: 12,
    color: THEME.textSecondary,
    textAlign: "center",
    marginTop: 16,
    fontStyle: "italic",
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
  },

  // Interactive Elements
  historyBarClickOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  historyBarClickArea: {
    flex: 1,
    height: "100%",
  },
  chartHint: {
    fontSize: 14,
    color: THEME.primary,
    textAlign: "center",
    marginBottom: 16,
    fontStyle: "italic",
    fontWeight: "500",
    backgroundColor: "rgba(92, 163, 119, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "center",
    marginHorizontal: 20,
    maxWidth: 300,
  },

  // Error states
  errorText: {
    fontSize: 16,
    color: THEME.danger,
    textAlign: "center",
    padding: 20,
  },

  // Enhanced info boxes (matching PostureDetail pattern)
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

  // Loading states (matching PostureDetail)
  loadingContainer: {
    alignItems: "center",
    padding: 40,
    backgroundColor: THEME.cardBackground,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  loadingText: {
    fontSize: 16,
    color: THEME.text,
    textAlign: "center",
    marginBottom: 16,
  },
});

export { styles, THEME };