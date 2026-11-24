import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Image,
  ActivityIndicator,
  Animated,
  ScrollView,
} from 'react-native';
import { Video as VideoPlayer, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Camera,
  Upload,
  Video as VideoIcon,
  Check,
  RotateCcw,
  Play,
  Square,
  Sparkles,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface NewReplyModalProps {
  visible: boolean;
  video: any;
  onClose: () => void;
  onReplyPosted?: (replyData: any) => void;
}

export const NewReplyModal: React.FC<NewReplyModalProps> = ({
  visible,
  video,
  onClose,
  onReplyPosted,
}) => {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [caption, setCaption] = useState('');
  const [hasRecordedMedia, setHasRecordedMedia] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Recording timer ref
  const timerRef = useRef<any>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Cleanup on unmount or close
  useEffect(() => {
    if (!visible) {
      resetState();
    }
  }, [visible]);

  const resetState = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setRecordSeconds(0);
    setHasRecordedMedia(false);
    setRecordedVideoUri(null);
    setCaption('');
    setIsSubmitting(false);
    setIsSuccess(false);
    progressAnim.setValue(0);
  };

  // 15-second recording simulation
  const handleStartRecording = () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    setIsRecording(true);
    setRecordSeconds(0);
    setHasRecordedMedia(false);
    progressAnim.setValue(0);

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 15000,
      useNativeDriver: false,
    }).start();

    timerRef.current = setInterval(() => {
      setRecordSeconds((prev) => {
        if (prev >= 14) {
          stopRecording();
          return 15;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setHasRecordedMedia(true);
    // Sample response video URI
    setRecordedVideoUri(
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    );
  };

  // Upload video simulation
  const handleUploadVideo = () => {
    setHasRecordedMedia(true);
    setRecordedVideoUri(
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    );
  };

  const handleRetake = () => {
    setHasRecordedMedia(false);
    setRecordedVideoUri(null);
    setRecordSeconds(0);
    progressAnim.setValue(0);
  };

  const handlePostReply = () => {
    if (!hasRecordedMedia && !caption.trim()) {
      // Allow posting quick text or video
      setCaption('Great video! Here is my reply ✨');
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      if (onReplyPosted) {
        onReplyPosted({
          id: `reply-${Date.now()}`,
          videoId: video?.id,
          caption,
          videoUrl: recordedVideoUri,
          user: user?.profile || {
            username: 'user_11c2796d',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
          },
        });
      }
      setTimeout(() => {
        onClose();
      }, 700);
    }, 600);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.container}>
          {/* 1. Header (New Reply + Close Button) */}
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>New Reply</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <X size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* 2. Main Camera / Recording Preview Box */}
            <View style={styles.cameraPreviewBox}>
              {hasRecordedMedia && recordedVideoUri ? (
                <View style={StyleSheet.absoluteFillObject}>
                  <VideoPlayer
                    source={{ uri: recordedVideoUri }}
                    style={StyleSheet.absoluteFillObject}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={true}
                    isLooping
                    isMuted={false}
                    useNativeControls={false}
                  />
                  <LinearGradient
                    colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.7)']}
                    style={StyleSheet.absoluteFillObject}
                    pointerEvents="none"
                  />
                  {/* Badge: 15s Video Reply */}
                  <View style={styles.recordedBadge}>
                    <VideoIcon size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.recordedBadgeText}>15s Video Ready</Text>
                  </View>
                  {/* Retake Button */}
                  <TouchableOpacity
                    style={styles.retakeButton}
                    onPress={handleRetake}
                    activeOpacity={0.8}
                  >
                    <RotateCcw size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.retakeText}>Retake</Text>
                  </TouchableOpacity>
                </View>
              ) : isRecording ? (
                <View style={[StyleSheet.absoluteFillObject, styles.recordingActiveContainer]}>
                  {/* Red pulsing record indicator */}
                  <View style={styles.recordingHeader}>
                    <View style={styles.redDot} />
                    <Text style={styles.recordingTimerText}>
                      0:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds} / 0:15
                    </Text>
                  </View>

                  <Text style={styles.recordingPromptText}>
                    Recording your video reply...
                  </Text>

                  {/* Stop button */}
                  <TouchableOpacity
                    style={styles.stopRecordingBtn}
                    onPress={stopRecording}
                    activeOpacity={0.85}
                  >
                    <Square size={22} color="#FFFFFF" fill="#FFFFFF" />
                  </TouchableOpacity>

                  {/* Bottom progress bar */}
                  <View style={styles.progressBarBg}>
                    <Animated.View
                      style={[
                        styles.progressBarFill,
                        {
                          width: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                          }),
                        },
                      ]}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.placeholderContainer}>
                  <View style={styles.cameraIconCircle}>
                    <Camera size={44} color="rgba(255, 255, 255, 0.45)" strokeWidth={1.8} />
                  </View>
                  <Text style={styles.placeholderSubtext}>
                    Record a 15-second video reply or upload from gallery
                  </Text>
                </View>
              )}
            </View>

            {/* 3. Action Buttons Row (Upload video & Record • 15 s) */}
            <View style={styles.actionButtonsRow}>
              {/* Left: Upload video */}
              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={handleUploadVideo}
                activeOpacity={0.8}
              >
                <Upload size={16} color="#FFFFFF" style={{ marginRight: 7 }} />
                <Text style={styles.uploadBtnText}>Upload video</Text>
              </TouchableOpacity>

              {/* Right: Record • 15 s (Using Besides Brand Gradient / Pink!) */}
              <TouchableOpacity
                style={styles.recordBtnWrapper}
                onPress={handleStartRecording}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[colors.gradientStart || '#E0287D', colors.gradientEnd || '#8A2BE2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.recordBtnGradient}
                >
                  {isRecording ? (
                    <>
                      <Square size={15} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.recordBtnText}>Stop • {15 - recordSeconds}s</Text>
                    </>
                  ) : (
                    <>
                      <VideoIcon size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.recordBtnText}>Record • 15 s</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* 4. Caption Section */}
            <View style={styles.captionSection}>
              <Text style={styles.captionLabel}>Caption</Text>
              <TextInput
                style={styles.captionInput}
                multiline
                numberOfLines={4}
                placeholder="Write a caption for your video reply..."
                placeholderTextColor="#64748B"
                value={caption}
                onChangeText={setCaption}
              />
            </View>

            {/* 5. Post Reply Button */}
            <TouchableOpacity
              style={styles.postReplyBtn}
              onPress={handlePostReply}
              disabled={isSubmitting || isSuccess}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={
                  isSuccess
                    ? ['#10B981', '#059669']
                    : [colors.gradientStart || '#E0287D', colors.gradientEnd || '#8A2BE2']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.postReplyGradient}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : isSuccess ? (
                  <View style={styles.successRow}>
                    <Check size={18} color="#FFFFFF" strokeWidth={3} style={{ marginRight: 6 }} />
                    <Text style={styles.postReplyText}>Reply Posted!</Text>
                  </View>
                ) : (
                  <Text style={styles.postReplyText}>Post Reply</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0A0718',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },

  // 2. Camera Preview Box
  cameraPreviewBox: {
    width: '100%',
    height: 320,
    borderRadius: 20,
    backgroundColor: '#130E26',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  cameraIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  placeholderSubtext: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },

  // Recording State
  recordingActiveContainer: {
    backgroundColor: '#0D081E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingHeader: {
    position: 'absolute',
    top: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  recordingTimerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  recordingPromptText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 20,
  },
  stopRecordingBtn: {
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
  progressBarBg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#E0287D',
  },

  // Recorded preview badges
  recordedBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(224, 40, 125, 0.5)',
  },
  recordedBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  retakeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  retakeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },

  // 3. Action Buttons Row
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 10,
  },
  uploadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 14,
    paddingVertical: 13,
  },
  uploadBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
  },
  recordBtnWrapper: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#E0287D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  recordBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
  },
  recordBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },

  // 4. Caption Section
  captionSection: {
    marginTop: 18,
  },
  captionLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  captionInput: {
    backgroundColor: '#130E26',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 14,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 90,
    textAlignVertical: 'top',
  },

  // 5. Post Reply Button
  postReplyBtn: {
    marginTop: 18,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#E0287D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  postReplyGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  postReplyText: {
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
