import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Modal,
  TextInput,
  Share,
  Platform,
  Animated,
} from 'react-native';
import {
  Settings,
  Camera,
  Volume2,
  VolumeX,
  Share2,
  Clapperboard,
  CornerDownRight,
  Heart,
  Plus,
  Play,
  X,
  Check,
  ChevronLeft,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { MOCK_USERS, MOCK_VIDEOS, MOCK_DECK_REELS } from '../services/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProfileScreenProps {
  userId?: string;
  onOpenSettings: () => void;
  onBack?: () => void;
  onSelectVideo?: (video: any) => void;
  onNavigateCreate?: () => void;
}

const resolveProfileData = (targetId: string, authUser: any) => {
  if (!targetId || targetId === authUser?.id || targetId === authUser?.username) {
    return {
      fullName: authUser?.fullName || 'Akhil Harish Neela',
      username: authUser?.username || 'user_11c2796d',
      avatarUrl:
        authUser?.profile?.avatarUrl ||
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
      stats: { moments: 0, audience: 0, interests: 0 },
    };
  }

  if (targetId === 'maya.films') {
    return {
      fullName: 'Maya Ortiz',
      username: 'maya.films',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
      stats: { moments: 5, audience: 16, interests: 3 },
    };
  }

  if (targetId === 'dia.de.ana') {
    return {
      fullName: 'Diana Ana',
      username: 'dia.de.ana',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500',
      stats: { moments: 12, audience: '36.5K', interests: 145 },
    };
  }

  const mockU = (MOCK_USERS as any)[targetId];
  if (mockU) {
    return {
      fullName: mockU.fullName,
      username: mockU.username,
      avatarUrl: mockU.profile?.avatarUrl || mockU.avatarUrl,
      stats: {
        moments: mockU.stats?.videos || 8,
        audience: mockU.stats?.audience || '14.2K',
        interests: mockU.stats?.interests || 120,
      },
    };
  }

  const deckItem = MOCK_DECK_REELS.find((r: any) => r.user?.username === targetId);
  if (deckItem) {
    return {
      fullName: deckItem.user.username.replace('.', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      username: deckItem.user.username,
      avatarUrl: deckItem.user.avatarUrl,
      stats: { moments: 10, audience: '22.4K', interests: 98 },
    };
  }

  return {
    fullName: targetId.replace('.', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
    username: targetId,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
    stats: { moments: 5, audience: '10K', interests: 50 },
  };
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userId,
  onOpenSettings,
  onBack,
  onSelectVideo,
  onNavigateCreate,
}) => {
  const { colors } = useTheme();
  const { user: authUser, updateUser } = useAuth();

  const isOtherUser = !!userId && userId !== authUser?.id && userId !== authUser?.username;
  const [isFollowing, setIsFollowing] = useState(false);
  const [profileData, setProfileData] = useState<any>(() => resolveProfileData(userId || '', authUser));

  useEffect(() => {
    setProfileData(resolveProfileData(userId || '', authUser));
  }, [userId, authUser]);

  // Tabs: 'moments' | 'video_comments' | 'liked'
  const [activeTab, setActiveTab] = useState<'moments' | 'video_comments' | 'liked'>('moments');

  // Moments list (starts empty to match screenshot, but can hold items)
  const [moments, setMoments] = useState<any[]>([]);
  const [videoComments, setVideoComments] = useState<any[]>([]);
  const [likedMoments, setLikedMoments] = useState<any[]>([]);

  // Voice Bio Audio playback state
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const avatarScale = useRef(new Animated.Value(1)).current;
  const ringPulse = useRef(new Animated.Value(0)).current;

  // Animate avatar zoom and glow ring during voice bio speaking
  useEffect(() => {
    if (isPlayingVoice) {
      // Smoothly zoom up avatar to 1.25x
      Animated.spring(avatarScale, {
        toValue: 1.25,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // Pulsing green glow ring around avatar
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(ringPulse, {
            toValue: 1,
            duration: 650,
            useNativeDriver: true,
          }),
          Animated.timing(ringPulse, {
            toValue: 0,
            duration: 650,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();

      return () => {
        loop.stop();
      };
    } else {
      // Smoothly return avatar to original scale (1.0)
      Animated.spring(avatarScale, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }).start();
      ringPulse.setValue(0);
    }
  }, [isPlayingVoice]);

  // Speak greeting using Web Speech API (Free, zero API key required!)
  const speakGreeting = (name: string) => {
    // Self profile: "Hi, this is [Name]."
    // Other profile: "Welcome to my profile. Hi, this is [Name]."
    const greetingText = isOtherUser
      ? `Welcome to my profile. Hi, this is ${name}.`
      : `Hi, this is ${name}.`;

    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(greetingText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';
      utterance.onstart = () => setIsPlayingVoice(true);
      utterance.onend = () => setIsPlayingVoice(false);
      utterance.onerror = () => setIsPlayingVoice(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingVoice(true);
      setTimeout(() => setIsPlayingVoice(false), isOtherUser ? 2800 : 1800);
    }
  };

  // Toggle Voice Bio audio preview
  const togglePlayVoiceBio = () => {
    if (isPlayingVoice) {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingVoice(false);
    } else {
      speakGreeting(profileData.fullName || profileData.username);
    }
  };

  // Automatically speak greeting when profile is opened
  useEffect(() => {
    const timer = setTimeout(() => {
      speakGreeting(profileData.fullName || profileData.username);
    }, 450);

    return () => {
      clearTimeout(timer);
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [profileData.fullName, profileData.username]);

  // Edit Profile Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFullName, setEditFullName] = useState(profileData.fullName);
  const [editUsername, setEditUsername] = useState(profileData.username);

  // Share profile
  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Check out @${profileData.username}'s profile on Besides: https://besides.app/@${profileData.username}`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleSaveProfile = () => {
    setProfileData((prev: any) => ({
      ...prev,
      fullName: editFullName,
      username: editUsername,
    }));
    if (updateUser) {
      updateUser({ fullName: editFullName, username: editUsername });
    }
    setShowEditModal(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: '#0B0814' }]}>
      {/* 1. TOP HEADER (Center Username, Right Settings Button, Left Back Button if provided) */}
      <View style={styles.header}>
        {onBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <ChevronLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
        ) : null}

        <View style={styles.headerCenter}>
          <Text style={styles.headerUsername}>{profileData.username}</Text>
        </View>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={onOpenSettings}
          activeOpacity={0.8}
        >
          <Settings size={18} color="#FFFFFF" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* 2. PROFILE HERO (Animated Avatar on Left, Name + Voice Bio on Right) */}
        <View style={styles.heroSection}>
          {/* Avatar with Animated Zoom & Pulsing Green Glow Ring */}
          <View style={styles.avatarWrapper}>
            {isPlayingVoice && (
              <Animated.View
                style={[
                  styles.avatarGlowRing,
                  {
                    transform: [{ scale: avatarScale }],
                    opacity: ringPulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.55, 1],
                    }),
                  },
                ]}
              />
            )}

            <Animated.View
              style={[
                styles.animatedAvatarContainer,
                {
                  transform: [{ scale: avatarScale }],
                  borderColor: isPlayingVoice ? '#22C55E' : 'rgba(255, 255, 255, 0.2)',
                  borderWidth: isPlayingVoice ? 2.5 : 1.5,
                },
              ]}
            >
              <Image
                source={{ uri: profileData.avatarUrl }}
                style={styles.avatarImage}
              />
            </Animated.View>

            {!isOtherUser && !isPlayingVoice && (
              <TouchableOpacity
                style={styles.cameraBadge}
                onPress={() => setShowEditModal(true)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cameraBadgeGradient}
                >
                  <Camera size={13} color="#FFFFFF" strokeWidth={2.5} />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {/* Name, Handle, and Voice Bio Pill */}
          <View style={styles.heroMeta}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.fullNameText}>{profileData.fullName}</Text>
              <View
                style={{
                  backgroundColor: '#22C55E',
                  borderRadius: 9,
                  width: 17,
                  height: 17,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: 6,
                }}
              >
                <Check size={11} color="#000000" strokeWidth={3} />
              </View>
            </View>
            <Text style={styles.handleText}>@{profileData.username}</Text>
            {isOtherUser && (
              <Text style={{ color: '#22C55E', fontSize: 12, fontWeight: '700', marginTop: 2 }}>
                Demo profile
              </Text>
            )}

            {/* Voice Bio Pill Button */}
            <TouchableOpacity
              style={[
                styles.voiceBioPill,
                isPlayingVoice && {
                  borderColor: '#22C55E',
                  backgroundColor: 'rgba(34, 197, 94, 0.12)',
                },
              ]}
              onPress={togglePlayVoiceBio}
              activeOpacity={0.8}
            >
              {isPlayingVoice ? (
                <Volume2 size={15} color="#22C55E" style={{ marginRight: 6 }} />
              ) : (
                <Volume2 size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
              )}
              <Text
                style={[
                  styles.voiceBioText,
                  isPlayingVoice && { color: '#FFFFFF', fontWeight: '700' },
                ]}
              >
                {isPlayingVoice ? 'Speaking...' : 'Voice bio • generated voice'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. STATS CARD (Moments | Audience | Interests) */}
        <View style={styles.statsCard}>
          <View style={styles.statCol}>
            <Text style={styles.statValue}>{profileData.stats.moments}</Text>
            <Text style={styles.statLabel}>Moments</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statCol}>
            <Text style={styles.statValue}>{profileData.stats.audience}</Text>
            <Text style={styles.statLabel}>Audience</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statCol}>
            <Text style={styles.statValue}>{profileData.stats.interests}</Text>
            <Text style={styles.statLabel}>Interests</Text>
          </View>
        </View>

        {/* 4. ACTION BUTTONS ROW (Edit / Follow Profile, Share Profile, Settings Gear) */}
        <View style={styles.actionsRow}>
          {isOtherUser ? (
            /* Follow Button for Other Users */
            <TouchableOpacity
              style={styles.editProfileButtonWrapper}
              onPress={() => setIsFollowing((prev) => !prev)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={
                  isFollowing
                    ? ['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']
                    : [colors.gradientStart, colors.gradientEnd]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.editProfileGradient}
              >
                <Text style={styles.editProfileText}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            /* A. Edit Profile Button for Self */
            <TouchableOpacity
              style={styles.editProfileButtonWrapper}
              onPress={() => setShowEditModal(true)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.editProfileGradient}
              >
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* B. Share Profile Button */}
          <TouchableOpacity
            style={styles.shareProfileButton}
            onPress={handleShareProfile}
            activeOpacity={0.8}
          >
            <Share2 size={15} color="#FFFFFF" strokeWidth={2.2} style={{ marginRight: 6 }} />
            <Text style={styles.shareProfileText}>Share Profile</Text>
          </TouchableOpacity>

          {/* C. Secondary Settings Icon Button */}
          <TouchableOpacity
            style={styles.gearIconButton}
            onPress={onOpenSettings}
            activeOpacity={0.8}
          >
            <Settings size={17} color="#FFFFFF" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {/* 5. TABS BAR (Moments, Video Comments, Liked) */}
        <View style={styles.tabsBar}>
          {/* Tab 1: Moments */}
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('moments')}
            activeOpacity={0.8}
          >
            <View style={styles.tabLabelRow}>
              <Clapperboard
                size={17}
                color={activeTab === 'moments' ? colors.primary : '#94A3B8'}
                strokeWidth={activeTab === 'moments' ? 2.6 : 2}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabLabelText,
                  activeTab === 'moments' && { color: colors.primary, fontWeight: '800' },
                ]}
              >
                Moments
              </Text>
            </View>
            {activeTab === 'moments' && (
              <View style={[styles.activeUnderline, { backgroundColor: colors.primary }]} />
            )}
          </TouchableOpacity>

          {/* Tab 2: Video Comments */}
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('video_comments')}
            activeOpacity={0.8}
          >
            <View style={styles.tabLabelRow}>
              <CornerDownRight
                size={17}
                color={activeTab === 'video_comments' ? colors.primary : '#94A3B8'}
                strokeWidth={activeTab === 'video_comments' ? 2.6 : 2}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabLabelText,
                  activeTab === 'video_comments' && { color: colors.primary, fontWeight: '800' },
                ]}
              >
                Video Comments
              </Text>
            </View>
            {activeTab === 'video_comments' && (
              <View style={[styles.activeUnderline, { backgroundColor: colors.primary }]} />
            )}
          </TouchableOpacity>

          {/* Tab 3: Liked */}
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('liked')}
            activeOpacity={0.8}
          >
            <View style={styles.tabLabelRow}>
              <Heart
                size={17}
                color={activeTab === 'liked' ? colors.primary : '#94A3B8'}
                strokeWidth={activeTab === 'liked' ? 2.6 : 2}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabLabelText,
                  activeTab === 'liked' && { color: colors.primary, fontWeight: '800' },
                ]}
              >
                Liked
              </Text>
            </View>
            {activeTab === 'liked' && (
              <View style={[styles.activeUnderline, { backgroundColor: colors.primary }]} />
            )}
          </TouchableOpacity>
        </View>

        {/* 6. TAB CONTENT (Moments / Video Comments / Liked) */}
        <View style={styles.tabContentArea}>
          {/* TAB 1: MOMENTS EMPTY STATE (Matching Screenshot 1) */}
          {activeTab === 'moments' && moments.length === 0 && (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconBadge}>
                <Clapperboard size={28} color={colors.primary} strokeWidth={2.4} />
              </View>
              <Text style={styles.emptyTitle}>No Moments yet.</Text>
              <Text style={styles.emptySubtitle}>
                Tap + to record your first moment.
              </Text>
            </View>
          )}

          {/* TAB 1: MOMENTS GRID (When moments exist) */}
          {activeTab === 'moments' && moments.length > 0 && (
            <View style={styles.videoGrid}>
              {moments.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.gridCard}
                  onPress={() => onSelectVideo && onSelectVideo(item)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: item.thumbnailUrl }} style={styles.gridThumb} />
                  <View style={styles.gridOverlay}>
                    <Play size={10} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.gridViews}>{item.views || '1.2K'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* TAB 2: VIDEO COMMENTS EMPTY STATE (Matching Screenshot 2) */}
          {activeTab === 'video_comments' && (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconBadge}>
                <CornerDownRight size={28} color={colors.primary} strokeWidth={2.4} />
              </View>
              <Text style={styles.emptyTitle}>No Video Comments yet.</Text>
              <Text style={styles.emptySubtitle}>
                Reply to a moment with a video and it'll live here.
              </Text>
            </View>
          )}

          {/* TAB 3: LIKED EMPTY STATE (Matching Screenshot 3) */}
          {activeTab === 'liked' && (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconBadge}>
                <Heart size={28} color={colors.primary} strokeWidth={2.4} />
              </View>
              <Text style={styles.emptyTitle}>No liked content yet.</Text>
              <Text style={styles.emptySubtitle}>
                Moments and video comments you like will appear here.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 7. EDIT PROFILE MODAL */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.modalInput}
                value={editFullName}
                onChangeText={setEditFullName}
                placeholder="Your full name"
                placeholderTextColor="#64748B"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.modalInput}
                value={editUsername}
                onChangeText={setEditUsername}
                placeholder="username"
                placeholderTextColor="#64748B"
              />
            </View>

            <TouchableOpacity
              style={styles.saveModalButton}
              onPress={handleSaveProfile}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveModalGradient}
              >
                <Check size={18} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 6 }} />
                <Text style={styles.saveModalText}>Save Changes</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0814',
  },
  // 1. TOP HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    position: 'relative',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerUsername: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  settingsButton: {
    position: 'absolute',
    right: 16,
    top: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  scrollArea: {
    flex: 1,
  },

  // 2. HERO SECTION
  heroSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 22,
    zIndex: 20,
    overflow: 'visible',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: 86,
    height: 86,
    overflow: 'visible',
    zIndex: 20,
  },
  avatarGlowRing: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2.5,
    borderColor: '#22C55E',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 5,
  },
  animatedAvatarContainer: {
    width: 82,
    height: 82,
    borderRadius: 41,
    overflow: 'hidden',
    backgroundColor: '#161129',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: '#0B0814',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 6,
  },
  cameraBadgeGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  fullNameText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  handleText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  voiceBioPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  voiceBioText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },

  // 3. STATS CARD
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginTop: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  // 4. ACTION BUTTONS ROW
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 20,
  },
  editProfileButtonWrapper: {
    flex: 1.4,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#E0287D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
  editProfileGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfileText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  shareProfileButton: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 22,
    paddingVertical: 12,
  },
  shareProfileText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  gearIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 5. TABS BAR
  tabsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabLabelText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  activeUnderline: {
    position: 'absolute',
    bottom: -1,
    left: '20%',
    right: '20%',
    height: 2.5,
    borderRadius: 1.5,
  },

  // 6. TAB CONTENT AREA
  tabContentArea: {
    paddingTop: 48,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIconBadge: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: 'rgba(224, 40, 125, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(224, 40, 125, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 240,
  },

  // Video Grid for Moments
  videoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  gridCard: {
    width: '33.33%',
    height: 140,
    padding: 1,
    position: 'relative',
  },
  gridThumb: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gridViews: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  // 7. MODAL
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#161129',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
  },
  saveModalButton: {
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 8,
  },
  saveModalGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  saveModalText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
