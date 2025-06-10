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
import { styles } from "../styles/ContactUsStyles";

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

export default ContactUs;