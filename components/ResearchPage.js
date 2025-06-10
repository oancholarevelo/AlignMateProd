import React from 'react';
import { View, StyleSheet } from 'react-native';
import ResearchForm from './ResearchForm';

// Define THEME locally or import from a central style file if available
const THEME = {
  primary: '#5CA377',
  cardBackground: '#FFFFFF',
  border: '#E5E7EB',
  text: '#1F2937',
  textLight: '#6B7280',
  background: '#F9FAFB',
};

const ResearchPage = () => {

  return (
    <View style={styles.container}>
      <ResearchForm
        isVisible={true}   // The form is always visible on its dedicated page
        onClose={null}     // No modal-specific close handler needed for a page view
        userUID={null}     // Pass null for anonymous user
        userName={null}    // Pass null for anonymous user
        isModal={false}    // Key prop to render as a page element
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background, // Use a consistent background
    // The ResearchForm's own pageContainer style will handle centering and padding of the form card.
  },
});

export default ResearchPage;