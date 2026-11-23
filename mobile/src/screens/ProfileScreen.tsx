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
  ActivityIndicator,
} from 'react-native';
import { CheckCircle2, Settings, Mic, Play, Pause, Square, Film, MessageCircle, Heart } from 'lucide-react-native';
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
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userId,
  onOpenSettings,
  onSelectVideo,
}) => {
  const { colors, isDark } = useTheme();
  const { user: authUser, refreshUser } = useAuth();

  const targetIdentifier = userId || authUser?.id || 'harshitha';
  const initialUser = (MOCK_USERS as any)[targetIdentifier] || authUser || MOCK_USERS.harshitha;

  const [profileData, setProfileData] = useState<any | null>(initialUser);
  const [activeTab, setActiveTab] = useState<'moments' | 'replies' | 'liked'>('moments');
  const [videos, setVideos] = useState<any[]>(MOCK_VIDEOS);

  // Voice Bio Audio playback state
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [voiceSound, setVoiceSound] = useState<Audio.Sound | null>(null);

  // Voice Bio recording modal state
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/users/${targetIdentifier}`);
      if (res.data?.success && res.data.user) {
        setProfileData(res.data.user);
      }
    } catch (err) {
      // offline fallback
      setProfileData((MOCK_USERS as any)[targetIdentifier] || authUser || MOCK_USERS.harshitha);
    }
  };

  const fetchVideos = async () => {
    try {
      const res = await api.get(`/users/${targetIdentifier}/videos`);
      if (res.data?.success && res.data.videos?.length > 0) {
        setVideos(res.data.videos);
      }
    } catch (err) {
      setVideos(MOCK_VIDEOS);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchVideos();

    return () => {
      if (voiceSound) {
        voiceSound.unloadAsync();
      }
    };
  }, [targetIdentifier]);

  // Voice Bio Play / Pause
  const togglePlayVoiceBio = async () => {
    const audioUrl = profileData?.voiceBio?.audioUrl || 'https://actions.google.com/sounds/v1/water/rain_heavy.ogg';

    try {
      if (voiceSound) {
        if (isPlayingVoice) {
          await voiceSound.pauseAsync();
          setIsPlayingVoice(false);
        } else {
          await voiceSound.playAsync();
          setIsPlayingVoice(true);
        }
      } else {
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded && status.didJustFinish) {
              setIsPlayingVoice(false);
            }
          }
        );
        setVoiceSound(sound);
        setIsPlayingVoice(true);
      }
    } catch (err) {
      console.log('Play voice bio error:', err);
    }
  };

  // Mock voice recorder saving (Strictly <= 30s)
  const handleSaveVoiceBio = async () => {
    setIsRecording(false);
    setShowVoiceRecorder(false);
    try {
      await api.post('/users/voice-bio', {
        audioUrl: 'https://actions.google.com/sounds/v1/water/waves_crashing.ogg',
        duration: Math.min(30.0, recordTimer || 7.0),
      });
      fetchProfile();
      refreshUser();
    } catch (err) {
      console.log('Save voice bio error:', err);
    }
  };

  const currentProfile = profileData || authUser;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header bar */}
      <View style={[styles.header, { borderBottomColor: colors.tabBarBorder }]}>
        <View style={styles.usernameRow}>
          <Text style={[styles.headerUsername, { color: colors.text }]}>
            @{currentProfile?.username || 'harshitha'}
          </Text>
          <CheckCircle2 size={16} color={colors.primary} style={{ marginLeft: 6 }} />
        </View>

        <TouchableOpacity onPress={onOpenSettings} style={styles.settingsButton}>
          <Settings size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Avatar & Stats */}
      <View style={styles.profileHero}>
        <View style={styles.avatarBorderGlow}>
          <Image
            source={{
              uri:
                currentProfile?.profile?.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
            }}
            style={styles.avatarImage}
          />
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {currentProfile?.stats?.videos || 124}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Videos
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {currentProfile?.stats?.audience || '18.4K'}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Audience
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {currentProfile?.stats?.interests || 328}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Following
            </Text>
          </View>
        </View>
      </View>

      {/* Name and Bio */}
      <View style={styles.bioContainer}>
        <Text style={[styles.fullName, { color: colors.text }]}>
          {currentProfile?.fullName || 'Harshitha Rao'}
        </Text>
        <Text style={[styles.bioText, { color: colors.textSecondary }]}>
          {currentProfile?.profile?.bio || 'Content Creator | Travel | Lifestyle ✨'}
        </Text>

        {/* Edit Profile Button */}
        <TouchableOpacity style={[styles.editProfileButton, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          <Text style={[styles.editProfileText, { color: colors.text }]}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Voice Bio Player (Compulsory V1 Feature) */}
      <View style={styles.voiceBioSection}>
        <TouchableOpacity
          style={[styles.voiceBioPill, { backgroundColor: colors.surfaceLight, borderColor: colors.primary }]}
          onPress={togglePlayVoiceBio}
          activeOpacity={0.8}
        >
          <View style={[styles.micCircle, { backgroundColor: colors.primary }]}>
            <Mic size={14} color="#FFFFFF" />
          </View>

          <Text style={[styles.voiceBioTitle, { color: colors.text }]}>
            Voice Bio
          </Text>

          {/* Audio Waveform visualization */}
          <View style={styles.waveformContainer}>
            {[0.4, 0.8, 0.5, 0.9, 0.3, 0.7, 1.0, 0.6, 0.4, 0.8].map((amp, idx) => (
              <View
                key={idx}
                style={[
                  styles.waveformBar,
                  {
                    height: 18 * amp,
                    backgroundColor: isPlayingVoice ? colors.primary : colors.textSecondary,
                  },
                ]}
              />
            ))}
          </View>

          {/* Play/Pause Button */}
          <View style={styles.playButton}>
            {isPlayingVoice ? (
              <Pause size={14} color={colors.primary} />
            ) : (
              <Play size={14} color={colors.primary} fill={colors.primary} />
            )}
          </View>

          {/* Duration */}
          <Text style={[styles.voiceDurationText, { color: colors.textSecondary }]}>
            0:0{Math.round(currentProfile?.voiceBio?.duration || 7)}
          </Text>
        </TouchableOpacity>

        {/* Record / Replace Voice Bio Button */}
        <TouchableOpacity
          style={styles.recordNewVoiceButton}
          onPress={() => setShowVoiceRecorder(true)}
        >
          <Text style={[styles.recordNewVoiceText, { color: colors.primary }]}>
            + Record Voice Bio (≤30s)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Profile Content Tabs: Moments (Videos), Replies, Liked */}
      <View style={[styles.tabBar, { borderBottomColor: colors.tabBarBorder }]}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'moments' && styles.activeTab]}
          onPress={() => setActiveTab('moments')}
        >
          <Film size={18} color={activeTab === 'moments' ? colors.primary : colors.textMuted} />
          <Text style={[styles.tabTitle, { color: activeTab === 'moments' ? colors.primary : colors.textMuted }]}>
            Moments
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'replies' && styles.activeTab]}
          onPress={() => setActiveTab('replies')}
        >
          <MessageCircle size={18} color={activeTab === 'replies' ? colors.primary : colors.textMuted} />
          <Text style={[styles.tabTitle, { color: activeTab === 'replies' ? colors.primary : colors.textMuted }]}>
            Replies
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'liked' && styles.activeTab]}
          onPress={() => setActiveTab('liked')}
        >
          <Heart size={18} color={activeTab === 'liked' ? colors.primary : colors.textMuted} />
          <Text style={[styles.tabTitle, { color: activeTab === 'liked' ? colors.primary : colors.textMuted }]}>
            Liked
          </Text>
        </TouchableOpacity>
      </View>

      {/* Moments Video Grid */}
      <View style={styles.gridContainer}>
        {videos.map((vid) => (
          <TouchableOpacity
            key={vid.id}
            style={styles.gridItem}
            onPress={() => onSelectVideo && onSelectVideo(vid)}
            activeOpacity={0.8}
          >
            <Image
              source={{
                uri:
                  vid.thumbnailUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
              }}
              style={styles.gridThumbnail}
            />
            <View style={styles.gridOverlay}>
              <Heart size={12} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.gridLikeCount}>{vid.likeCount || 124}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Voice Recorder Modal */}
      <Modal visible={showVoiceRecorder} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.recorderCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.recorderTitle, { color: colors.text }]}>
              Record Voice Bio
            </Text>
            <Text style={[styles.recorderSubtitle, { color: colors.textSecondary }]}>
              Maximum duration: 30 seconds
            </Text>

            <View style={styles.recorderTimerContainer}>
              <Text style={[styles.timerText, { color: colors.primary }]}>
                0:{recordTimer < 10 ? `0${recordTimer}` : recordTimer} / 0:30
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.micBigButton, { backgroundColor: isRecording ? colors.danger : colors.primary }]}
              onPress={() => {
                if (!isRecording) {
                  setIsRecording(true);
                  setRecordTimer(7); // Simulate 7s recording
                } else {
                  handleSaveVoiceBio();
                }
              }}
            >
              {isRecording ? (
                <Square size={28} color="#FFFFFF" fill="#FFFFFF" />
              ) : (
                <Mic size={32} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            <View style={styles.recorderActionsRow}>
              <TouchableOpacity
                onPress={() => setShowVoiceRecorder(false)}
                style={styles.cancelButton}
              >
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveVoiceBio}
                style={[styles.saveVoiceButton, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.saveVoiceText}>Save Bio</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerUsername: {
    fontSize: 18,
    fontWeight: '800',
  },
  settingsButton: {
    padding: 6,
  },
  profileHero: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  avatarBorderGlow: {
    width: 82,
    height: 82,
    borderRadius: 41,
    padding: 3,
    backgroundColor: '#E0287D',
    shadowColor: '#E0287D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  bioContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  fullName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  bioText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  editProfileButton: {
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfileText: {
    fontSize: 13,
    fontWeight: '600',
  },
  voiceBioSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  voiceBioPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  micCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  voiceBioTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 10,
  },
  waveformContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 20,
    marginRight: 10,
  },
  waveformBar: {
    width: 3,
    borderRadius: 1.5,
  },
  playButton: {
    marginRight: 8,
  },
  voiceDurationText: {
    fontSize: 11,
    fontWeight: '600',
  },
  recordNewVoiceButton: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  recordNewVoiceText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#E0287D',
  },
  tabTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '33.33%',
    height: 130,
    padding: 1,
    position: 'relative',
  },
  gridThumbnail: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridLikeCount: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  recorderCard: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  recorderTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  recorderSubtitle: {
    fontSize: 12,
    marginBottom: 16,
  },
  recorderTimerContainer: {
    marginBottom: 20,
  },
  timerText: {
    fontSize: 22,
    fontWeight: '800',
  },
  micBigButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  recorderActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  saveVoiceButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  saveVoiceText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
