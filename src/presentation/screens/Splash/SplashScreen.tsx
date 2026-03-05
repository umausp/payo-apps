// Splash Screen
// Initial loading screen with PAYO logo

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { APP_NAME, UI } from '../../../constants';

const SplashScreen: React.FC = () => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
      <LinearGradient
        colors={['#6366F1', '#8B5CF6', '#A855F7']}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.logo}>{APP_NAME}</Text>
          <Text style={styles.tagline}>QR-Based Digital Payment Platform</Text>
          <ActivityIndicator
            size="large"
            color="#FFFFFF"
            style={styles.loader}
          />
        </View>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: '#E0E7FF',
    marginTop: 8,
  },
  loader: {
    marginTop: 32,
  },
});

export default SplashScreen;
