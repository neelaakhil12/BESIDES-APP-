import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Home, Search } from 'lucide-react-native';
import Svg, { Path, Rect, Polygon } from 'react-native-svg';

export type TabName = 'home' | 'reels' | 'chat' | 'explore' | 'me';

interface BottomNavBarProps {
  currentTab: TabName;
  onSelectTab: (tab: TabName) => void;
  unreadChatCount?: number;
  userAvatarUrl?: string;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
  unreadChatCount = 2,
  userAvatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
}) => {
  const { isDark } = useTheme();

  const barBg = isDark ? 'rgba(22, 22, 30, 0.95)' : 'rgba(255, 255, 255, 0.96)';
  const activePillBg = isDark ? '#2D2D3D' : '#E5E7EB';
  const iconColor = isDark ? '#FFFFFF' : '#0F172A';
  const inactiveColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <View style={styles.floatingWrapper} pointerEvents="box-none">
      <View
        style={[
          styles.container,
          {
            backgroundColor: barBg,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
          },
        ]}
      >
        {/* 1. Home Tab */}
        <TouchableOpacity
          style={[styles.tabButton, currentTab === 'home' && { backgroundColor: activePillBg }]}
          onPress={() => onSelectTab('home')}
          activeOpacity={0.75}
        >
          <Home
            size={22}
            color={currentTab === 'home' ? iconColor : inactiveColor}
            strokeWidth={currentTab === 'home' ? 2.5 : 2}
          />
        </TouchableOpacity>

        {/* 2. Reels Tab (Instagram Reels Clapboard) */}
        <TouchableOpacity
          style={[styles.tabButton, currentTab === 'reels' && { backgroundColor: activePillBg }]}
          onPress={() => onSelectTab('reels')}
          activeOpacity={0.75}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            {/* Clapboard frame */}
            <Rect
              x="2"
              y="3"
              width="20"
              height="18"
              rx="4"
              stroke={currentTab === 'reels' ? iconColor : inactiveColor}
              strokeWidth="2"
            />
            {/* Diagonal cuts */}
            <Path
              d="M2 8.5H22M6.5 3L4.5 8.5M12.5 3L10.5 8.5M18.5 3L16.5 8.5"
              stroke={currentTab === 'reels' ? iconColor : inactiveColor}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Play triangle */}
            <Polygon
              points="10,12 15,15 10,18"
              fill={currentTab === 'reels' ? iconColor : inactiveColor}
            />
          </Svg>
        </TouchableOpacity>

        {/* 3. Direct Messages Tab (Paper Airplane with red dot) */}
        <TouchableOpacity
          style={[styles.tabButton, currentTab === 'chat' && { backgroundColor: activePillBg }]}
          onPress={() => onSelectTab('chat')}
          activeOpacity={0.75}
        >
          <View style={styles.iconWithBadge}>
            <Svg width={23} height={23} viewBox="0 0 24 24" fill="none">
              <Path
                d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                stroke={currentTab === 'chat' ? iconColor : inactiveColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={currentTab === 'chat' ? iconColor : 'none'}
              />
            </Svg>
            {unreadChatCount > 0 && <View style={styles.redBadgeDot} />}
          </View>
        </TouchableOpacity>

        {/* 4. Explore / Search Tab */}
        <TouchableOpacity
          style={[styles.tabButton, currentTab === 'explore' && { backgroundColor: activePillBg }]}
          onPress={() => onSelectTab('explore')}
          activeOpacity={0.75}
        >
          <Search
            size={22}
            color={currentTab === 'explore' ? iconColor : inactiveColor}
            strokeWidth={currentTab === 'explore' ? 2.5 : 2}
          />
        </TouchableOpacity>

        {/* 5. Profile Tab (User Avatar with ring) */}
        <TouchableOpacity
          style={[styles.tabButton, currentTab === 'me' && { backgroundColor: activePillBg }]}
          onPress={() => onSelectTab('me')}
          activeOpacity={0.75}
        >
          <View
            style={[
              styles.avatarRing,
              currentTab === 'me' && {
                borderColor: iconColor,
                borderWidth: 2,
              },
            ]}
          >
            <Image
              source={{ uri: userAvatarUrl }}
              style={styles.avatarImage}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    maxWidth: 360,
    height: 52,
    borderRadius: 28,
    paddingHorizontal: 8,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 12,
  },
  tabButton: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
  },
  iconWithBadge: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  redBadgeDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  avatarRing: {
    width: 26,
    height: 26,
    borderRadius: 13,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 13,
  },
});
