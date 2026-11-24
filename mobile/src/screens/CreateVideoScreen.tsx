import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Video as VideoPlayer, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Camera,
  Image as ImageIcon,
  Video as VideoIcon,
  Check,
  RotateCcw,
  Play,
  Square,
  Sparkles,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface CreateVideoScreenProps {
  onClose: () => void;
  onPublishSuccess: () => void;
}

const AVAILABLE_TOPICS = [
  'Movies',
  'Sports',
  'Music',
  'Travel',
  'Food',
  'Comedy',
  'Fashion',
  'Fitness',
  'Gaming',
  'Technology',
  'Art',
  'Nature',
];

export const CreateVideoScreen: React.FC<CreateVideoScreenProps> = ({
  onClose,
  onPublishSuccess,
}) => {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [caption, setCaption] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Travel', 'Nature']);
  const [hasMedia, setHasMedia] = useState(false);
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const timerRef = useRef<any>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  // Start 60-second video recording simulation
  const startRecording = () => {
    setIsRecording(true);
    setRecordSeconds(0);
    progressAnim.setValue(0);

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 60000,
      useNativeDriver: false,
    }).start();

    timerRef.current = setInterval(() => {
      setRecordSeconds((prev) => {
        if (prev >= 60) {
          stopRecording();
          return 60;
        }
        return prev + 1;
      });
    }, 1000);
  };

  // Stop recording and save captured video
  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setHasMedia(true);
    setMediaUri(
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    );
  };

  // Upload Photo / Video from gallery
  const handlePickMedia = () => {
    setHasMedia(true);
    setMediaUri('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800');
  };

  const handleRetake = () => {
    setHasMedia(false);
    setMediaUri(null);
    setRecordSeconds(0);
    progressAnim.setValue(0);
  };

  const handlePostMoment = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        onPublishSuccess();
      }, 500);
    }, 700);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      {/* 1. TOP HEADER (New Moment + '✕' Close Button) */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>New Moment</Text>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <X size={20} color="#FFFFFF" strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 2. MAIN MEDIA PREVIEW BOX (With Camera Icon) */}
        <View style={styles.mediaPreviewBox}>
          {hasMedia && mediaUri ? (
            <View style={StyleSheet.absoluteFillObject}>
              {mediaUri.endsWith('.mp4') ? (
                <VideoPlayer
                  source={{ uri: mediaUri }}
                  style={StyleSheet.absoluteFillObject}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay
                  isLooping
                  isMuted
                  useNativeControls={false}
                />
              ) : (
                <Image
                  source={{ uri: mediaUri }}
                  style={StyleSheet.absoluteFillObject}
                  resizeMode="cover"
                />
              )}

              {/* Retake Media Button */}
              <TouchableOpacity
                style={styles.retakeBtn}
                onPress={handleRetake}
                activeOpacity={0.8}
              >
                <RotateCcw size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.retakeBtnText}>Retake</Text>
              </TouchableOpacity>
            </View>
          ) : isRecording ? (
            /* Live Recording Active State */
            <View style={styles.recordingOverlay}>
              <View style={styles.liveTimerBadge}>
                <View style={styles.recDot} />
                <Text style={styles.liveTimerText}>{formatTimer(recordSeconds)} / 1:00</Text>
              </View>

              <TouchableOpacity
                style={styles.stopRecordCircle}
                onPress={stopRecording}
                activeOpacity={0.8}
              >
                <Square size={20} color="#FFFFFF" fill="#FFFFFF" />
              </TouchableOpacity>

              {/* Progress bar line */}
              <View style={styles.recordProgressTrack}>
                <Animated.View
                  style={[
                    styles.recordProgressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
            </View>
          ) : (
            /* Empty State with Centered Camera Icon */
            <TouchableOpacity
              style={styles.emptyMediaPrompt}
              onPress={handlePickMedia}
              activeOpacity={0.8}
            >
              <View style={styles.cameraIconBox}>
                <Camera size={38} color="#94A3B8" strokeWidth={1.8} />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* 3. ACTION BUTTONS ROW: [Photo / video] & [Record · 60 s] */}
        <View style={styles.actionButtonsRow}>
          {/* Photo / video Button */}
          <TouchableOpacity
            style={styles.photoVideoBtn}
            onPress={handlePickMedia}
            activeOpacity={0.8}
          >
            <ImageIcon size={17} color="#FFFFFF" style={{ marginRight: 7 }} />
            <Text style={styles.actionBtnText}>Photo / video</Text>
          </TouchableOpacity>

          {/* Record · 60 s Button (Beside Brand Gradient) */}
          <TouchableOpacity
            style={styles.record60Btn}
            onPress={isRecording ? stopRecording : startRecording}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.recordGradient}
            >
              <VideoIcon size={17} color="#FFFFFF" strokeWidth={2.4} style={{ marginRight: 7 }} />
              <Text style={styles.recordBtnText}>
                {isRecording ? `Stop (${recordSeconds}s)` : 'Record • 60 s'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* 4. CAPTION SECTION */}
        <View style={styles.captionSection}>
          <Text style={styles.sectionLabel}>Caption</Text>
          <View style={styles.captionInputWrapper}>
            <TextInput
              style={styles.captionInput}
              placeholder="Write a caption for your moment..."
              placeholderTextColor="#64748B"
              value={caption}
              onChangeText={setCaption}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* 5. TOPICS SECTION (Checkboxes with 12 Topics) */}
        <View style={styles.topicsSection}>
          <Text style={styles.sectionLabel}>Topics</Text>
          <View style={styles.topicsGrid}>
            {AVAILABLE_TOPICS.map((topic) => {
              const isChecked = selectedTopics.includes(topic);
              return (
                <TouchableOpacity
                  key={topic}
                  style={styles.topicCheckboxRow}
                  onPress={() => toggleTopic(topic)}
                  activeOpacity={0.75}
                >
                  <View
                    style={[
                      styles.checkboxBox,
                      isChecked && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    {isChecked && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                  <Text style={[styles.topicLabelText, isChecked && { color: '#FFFFFF', fontWeight: '700' }]}>
                    {topic}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 6. POST MOMENT SUBMIT BUTTON (Beside Brand Colors) */}
        <TouchableOpacity
          style={styles.postMomentBtn}
          onPress={handlePostMoment}
          disabled={isSubmitting}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.postMomentGradient}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : isSuccess ? (
              <View style={styles.successRow}>
                <Check size={18} color="#FFFFFF" strokeWidth={3} style={{ marginRight: 6 }} />
                <Text style={styles.postMomentText}>Moment Posted!</Text>
              </View>
            ) : (
              <Text style={styles.postMomentText}>Post Moment</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07050E',
    position: 'relative',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 70,
  },
  mediaPreviewBox: {
    width: '100%',
    height: 250,
    borderRadius: 20,
    backgroundColor: '#120E22',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMediaPrompt: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  retakeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  retakeBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  recordingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  liveTimerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 20,
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  liveTimerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  stopRecordCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  recordProgressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  recordProgressFill: {
    height: '100%',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 10,
  },
  photoVideoBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  record60Btn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden',
  },
  recordGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  recordBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  captionSection: {
    marginTop: 16,
  },
  sectionLabel: {
    color: '#CBD5E1',
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 8,
  },
  captionInputWrapper: {
    backgroundColor: '#120E22',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 80,
  },
  captionInput: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '500',
    lineHeight: 19,
    outlineStyle: 'none',
  } as any,
  topicsSection: {
    marginTop: 18,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  topicCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '30%',
    marginBottom: 4,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  topicLabelText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  postMomentBtn: {
    marginTop: 22,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#E0287D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  postMomentGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postMomentText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
