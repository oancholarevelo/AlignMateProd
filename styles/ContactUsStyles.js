import { StyleSheet } from "react-native";

const THEME = {
  primary: '#5CA377',
  cardBackground: '#FFFFFF',
  border: '#E5E7EB',
  text: '#1F2937',
  textLight: '#6B7280',
  background: '#F9FAFB',
};

const styles = StyleSheet.create({
  container: {
    // For standalone page view
    flex: 1,
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: THEME.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Matched ResearchForm
    justifyContent: "center",
    alignItems: "center",
    padding: 16, // Matched ResearchForm
  },
  modalContainer: {
    // Applied to the main card in modal view
    backgroundColor: THEME.cardBackground,
    borderRadius: 16,
    width: "100%",
    maxWidth: 600, // Consistent with ResearchForm
    maxHeight: "90%",
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    display: "flex",
    flexDirection: "column",
  },
  pageFormContainer: {
    // Applied to the main card in standalone page view
    backgroundColor: THEME.cardBackground,
    borderRadius: 16,
    width: "100%",
    maxWidth: 700,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    display: "flex",
    flexDirection: "column",
    flexShrink: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20, // Matched ResearchForm
    paddingVertical: 16, // Matched ResearchForm
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    backgroundColor: THEME.primary,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    tintColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    flexShrink: 1,
    marginRight: 8,
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    width: 24,
    height: 24,
    tintColor: "#FFFFFF", // Ensured white tint for close icon
  },
  content: {
    flex: 1, // Allows ScrollView to take available space
  },
  contentContainer: {
    paddingHorizontal: 24, // Matched ResearchForm
    paddingBottom: 24, // Matched ResearchForm
  },
  stepContainer: {
    // Renamed from formContainer for consistency if multi-step was planned
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20, // Matched ResearchForm
    fontWeight: "bold",
    color: THEME.text,
    marginBottom: 8, // Adjusted from 24 to be less for this context
    textAlign: "center",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.textLight,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24, // Matched ResearchForm
  },
  inputGroup: {
    marginBottom: 24, // Matched ResearchForm
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.text,
    marginBottom: 10, // Matched ResearchForm
  },
  textInput: {
    borderWidth: 1, // Matched ResearchForm
    borderColor: "#D1D5DB", // Matched ResearchForm
    borderRadius: 8,
    paddingHorizontal: 14, // Matched ResearchForm
    paddingVertical: 12, // Matched ResearchForm
    fontSize: 16,
    color: THEME.text,
    backgroundColor: "#F9FAFB", // Matched ResearchForm
  },
  textArea: {
    borderWidth: 1, // Matched ResearchForm
    borderColor: "#D1D5DB", // Matched ResearchForm
    borderRadius: 8,
    paddingHorizontal: 14, // Matched ResearchForm
    paddingVertical: 12, // Matched ResearchForm
    fontSize: 16,
    color: THEME.text,
    backgroundColor: "#F9FAFB", // Matched ResearchForm
    minHeight: 120, // Matched ResearchForm
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: THEME.textLight,
    textAlign: "right",
    marginTop: 6, // Adjusted slightly
  },
  inputHint: {
    fontSize: 12,
    color: THEME.textLight,
    marginTop: 6, // Adjusted slightly
    fontStyle: "italic",
  },
  categoriesContainer: {
    gap: 12, // Consistent with ResearchForm's gap usage
  },
  categoryCard: {
    backgroundColor: THEME.cardBackground, // Use cardBackground for consistency
    borderRadius: 8, // Matched ResearchForm's input/button radius
    padding: 16,
    borderWidth: 1, // Thinner border
    borderColor: "#D1D5DB", // Softer border
  },
  selectedCategoryCard: {
    borderColor: THEME.primary,
    backgroundColor: `${THEME.primary}1A`, // Slightly more subtle selection background
    borderWidth: 2, // Make selected border more prominent
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryIcon: {
    width: 24, // Keep size
    height: 24,
    marginRight: 12,
    // tintColor will be applied directly in component
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.text,
  },
  selectedCategoryTitle: {
    color: THEME.primary, // Keep primary color for selected
  },
  categoryDescription: {
    fontSize: 14,
    color: THEME.textLight,
    lineHeight: 20,
  },
  selectedCategoryDescription: {
    color: THEME.primary, // Keep primary color for selected
    // fontWeight: '500', // Optional: slightly bolder
  },
  submitButton: {
    backgroundColor: THEME.primary,
    borderRadius: 8, // Matched ResearchForm
    paddingVertical: 14, // Matched ResearchForm
    paddingHorizontal: 20, // Matched ResearchForm
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24, // Increased top margin
  },
  disabledButton: {
    opacity: 0.5, // Matched ResearchForm
  },
  submitIcon: {
    width: 20,
    height: 20,
    marginRight: 10, // Adjusted margin
    tintColor: "#FFFFFF",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF", // Matched ResearchForm
  },
  footer: {
    marginTop: 32,
    padding: 20,
    backgroundColor: THEME.background, // Use page background for footer section
    borderRadius: 8, // Consistent border radius
    alignItems: "center",
    borderTopWidth: 1, // Add a subtle separator
    borderTopColor: THEME.border,
  },
  footerText: {
    fontSize: 14,
    color: THEME.textLight,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 20,
  },
  footerEmail: {
    color: THEME.primary,
    fontWeight: "600",
  },
  thankYouContainer: {
    // Matched ResearchForm
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  successIcon: {
    // Matched ResearchForm
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  thankYouTitle: {
    // Matched ResearchForm
    fontSize: 24,
    fontWeight: "bold",
    color: THEME.text,
    textAlign: "center",
    marginBottom: 16,
  },
  thankYouMessage: {
    // Matched ResearchForm
    fontSize: 16,
    color: THEME.text,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 16,
    paddingHorizontal: 20, // Keep this for text wrapping
  },
  thankYouSubMessage: {
    // Matched ResearchForm
    fontSize: 14,
    color: THEME.textLight,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 20, // Keep this for text wrapping
  },
  thankYouButton: {
    // Matched ResearchForm
    backgroundColor: THEME.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 120,
  },
  thankYouButtonText: {
    // Matched ResearchForm
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
});

export { styles, THEME };