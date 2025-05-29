import React from 'react';
import { View, StyleSheet } from 'react-native';
import ContactUs from './ContactUs';

const ContactPage = () => {
  // Get user info from URL params or localStorage if available
  const urlParams = new URLSearchParams(window.location.search);
  const userUID = urlParams.get('uid') || localStorage.getItem('userUID');
  const userName = urlParams.get('name') || localStorage.getItem('userName');

  return (
    <View style={styles.container}>
      <ContactUs
        isVisible={true}
        onClose={null}
        userUID={userUID}
        userName={userName}
        isModal={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});

export default ContactPage;