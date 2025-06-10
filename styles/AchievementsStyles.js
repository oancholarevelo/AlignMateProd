import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  scrollContentContainer: {
    padding: 16,
    paddingBottom: 90,
  },
  headerContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(27, 18, 18, 0.1)",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B1212",
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
  themeSelectorContainer: {
    marginBottom: 20,
  },
  themeSelectorTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  themeSelectorWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  themeScrollView: {
    flex: 1,
    marginHorizontal: 8,
  },
  themeScrollContent: {
    paddingHorizontal: 8,
  },
  leftArrowButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  rightArrowButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  arrowDisabled: {
    backgroundColor: "rgba(240, 240, 240, 0.5)",
    borderColor: "#C0C0C0",
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
  arrowIconDisabled: {
    opacity: 0.3,
  },
  themeCard: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 120,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
  },
  themeCardSelected: {
    backgroundColor: "#fff",
    borderWidth: 2,
  },
  themeIcon: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  themeCardTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  themeCardDesc: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
    lineHeight: 12,
  },
  scrollIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 3,
  },
  indicatorDotActive: {
    backgroundColor: "#666",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // themeScrollView: { // This style was duplicated, ensure it's defined once correctly.
  //   flex: 1,
  // },
  statusContainer: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statusHeader: {
    alignItems: "center",
    marginBottom: 10,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statusSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  currentAchievementBanner: {
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    alignItems: "center",
  },
  currentAchievementTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  currentAchievementDesc: {
    fontSize: 14,
    color: "white",
    opacity: 0.9,
  },
  nextAchievementContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 12,
  },
  nextAchievementTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
  },
  progressVisualizationContainer: {
    marginVertical: 12,
  },
  progressTrack: {
    height: 24,
    backgroundColor: "#E0E0E0",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  progressFill: {
    height: "100%",
    borderRadius: 12,
  },
  progressLabels: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  progressStart: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
  progressEnd: {
    fontSize: 10,
    fontWeight: "600",
    color: "#666",
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
  perfectSessionBanner: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    alignItems: "center",
  },
  perfectSessionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  perfectSessionDesc: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
  animatedAchievementContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 150,
    marginVertical: 20,
    position: "relative",
  },
  achievementIconContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
  },
  largeAchievementIcon: {
    width: 120,
    height: 120,
  },
  particlesContainer: {
    position: "absolute",
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  particle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFD700",
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
  rewardsCard: {
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
  rewardsIcon: {
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
  rewardsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  rewardsValue: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  rewardsDescription: {
    fontSize: 12,
    color: "#666",
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
  milestonesContainer: {
    marginBottom: 24,
  },
  milestonesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  milestonesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  milestone: {
    width: "48%",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 2,
  },
  milestoneUnlocked: {
    backgroundColor: "#E8F5E9",
  },
  milestoneLocked: {
    backgroundColor: "#F5F5F5",
    borderColor: "#E0E0E0",
  },
  milestoneReward: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  milestoneDesc: {
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
    textAlign: "center",
  },
  milestoneRequirementContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  checkIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  milestoneRequirement: {
    fontSize: 10,
    color: "#888",
    textAlign: "center",
  },
  historyContentContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 2,
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  historyIconContainer: {
    marginRight: 12,
  },
  historyItemIcon: {
    width: 24,
    height: 24,
  },
  historyContent: {
    flex: 1,
  },
  historyText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
    color: "#757575",
  },
  historyBadge: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  historyBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  historyPoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#56a64b",
    marginTop: 4,
    marginRight: 12,
  },
  // historyContent: { // This style was duplicated
  //   flex: 1,
  // },
  // historyText: { // This style was duplicated
  //   fontSize: 14,
  //   color: "#333",
  // },
  // historyDate: { // This style was duplicated
  //   fontSize: 12,
  //   color: "#757575",
  // },
  // noHistoryText: { // This style was duplicated
  //   fontSize: 14,
  //   color: "#757575",
  //   fontStyle: "italic",
  //   textAlign: "center",
  //   padding: 16,
  // },
  noHistoryContainer: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E8E8E8",
    borderStyle: "dashed",
  },
  noHistoryIconContainer: {
    marginBottom: 16,
  },
  noHistoryIcon: {
    width: 48,
    height: 48,
  },
  noHistoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#424242",
    marginBottom: 8,
  },
  noHistoryText: {
    fontSize: 14,
    color: "#757575",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  noHistoryTip: {
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  noHistoryTipText: {
    fontSize: 12,
    color: "#1976D2",
    fontWeight: "500",
  },
  researchModeIndicator: {
    backgroundColor: "rgba(33, 150, 243, 0.1)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  researchModeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1976D2",
    marginBottom: 4,
  },
  researchModeSubtext: {
    fontSize: 12,
    color: "#1976D2",
    opacity: 0.8,
  },
  comingSoonContainer: {
    backgroundColor: "rgba(156, 39, 176, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 2,
    borderColor: "#9C27B0",
    borderStyle: "dashed",
  },
  comingSoonTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#7B1FA2",
    marginBottom: 8,
    textAlign: "center",
  },
  comingSoonText: {
    fontSize: 14,
    color: "#7B1FA2",
    textAlign: "center",
    lineHeight: 18,
  },
  // extendedPreviewContainer: { // This style was duplicated
  //   backgroundColor: "rgba(255, 193, 7, 0.1)",
  //   borderRadius: 12,
  //   padding: 16,
  //   marginTop: 16,
  //   borderWidth: 2,
  //   borderColor: "#FFC107",
  // },
  // extendedPreviewTitle: { // This style was duplicated
  //   fontSize: 16,
  //   fontWeight: "bold",
  //   color: "#F57C00",
  //   marginBottom: 8,
  //   textAlign: "center",
  // },
  extendedPreviewText: {
    fontSize: 14,
    color: "#F57C00",
    marginBottom: 12,
    textAlign: "center",
  },
  previewList: {
    paddingLeft: 16,
  },
  previewItem: {
    fontSize: 12,
    color: "#F57C00",
    marginBottom: 4,
    fontWeight: "500",
  },
  extendedPreviewContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    borderWidth: 2,
    borderColor: "#667eea",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },

  extendedPreviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  extendedPreviewTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a202c",
    flex: 1,
  },

  comingSoonBadge: {
    backgroundColor: "#667eea",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  comingSoonBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.5,
  },

  extendedPreviewSubtitle: {
    fontSize: 16,
    color: "#4a5568",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
    lineHeight: 22,
  },

  previewCardsContainer: {
    gap: 12,
  },

  previewCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  previewCardLocked: {
    backgroundColor: "#f8fafc",
    borderColor: "#cbd5e0",
  },

  previewCardEpic: {
    backgroundColor: "#faf5ff",
    borderColor: "#8b5cf6",
    borderWidth: 2,
  },

  previewCardLegendary: {
    backgroundColor: "#fffbeb",
    borderColor: "#f59e0b",
    borderWidth: 2,
  },

  previewCardMythic: {
    backgroundColor: "#fdf2f8",
    borderColor: "#ec4899",
    borderWidth: 3,
  },

  previewCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  previewCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a202c",
    flex: 1,
    marginRight: 8,
  },

  previewCardTime: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4c51bf",
    backgroundColor: "#e0e7ff",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 50,
    textAlign: "center",
  },

  previewCardDesc: {
    fontSize: 14,
    color: "#4a5568",
    marginBottom: 12,
    lineHeight: 18,
  },

  previewCardBadge: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#cbd5e0",
  },

  previewCardBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748b",
  },

  epicBadge: {
    backgroundColor: "#f3e8ff",
    borderColor: "#8b5cf6",
  },

  epicBadgeText: {
    color: "#7c3aed",
    fontWeight: "700",
  },

  legendaryBadge: {
    backgroundColor: "#fef3c7",
    borderColor: "#f59e0b",
  },

  legendaryBadgeText: {
    color: "#d97706",
    fontWeight: "700",
  },

  mythicBadge: {
    backgroundColor: "#fce7f3",
    borderColor: "#ec4899",
  },

  mythicBadgeText: {
    color: "#db2777",
    fontWeight: "700",
  },

  fullReleaseTeaser: {
    backgroundColor: "#f0f4ff",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 2,
    borderColor: "#667eea",
    borderStyle: "dashed",
  },

  fullReleaseTeaserTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4c51bf",
    textAlign: "center",
    marginBottom: 12,
  },

  featuresList: {
    gap: 8,
  },

  featureItem: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    lineHeight: 20,
    paddingLeft: 4,
  },
});