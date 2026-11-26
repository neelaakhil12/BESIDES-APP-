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
  Animated,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Video as VideoPlayer, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Music,
  RotateCw,
  Sparkles,
  Timer,
  LayoutGrid,
  Maximize2,
  Palette,
  ChevronDown,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Send,
  Square,
  Camera,
  Image as ImageIcon,
  Plus,
  Play,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

interface CreateVideoScreenProps {
  onClose: () => void;
  onPublishSuccess: () => void;
}

type CameraMode = '10m' | '60s' | '15s' | 'PHOTO' | 'TEXT';
type BottomTab = 'LIVE' | 'CAMERA' | 'CREATE';

const CAMERA_MODES: CameraMode[] = ['10m', '60s', '15s', 'PHOTO', 'TEXT'];

const FILTER_PRESETS = [
  { id: 'normal', name: 'Normal', color: 'transparent', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  { id: 'glow', name: 'Beside Glow', color: 'rgba(224, 40, 125, 0.18)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: 'neon', name: 'Cyber Neon', color: 'rgba(139, 92, 246, 0.22)', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
  { id: 'sunset', name: 'Golden Hour', color: 'rgba(245, 158, 11, 0.18)', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { id: 'vintage', name: 'Film 90s', color: 'rgba(16, 185, 129, 0.15)', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150' },
];

const SOUND_TRACKS = [
  { id: 's1', title: 'Beside Hits • Trending Beats', duration: '0:15', artist: 'Beside Original' },
  { id: 's2', title: 'City Night Lights • Lo-Fi Pop', duration: '0:30', artist: 'Neo Echo' },
  { id: 's3', title: 'Sunset Chill & Bounce', duration: '0:15', artist: 'DJ Madrid' },
  { id: 's4', title: 'Electronic Pulse 128 BPM', duration: '0:60', artist: 'Synth Wave' },
];

export const CreateVideoScreen: React.FC<CreateVideoScreenProps> = ({
  onClose,
  onPublishSuccess,
}) => {
  const { colors } = useTheme();
  const { user } = useAuth();

  // Mode Selection: '10m' | '60s' | '15s' | 'PHOTO' | 'TEXT'
  const [activeMode, setActiveMode] = useState<CameraMode>('PHOTO');
  // Bottom-most bar tabs: 'LIVE' | 'CAMERA' | 'CREATE'
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTab>('CAMERA');

  // Toolbar settings
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isBeautyOn, setIsBeautyOn] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0); // 0, 3, 10
  const [isGridOn, setIsGridOn] = useState(false);
  const [isFullAspect, setIsFullAspect] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState(FILTER_PRESETS[0]);
  const [selectedSound, setSelectedSound] = useState<string | null>(null);

  // Modals & Panels
  const [showSoundModal, setShowSoundModal] = useState(false);
  const [showFilterPicker, setShowFilterPicker] = useState(false);
  const [showTimerNotice, setShowTimerNotice] = useState<string | null>(null);

  // Capture & Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSeconds, setRecordedSeconds] = useState(0);
  const [countdownNum, setCountdownNum] = useState<number | null>(null);

  // Post capture preview state
  const [capturedMedia, setCapturedMedia] = useState<{
    type: 'photo' | 'video';
    uri: string;
  } | null>(null);
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Animations
  const flashAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const focusScaleAnim = useRef(new Animated.Value(1)).current;
  const recordTimerRef = useRef<any>(null);

  // Web camera reference
  const webcamVideoRef = useRef<any>(null);

  // Attempt live webcam stream on Web browsers if supported
  useEffect(() => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          video: { facingMode: isFrontCamera ? 'user' : 'environment' },
          audio: false,
        })
        .then((stream) => {
          if (webcamVideoRef.current) {
            webcamVideoRef.current.srcObject = stream;
            webcamVideoRef.current.play().catch(() => {});
          }
        })
        .catch(() => {
          // Camera permission denied or not available; fallback to high-def simulated viewfinder
        });
    }

    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, [isFrontCamera]);

  // Pulsing animation for recording shutter
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1.0);
    }
  }, [isRecording]);

  // Animate focus ring on tap
  const handleViewfinderTap = () => {
    focusScaleAnim.setValue(1.4);
    Animated.spring(focusScaleAnim, {
      toValue: 1.0,
      friction: 4,
      tension: 60,
      useNativeDriver: true,
    }).start();
  };

  // Flip Camera
  const handleFlipCamera = () => {
    setIsFrontCamera((prev) => !prev);
  };

  // Toggle Beauty Filter
  const handleToggleBeauty = () => {
    setIsBeautyOn((prev) => !prev);
  };

  // Toggle Timer (Off -> 3s -> 10s)
  const handleCycleTimer = () => {
    if (timerSeconds === 0) {
      setTimerSeconds(3);
      setShowTimerNotice('Timer: 3s');
    } else if (timerSeconds === 3) {
      setTimerSeconds(10);
      setShowTimerNotice('Timer: 10s');
    } else {
      setTimerSeconds(0);
      setShowTimerNotice('Timer: Off');
    }
    setTimeout(() => setShowTimerNotice(null), 1800);
  };

  // Trigger Capture (Photo Snap or Video Start/Stop)
  const handleShutterPress = () => {
    if (timerSeconds > 0 && countdownNum === null && !isRecording) {
      // Run countdown
      let count = timerSeconds;
      setCountdownNum(count);
      const interval = setInterval(() => {
        count -= 1;
        if (count <= 0) {
          clearInterval(interval);
          setCountdownNum(null);
          executeCaptureAction();
        } else {
          setCountdownNum(count);
        }
      }, 1000);
      return;
    }

    executeCaptureAction();
  };

  const executeCaptureAction = () => {
    if (activeMode === 'PHOTO') {
      // Photo Snap with Camera Flash animation
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 70, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 0, duration: 140, useNativeDriver: true }),
      ]).start();

      setTimeout(() => {
        setCapturedMedia({
          type: 'photo',
          uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900',
        });
      }, 150);
    } else if (activeMode === 'TEXT') {
      setCapturedMedia({
        type: 'photo',
        uri: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900',
      });
    } else {
      // Video Recording (15s, 60s, 10m)
      if (isRecording) {
        // Stop recording
        if (recordTimerRef.current) clearInterval(recordTimerRef.current);
        setIsRecording(false);
        setCapturedMedia({
          type: 'video',
          uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        });
      } else {
        // Start recording
        setIsRecording(true);
        setRecordedSeconds(0);
        progressAnim.setValue(0);

        const maxSecs = activeMode === '15s' ? 15 : activeMode === '60s' ? 60 : 600;

        Animated.timing(progressAnim, {
          toValue: 1,
          duration: maxSecs * 1000,
          useNativeDriver: false,
        }).start();

        recordTimerRef.current = setInterval(() => {
          setRecordedSeconds((prev) => {
            if (prev >= maxSecs) {
              if (recordTimerRef.current) clearInterval(recordTimerRef.current);
              setIsRecording(false);
              setCapturedMedia({
                type: 'video',
                uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
              });
              return maxSecs;
            }
            return prev + 1;
          });
        }, 1000);
      }
    }
  };

  // Upload from Gallery
  const handleUploadFromGallery = () => {
    setCapturedMedia({
      type: 'photo',
      uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=900',
    });
  };

  // Retake captured media
  const handleRetake = () => {
    setCapturedMedia(null);
    setIsRecording(false);
    setRecordedSeconds(0);
    progressAnim.setValue(0);
    setCaption('');
  };

  // Post Moment / Publish
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

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // =========================================================================
  // VIEW 1: CAPTURED MEDIA REVIEW & POST (After Photo Snap or Video Recording)
  // =========================================================================
  if (capturedMedia) {
    return (
      <View style={styles.container}>
        {/* Full-screen Captured Media Preview */}
        {capturedMedia.type === 'video' ? (
          <VideoPlayer
            source={{ uri: capturedMedia.uri }}
            style={StyleSheet.absoluteFillObject}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
            isMuted={false}
            useNativeControls={false}
          />
        ) : (
          <Image
            source={{ uri: capturedMedia.uri }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        )}

        {/* Selected Filter Tint Overlay */}
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: selectedFilter.color }]} pointerEvents="none" />

        {/* Top Vignette Gradient */}
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'transparent']}
          style={styles.topVignette}
          pointerEvents="none"
        />

        {/* Top Bar: Retake (Back) & Sound Pill */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topCircleBtn} onPress={handleRetake} activeOpacity={0.8}>
            <RotateCcw size={20} color="#FFFFFF" strokeWidth={2.4} />
          </TouchableOpacity>

          <View style={styles.addSoundPill}>
            <Music size={14} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.addSoundText} numberOfLines={1}>
              {selectedSound || 'Original sound • Beside'}
            </Text>
          </View>

          <View style={{ width: 40 }} />
        </View>

        {/* Bottom Vignette Gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(7, 5, 14, 0.95)']}
          style={styles.bottomVignette}
          pointerEvents="none"
        />

        {/* Bottom Post Form */}
        <View style={styles.postCardContainer}>
          {/* Caption Input */}
          <View style={styles.captionInputWrapper}>
            <TextInput
              style={styles.captionInput}
              placeholder="Add a caption to your moment... #beside"
              placeholderTextColor="#94A3B8"
              value={caption}
              onChangeText={setCaption}
              multiline
              maxLength={150}
            />
          </View>

          {/* Action Buttons: Retake & Post Moment */}
          <View style={styles.postButtonsRow}>
            <TouchableOpacity style={styles.secondaryRetakeBtn} onPress={handleRetake} activeOpacity={0.8}>
              <Text style={styles.secondaryRetakeText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryPostBtn}
              onPress={handlePostMoment}
              disabled={isSubmitting}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryPostGradient}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : isSuccess ? (
                  <View style={styles.successRow}>
                    <Check size={18} color="#FFFFFF" strokeWidth={3} style={{ marginRight: 6 }} />
                    <Text style={styles.primaryPostText}>Published!</Text>
                  </View>
                ) : (
                  <View style={styles.successRow}>
                    <Send size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.primaryPostText}>Post Moment</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // =========================================================================
  // VIEW 2: TIKTOK CAMERA RECORDING INTERFACE (Matches User Screenshot Exactly)
  // =========================================================================
  return (
    <View style={styles.container}>
      {/* 1. CAMERA VIEWFINDER SURFACE */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleViewfinderTap}
        style={styles.cameraViewfinder}
      >
        {/* Web live video element if running in browser */}
        {Platform.OS === 'web' ? (
          <video
            ref={webcamVideoRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: isFrontCamera ? 'scaleX(-1)' : 'none',
            }}
            autoPlay
            playsInline
            muted
          />
        ) : null}

        {/* High-def Studio / Viewfinder Fallback Backdrop */}
        <Image
          source={{
            uri: isFrontCamera
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900'
              : 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=900',
          }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />

        {/* Selected Filter Tint */}
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: selectedFilter.color }]} />

        {/* Beauty Soft Glow Overlay */}
        {isBeautyOn && (
          <LinearGradient
            colors={['rgba(255, 200, 220, 0.14)', 'transparent', 'rgba(224, 40, 125, 0.12)']}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />
        )}

        {/* 3x3 Rule-of-Thirds Grid Overlay */}
        {isGridOn && (
          <View style={styles.gridOverlay} pointerEvents="none">
            <View style={[styles.gridLineH, { top: '33.33%' }]} />
            <View style={[styles.gridLineH, { top: '66.66%' }]} />
            <View style={[styles.gridLineV, { left: '33.33%' }]} />
            <View style={[styles.gridLineV, { left: '66.66%' }]} />
          </View>
        )}

        {/* Animated Center Focus Reticle [ ] */}
        <Animated.View
          style={[
            styles.focusReticle,
            { transform: [{ scale: focusScaleAnim }] },
          ]}
          pointerEvents="none"
        >
          <View style={[styles.reticleCorner, styles.cornerTL, { borderColor: colors.primary }]} />
          <View style={[styles.reticleCorner, styles.cornerTR, { borderColor: colors.primary }]} />
          <View style={[styles.reticleCorner, styles.cornerBL, { borderColor: colors.primary }]} />
          <View style={[styles.reticleCorner, styles.cornerBR, { borderColor: colors.primary }]} />
        </Animated.View>

        {/* White Screen Flash Effect for Photo Snap */}
        <Animated.View
          style={[styles.flashOverlay, { opacity: flashAnim }]}
          pointerEvents="none"
        />

        {/* Live Countdown Overlay */}
        {countdownNum !== null && (
          <View style={styles.countdownCenter}>
            <Text style={[styles.countdownText, { color: colors.primary }]}>{countdownNum}</Text>
          </View>
        )}

        {/* Timer Notification Pill */}
        {showTimerNotice && (
          <View style={styles.timerNoticePill}>
            <Timer size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.timerNoticeText}>{showTimerNotice}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* 2. TOP RECORDING PROGRESS BAR (Video Modes) */}
      {isRecording && (
        <View style={styles.topProgressTrack}>
          <Animated.View
            style={[
              styles.topProgressFill,
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
      )}

      {/* 3. TOP CONTROLS BAR: [✕ Close] · [🎵 Add sound] · [Timer/Badge] */}
      <View style={styles.topBar}>
        {/* Close Button ('✕') */}
        <TouchableOpacity style={styles.topCircleBtn} onPress={onClose} activeOpacity={0.75}>
          <X size={22} color="#FFFFFF" strokeWidth={2.4} />
        </TouchableOpacity>

        {/* Add Sound Pill (TikTok Style) */}
        <TouchableOpacity
          style={styles.addSoundPill}
          onPress={() => setShowSoundModal(true)}
          activeOpacity={0.8}
        >
          <Music size={14} color={selectedSound ? colors.primary : '#FFFFFF'} style={{ marginRight: 6 }} />
          <Text style={styles.addSoundText} numberOfLines={1}>
            {selectedSound || 'Add sound'}
          </Text>
        </TouchableOpacity>

        {/* Balance spacer */}
        <View style={{ width: 42 }} />
      </View>

      {/* 4. RIGHT VERTICAL TOOLBAR (TikTok Tools Column) */}
      <View style={styles.rightToolbarColumn}>
        {/* Tool 1: Flip Camera */}
        <TouchableOpacity style={styles.toolbarIconBtn} onPress={handleFlipCamera} activeOpacity={0.75}>
          <View style={styles.toolbarIconCircle}>
            <RotateCw size={21} color="#FFFFFF" strokeWidth={2.2} />
          </View>
          <Text style={styles.toolbarLabel}>Flip</Text>
        </TouchableOpacity>

        {/* Tool 2: Beauty / Sparkles */}
        <TouchableOpacity style={styles.toolbarIconBtn} onPress={handleToggleBeauty} activeOpacity={0.75}>
          <View style={[styles.toolbarIconCircle, isBeautyOn && { backgroundColor: colors.primary }]}>
            <Sparkles size={20} color="#FFFFFF" strokeWidth={2.2} />
          </View>
          <Text style={[styles.toolbarLabel, isBeautyOn && { color: colors.primary, fontWeight: '700' }]}>
            Beauty
          </Text>
        </TouchableOpacity>

        {/* Tool 3: Timer */}
        <TouchableOpacity style={styles.toolbarIconBtn} onPress={handleCycleTimer} activeOpacity={0.75}>
          <View style={[styles.toolbarIconCircle, timerSeconds > 0 && { backgroundColor: colors.primary }]}>
            <Timer size={20} color="#FFFFFF" strokeWidth={2.2} />
          </View>
          <Text style={[styles.toolbarLabel, timerSeconds > 0 && { color: colors.primary, fontWeight: '700' }]}>
            {timerSeconds > 0 ? `${timerSeconds}s` : 'Timer'}
          </Text>
        </TouchableOpacity>

        {/* Tool 4: Grid Layout */}
        <TouchableOpacity
          style={styles.toolbarIconBtn}
          onPress={() => setIsGridOn((prev) => !prev)}
          activeOpacity={0.75}
        >
          <View style={[styles.toolbarIconCircle, isGridOn && { backgroundColor: colors.primary }]}>
            <LayoutGrid size={20} color="#FFFFFF" strokeWidth={2.2} />
          </View>
          <Text style={styles.toolbarLabel}>Grid</Text>
        </TouchableOpacity>

        {/* Tool 5: Zoom / Aspect Ratio */}
        <TouchableOpacity
          style={styles.toolbarIconBtn}
          onPress={() => setIsFullAspect((prev) => !prev)}
          activeOpacity={0.75}
        >
          <View style={styles.toolbarIconCircle}>
            <Maximize2 size={19} color="#FFFFFF" strokeWidth={2.2} />
          </View>
          <Text style={styles.toolbarLabel}>Zoom</Text>
        </TouchableOpacity>

        {/* Tool 6: Filters */}
        <TouchableOpacity
          style={styles.toolbarIconBtn}
          onPress={() => setShowFilterPicker((prev) => !prev)}
          activeOpacity={0.75}
        >
          <View style={[styles.toolbarIconCircle, showFilterPicker && { backgroundColor: colors.primary }]}>
            <Palette size={20} color="#FFFFFF" strokeWidth={2.2} />
          </View>
          <Text style={styles.toolbarLabel}>Filters</Text>
        </TouchableOpacity>

        {/* Tool 7: More Tools */}
        <TouchableOpacity
          style={styles.toolbarIconBtn}
          onPress={() => setShowSoundModal(true)}
          activeOpacity={0.75}
        >
          <View style={styles.toolbarIconCircle}>
            <ChevronDown size={20} color="#FFFFFF" strokeWidth={2.4} />
          </View>
        </TouchableOpacity>
      </View>

      {/* 5. FILTER SELECTOR DRAWER (When Filters Clicked) */}
      {showFilterPicker && (
        <View style={styles.filterDrawer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            {FILTER_PRESETS.map((filter) => {
              const isSelected = selectedFilter.id === filter.id;
              return (
                <TouchableOpacity
                  key={filter.id}
                  style={styles.filterItemBtn}
                  onPress={() => setSelectedFilter(filter)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.filterAvatarRing,
                      isSelected && { borderColor: colors.primary, borderWidth: 2.5 },
                    ]}
                  >
                    <Image source={{ uri: filter.avatar }} style={styles.filterAvatarImg} />
                  </View>
                  <Text
                    style={[
                      styles.filterItemText,
                      isSelected && { color: colors.primary, fontWeight: '700' },
                    ]}
                  >
                    {filter.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* 6. BOTTOM CONTROLS SECTION */}
      <View style={styles.bottomSectionWrapper}>
        {/* Live Recording Badge with Pulsing Red Dot */}
        {isRecording && (
          <View style={styles.liveRecordingBadge}>
            <View style={styles.recDotPulsing} />
            <Text style={styles.liveRecordingText}>{formatTimer(recordedSeconds)}</Text>
          </View>
        )}

        {/* 6A. MODE SELECTOR ROW: [10m · 60s · 15s · PHOTO · TEXT] */}
        <View style={styles.modeSelectorRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.modeScrollContent}
          >
            {CAMERA_MODES.map((mode) => {
              const isSelected = activeMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => {
                    if (!isRecording) setActiveMode(mode);
                  }}
                  style={[
                    styles.modeTabPill,
                    isSelected && styles.modeTabPillActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.modeTabText,
                      isSelected && styles.modeTabTextActive,
                    ]}
                  >
                    {mode}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 6B. SHUTTER & FLANKING EFFECT AVATARS ROW */}
        <View style={styles.shutterRow}>
          {/* Left Flanking Effect Avatar (Glow Effect) */}
          <TouchableOpacity
            style={styles.flankingAvatarBtn}
            onPress={() => setSelectedFilter(FILTER_PRESETS[1])}
            activeOpacity={0.8}
          >
            <View style={[styles.flankingAvatarRing, selectedFilter.id === 'glow' && { borderColor: colors.primary, borderWidth: 2.5 }]}>
              <Image
                source={{ uri: FILTER_PRESETS[1].avatar }}
                style={styles.flankingAvatarImg}
              />
            </View>
          </TouchableOpacity>

          {/* Center Main Shutter Button */}
          <TouchableOpacity
            onPress={handleShutterPress}
            activeOpacity={0.88}
            style={styles.shutterTouchable}
          >
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.shutterOuterGlowRing}
            >
              <Animated.View
                style={[
                  styles.shutterInnerCircle,
                  activeMode !== 'PHOTO' && { backgroundColor: '#EF4444' },
                  isRecording && styles.shutterRecordingSquare,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                {isRecording && <Square size={18} color="#FFFFFF" fill="#FFFFFF" />}
              </Animated.View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Right Flanking Effect Avatar (Neon Effect) */}
          <TouchableOpacity
            style={styles.flankingAvatarBtn}
            onPress={() => setSelectedFilter(FILTER_PRESETS[2])}
            activeOpacity={0.8}
          >
            <View style={[styles.flankingAvatarRing, selectedFilter.id === 'neon' && { borderColor: colors.primary, borderWidth: 2.5 }]}>
              <Image
                source={{ uri: FILTER_PRESETS[2].avatar }}
                style={styles.flankingAvatarImg}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* 6C. BOTTOM NAVIGATION BAR: [Gallery/Upload] · [LIVE | CAMERA | CREATE] */}
        <View style={styles.bottomNavRow}>
          {/* Upload from Gallery Square Button */}
          <TouchableOpacity
            style={styles.galleryUploadBtn}
            onPress={handleUploadFromGallery}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=120' }}
              style={styles.galleryThumbImg}
            />
          </TouchableOpacity>

          {/* Center Tabs: [LIVE · CAMERA · CREATE] */}
          <View style={styles.centerBottomTabs}>
            <TouchableOpacity
              onPress={() => setActiveBottomTab('LIVE')}
              style={styles.bottomTabItem}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.bottomTabText,
                  activeBottomTab === 'LIVE' && styles.bottomTabTextActive,
                ]}
              >
                LIVE
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveBottomTab('CAMERA')}
              style={styles.bottomTabItem}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.bottomTabText,
                  activeBottomTab === 'CAMERA' && styles.bottomTabTextActive,
                ]}
              >
                CAMERA
              </Text>
              {activeBottomTab === 'CAMERA' && (
                <View style={[styles.activeTabDot, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveBottomTab('CREATE')}
              style={styles.bottomTabItem}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.bottomTabText,
                  activeBottomTab === 'CREATE' && styles.bottomTabTextActive,
                ]}
              >
                CREATE
              </Text>
            </TouchableOpacity>
          </View>

          {/* Right Spacer for optical centering */}
          <View style={{ width: 44 }} />
        </View>
      </View>

      {/* 7. SOUND PICKER MODAL */}
      {showSoundModal && (
        <View style={styles.modalBackdrop}>
          <View style={styles.soundModalSheet}>
            <View style={styles.soundModalHeader}>
              <Text style={styles.soundModalTitle}>Sounds for Moments</Text>
              <TouchableOpacity onPress={() => setShowSoundModal(false)} style={styles.modalCloseBtn}>
                <X size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 260 }}>
              {SOUND_TRACKS.map((track) => (
                <TouchableOpacity
                  key={track.id}
                  style={[
                    styles.soundTrackRow,
                    selectedSound === track.title && { borderColor: colors.primary, backgroundColor: 'rgba(224, 40, 125, 0.12)' },
                  ]}
                  onPress={() => {
                    setSelectedSound(track.title);
                    setShowSoundModal(false);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.soundTrackIconBox}>
                    <Music size={16} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.soundTrackTitle} numberOfLines={1}>{track.title}</Text>
                    <Text style={styles.soundTrackArtist}>{track.artist} • {track.duration}</Text>
                  </View>
                  {selectedSound === track.title && (
                    <Check size={18} color={colors.primary} strokeWidth={2.6} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },
  cameraViewfinder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0713',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    zIndex: 90,
  },

  // Focus reticle [ ]
  focusReticle: {
    width: 72,
    height: 72,
    position: 'relative',
  },
  reticleCorner: {
    position: 'absolute',
    width: 14,
    height: 14,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 },

  // Grid
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },

  // Countdown & Notices
  countdownCenter: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 80,
  },
  countdownText: {
    fontSize: 96,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  timerNoticePill: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 80,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  timerNoticeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Top Progress Bar
  topProgressTrack: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 12,
    left: 12,
    right: 12,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 80,
    overflow: 'hidden',
  },
  topProgressFill: {
    height: '100%',
  },

  // Top Bar
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 70,
  },
  topCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  addSoundPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    maxWidth: 220,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addSoundText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Right Vertical Toolbar
  rightToolbarColumn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 70,
    right: 12,
    alignItems: 'center',
    gap: 13,
    zIndex: 70,
  },
  toolbarIconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
  },
  toolbarIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  toolbarLabel: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 3,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Filter Selector Drawer
  filterDrawer: {
    position: 'absolute',
    bottom: 190,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(11, 8, 20, 0.88)',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    zIndex: 75,
  },
  filtersScroll: {
    paddingHorizontal: 16,
    gap: 14,
  },
  filterItemBtn: {
    alignItems: 'center',
    width: 68,
  },
  filterAvatarRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  filterAvatarImg: {
    width: '100%',
    height: '100%',
  },
  filterItemText: {
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 5,
    textAlign: 'center',
  },

  // Bottom Section Wrapper
  bottomSectionWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 26 : 14,
    zIndex: 70,
  },

  // Live Recording Badge
  liveRecordingBadge: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  recDotPulsing: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  liveRecordingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Mode Selector Row (10m · 60s · 15s · PHOTO · TEXT)
  modeSelectorRow: {
    marginBottom: 16,
  },
  modeScrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  modeTabPill: {
    paddingHorizontal: 14,
    paddingVertical: 5.5,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  modeTabPillActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modeTabText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  modeTabTextActive: {
    color: '#000000',
    fontWeight: '800',
    textShadowRadius: 0,
  },

  // Shutter & Flanking Avatars Row
  shutterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  flankingAvatarBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
  },
  flankingAvatarRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  flankingAvatarImg: {
    width: '100%',
    height: '100%',
  },
  shutterTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuterGlowRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    shadowColor: '#E0287D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 10,
    elevation: 8,
  },
  shutterInnerCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterRecordingSquare: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EF4444',
  },

  // Bottom Navigation Bar (LIVE · CAMERA · CREATE)
  bottomNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  galleryUploadBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1.8,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  galleryThumbImg: {
    width: '100%',
    height: '100%',
  },
  centerBottomTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  bottomTabItem: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  bottomTabText: {
    color: '#94A3B8',
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  bottomTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  activeTabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },

  // Sound Modal
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'flex-end',
    zIndex: 95,
  },
  soundModalSheet: {
    backgroundColor: '#110D20',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  soundModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  soundModalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundTrackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  soundTrackIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  soundTrackTitle: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  soundTrackArtist: {
    color: '#94A3B8',
    fontSize: 11.5,
    marginTop: 2,
  },

  // Post Captured Review Screen Styles
  topVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 60,
  },
  bottomVignette: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 220,
    zIndex: 60,
  },
  postCardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingBottom: Platform.OS === 'ios' ? 36 : 22,
    zIndex: 70,
  },
  captionInputWrapper: {
    backgroundColor: 'rgba(18, 14, 32, 0.88)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  captionInput: {
    color: '#FFFFFF',
    fontSize: 13.5,
    lineHeight: 18,
  },
  postButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  secondaryRetakeBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryRetakeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  primaryPostBtn: {
    flex: 2,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#E0287D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryPostGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryPostText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
