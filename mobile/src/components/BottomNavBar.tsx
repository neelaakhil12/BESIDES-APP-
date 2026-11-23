import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Home, Search } from 'lucide-react-native';
import Svg, { Path, Rect, Polygon } from 'react-native-svg';

export type TabName = 'home' | 'explore' | 'chat' | 'reels' | 'me' | 'create';

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
  return (
    <View style={styles.floatingWrapper} pointerEvents="box-none">
      <View style={styles.container}>
        {/* 1. Home Tab */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onSelectTab('home')}
          activeOpacity={0.8}
        >
          {currentTab === 'home' ? (
            <LinearGradient
              colors={['#2E1065', '#581C87', '#3B0764']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.activePillGradient}
            >
              <Home size={19} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.activeTabLabel}>Home</Text>
            </LinearGradient>
          ) : (
            <View style={styles.inactiveTabContent}>
              <Home size={19} color="#94A3B8" strokeWidth={2} />
              <Text style={styles.inactiveTabLabel}>Home</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 2. Explore Tab */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onSelectTab('explore')}
          activeOpacity={0.8}
        >
          {currentTab === 'explore' ? (
            <LinearGradient
              colors={['#2E1065', '#581C87', '#3B0764']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.activePillGradient}
            >
              <Search size={19} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.activeTabLabel}>Explore</Text>
            </LinearGradient>
          ) : (
            <View style={styles.inactiveTabContent}>
              <Search size={19} color="#94A3B8" strokeWidth={2} />
              <Text style={styles.inactiveTabLabel}>Explore</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 3. Chat / Friend Tab (Center Position - Replaces + button) */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onSelectTab('chat')}
          activeOpacity={0.8}
        >
          {currentTab === 'chat' ? (
            <LinearGradient
              colors={['#2E1065', '#581C87', '#3B0764']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.activePillGradient}
            >
              <View style={styles.iconWithBadge}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="#FFFFFF"
                  />
                </Svg>
                {unreadCount > 0 && <View style={styles.redBadgeDot} />}
              </View>
              <Text style={styles.activeTabLabel}>Chat</Text>
            </LinearGradient>
          ) : (
            <View style={styles.inactiveTabContent}>
              <View style={styles.iconWithBadge}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                    stroke="#94A3B8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                {unreadCount > 0 && <View style={styles.redBadgeDot} />}
              </View>
              <Text style={styles.inactiveTabLabel}>Chat</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 4. Reels Tab (Right side nundi 2nd place!) */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onSelectTab('reels')}
          activeOpacity={0.8}
        >
          {currentTab === 'reels' ? (
            <LinearGradient
              colors={['#2E1065', '#581C87', '#3B0764']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.activePillGradient}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Rect x="2" y="3" width="20" height="18" rx="4" stroke="#FFFFFF" strokeWidth="2" />
                <Path d="M2 8.5H22M6.5 3L4.5 8.5M12.5 3L10.5 8.5M18.5 3L16.5 8.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
                <Polygon points="10,12 15,15 10,18" fill="#FFFFFF" />
              </Svg>
              <Text style={styles.activeTabLabel}>Reels</Text>
            </LinearGradient>
          ) : (
            <View style={styles.inactiveTabContent}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Rect x="2" y="3" width="20" height="18" rx="4" stroke="#94A3B8" strokeWidth="2" />
                <Path d="M2 8.5H22M6.5 3L4.5 8.5M12.5 3L10.5 8.5M18.5 3L16.5 8.5" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
                <Polygon points="10,12 15,15 10,18" fill="#94A3B8" />
              </Svg>
              <Text style={styles.inactiveTabLabel}>Reels</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 5. Me Tab */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onSelectTab('me')}
          activeOpacity={0.8}
        >
          {currentTab === 'me' ? (
            <LinearGradient
              colors={['#2E1065', '#581C87', '#3B0764']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.activePillGradient}
            >
              <View style={styles.avatarRingActive}>
                <Image source={{ uri: userAvatarUrl }} style={styles.avatarImage} />
              </View>
              <Text style={styles.activeTabLabel}>Me</Text>
            </LinearGradient>
          ) : (
            <View style={styles.inactiveTabContent}>
              <View style={styles.avatarRingInactive}>
                <Image source={{ uri: userAvatarUrl }} style={styles.avatarImage} />
              </View>
              <Text style={styles.inactiveTabLabel}>Me</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '92%',
    maxWidth: 375,
    height: 58,
    borderRadius: 30,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(18, 12, 34, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.35)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
  },
  tabButton: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 1,
  },
  activePillGradient: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '95%',
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.5)',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  inactiveTabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 1.5,
  },
  inactiveTabLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 1.5,
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
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#120C22',
  },
  avatarRingActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#EC4899',
  },
  avatarRingInactive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#94A3B8',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
});
