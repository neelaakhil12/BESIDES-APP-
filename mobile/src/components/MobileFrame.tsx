import React from 'react';
import {
  View,
  StyleSheet,
  Platform,
  useWindowDimensions,
  StatusBar,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Wifi, Signal } from 'lucide-react-native';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  let insets = { top: 0, bottom: 0, left: 0, right: 0 };
  try {
    insets = useSafeAreaInsets() || insets;
  } catch {
    // Fallback if SafeAreaInsets not available
  }
  const { colors, isDark } = useTheme();

  // Desktop check: if width > 500px and running on web, render within luxury smartphone bezel
  const isWeb = Platform.OS === 'web';
  const isDesktopWeb = isWeb && (windowWidth > 500 || (typeof window !== 'undefined' && window.innerWidth > 500));

  // Android safe-area insets calculation
  const safeTopPadding = Platform.OS === 'android' ? Math.max(insets?.top || 0, StatusBar.currentHeight || 24) : (insets?.top || 0);
  const safeBottomPadding = Math.max(insets?.bottom || 0, Platform.OS === 'android' ? 12 : 0);

  if (isDesktopWeb) {
    const frameWidth = 400;
    const frameHeight = Math.min(840, (windowHeight || 800) - 40);

    return (
      <View style={styles.desktopOuterContainer}>
        {/* Ambient glow behind phone */}
        <View style={styles.ambientAura} />

        <View
          style={[
            styles.phoneBezel,
            {
              width: frameWidth,
              height: frameHeight,
              borderColor: '#261F42',
              backgroundColor: colors.background,
            },
          ]}
        >
          {/* Virtual Status Bar */}
          <View style={[styles.virtualStatusBar, { backgroundColor: colors.background }]}>
            <Text style={[styles.timeText, { color: colors.text }]}>9:41</Text>

            {/* Dynamic Island / Camera punch hole */}
            <View style={styles.dynamicIsland}>
              <View style={styles.cameraDot} />
            </View>

            {/* Status Icons */}
            <View style={styles.statusIcons}>
              <Signal size={13} color={colors.text} style={styles.iconItem} />
              <Wifi size={13} color={colors.text} style={styles.iconItem} />
              <View style={styles.batteryContainer}>
                <View style={[styles.batteryFill, { backgroundColor: colors.text }]} />
              </View>
            </View>
          </View>

          {/* App Screen Content */}
          <View style={styles.screenContentContainer}>
            {children}
          </View>

          {/* Virtual Bottom Gesture Bar */}
          <View style={[styles.virtualBottomBar, { backgroundColor: colors.tabBar }]}>
            <View style={[styles.homeIndicator, { backgroundColor: colors.textSecondary }]} />
          </View>
        </View>
      </View>
    );
  }

  // Native Mobile layout (Android & iOS)
  return (
    <View
      style={[
        styles.nativeContainer,
        {
          backgroundColor: colors.background,
          paddingTop: safeTopPadding,
          paddingBottom: safeBottomPadding,
        },
      ]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  desktopOuterContainer: {
    flex: 1,
    width: '100%',
    height: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    minHeight: Platform.OS === 'web' ? ('100vh' as any) : undefined,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#06040B',
    overflow: 'hidden',
    position: 'relative',
  },
  ambientAura: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(224, 40, 125, 0.1)',
  },
  phoneBezel: {
    borderRadius: 44,
    borderWidth: 8,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    shadowColor: '#E0287D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 25,
    elevation: 12,
  },
  virtualStatusBar: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 999,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  dynamicIsland: {
    width: 84,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E1738',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconItem: {
    marginRight: 6,
  },
  batteryContainer: {
    width: 20,
    height: 10,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#888',
    padding: 1,
    justifyContent: 'center',
  },
  batteryFill: {
    width: '75%',
    height: '100%',
    borderRadius: 1.5,
  },
  screenContentContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    height: '100%',
  },
  virtualBottomBar: {
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  homeIndicator: {
    width: 110,
    height: 4,
    borderRadius: 2,
    opacity: 0.6,
  },
  nativeContainer: {
    flex: 1,
    height: '100%',
  },
});
