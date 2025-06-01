import { StyleSheet, Dimensions } from "react-native";

// Get screen dimensions for responsive design
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// App theme colors
const THEME = {
  primary: "#5CA377", // Good posture green
  warning: "#FFA500", // Warning orange
  danger: "#F87A53", // Bad posture red
  background: "#FAF9F6", // Off-white background
  cardBackground: "#FFFFFF", // Card background
  text: "#1B1212", // Main text color
  textLight: "#666666", // Secondary text color
  border: "rgba(27, 18, 18, 0.1)", // Border color
  shadow: "rgba(0, 0, 0, 0.1)", // Shadow color
};

const styles = StyleSheet.create({
  // Main containers
  mainContainer: {
    flex: 1,
    backgroundColor: THEME.background,
    position: "relative",
  },
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 90, // Extra padding for footer
  },
  footerPadding: {
    height: 20, // Ensures content isn't hidden behind footer
  },
  card: {
    backgroundColor: THEME.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: THEME.border,
  },

  // Loading screen styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: THEME.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: THEME.textLight,
    textAlign: "center",
  },

  // First-time modal styles
  firstTimeModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  firstTimeModalContent: {
    backgroundColor: THEME.cardBackground,
    borderRadius: 20,
    width: "95%",
    maxWidth: 450,
    maxHeight: "90%",
    shadowColor: THEME.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  firstTimeScrollContent: {
    padding: 24,
  },
  firstTimeHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  firstTimeTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: THEME.text,
    textAlign: "center",
    marginBottom: 8,
  },
  firstTimeSubtitle: {
    fontSize: 16,
    color: THEME.textLight,
    textAlign: "center",
    lineHeight: 22,
  },
  setupOptionsContainer: {
    marginBottom: 20,
  },
  setupOption: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#E9ECEF",
  },
  recommendedOption: {
    borderColor: THEME.primary,
    backgroundColor: "#F0F9F4",
    position: "relative",
  },
  recommendedBadge: {
    position: "absolute",
    top: -1,
    right: -1,
    backgroundColor: THEME.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 14,
  },
  recommendedText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  setupOptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  setupOptionIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  setupOptionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: THEME.text,
    flex: 1,
  },
  setupOptionDescription: {
    fontSize: 15,
    color: THEME.text,
    lineHeight: 21,
    marginBottom: 16,
  },
  setupOptionPros: {
    marginBottom: 12,
  },
  setupOptionCons: {
    marginBottom: 12,
  },
  prosConsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.text,
    marginBottom: 6,
  },
  prosConsText: {
    fontSize: 13,
    color: THEME.textLight,
    lineHeight: 18,
    marginBottom: 2,
  },
  setupOptionFooter: {
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
    paddingTop: 12,
    marginTop: 4,
  },
  setupOptionFooterText: {
    fontSize: 12,
    color: THEME.textLight,
    fontStyle: "italic",
    textAlign: "center",
  },
  firstTimeFooter: {
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  firstTimeFooterText: {
    fontSize: 14,
    color: THEME.textLight,
    textAlign: "center",
    lineHeight: 20,
  },

  // Typography
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
    color: THEME.text,
  },
  sectionHeader: {
    fontSize: 19,
    fontWeight: "700",
    marginVertical: 12,
    color: THEME.text,
    textAlign: "center", // Added center alignment
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
    color: THEME.text,
  },
  chartHint: {
    fontSize: 13,
    color: THEME.textLight,
    textAlign: "center",
    marginBottom: 8,
    fontStyle: "italic",
  },

  // User greeting section
  userGreeting: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: THEME.background,
    borderWidth: 2,
    borderColor: THEME.primary,
  },
  userAvatarContainer: {
    borderRadius: 30,
    overflow: "hidden",
  },
  greetingText: {
    flex: 1,
  },
  greetingName: {
    fontSize: 15,
    color: THEME.textLight,
    marginBottom: 4,
  },
  userNameText: {
    fontSize: 20,
    fontWeight: "700",
    color: THEME.text,
  },

  // Sensor status
  sensorStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  sensorStatusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  sensorStatusText: {
    fontSize: 14,
    color: THEME.textLight,
  },

  // Chart elements
  chartCard: {
    marginBottom: 24,
    padding: 12,
    position: "relative",
  },
  historyChartCard: {
    marginBottom: 24,
    padding: 12,
  },
  historyChartContainer: {
    padding: 16,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    backgroundColor: THEME.cardBackground,
  },

  historyChart: {
    borderRadius: 12,
    backgroundColor: "transparent",
    marginVertical: 12,
  },

  customDateLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 35, // Align with chart bars
    marginTop: 8,
    marginBottom: 12,
  },

  dateLabel: {
    fontSize: 11,
    color: THEME.textLight,
    fontWeight: "500",
    textAlign: "center",
    flex: 1,
    minWidth: 32,
  },

  todayDateLabel: {
    color: THEME.primary,
    fontWeight: "600",
  },

  noDataDateLabel: {
    color: "rgba(102, 102, 102, 0.4)", // Much lighter gray for days without data
    fontWeight: "400",
  },

  // Enhanced Legend Styles
  historyLegendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 16,
    gap: 20,
  },

  historyLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },

  historyLegendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },

  historyLegendText: {
    fontSize: 13,
    color: THEME.text,
    fontWeight: "500",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  barClickOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingHorizontal: 30,
    paddingBottom: 30,
    paddingTop: 30,
    zIndex: 10,
  },

  // Stats containers
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Changed back to space-between for equal distribution
    alignItems: "stretch", // Changed to stretch so both boxes have same height
    marginBottom: 24,
    paddingHorizontal: 16,
    gap: 16, // Add gap between the boxes
  },
  statsBox: {
    flex: 1, // This ensures both boxes take equal width
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    minHeight: 110, // Ensures minimum height consistency
    // Remove maxWidth to allow full flex expansion
    display: "flex",
    flexDirection: "column",
  },
  statsLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 10,
    textTransform: "uppercase",
    textAlign: "center", // Add explicit text alignment
    width: "100%", // Ensure full width for proper centering
  },
  statsPercentage: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center", // Add explicit text alignment
    width: "100%", // Ensure full width for proper centering
  },

  // ML Status section
  mlStatusContainer: {
    marginBottom: 16,
  },
  mlStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  mlStatusLabel: {
    fontSize: 15,
    color: THEME.textLight,
  },
  mlStatusValue: {
    fontSize: 15,
    fontWeight: "500",
    color: THEME.text,
  },
  goodText: {
    color: THEME.primary,
    fontWeight: "700",
  },
  warningText: {
    color: THEME.warning,
    fontWeight: "700",
  },
  badText: {
    color: THEME.danger,
    fontWeight: "700",
  },
  mlToggleButton: {
    marginTop: 8,
  },

  // ML Features section
  mlFeatureContainer: {
    marginBottom: 20,
    padding: 16,
  },
  mlFeatureSubtitle: {
    fontSize: 14,
    color: THEME.textLight,
    textAlign: "center",
    marginBottom: 16,
    fontStyle: "italic",
  },
  mlFeatureLegend: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  featureImportanceContainer: {
    marginTop: 20,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.border,
  },

  featureImportanceTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.text,
    marginBottom: 4,
    textAlign: "center",
  },

  featureImportanceSubtitle: {
    fontSize: 13,
    color: THEME.textLight,
    textAlign: "center",
    marginBottom: 16,
    fontStyle: "italic",
  },

  featureImportanceBars: {
    marginTop: 8,
  },
  featureBar: {
    marginBottom: 12,
  },

  featureBarLabel: {
    fontSize: 14,
    color: THEME.text,
    fontWeight: "600",
    marginBottom: 6,
  },

  featureBarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  featureBarOuter: {
    flex: 1,
    height: 10,
    backgroundColor: "#E5E5E5",
    borderRadius: 5,
    marginRight: 12,
    overflow: "hidden",
  },

  featureBarInner: {
    height: "100%",
    backgroundColor: THEME.primary,
    borderRadius: 5,
  },

  featureBarValue: {
    width: 45,
    fontSize: 13,
    color: THEME.text,
    textAlign: "right",
    fontWeight: "600",
  },

  // Tree metadata
  treeMetadataContainer: {
    marginBottom: 20,
  },
  treeMetadataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  treeMetadataItem: {
    width: "50%",
    marginBottom: 12,
  },
  treeMetadataLabel: {
    fontSize: 14,
    color: THEME.textLight,
    marginBottom: 2,
  },
  treeMetadataValue: {
    fontSize: 16,
    fontWeight: "500",
    color: THEME.text,
  },

  // Logs
  quickLogsContainer: {
    marginBottom: 20,
  },
  quickLogsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  closeIcon: {
    width: 20,
    height: 20,
    tintColor: THEME.textLight,
  },
  quickLogsHint: {
    fontSize: 12,
    color: THEME.textLight,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
  },
  logViewerContainer: {
    marginTop: 10,
    marginBottom: 10,
    width: "100%",
  },

  // Log alerts
  logAlertContainer: {
    backgroundColor: "#FFF8E1",
    borderColor: "#FFECB3",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logAlertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  logAlertTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logAlertIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
    tintColor: "#856404",
  },
  logAlertTitle: {
    fontWeight: "700",
    color: "#856404",
    fontSize: 16,
  },
  logAlertCloseIcon: {
    width: 16,
    height: 16,
    tintColor: "#856404",
  },
  logAlertContent: {
    marginBottom: 8,
  },
  logAlertMessage: {
    color: "#856404",
    fontSize: 14,
    lineHeight: 20,
  },
  logAlertMore: {
    color: "#856404",
    fontStyle: "italic",
    fontSize: 12,
    marginTop: 2,
  },
  logAlertTap: {
    color: "#856404",
    fontSize: 12,
    textAlign: "right",
    fontStyle: "italic",
  },

  // Settings page
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: THEME.primary,
    backgroundColor: "#F0F0F0",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: THEME.text,
    marginBottom: 6,
    textAlign: "center",
  },
  settingsCard: {
    marginBottom: 20,
  },
  settingsCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.text,
    marginBottom: 12,
  },
  settingsDescription: {
    fontSize: 15,
    color: THEME.textLight,
    marginBottom: 16,
    lineHeight: 22,
  },
  calibrationStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  settingsText: {
    fontSize: 15,
    color: THEME.text,
  },
  calibrationButtonContainer: {
    marginTop: 12,
  },
  settingsButton: {
    marginTop: 8,
  },
  logoutContainer: {
    alignItems: "center",
    marginVertical: 24,
  },

  // Buttons
  primaryButton: {
    backgroundColor: THEME.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "rgba(92, 163, 119, 0.1)",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: THEME.primary,
  },
  secondaryButtonText: {
    color: THEME.primary,
    fontWeight: "600",
    fontSize: 16,
  },
  dangerButton: {
    backgroundColor: THEME.danger,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  dangerButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    height: 80,
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 10,
    zIndex: 100,
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  footerButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    flex: 1,
  },
  footerIcon: {
    width: 24,
    height: 24,
    marginBottom: 6,
    tintColor: THEME.textLight,
  },
  footerButtonText: {
    fontSize: 13,
    color: THEME.textLight,
    fontWeight: "500",
  },
  activeFooterButton: {
    borderTopWidth: 3,
    borderTopColor: THEME.primary,
  },
  activeFooterButtonText: {
    color: THEME.primary,
    fontWeight: "600",
  },
  activeFooterIcon: {
    tintColor: THEME.primary,
  },
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: THEME.cardBackground,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: THEME.border,
    alignSelf: "center", // Center the container itself
    width: "100%", // Full width
    textAlign: "center", // Added for web compatibility
  },
  noDataText: {
    fontSize: 17,
    fontWeight: "600",
    color: THEME.text,
    marginBottom: 8,
    textAlign: "center", // Explicit text centering
    width: "100%", // Full width for proper centering
  },
  noDataSubtext: {
    fontSize: 14,
    color: THEME.textLight,
    textAlign: "center", // Already has this, but ensuring it's there
    width: "100%", // Full width for proper centering
    lineHeight: 20, // Added for better readability
  },
  nameDisplayContainer: {
    alignItems: "center",
  },
  nameInput: {
    width: "100%",
    padding: 12,
    fontSize: 16,
    backgroundColor: THEME.cardBackground,
    border: `2px solid ${THEME.border}`,
    borderRadius: 8,
    outline: "none",
    boxSizing: "border-box",
    // ADD THESE FONT PROPERTIES:
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontWeight: "400",
    color: THEME.text,
    transition: "border-color 0.2s ease",
  },

  // Also update these if they exist:
  nameEditContainer: {
    width: "100%",
    marginTop: 8,
  },

  nameEditButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 8,
  },

  nameEditButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: THEME.cardBackground,
  },

  nameEditButtonSave: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },

  nameEditButtonTextCancel: {
    fontSize: 14,
    color: THEME.textLight,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },

  nameEditButtonTextSave: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  editNameButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: "rgba(92, 163, 119, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(92, 163, 119, 0.3)",
  },
  editNameIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
    tintColor: THEME.primary,
  },
  editNameText: {
    color: THEME.primary,
    fontSize: 14,
    fontWeight: "500",
  },

  // Profile picture styles
  headerProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: THEME.primary,
    backgroundColor: "#F0F0F0",
  },
  profileClickArea: {
    position: "relative",
    alignItems: "center",
    marginBottom: 16,
  },
  profileOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileEditIcon: {
    width: 16,
    height: 16,
    tintColor: "#FFFFFF",
  },

  // Modal styles
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  profileModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: "90%",
    maxWidth: 400,
    padding: 0,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: THEME.text,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseIcon: {
    width: 16,
    height: 16,
    tintColor: THEME.textLight,
  },
  modalContent: {
    padding: 20,
    alignItems: "center",
  },
  profilePreviewContainer: {
    position: "relative",
    marginBottom: 24,
  },
  profilePreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: THEME.primary,
    backgroundColor: "#F0F0F0",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  modalActions: {
    width: "100%",
    gap: 12,
  },
  modalButton: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: THEME.primary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
  },
  modalButtonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: THEME.textLight,
  },
  modalButtonDanger: {
    backgroundColor: THEME.danger,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalButtonSecondaryText: {
    color: THEME.textLight,
  },
  modalButtonDangerText: {
    color: "#FFFFFF",
  },
  hiddenInput: {
    display: "none",
  },
  chartDataInfo: {
    marginTop: 2,
    paddingHorizontal: 8,
    alignItems: "center",
  },

  chartDataInfoText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
  enhancedChartCard: {
    backgroundColor: THEME.cardBackground,
    borderRadius: 20,
    padding: 0,
    marginBottom: 24,
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: THEME.border,
    overflow: "hidden",
    alignSelf: "center", // Added center alignment
    width: "100%", // Ensure full width
  },

  chartHeader: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    alignItems: "center",
  },

  chartTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.text,
    marginBottom: 4,
    textAlign: "center",
  },

  chartSubtitle: {
    fontSize: 14,
    color: THEME.textLight,
    fontStyle: "italic",
    textAlign: "center",
  },

  chartLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    gap: 12,
  },

  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
  },

  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },

  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },

  legendLabel: {
    fontSize: 12,
    color: THEME.text,
    fontWeight: "500",
    flex: 1,
  },

  legendText: {
    fontSize: 12,
    color: THEME.textLight,
    fontWeight: "500",
  },

  chartContainer: {
    padding: 20,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: "100%", // Ensure full width
  },

  enhancedChart: {
    borderRadius: 12,
    backgroundColor: "transparent",
    marginVertical: 8,
  },

  chartFooter: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },

  chartStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  chartStatItem: {
    alignItems: "center",
    flex: 1,
  },

  chartStatLabel: {
    fontSize: 12,
    color: THEME.textLight,
    fontWeight: "500",
    marginBottom: 4,
    textAlign: "center",
  },

  chartStatValue: {
    fontSize: 16,
    color: THEME.text,
    fontWeight: "700",
    textAlign: "center",
  },

  // History Chart Specific Styles - UPDATED for consistency
  historyInsights: {
    marginTop: 8,
    alignItems: "center",
  },

  insightsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.text,
    marginBottom: 12,
    textAlign: "center",
  },

  insightsList: {
    gap: 8,
    alignItems: "center",
  },

  insightText: {
    fontSize: 13,
    color: THEME.textLight,
    lineHeight: 18,
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 12,
  },

  // Enhanced Chart Hint - UPDATED for consistency
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
    alignSelf: "center", // Ensure hint is centered
    marginHorizontal: 20,
    maxWidth: 300, // Added max width for better appearance
  },

  // Interactive Elements - UPDATED for consistency
  barClickOverlay: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "stretch",
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
    zIndex: 10,
  },

  barClickArea: {
    flex: 1,
    height: "100%",
    borderRadius: 8,
    backgroundColor: "transparent",
    marginHorizontal: 2,
  },
  feedbackCallout: {
    backgroundColor: "#F8FFF9",
    borderWidth: 1,
    borderColor: THEME.primary,
    borderStyle: "dashed",
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  feedbackIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  feedbackTextContainer: {
    flex: 1,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: THEME.text,
    marginBottom: 4,
  },
  feedbackSubtitle: {
    fontSize: 14,
    color: THEME.textLight,
  },
  feedbackButton: {
    marginTop: 8,
  },
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
  clickableDateLabel: {
    textDecorationLine: "underline",
    textDecorationColor: THEME.primary,
  },
  dateNavigationCard: {
  marginBottom: 16,
  paddingVertical: 12,
},

dateNavigationContainer: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},

dateNavButton: {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 8,
  backgroundColor: THEME.secondary,
  minWidth: 80,
  justifyContent: "center",
},

dateNavButtonEnabled: {
  backgroundColor: THEME.primary,
},

dateNavButtonDisabled: {
  backgroundColor: THEME.lightGray,
  opacity: 0.5,
},

dateNavIcon: {
  width: 16,
  height: 16,
  marginRight: 4,
},

dateNavIconRight: {
  transform: [{ scaleX: -1 }], // Flip horizontally for right arrow
  marginLeft: 4,
  marginRight: 0,
},

dateNavIconDisabled: {
  opacity: 0.5,
},

dateNavText: {
  fontSize: 14,
  fontWeight: "600",
  color: "#FFFFFF",
},

dateNavTextDisabled: {
  color: "#999999",
},

dateDisplayContainer: {
  alignItems: "center",
  flex: 1,
  paddingHorizontal: 16,
},

dateDisplayText: {
  fontSize: 18,
  fontWeight: "bold",
  color: THEME.text, // Changed from THEME.textPrimary to THEME.text
  textAlign: "center",
  flexWrap: "nowrap", // Prevent text wrapping
  numberOfLines: 1, // Force single line
  whiteSpace: "nowrap", // Prevent wrapping on web
},


todayButton: {
  marginTop: 4,
  paddingHorizontal: 8,
  paddingVertical: 4,
  backgroundColor: THEME.primary,
  borderRadius: 4,
},

todayButtonText: {
  fontSize: 12,
  color: "#FFFFFF",
  fontWeight: "600",
},

// Quick navigation styles
quickNavContainer: {
  marginTop: 20,
  paddingTop: 16,
  borderTopWidth: 1,
  borderTopColor: THEME.border,
},

quickNavTitle: {
  fontSize: 14,
  fontWeight: "600",
  color: THEME.textSecondary,
  marginBottom: 12,
  textAlign: "center",
},

quickNavButtons: {
  flexDirection: "row",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: 8,
},

quickNavButton: {
  paddingHorizontal: 12,
  paddingVertical: 8,
  backgroundColor: THEME.primary,
  borderRadius: 6,
  marginHorizontal: 4,
  marginVertical: 2,
},

quickNavButtonText: {
  fontSize: 13,
  fontWeight: "600",
  color: "#FFFFFF",
},
// Add these styles to PostureGraphStyles.js
statsSubtext: {
  fontSize: 12,
  color: THEME.textSecondary,
  marginTop: 4,
  textAlign: 'center',
  fontWeight: '400',
},

dateContextCard: {
  marginTop: 8,
  marginBottom: 8,
},

dateContextHeader: {
  marginBottom: 12,
},

dateContextTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: THEME.text,
  textAlign: 'center',
},

dateContextStats: {
  paddingTop: 8,
},

dateContextNoData: {
  fontSize: 14,
  color: THEME.textSecondary,
  textAlign: 'center',
  fontStyle: 'italic',
},

dateContextDetails: {
  gap: 8,
},

dateContextStat: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 4,
},

dateContextLabel: {
  fontSize: 14,
  color: THEME.text,
  fontWeight: '500',
},

dateContextValue: {
  fontSize: 14,
  color: THEME.primary,
  fontWeight: '600',
},
});

export { styles, THEME };
