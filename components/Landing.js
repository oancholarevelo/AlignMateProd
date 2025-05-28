import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigate } from 'react-router-dom';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');

const Landing = () => {
  const navigate = useNavigate();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Gradient Background */}
        <View style={styles.gradientBackground} />

        {/* Navigation Bar */}
        <View style={styles.navbar}>
          <View style={styles.navBrand}>
            <Svg width={40} height={40} viewBox="0 0 66 66" style={styles.navLogo}>
              <Path
                d="M61.5,3.8l-1.3-1.5c-1.1-1.3-3.1-1.7-4.6-0.6c-0.4,0.1,1.3-0.8-21,13h-3C9.8,1.1,11.1,1.7,10.5,1.7C9,0.6,7,0.9,5.8,2.2
                  L4.5,3.8c-1.3,1.5-1.1,3.7,0.4,5c18.9,15.7,17.7,14.9,18.1,15v1c-19.6,6.9-9.9,3.5-12.7,4.5c-1.6,0.6-2.6,2.2-2.3,3.9l0.2,1.2
                  c0.4,2.1,2.5,3.4,4.6,2.7l10.4-3.5c0.2,0.9,0.5,1.7,1.1,2.5l-11.6,3.7c-1.7,0.5-2.7,2.3-2.4,4l0.2,1.2c0.4,2.2,2.7,3.4,4.7,2.6
                  l14.3-5.6v3.4l-14.9,5.4c-1.7,0.6-2.6,2.4-2.2,4.1l0.1,0.5c0.5,2.1,2.7,3.2,4.7,2.5l12.3-4.6V64c0,0.5,0.4,1,1,1h5.8
                  c0.5,0,1-0.4,1-1V53.7l11.7,4.4c2,0.7,4.2-0.4,4.7-2.5l0.1-0.5c0.4-1.7-0.5-3.5-2.2-4.1l-14.2-5.2v-3.4l13.7,5.3
                  c2,0.8,4.3-0.5,4.7-2.6l0.2-1.2c0.3-1.7-0.7-3.5-2.4-4l-11.1-3.6c0.5-0.7,0.9-1.5,1.1-2.4l9.7,3.3c2.1,0.7,4.2-0.6,4.6-2.7l0.2-1.2
                  c0.3-1.7-0.7-3.3-2.3-3.9L43.7,25v-1.7L61.1,8.8C62.6,7.5,62.8,5.3,61.5,3.8z M41.7,32.2C41.7,32.2,41.7,32.2,41.7,32.2
                  c-0.1,0.2-0.1,0.4,0,0.6c-0.2,2.4-2.2,4.3-4.7,4.3c-0.3,0-7.6,0-7.3,0c-2.6,0-4.8-2.1-4.8-4.8v-11c0-2.6,2.1-4.8,4.8-4.8H37
                  c2.6,0,4.8,2.1,4.8,4.8V32.2z M26.4,15.5L19,9l9.2,5.8C27.6,14.9,26.9,15.2,26.4,15.5z M38.1,14.7l8.5-5.3l-6.7,5.8
                  C39.3,15,38.7,14.8,38.1,14.7z M6.2,7.3C5.5,6.7,5.4,5.7,6,5l1.3-1.5c0.6-0.7,1.6-0.7,2.2-0.2l15.3,13.4c-1.1,1.2-1.8,2.8-1.8,4.6
                  L6.2,7.3z M12.1,35.3c-0.9,0.3-1.9-0.3-2.1-1.2l-0.2-1.2c-0.1-0.8,0.3-1.5,1-1.8L23,26.8v4.9L12.1,35.3z M14.4,45.8
                  c-0.9,0.4-1.9-0.2-2.1-1.2l-0.2-1.2c-0.1-0.8,0.3-1.6,1.1-1.8l12.5-4c1.1,0.8,2.4,1.3,3.8,1.3v1L14.4,45.8z M16.5,56.2
                  c-0.9,0.3-1.9-0.2-2.1-1.1l-0.1-0.5c-0.2-0.8,0.2-1.6,1-1.8l14.2-5.2v3.8L16.5,56.2z M35.2,63.1h-3.9V39h3.9V63.1z M50.8,52.8
                  c0.8,0.3,1.2,1.1,1,1.8l-0.1,0.5c-0.2,0.9-1.2,1.4-2.1,1.1l-12.4-4.6v-3.8L50.8,52.8z M53.9,43.5l-0.2,1.2c-0.2,1-1.2,1.5-2.1,1.2
                  l-14.4-5.6V39c1.3,0,2.6-0.5,3.6-1.2l12.1,3.9C53.6,42,54.1,42.7,53.9,43.5z M55.1,31.1c0.7,0.3,1.2,1,1,1.8l-0.2,1.2
                  c-0.2,1-1.1,1.5-2.1,1.2l-10.2-3.4V27L55.1,31.1z M59.8,7.3L43.7,20.8c-0.1-1.7-0.9-3.3-2.1-4.4L56.5,3.4c0.7-0.6,1.7-0.5,2.2,0.2
                  L60,5C60.6,5.7,60.5,6.7,59.8,7.3z"
                fill="#5CA377"
              />
            </Svg>
            <Text style={styles.navBrandText}>AlignMate</Text>
          </View>
          
          <View style={styles.navActions}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => navigate('/login')}
            >
              <Text style={styles.navButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✨ Smart Posture Technology</Text>
            </View>
            
            <Text style={styles.heroTitle}>
              Perfect Your Posture with{'\n'}
              <Text style={styles.heroTitleAccent}>AI-Powered Precision</Text>
            </Text>
            
            <Text style={styles.heroDescription}>
              Transform your workspace wellness with real-time posture monitoring, 
              personalized insights, and intelligent corrections powered by advanced ESP32 sensors.
            </Text>

            <View style={styles.heroButtons}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigate('/register')}
              >
                <Text style={styles.primaryButtonText}>Start Free Here</Text>
                <Text style={styles.buttonArrow}>→</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigate('/app')}
              >
                <Text style={styles.secondaryButtonText}>View Demo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.socialProof}>
              <Text style={styles.socialProofText}>
                Trusted by <Text style={styles.socialProofNumber}>2,500+</Text> professionals
              </Text>
              <View style={styles.stars}>
                <Text style={styles.starText}>⭐⭐⭐⭐⭐</Text>
                <Text style={styles.ratingText}>4.9/5 rating</Text>
              </View>
            </View>
          </View>

          {/* Floating Posture Card */}
          <View style={styles.postureCard}>
            <View style={styles.postureHeader}>
              <View style={styles.statusIndicator} />
              <Text style={styles.postureStatus}>Good Posture</Text>
            </View>
            <View style={styles.postureMetrics}>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>92%</Text>
                <Text style={styles.metricLabel}>Today</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>7.2h</Text>
                <Text style={styles.metricLabel}>Active</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>15</Text>
                <Text style={styles.metricLabel}>Breaks</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Why Choose AlignMate</Text>
            <Text style={styles.sectionTitle}>Everything you need for perfect posture</Text>
            <Text style={styles.sectionDescription}>
              Comprehensive posture monitoring with cutting-edge technology and personalized insights.
            </Text>
          </View>
          
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>🤖</Text>
              </View>
              <Text style={styles.featureTitle}>AI-Powered Analysis</Text>
              <Text style={styles.featureDescription}>
                Machine learning algorithms analyze your posture patterns and provide intelligent recommendations.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>⚡</Text>
              </View>
              <Text style={styles.featureTitle}>Real-Time Monitoring</Text>
              <Text style={styles.featureDescription}>
                ESP32-powered sensors deliver instant feedback and alerts for immediate posture correction.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>📊</Text>
              </View>
              <Text style={styles.featureTitle}>Progress Analytics</Text>
              <Text style={styles.featureDescription}>
                Track improvements with detailed analytics, trends, and personalized health insights.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>💡</Text>
              </View>
              <Text style={styles.featureTitle}>Smart Exercises</Text>
              <Text style={styles.featureDescription}>
                Personalized exercise routines and stretches based on your specific posture needs.
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>95%</Text>
              <Text style={styles.statLabel}>Posture Improvement</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>2.5K+</Text>
              <Text style={styles.statLabel}>Active Users</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>87%</Text>
              <Text style={styles.statLabel}>Reduced Back Pain</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>Monitoring</Text>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to transform your posture?</Text>
          <Text style={styles.ctaDescription}>
            Join thousands of users who have improved their health and productivity with AlignMate.
          </Text>

          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigate('/register')}
          >
            <Text style={styles.ctaButtonText}>Get Started Free</Text>
            <Text style={styles.buttonArrow}>→</Text>
          </TouchableOpacity>

          <Text style={styles.ctaNote}>
            No credit card required • 14-day free trial
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 AlignMate. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 800,
    backgroundColor: 'linear-gradient(135deg, #F8FDF9 0%, #F0F9F4 100%)',
  },
  
  // Navigation
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
  },
  navBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navLogo: {
    marginRight: 12,
  },
  navBrandText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B1212',
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#5CA377',
  },
  navButtonText: {
    color: '#5CA377',
    fontWeight: '600',
    fontSize: 16,
  },

  // Hero Section
  heroSection: {
    paddingHorizontal: 24,
    paddingVertical: 80,
    alignItems: 'center',
    position: 'relative',
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: 600,
  },
  badge: {
    backgroundColor: 'rgba(92, 163, 119, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  badgeText: {
    color: '#5CA377',
    fontSize: 14,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: width > 768 ? 56 : 42,
    fontWeight: '800',
    color: '#1B1212',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: width > 768 ? 64 : 48,
  },
  heroTitleAccent: {
    color: '#5CA377',
  },
  heroDescription: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 40,
    maxWidth: 500,
  },
  heroButtons: {
    flexDirection: width > 768 ? 'row' : 'column',
    alignItems: 'center',
    gap: 16,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#5CA377',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#5CA377',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
  buttonArrow: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  secondaryButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  socialProof: {
    alignItems: 'center',
  },
  socialProofText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  socialProofNumber: {
    fontWeight: '700',
    color: '#1B1212',
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starText: {
    fontSize: 16,
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },

  // Posture Card
  postureCard: {
    position: 'absolute',
    right: 24,
    top: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  postureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    backgroundColor: '#10B981',
    borderRadius: 4,
    marginRight: 8,
  },
  postureStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B1212',
  },
  postureMetrics: {
    gap: 12,
  },
  metric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B1212',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Features Section
  featuresSection: {
    paddingHorizontal: 24,
    paddingVertical: 80,
    backgroundColor: '#FAFAFA',
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 64,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5CA377',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1B1212',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 44,
  },
  sectionDescription: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 28,
    maxWidth: 500,
  },
  featuresGrid: {
    flexDirection: width > 768 ? 'row' : 'column',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'center',
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    width: width > 768 ? (width - 96) / 2 : width - 48,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  featureIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(92, 163, 119, 0.1)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  featureIcon: {
    fontSize: 32,
  },
  featureTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B1212',
    marginBottom: 12,
  },
  featureDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },

  // Stats Section
  statsSection: {
    paddingHorizontal: 24,
    paddingVertical: 80,
    backgroundColor: '#1B1212',
  },
  statsGrid: {
    flexDirection: width > 768 ? 'row' : 'column',
    gap: 32,
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: width > 768 ? 1 : 0,
  },
  statNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#5CA377',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
  },

  // CTA Section
  ctaSection: {
    paddingHorizontal: 24,
    paddingVertical: 80,
    alignItems: 'center',
    backgroundColor: 'linear-gradient(135deg, #5CA377 0%, #4A9960 100%)',
  },
  ctaTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 44,
  },
  ctaDescription: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 40,
    maxWidth: 500,
  },
  ctaButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5CA377',
    marginRight: 8,
  },
  ctaNote: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },

  // Footer
  footer: {
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default Landing;