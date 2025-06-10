import React from 'react';
import { View, StyleSheet } from 'react-native';
import ContactUs from './ContactUs';

const THEME = {
  primary: '#5CA377',
  cardBackground: '#FFFFFF',
  border: '#E5E7EB',
  text: '#1F2937',
  textLight: '#6B7280',
  background: '#F9FAFB',
};

const ContactPage = () => {

  return (
    <View style={styles.container}>
      <ContactUs
        isVisible={true}SS
        onClose={null}
        userUID={null}
        userName={null}
        isModal={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
});

export default ContactPage;