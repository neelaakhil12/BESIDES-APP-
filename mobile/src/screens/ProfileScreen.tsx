import React, { useState, useEffect } from 'react';
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
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { MOCK_USERS, MOCK_VIDEOS } from '../services/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProfileScreenProps {
  userId?: string;
  onOpenSettings: () => void;
  onSelectVideo?: (video: any) => void;
  onNavigateCreate?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userId,
  onOpenSettings,
  onSelectVideo,
  onNavigateCreate,
}) => {
  const { colors } = useTheme();
  const { user: authUser, updateUser } = useAuth();

  // Selected profile user data
  const targetId = userId || authUser?.id || 'akhil';
  const initialUser =
    (MOCK_USERS as any)[targetId] ||
    authUser || {
      fullName: 'Akhil Harish Neela',
      username: 'user_11c2796d',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
    };

  const [profileData, setProfileData] = useState<any>({
    fullName: authUser?.fullName || 'Akhil Harish Neela',
    username: authUser?.username || 'user_11c2796d',
    avatarUrl:
      authUser?.profile?.avatarUrl ||
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
    stats: {
      moments: 0,
      audience: 0,
      interests: 0,
    },
  });

  // Tabs: 'moments' | 'video_comments' | 'liked'
  const [activeTab, setActiveTab] = useState<'moments' | 'video_comments' | 'liked'>('moments');

  // Moments list (starts empty to match screenshot, but can hold items)
  const [moments, setMoments] = useState<any[]>([]);
  const [videoComments, setVideoComments] = useState<any[]>([]);
  const [likedMoments, setLikedMoments] = useState<any[]>([]);

  // Voice Bio Audio playback state
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  // Speak greeting using Web Speech API (Free, zero API key required!)
  const speakGreeting = (name: string) => {
    const greetingText = `Hi, this is ${name}, nice to meet you.`;

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
      setTimeout(() => setIsPlayingVoice(false), 2600);
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
      {/* 1. TOP HEADER (Center Username, Right Settings Button) */}
      <View style={styles.header}>
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
        {/* 2. PROFILE HERO (Avatar + Camera Badge on Left, Name + Voice Bio on Right) */}
        <View style={styles.heroSection}>
          {/* Avatar with Camera Icon Badge */}
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: profileData.avatarUrl }}
              style={styles.avatarImage}
            />
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
          </View>

          {/* Name, Handle, and Voice Bio Pill */}
          <View style={styles.heroMeta}>
            <Text style={styles.fullNameText}>{profileData.fullName}</Text>
            <Text style={styles.handleText}>@{profileData.username}</Text>

            {/* Voice Bio Pill Button */}
            <TouchableOpacity
              style={[
                styles.voiceBioPill,
                isPlayingVoice && { borderColor: colors.primary },
              ]}
              onPress={togglePlayVoiceBio}
              activeOpacity={0.8}
            >
              {isPlayingVoice ? (
                <VolumeX size={15} color={colors.primary} style={{ marginRight: 6 }} />
              ) : (
                <Volume2 size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
              )}
              <Text style={styles.voiceBioText}>
                {isPlayingVoice ? 'Playing bio...' : 'Voice bio • generated voice'}
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

        {/* 4. ACTION BUTTONS ROW (Edit Profile, Share Profile, Settings Gear) */}
        <View style={styles.actionsRow}>
          {/* A. Edit Profile Button (Besides Vibrant Brand Gradient) */}
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

  scrollArea: {
    flex: 1,
  },

  // 2. HERO SECTION
  heroSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  avatarImage: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: '#161129',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#0B0814',
    alignItems: 'center',
    justifyContent: 'center',
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
