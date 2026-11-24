import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Home, Compass, Plus, MessageCircle } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export type TabName = 'home' | 'explore' | 'create' | 'chat' | 'me';

interface BottomNavBarProps {
  currentTab: TabName;
  onSelectTab: (tab: TabName) => void;
  userAvatarUrl?: string;
  unreadCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
  userAvatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
  unreadCount = 2,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.floatingWrapper} pointerEvents="box-none">
      <View style={styles.container}>
        {/* 1. Home Tab */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onSelectTab('home')}
          activeOpacity={0.8}
        >
          <Home
            size={22}
            color={currentTab === 'home' ? colors.primary : '#94A3B8'}
            strokeWidth={currentTab === 'home' ? 2.6 : 2}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: currentTab === 'home' ? colors.primary : '#94A3B8', fontWeight: currentTab === 'home' ? '800' : '600' },
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        {/* 2. Explore Tab (Compass) */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onSelectTab('explore')}
          activeOpacity={0.8}
        >
          <Compass
            size={22}
            color={currentTab === 'explore' ? colors.primary : '#94A3B8'}
            strokeWidth={currentTab === 'explore' ? 2.6 : 2}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: currentTab === 'explore' ? colors.primary : '#94A3B8', fontWeight: currentTab === 'explore' ? '800' : '600' },
            ]}
          >
            Explore
          </Text>
        </TouchableOpacity>

        {/* 3. Center Elevated Create (+) Button */}
        <TouchableOpacity
          style={styles.createButtonWrapper}
          onPress={() => onSelectTab('create')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.createGradientPill}
          >
            <Plus size={24} color="#FFFFFF" strokeWidth={3} />
          </LinearGradient>
        </TouchableOpacity>

        {/* 4. Chats Tab (Message Bubble) */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onSelectTab('chat')}
          activeOpacity={0.8}
        >
          <View style={styles.iconBadgeWrapper}>
            <MessageCircle
              size={22}
              color={currentTab === 'chat' ? colors.primary : '#94A3B8'}
              strokeWidth={currentTab === 'chat' ? 2.6 : 2}
            />
            {unreadCount > 0 && <View style={styles.unreadDot} />}
          </View>
          <Text
            style={[
              styles.tabLabel,
              { color: currentTab === 'chat' ? colors.primary : '#94A3B8', fontWeight: currentTab === 'chat' ? '800' : '600' },
            ]}
          >
            Chats
          </Text>
        </TouchableOpacity>

        {/* 5. Me Tab (Avatar) */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onSelectTab('me')}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.avatarRing,
              currentTab === 'me'
                ? { borderColor: colors.primary, borderWidth: 2 }
                : { borderColor: '#64748B', borderWidth: 1 },
            ]}
          >
            <Image source={{ uri: userAvatarUrl }} style={styles.avatarImage} />
          </View>
          <Text
            style={[
              styles.tabLabel,
              { color: currentTab === 'me' ? colors.primary : '#94A3B8', fontWeight: currentTab === 'me' ? '800' : '600' },
            ]}
          >
            Me
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '92%',
    maxWidth: 380,
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(11, 8, 20, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    letterSpacing: -0.1,
  },
  createButtonWrapper: {
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createGradientPill: {
    width: 48,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E0287D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  iconBadgeWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#0B0814',
  },
  avatarRing: {
    width: 23,
    height: 23,
    borderRadius: 11.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
});
