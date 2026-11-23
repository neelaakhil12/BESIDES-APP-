import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Animated, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';

interface SplashScreenProps {
  onGetStarted: () => void;
  onLogin: () => void;
  autoTransition?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onGetStarted,
  onLogin,
}) => {
  const { colors } = useTheme();

  // Animation values
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // Pop-up animation for the bottom buttons ("Get Started" & "Log In")
  const bottomSlideY = useRef(new Animated.Value(140)).current;
  const bottomOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. First: Logo smoothly fades in and scales up into center
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Then after 1.2 seconds: Bottom "Get Started" & "Log In" pops up from the bottom!
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(bottomSlideY, {
          toValue: 0,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(bottomOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Center: The transparent Beside logo ONLY (Pink circle removed) */}
      <View style={styles.centerContainer}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* Bottom Popup Section: Slides up smoothly from bottom */}
      <Animated.View
        style={[
          styles.bottomPopupSection,
          {
            opacity: bottomOpacity,
            transform: [{ translateY: bottomSlideY }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={onGetStarted}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={onLogin}
          activeOpacity={0.7}
        >
          <Text style={[styles.loginLinkText, { color: colors.text }]}>Log In</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    position: 'relative',
    height: '100%',
    width: '100%',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 185,
    height: 185,
  },
  bottomPopupSection: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 16,
  },
  getStartedButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#E0287D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  buttonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loginLink: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  loginLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
