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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Slightly darker overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16, // Adjusted padding
  },
  modalContainer: {
    backgroundColor: THEME.cardBackground,
    borderRadius: 16,
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    overflow: 'hidden',
    elevation: 8, // Added shadow for Android
    shadowColor: '#000000', // Added shadow for iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  pageContainer: { // New style for page view
    flex: 1,
    alignItems: 'center', 
    paddingVertical: 20, // Add some vertical padding for the page
    paddingHorizontal: 16,
    backgroundColor: THEME.background, 
  },
  pageFormContainer: { // Style for the form card when on a page
    backgroundColor: THEME.cardBackground,
    borderRadius: 16,
    width: '100%',
    maxWidth: 700, // Max width for page view can be larger
    // maxHeight: '95%', // Let height be determined by content or ScrollView within
    overflow: 'hidden',
    elevation: 8, 
    shadowColor: '#000000', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    display: 'flex', 
    flexDirection: 'column',
    flexShrink: 1, // Allow shrinking if page content is constrained
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16, // Adjusted padding
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
    flexShrink: 1, // Allow title to shrink if needed
    marginRight: 8, // Space before close button
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
    paddingHorizontal: 20,
    paddingTop: 16, // Adjusted padding
    paddingBottom: 12, // Adjusted padding
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
    paddingHorizontal: 24, // Increased horizontal padding
    paddingBottom: 24, // Ensure space at the bottom
  },
  stepContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.text,
    marginBottom: 24, // Increased spacing
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.primary,
    marginTop: 24, // Increased spacing
    marginBottom: 16, // Increased spacing
  },
  inputGroup: {
    marginBottom: 24, // Increased spacing
  },
  halfInputGroup: {
    flex: 1,
    // Removed marginRight, will use gap in twoColumnRow if needed or adjust parent
  },
  twoColumnRow: {
    flexDirection: 'row',
    marginBottom: 24, // Increased spacing
    gap: 16, // Added gap for spacing between columns
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 10, // Increased spacing
  },
  textInput: {
    borderWidth: 1, // Slightly thinner border
    borderColor: '#D1D5DB', // Softer border color
    borderRadius: 8,
    paddingHorizontal: 14, // Adjusted padding
    paddingVertical: 12, // Adjusted padding
    fontSize: 16,
    color: THEME.text,
    backgroundColor: '#F9FAFB', // Subtle background for inputs
  },
  inputError: {
    borderColor: THEME.danger,
    borderWidth: 1,
  },
  disabledInput: {
    backgroundColor: THEME.lightGray, // Or another color to indicate non-editable
    color: THEME.textSecondary,
  },
  disabledRadioOption: {
    backgroundColor: '#e0e0e0', // Example disabled background
    borderColor: '#c0c0c0',    // Example disabled border
  },
  disabledRadioText: {
    color: '#a0a0a0',          // Example disabled text color
  },
  infoText: {
    fontSize: 12,
    color: THEME.textSecondary,
    marginTop: 4,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    // marginBottom: 8, // Optional: if more space is needed below error
  },
  // ADDED: Styles for time input row and AM/PM selector
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeTextInput: {
    flex: 1, // Allow text input to take available space
    minWidth: 0, // Add this line to allow more aggressive shrinking
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: THEME.text,
    backgroundColor: '#F9FAFB',
  },
  ampmSelector: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#D1D5DB', // This specific grey is used for timeTextInput and textInput as well
    borderRadius: 8,
    overflow: 'hidden', // To clip children borderRadius
    flexShrink: 0, // Add this line to prevent the selector from shrinking
  },
  ampmOption: {
    paddingVertical: 12,
    paddingHorizontal: 16, // Increased padding for better touch area
    backgroundColor: '#FFFFFF',
  },
  selectedAmpmOption: {
    backgroundColor: THEME.primary,
  },
  ampmOptionText: {
    fontSize: 14, // Matched radioText
    color: THEME.text,
    fontWeight: '500',
  },
  selectedAmpmOptionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  textArea: {
    borderWidth: 1, // Slightly thinner border
    borderColor: '#D1D5DB', // Softer border color
    borderRadius: 8,
    paddingHorizontal: 14, // Adjusted padding
    paddingVertical: 12, // Adjusted padding
    fontSize: 16,
    color: THEME.text,
    backgroundColor: '#F9FAFB', // Subtle background for inputs
    minHeight: 120, // Slightly increased minHeight
    textAlignVertical: 'top', // Ensure text starts from top
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
    justifyContent: 'space-evenly',
    paddingHorizontal: 0, // Adjusted from 10 to 0, or remove if not needed, let scaleNumber handle spacing
  },
  scaleNumber: {
    width: 26, // Reduced from 36
    height: 26, // Reduced from 36
    borderRadius: 13, // Half of new width/height
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
    fontSize: 12, // Reduced from 14 to better fit "10"
    color: THEME.text,
    fontWeight: '600',
  },
  selectedScaleNumberText: {
    color: '#FFFFFF',
  },
  scaleDescription: {
    fontSize: 13, // Slightly larger for readability
    color: THEME.textLight,
    marginBottom: 12, // Increased spacing
    fontStyle: 'italic',
    lineHeight: 18, // Improved line height
  },
  likertGroup: {
    marginBottom: 24, // Increased spacing
    padding: 16, // Adjusted padding
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1, // Add a subtle border to the group
    borderColor: THEME.border,
  },
  likertStatement: {
    fontSize: 14,
    color: THEME.text,
    marginBottom: 12,
    fontWeight: '500',
    lineHeight: 20, // Improved line height
  },
  likertContainer: {
    gap: 10, // Increased gap
  },
  likertOption: {
    paddingVertical: 12, // Adjusted padding
    paddingHorizontal: 10, // Adjusted padding
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
    fontSize: 13, // Increased font size
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
    gap: 16, // Increased gap
    marginTop: 32, // Increased spacing
  },
  backButton: {
    flex: 1,
    paddingVertical: 14, // Adjusted padding
    paddingHorizontal: 20, // Adjusted padding
    borderRadius: 8,
    borderWidth: 1, // Thinner border
    borderColor: THEME.textLight, // Softer border for back button
    backgroundColor: '#FFFFFF',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.textLight, // Softer text color
    textAlign: 'center',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 14, // Adjusted padding
    paddingHorizontal: 20, // Adjusted padding
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
    paddingVertical: 14, // Adjusted padding
    paddingHorizontal: 20, // Adjusted padding
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
    paddingHorizontal: 20, // Added horizontal padding
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

export { styles, THEME };