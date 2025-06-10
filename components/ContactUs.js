import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { ref, push, set } from 'firebase/database';
import { database } from '../firebase';

// Theme constants to match ResearchForm
const THEME = {
  primary: '#5CA377',
  cardBackground: '#FFFFFF',
  border: '#E5E7EB',
  text: '#1F2937',
  textLight: '#6B7280',
  background: '#F9FAFB',
};

// Icons for the contact form
const CONTACT_ICONS = {
  close: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='6' x2='6' y2='18'/%3E%3Cline x1='6' y1='6' x2='18' y2='18'/%3E%3C/svg%3E",
  email: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%235CA377' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0 1.1.9-2 2-2z'/%3E%3Cpolyline points='22,6 12,13 2,6'/%3E%3C/svg%3E",
  bug: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23FF6B6B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M8 2h8v4H8z'/%3E%3Cpath d='M20 9v3a8 8 0 0 1-8 8 8 8 0 0 1-8-8v-3'/%3E%3Cpath d='M16 8h3l2 3-2 3h-3'/%3E%3Cpath d='M8 8H5l-2 3 2 3h3'/%3E%3C/svg%3E",
  feature: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234299E1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 12l2 2 4-4'/%3E%3Cpath d='M21 12c0 1.66-4 3-9 3s-9-1.34-9-3 4-3 9-3 9 1.34 9 3'/%3E%3Cpath d='M21 5c0 1.66-4 3-9 3S3 6.66 3 5s4-3 9-3 9 1.34 9 3'/%3E%3Cpath d='M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5'/%3E%3C/svg%3E",
  support: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23F6AD55' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpath d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3'/%3E%3Cpath d='M12 17h.01'/%3E%3C/svg%3E",
  send: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 2L11 13'/%3E%3Cpath d='M22 2l-7 20-4-9-9-4z'/%3E%3C/svg%3E",
  success: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%235CA377' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 11.08V12a10 10 0 1 1-5.93-9.14'/%3E%3Cpolyline points='22 4 12 14.01 9 11.01'/%3E%3C/svg%3E",
  contact: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%235CA377' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'/%3E%3C/svg%3E",
};

const ContactUs = ({ 
  isVisible = true, 
  onClose = null, 
  userUID = null, 
  userName = null,
  isModal = false 
}) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const categories = [
    {
      id: 'bug',
      title: 'Bug Report',
      description: 'Report issues or problems with the app',
      icon: CONTACT_ICONS.bug,
      color: '#FF6B6B',
    },
    {
      id: 'feature',
      title: 'Feature Request',
      description: 'Suggest new features or improvements',
      icon: CONTACT_ICONS.feature,
      color: '#4299E1',
    },
    {
      id: 'support',
      title: 'General Support',
      description: 'Need help using AlignMate?',
      icon: CONTACT_ICONS.support,
      color: '#F6AD55',
    },
    {
      id: 'other',
      title: 'Other',
      description: 'Something else? We\'d love to hear from you',
      icon: CONTACT_ICONS.email,
      color: '#5CA377',
    },
  ];

  // Reset form
  const resetForm = useCallback(() => {
    setSelectedCategory('');
    setSubject('');
    setMessage('');
    setUserEmail('');
    setShowSuccess(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    // Validation
    if (!selectedCategory) {
      Alert.alert('Missing Information', 'Please select a category for your message.');
      return;
    }

    if (!subject.trim()) {
      Alert.alert('Missing Information', 'Please enter a subject for your message.');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Missing Information', 'Please enter your message.');
      return;
    }

    if (!userEmail.trim()) {
      Alert.alert('Missing Information', 'Please enter your email address so we can respond.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare contact data
      const contactData = {
        timestamp: Date.now(),
        category: selectedCategory,
        subject: subject.trim(),
        message: message.trim(),
        userEmail: userEmail.trim(),
        userUID: userUID || 'anonymous',
        userName: userName || 'Anonymous User',
        status: 'new',
        priority: selectedCategory === 'bug' ? 'high' : 'normal',
        userAgent: navigator.userAgent || 'Unknown',
        url: window.location.href,
        dateCreated: new Date().toISOString(),
      };

      // Save to Firebase
      const contactRef = ref(database, 'contactRequests');
      const newContactRef = push(contactRef);
      await set(newContactRef, contactData);

      console.log('Contact form submitted successfully:', contactData);

      // Show success state
      setShowSuccess(true);

    } catch (error) {
      console.error('Error submitting contact form:', error);
      Alert.alert(
        'Submission Error',
        'Failed to send your message. Please try again or contact us directly at support@alignmate.com'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedCategory, subject, message, userEmail, userUID, userName]);

  // Handle closing with proper cleanup
  const handleClose = useCallback(() => {
    if (showSuccess) {
      resetForm();
      onClose();
      return;
    }

    resetForm();
    onClose();
  }, [showSuccess, resetForm, onClose]);

  // Category selection component
  const CategorySelection = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>What can we help you with?</Text>
      <View style={styles.categoriesContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryCard,
              selectedCategory === category.id && styles.selectedCategoryCard,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <View style={styles.categoryHeader}>
              <Image 
                source={{ uri: category.icon }} 
                style={[styles.categoryIcon, { tintColor: category.color }]} 
              />
              <Text style={[
                styles.categoryTitle,
                selectedCategory === category.id && styles.selectedCategoryTitle
              ]}>
                {category.title}
              </Text>
            </View>
            <Text style={[
              styles.categoryDescription,
              selectedCategory === category.id && styles.selectedCategoryDescription
            ]}>
              {category.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Form content
  const renderContactForm = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>Contact AlignMate Support</Text>
      <Text style={styles.subtitle}>
        We're here to help! Let us know how we can assist you.
      </Text>

      {/* Category Selection */}
      <CategorySelection />

      {/* Subject */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Subject</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Brief description of your inquiry..."
          value={subject}
          onChangeText={setSubject}
          maxLength={100}
        />
        <Text style={styles.charCount}>{subject.length}/100</Text>
      </View>

      {/* Email */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Your Email Address</Text>
        <TextInput
          style={styles.textInput}
          placeholder="your.email@example.com"
          value={userEmail}
          onChangeText={setUserEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={styles.inputHint}>
          We'll use this to respond to your inquiry
        </Text>
      </View>

      {/* Message */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Message</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Please describe your issue, question, or feedback in detail..."
          value={message}
          onChangeText={setMessage}
          maxLength={1000}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{message.length}/1000</Text>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (!selectedCategory || !subject.trim() || !message.trim() || !userEmail.trim() || isSubmitting) && 
          styles.disabledButton
        ]}
        onPress={handleSubmit}
        disabled={!selectedCategory || !subject.trim() || !message.trim() || !userEmail.trim() || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Image source={{ uri: CONTACT_ICONS.send }} style={styles.submitIcon} />
            <Text style={styles.submitButtonText}>Send Message</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          You can also reach us directly at:{'\n'}
          <Text style={styles.footerEmail}>support.alignmate@gmail.com</Text>
        </Text>
      </View>
    </View>
  );

  // Success screen
  const renderSuccessView = () => (
    <View style={styles.thankYouContainer}>
      <Image 
        source={{ uri: CONTACT_ICONS.success }} 
        style={styles.successIcon} 
      />
      <Text style={styles.thankYouTitle}>Message Sent Successfully! ✅</Text>
      <Text style={styles.thankYouMessage}>
        Thank you for contacting us! We've received your message and will get back to you within 24-48 hours.
      </Text>
      <Text style={styles.thankYouSubMessage}>
        We'll respond to: {userEmail}
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

  const content = showSuccess ? renderSuccessView() : renderContactForm();

  // Render as modal or standalone page
  if (isModal) {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}> {/* This is the white card for modal */}
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Image 
                  source={{ uri: CONTACT_ICONS.contact }} 
                  style={styles.headerIcon} 
                />
                <Text style={styles.headerTitle}>
                  {showSuccess ? "Thank You" : "Contact Support"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
              >
                <Image 
                  source={{ uri: CONTACT_ICONS.close }} 
                  style={styles.closeIcon} 
                />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView 
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
              {content}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }

  // Render as standalone page
  return (
    <View style={styles.container}> {/* This is the outer gray page background from ContactUs itself */}
      <View style={styles.pageFormContainer}> {/* This is the white card for the form content */}
        {/* Header (Green Bar) */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image 
              source={{ uri: CONTACT_ICONS.contact }} 
              style={styles.headerIcon} 
            />
            <Text style={styles.headerTitle}>
              {showSuccess ? "Thank You" : "Contact AlignMate Support"}
            </Text>
          </View>
          {/* Optionally, add a close button or other elements if needed for standalone header */}
        </View>
        
        {/* Scrollable Content Area */}
        <ScrollView 
          style={styles.content} // Ensures ScrollView takes space within the card
          contentContainerStyle={styles.contentContainer} // Padding for content within ScrollView
          showsVerticalScrollIndicator={false}
        >
          {content} {/* This will now render on the white pageFormContainer */}
        </ScrollView>
      </View>
    </View>
  );
};

// Styles matching ResearchForm
const styles = StyleSheet.create({
  container: { // For standalone page view
    flex: 1,
    alignItems: 'center', 
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: THEME.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Matched ResearchForm
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16, // Matched ResearchForm
  },
  modalContainer: { // Applied to the main card in modal view
    backgroundColor: THEME.cardBackground,
    borderRadius: 16,
    width: '100%',
    maxWidth: 600, // Consistent with ResearchForm
    maxHeight: '90%',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    display: 'flex', 
    flexDirection: 'column',
  },
  pageFormContainer: { // Applied to the main card in standalone page view
    backgroundColor: THEME.cardBackground,
    borderRadius: 16,
    width: '100%',
    maxWidth: 700, 
    overflow: 'hidden',
    elevation: 8, 
    shadowColor: '#000000', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    display: 'flex', 
    flexDirection: 'column',
    flexShrink: 1, 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20, // Matched ResearchForm
    paddingVertical: 16, // Matched ResearchForm
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
    flexShrink: 1,
    marginRight: 8,
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF', // Ensured white tint for close icon
  },
  content: {
    flex: 1, // Allows ScrollView to take available space
  },
  contentContainer: {
    paddingHorizontal: 24, // Matched ResearchForm
    paddingBottom: 24, // Matched ResearchForm
  },
  stepContainer: { // Renamed from formContainer for consistency if multi-step was planned
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20, // Matched ResearchForm
    fontWeight: 'bold',
    color: THEME.text,
    marginBottom: 8, // Adjusted from 24 to be less for this context
    textAlign: 'center',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24, // Matched ResearchForm
  },
  inputGroup: {
    marginBottom: 24, // Matched ResearchForm
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 10, // Matched ResearchForm
  },
  textInput: {
    borderWidth: 1, // Matched ResearchForm
    borderColor: '#D1D5DB', // Matched ResearchForm
    borderRadius: 8,
    paddingHorizontal: 14, // Matched ResearchForm
    paddingVertical: 12, // Matched ResearchForm
    fontSize: 16,
    color: THEME.text,
    backgroundColor: '#F9FAFB', // Matched ResearchForm
  },
  textArea: {
    borderWidth: 1, // Matched ResearchForm
    borderColor: '#D1D5DB', // Matched ResearchForm
    borderRadius: 8,
    paddingHorizontal: 14, // Matched ResearchForm
    paddingVertical: 12, // Matched ResearchForm
    fontSize: 16,
    color: THEME.text,
    backgroundColor: '#F9FAFB', // Matched ResearchForm
    minHeight: 120, // Matched ResearchForm
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: THEME.textLight,
    textAlign: 'right',
    marginTop: 6, // Adjusted slightly
  },
  inputHint: {
    fontSize: 12,
    color: THEME.textLight,
    marginTop: 6, // Adjusted slightly
    fontStyle: 'italic',
  },
  categoriesContainer: {
    gap: 12, // Consistent with ResearchForm's gap usage
  },
  categoryCard: {
    backgroundColor: THEME.cardBackground, // Use cardBackground for consistency
    borderRadius: 8, // Matched ResearchForm's input/button radius
    padding: 16,
    borderWidth: 1, // Thinner border
    borderColor: '#D1D5DB', // Softer border
  },
  selectedCategoryCard: {
    borderColor: THEME.primary,
    backgroundColor: `${THEME.primary}1A`, // Slightly more subtle selection background
    borderWidth: 2, // Make selected border more prominent
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '600',
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24, // Increased top margin
  },
  disabledButton: {
    opacity: 0.5, // Matched ResearchForm
  },
  submitIcon: {
    width: 20,
    height: 20,
    marginRight: 10, // Adjusted margin
    tintColor: '#FFFFFF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF', // Matched ResearchForm
  },
  footer: {
    marginTop: 32,
    padding: 20,
    backgroundColor: THEME.background, // Use page background for footer section
    borderRadius: 8, // Consistent border radius
    alignItems: 'center',
    borderTopWidth: 1, // Add a subtle separator
    borderTopColor: THEME.border,
  },
  footerText: {
    fontSize: 14,
    color: THEME.textLight,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  footerEmail: {
    color: THEME.primary,
    fontWeight: '600',
  },
  thankYouContainer: { // Matched ResearchForm
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  successIcon: { // Matched ResearchForm
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  thankYouTitle: { // Matched ResearchForm
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  thankYouMessage: { // Matched ResearchForm
    fontSize: 16,
    color: THEME.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
    paddingHorizontal: 20, // Keep this for text wrapping
  },
  thankYouSubMessage: { // Matched ResearchForm
    fontSize: 14,
    color: THEME.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 20, // Keep this for text wrapping
  },
  thankYouButton: { // Matched ResearchForm
    backgroundColor: THEME.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 120,
  },
  thankYouButtonText: { // Matched ResearchForm
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default ContactUs;