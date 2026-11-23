import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Home, Compass, Plus, MapPin, User, MessageSquare } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export type TabName = 'home' | 'explore' | 'create' | 'maps' | 'me' | 'chat';

interface BottomNavBarProps {
  currentTab: TabName;
  onSelectTab: (tab: TabName) => void;
  unreadChatCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
  unreadChatCount = 2,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
        },
      ]}
    >
      {/* 1. Home Tab */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onSelectTab('home')}
        activeOpacity={0.7}
      >
        <Home
          size={22}
          color={currentTab === 'home' ? colors.primary : colors.textMuted}
          strokeWidth={currentTab === 'home' ? 2.5 : 2}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: currentTab === 'home' ? colors.primary : colors.textMuted },
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>

      {/* 2. Explore Tab */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onSelectTab('explore')}
        activeOpacity={0.7}
      >
        <Compass
          size={22}
          color={currentTab === 'explore' ? colors.primary : colors.textMuted}
          strokeWidth={currentTab === 'explore' ? 2.5 : 2}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: currentTab === 'explore' ? colors.primary : colors.textMuted },
          ]}
        >
          Explore
        </Text>
      </TouchableOpacity>

      {/* 3. Create Button (+) */}
      <TouchableOpacity
        style={styles.createButtonWrapper}
        onPress={() => onSelectTab('create')}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.createButtonGradient}
        >
          <Plus size={24} color="#FFFFFF" strokeWidth={3} />
        </LinearGradient>
      </TouchableOpacity>

      {/* 4. Maps (Nearby Users 300m) */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onSelectTab('maps')}
        activeOpacity={0.7}
      >
        <MapPin
          size={22}
          color={currentTab === 'maps' ? colors.primary : colors.textMuted}
          strokeWidth={currentTab === 'maps' ? 2.5 : 2}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: currentTab === 'maps' ? colors.primary : colors.textMuted },
          ]}
        >
          Maps
        </Text>
      </TouchableOpacity>

      {/* 5. Me / Profile */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onSelectTab('me')}
        activeOpacity={0.7}
      >
        <User
          size={22}
          color={currentTab === 'me' ? colors.primary : colors.textMuted}
          strokeWidth={currentTab === 'me' ? 2.5 : 2}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: currentTab === 'me' ? colors.primary : colors.textMuted },
          ]}
        >
          Me
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingHorizontal: 8,
    zIndex: 100,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },
  createButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  createButtonGradient: {
    width: 44,
    height: 32,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E0287D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
