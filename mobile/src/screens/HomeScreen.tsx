import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  Platform,
  PanResponder,
  Animated,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Heart,
  LayoutGrid,
  Send,
  Video as VideoIcon,
  Volume2,
  VolumeX,
  Music,
  Check,
  Search,
  Bell,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Undo2,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { CommentsModal } from './CommentsModal';
import { VideoCommentsModal } from './VideoCommentsModal';
import { NewReplyModal } from './NewReplyModal';
import { MOCK_DECK_REELS } from '../services/mockData';

const { height: WINDOW_HEIGHT, width: WINDOW_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 275;
const CARD_SPACING = 14;
const ITEM_WIDTH = CARD_WIDTH + CARD_SPACING;
const CARD_HEIGHT = 440;

interface HomeScreenProps {
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
  onOpenChat?: () => void;
  onOpenProfile?: (userId: string) => void;
}

// 15 Reels starting with @maya.films matching user's video exactly
const INITIAL_REELS = [
  {
    id: 'deck-maya',
    user: {
      id: 'maya.films',
      username: 'maya.films',
      fullName: 'Maya Films',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900',
    caption: 'Shooting a full vlog on just a gimbal...',
    musicTitle: 'Original audio • maya.films',
    timeAgo: '5d',
    likeCount: 48200,
    commentCount: 15,
    shareCount: 1300,
    countLabel: '1/15',
    isLiked: false,
    isFollowing: false,
  },
  ...MOCK_DECK_REELS.slice(0, 14).map((item, idx) => ({
    id: item.id,
    user: {
      id: item.user.username,
      username: item.user.username,
      fullName: item.user.username,
      avatarUrl: item.user.avatarUrl,
    },
    videoUrl: item.videoUrl,
    thumbnailUrl: item.thumbnailUrl,
    caption: item.caption,
    musicTitle: `Original audio • ${item.user.username}`,
    timeAgo: item.timeAgo || '5d',
    likeCount: 1500 + idx * 800,
    commentCount: item.comments || 18,
    shareCount: 600 + idx * 200,
    countLabel: `${idx + 2}/15`,
    isLiked: false,
    isFollowing: false,
  })),
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenSearch,
  onOpenNotifications,
  onOpenChat,
  onOpenProfile,
}) => {
  const { colors } = useTheme();

  // Top header tab: 'following' | 'for_you'
  const [activeTab, setActiveTab] = useState<'following' | 'for_you'>('for_you');

  // Reels feed data (15 reels)
  const [videos, setVideos] = useState<any[]>(INITIAL_REELS);

  // Current active index in full-screen vertical feed
  const [currentIndex, setCurrentIndex] = useState(0);

  // Deck Mode toggle (triggered by clicking preview card or grid icon)
  const [isDeckMode, setIsDeckMode] = useState(false);

  // Deck Mode origin: 'reel' (from preview card) or 'comments' (from VideoCommentsModal)
  const [deckSource, setDeckSource] = useState<'reel' | 'comments'>('reel');

  // Video Comments Modal (Grid of 15 replies)
  const [isVideoCommentsOpen, setIsVideoCommentsOpen] = useState(false);

  // New Reply Modal (15s video recorder/uploader)
  const [selectedVideoForReply, setSelectedVideoForReply] = useState<any | null>(null);

  // Active index when browsing in 3D Card Deck mode
  const [deckActiveIndex, setDeckActiveIndex] = useState(0);

  // Mini Preview Deck scrub index (0 to 14) matching video reference
  const [miniDeckIndex, setMiniDeckIndex] = useState(0);
  const miniDeckIndexRef = useRef(0);
  miniDeckIndexRef.current = miniDeckIndex;
  const lastScrubX = useRef(0);

  // Sync mini deck index with current video if not manually scrubbing
  useEffect(() => {
    setMiniDeckIndex(currentIndex);
  }, [currentIndex]);

  const handleOpenDeckFromMini = () => {
    setDeckSource('reel');
    setDeckActiveIndex(miniDeckIndexRef.current);
    deckActiveIndexRef.current = miniDeckIndexRef.current;
    deckPanX.setValue(0);
    setIsDeckPaused(false);
    setIsPaused(true);
    setIsDeckMode(true);
  };

  // Handle click on mini deck to shuffle cards (right side advances, left side goes back)
  const handleMiniDeckClick = (clientX: number, targetElem: any) => {
    if (!targetElem) {
      setMiniDeckIndex((prev) => Math.min(videos.length - 1, prev + 1));
      return;
    }
    const rect = targetElem.getBoundingClientRect ? targetElem.getBoundingClientRect() : null;
    if (rect && rect.width > 0) {
      const relativeX = clientX - rect.left;
      // If clicked on the right half -> advance to next card
      if (relativeX >= rect.width / 2) {
        setMiniDeckIndex((prev) => Math.min(videos.length - 1, prev + 1));
      } else {
        // If clicked on the left half -> go back to previous card
        setMiniDeckIndex((prev) => Math.max(0, prev - 1));
      }
    } else {
      setMiniDeckIndex((prev) => Math.min(videos.length - 1, prev + 1));
    }
  };

  const miniCardPanX = useRef(new Animated.Value(0)).current;

  // PanResponder to enable smooth swipe / slide gestures on the small card
  // onStartShouldSetPanResponder is false so clicking sides/center still works instantly!
  // onMoveShouldSetPanResponder activates when dragging horizontally > 6px.
  const miniPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 6 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderGrant: () => {
        lastScrubX.current = 0;
      },
      onPanResponderMove: (_, gestureState) => {
        miniCardPanX.setValue(gestureState.dx * 0.65);
        const diff = gestureState.dx - lastScrubX.current;
        // Step card-by-card if user continues dragging
        if (Math.abs(diff) >= 28) {
          const step = diff > 0 ? -1 : 1;
          setMiniDeckIndex((prev) => Math.max(0, Math.min(videos.length - 1, prev + step)));
          lastScrubX.current = gestureState.dx;
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // If a single swipe occurred without triggering continuous step
        if (lastScrubX.current === 0) {
          if (gestureState.dx < -18 && miniDeckIndexRef.current < videos.length - 1) {
            setMiniDeckIndex((prev) => Math.min(videos.length - 1, prev + 1));
          } else if (gestureState.dx > 18 && miniDeckIndexRef.current > 0) {
            setMiniDeckIndex((prev) => Math.max(0, prev - 1));
          }
        }
        Animated.spring(miniCardPanX, {
          toValue: 0,
          friction: 7,
          tension: 60,
          useNativeDriver: false,
        }).start();
      },
      onPanResponderTerminate: () => {
        Animated.spring(miniCardPanX, {
          toValue: 0,
          friction: 7,
          tension: 60,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  // Mute state
  const [isMuted, setIsMuted] = useState(true);

  // Play/pause states
  const [isPaused, setIsPaused] = useState(false);
  const [isDeckPaused, setIsDeckPaused] = useState(false);

  const togglePlayPause = () => {
    setIsPaused((prev) => !prev);
  };

  // Comments modal
  const [selectedVideoForComments, setSelectedVideoForComments] = useState<any | null>(null);

  // Screen container dimensions (initialized from window dimensions so there is 0 layout jump on start)
  const [containerHeight, setContainerHeight] = useState<number>(WINDOW_HEIGHT || 720);
  const [containerWidth, setContainerWidth] = useState<number>(WINDOW_WIDTH || 380);

  const flatListRef = useRef<FlatList>(null);
  const deckPanX = useRef(new Animated.Value(0)).current;
  const deckActiveIndexRef = useRef(0);

  useEffect(() => {
    deckActiveIndexRef.current = deckActiveIndex;
  }, [deckActiveIndex]);

  // Open 3D Card Deck Mode from Reel Preview Card
  const handleOpenDeckMode = () => {
    setDeckSource('reel');
    setDeckActiveIndex(currentIndex);
    deckActiveIndexRef.current = currentIndex;
    deckPanX.setValue(0);
    setIsDeckPaused(false);
    setIsDeckMode(true);
  };

  // Open 3D Card Deck Mode from Video Comments Grid
  const handleOpenDeckFromComments = (index: number) => {
    setDeckSource('comments');
    setDeckActiveIndex(index);
    deckActiveIndexRef.current = index;
    deckPanX.setValue(0);
    setIsDeckPaused(false);
    setIsDeckMode(true);
  };

  // Close 3D Card Deck and return to Video Comments Grid
  const handleCloseDeckToComments = () => {
    setIsDeckMode(false);
    if (deckSource === 'comments') {
      setIsVideoCommentsOpen(true);
    }
  };

  // Advance to next card in the deck (with smooth slide animation)
  const nextCard = () => {
    if (deckActiveIndexRef.current < videos.length - 1) {
      Animated.timing(deckPanX, {
        toValue: -CARD_WIDTH - 60,
        duration: 180,
        useNativeDriver: false,
      }).start(() => {
        deckPanX.setValue(0);
        setDeckActiveIndex((prev) => {
          const next = Math.min(videos.length - 1, prev + 1);
          deckActiveIndexRef.current = next;
          return next;
        });
      });
    }
  };

  // Return to previous card in the deck
  const prevCard = () => {
    if (deckActiveIndexRef.current > 0) {
      Animated.timing(deckPanX, {
        toValue: CARD_WIDTH + 60,
        duration: 180,
        useNativeDriver: false,
      }).start(() => {
        deckPanX.setValue(0);
        setDeckActiveIndex((prev) => {
          const next = Math.max(0, prev - 1);
          deckActiveIndexRef.current = next;
          return next;
        });
      });
    }
  };

  // Keyboard navigation for web
  useEffect(() => {
    if (Platform.OS === 'web' && isDeckMode) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          nextCard();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          prevCard();
        } else if (e.key === 'Escape') {
          setIsDeckMode(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isDeckMode]);

  // PanResponder to enable smooth drag gestures on web & mobile
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 6,
      onPanResponderMove: (_, gestureState) => {
        deckPanX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -45 && deckActiveIndexRef.current < videos.length - 1) {
          nextCard();
        } else if (gestureState.dx > 45 && deckActiveIndexRef.current > 0) {
          prevCard();
        } else {
          Animated.spring(deckPanX, {
            toValue: 0,
            friction: 6,
            tension: 50,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  // Close Deck Mode and resume full-screen playback of the selected card
  const handleSelectReelFromDeck = (index: number) => {
    setCurrentIndex(index);
    setIsPaused(false);
    setIsDeckMode(false);
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
      });
    }, 50);
  };

  const toggleLike = (index: number) => {
    setVideos((prev) => {
      const updated = [...prev];
      const cur = updated[index];
      if (!cur) return prev;
      const wasLiked = cur.isLiked;
      updated[index] = {
        ...cur,
        isLiked: !wasLiked,
        likeCount: cur.likeCount + (wasLiked ? -1 : 1),
      };
      return updated;
    });
  };

  const toggleFollow = (index: number) => {
    setVideos((prev) => {
      const updated = [...prev];
      const cur = updated[index];
      if (!cur) return prev;
      updated[index] = {
        ...cur,
        isFollowing: !cur.isFollowing,
      };
      return updated;
    });
  };

  const scrollToNext = () => {
    if (currentIndex < videos.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      flatListRef.current?.scrollToIndex({ index: nextIdx, animated: true });
    }
  };

  // Next preview video details
  const nextReelIndex = (currentIndex + 1) % videos.length;
  const nextReel = videos[nextReelIndex];

  // =========================================================================
  // 1. RENDER FULL-SCREEN VERTICAL REEL ITEM
  // =========================================================================
  const renderVideoItem = ({ item, index }: { item: any; index: number }) => {
    const isFocused = index === currentIndex && !isDeckMode;
    const cardHeight = containerHeight > 0 ? containerHeight : 660;

    return (
      <View style={[styles.videoContainer, { height: cardHeight }]}>
        {/* Poster / Fallback preview */}
        <Image
          source={{ uri: item.thumbnailUrl }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />

        {/* Full-screen Video Player */}
        <Video
          source={{ uri: item.videoUrl }}
          style={StyleSheet.absoluteFillObject}
          resizeMode={ResizeMode.COVER}
          shouldPlay={isFocused && !isPaused}
          isLooping
          isMuted={isMuted}
          useNativeControls={false}
        />

        {/* Soft vignette gradient */}
        <LinearGradient
          colors={['rgba(0,0,0,0.45)', 'transparent', 'rgba(0,0,0,0.7)']}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />

        {/* Tap video to Pause / Resume (Full-screen Reel) */}
        {!isDeckMode && (
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={togglePlayPause}
          >
            {/* Center Frosted Play Badge when paused */}
            {isFocused && isPaused && (
              <View style={styles.centerPlayPauseOverlay} pointerEvents="none">
                <View style={styles.centerPlayPauseCircle}>
                  <Play size={34} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 4 }} />
                </View>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Floating Mute Button (Hidden in deck mode so background is clean) */}
        {!isDeckMode && (
          <TouchableOpacity
            style={styles.muteButton}
            onPress={() => setIsMuted(!isMuted)}
            activeOpacity={0.8}
          >
            {isMuted ? (
              <VolumeX size={16} color="#FFFFFF" />
            ) : (
              <Volume2 size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        )}

        {/* Right Side: Action Column (Hidden in deck mode) */}
        {!isDeckMode && (
          <View style={styles.rightActionsColumn}>
            {/* 1. Like Heart */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => toggleLike(index)}
              activeOpacity={0.7}
            >
              <Heart
                size={28}
                color={item.isLiked ? '#EF4444' : '#FFFFFF'}
                fill={item.isLiked ? '#EF4444' : 'none'}
                strokeWidth={2}
              />
              <Text style={styles.actionText}>
                {item.likeCount > 999
                  ? `${(item.likeCount / 1000).toFixed(1)}K`
                  : item.likeCount}
              </Text>
            </TouchableOpacity>

            {/* 2. Video Comments / Grid Button -> Opens 3-Column Video Comments Sheet */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                setIsPaused(true);
                setIsVideoCommentsOpen(true);
              }}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.commentGridBox}
              >
                <LayoutGrid size={18} color="#FFFFFF" strokeWidth={2.2} />
              </LinearGradient>
              <Text style={styles.actionText}>{item.commentCount || 15}</Text>
            </TouchableOpacity>

            {/* 3. Share Paper Airplane */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={onOpenChat}
              activeOpacity={0.7}
            >
              <View style={styles.shareIconContainer}>
                <Send
                  size={24}
                  color="#FFFFFF"
                  strokeWidth={2}
                />
              </View>
              <Text style={styles.actionText}>
                {item.shareCount > 999
                  ? `${(item.shareCount / 1000).toFixed(1)}K`
                  : item.shareCount}
              </Text>
            </TouchableOpacity>

            {/* 4. Video Camera / New Reply Button */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => setSelectedVideoForReply(item)}
              activeOpacity={0.8}
            >
              <View style={styles.cameraCircleBtn}>
                <VideoIcon size={22} color="#FFFFFF" strokeWidth={2} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Left: Creator Info, Caption, Music Row */}
        <View style={[styles.bottomCreatorContainer, isDeckMode && { opacity: 0.75 }]}>
          <View style={styles.creatorRow}>
              <TouchableOpacity
                onPress={() => onOpenProfile && onOpenProfile(item.user.username)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: item.user.avatarUrl }} style={styles.creatorAvatar} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onOpenProfile && onOpenProfile(item.user.username)}
                activeOpacity={0.8}
              >
                <Text style={styles.creatorUsername}>{item.user.username}</Text>
              </TouchableOpacity>

              {/* Follow Button (Besides Brand Colors) */}
              <TouchableOpacity
                onPress={() => toggleFollow(index)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={
                    item.isFollowing
                      ? ['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']
                      : [colors.gradientStart, colors.gradientEnd]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.followButtonGradient}
                >
                  {item.isFollowing ? (
                    <View style={styles.followingRow}>
                      <Check size={11} color="#FFFFFF" strokeWidth={3} style={{ marginRight: 3 }} />
                      <Text style={styles.followButtonText}>Following</Text>
                    </View>
                  ) : (
                    <Text style={styles.followButtonText}>Follow</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Caption */}
            <Text style={styles.captionText} numberOfLines={2}>
              {item.caption}
            </Text>

            {/* Music Row */}
            <View style={styles.musicRow}>
              <Music size={12} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.musicText} numberOfLines={1}>
                {item.musicTitle}
              </Text>
            </View>
          </View>

        {/* Floating Mini Preview Deck (Scrolls WITH this reel item!) */}
        {!isDeckMode && !selectedVideoForReply && !isVideoCommentsOpen && !selectedVideoForComments && (
          renderMiniPreviewDeck(index)
        )}
      </View>
    );
  };

  // =========================================================================
  // 1.5 RENDER MINI PREVIEW DECK (Reusable helper for reel items & deck mode)
  // Supports both:
  // 1) Click/Tap: Side wings shuffle, center card/badge opens 3D Pop-Up Reels Card
  // 2) Swipe/Slide: Dragging horizontally slides through cards one-by-one!
  // =========================================================================
  const renderMiniPreviewDeck = (reelIndex?: number) => {
    return (
      <View style={styles.floatingMiniPreviewDeck} {...miniPanResponder.panHandlers}>
        {/* Stacked Cards behind to the LEFT (cards with index < miniDeckIndex) */}
        {miniDeckIndex > 2 && (
          <View style={styles.miniStackLeft3} pointerEvents="none">
            <Image
              source={{ uri: videos[miniDeckIndex - 3]?.thumbnailUrl }}
              style={styles.miniStackImg}
            />
            <View style={styles.miniStackTintDarker} />
          </View>
        )}
        {miniDeckIndex > 1 && (
          <View style={styles.miniStackLeft2} pointerEvents="none">
            <Image
              source={{ uri: videos[miniDeckIndex - 2]?.thumbnailUrl }}
              style={styles.miniStackImg}
            />
            <View style={styles.miniStackTintDark} />
          </View>
        )}
        {miniDeckIndex > 0 && (
          <View style={styles.miniStackLeft1} pointerEvents="none">
            <Image
              source={{ uri: videos[miniDeckIndex - 1]?.thumbnailUrl }}
              style={styles.miniStackImg}
            />
            <View style={styles.miniStackTint} />
          </View>
        )}

        {/* LEFT SIDE CLICK TO SHUFFLE PREVIOUS CARD */}
        <TouchableOpacity
          style={styles.miniStackLeftTouchZone}
          onPress={() => setMiniDeckIndex((prev) => Math.max(0, prev - 1))}
          activeOpacity={0.7}
        />

        {/* Stacked Cards behind to the RIGHT (cards with index > miniDeckIndex) */}
        {miniDeckIndex < videos.length - 3 && (
          <View style={styles.miniStackRight3} pointerEvents="none">
            <Image
              source={{ uri: videos[miniDeckIndex + 3]?.thumbnailUrl }}
              style={styles.miniStackImg}
            />
            <View style={styles.miniStackTintDarker} />
          </View>
        )}
        {miniDeckIndex < videos.length - 2 && (
          <View style={styles.miniStackRight2} pointerEvents="none">
            <Image
              source={{ uri: videos[miniDeckIndex + 2]?.thumbnailUrl }}
              style={styles.miniStackImg}
            />
            <View style={styles.miniStackTintDark} />
          </View>
        )}
        {miniDeckIndex < videos.length - 1 && (
          <View style={styles.miniStackRight1} pointerEvents="none">
            <Image
              source={{ uri: videos[miniDeckIndex + 1]?.thumbnailUrl }}
              style={styles.miniStackImg}
            />
            <View style={styles.miniStackTint} />
          </View>
        )}

        {/* RIGHT SIDE CLICK TO SHUFFLE NEXT CARD */}
        <TouchableOpacity
          style={styles.miniStackRightTouchZone}
          onPress={() => setMiniDeckIndex((prev) => Math.min(videos.length - 1, prev + 1))}
          activeOpacity={0.7}
        />

        {/* ACTIVE SMALL CARD (Clicking opens Pop-Up Card, Swiping slides cards one-by-one!) */}
        <Animated.View
          style={[
            styles.miniCardMain,
            {
              transform: [{ translateX: miniCardPanX }],
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={handleOpenDeckFromMini}
            activeOpacity={0.88}
          >
            <Image
              source={{ uri: videos[miniDeckIndex]?.thumbnailUrl }}
              style={styles.deckThumbnail}
            />

            {/* Subtle bottom vignette gradient for avatar contrast */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.55)']}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />

            {/* Mini Creator Avatar Badge with Green Ring at Bottom-Left */}
            <View style={styles.deckAvatarBadge} pointerEvents="none">
              <Image
                source={{ uri: videos[miniDeckIndex]?.user?.avatarUrl }}
                style={styles.deckAvatarImg}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Top Floating Badge: 📹 index/15 (Clicking opens the Pop-Up Reels Card!) */}
        <Animated.View
          style={[
            styles.deckBadge,
            {
              transform: [{ translateX: miniCardPanX }],
            },
          ]}
        >
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center' }}
            onPress={handleOpenDeckFromMini}
            activeOpacity={0.8}
          >
            <VideoIcon size={12} color="#22C55E" fill="#22C55E" style={{ marginRight: 3.5 }} />
            <Text style={styles.deckBadgeText}>
              {`${miniDeckIndex + 1}/15`}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  // =========================================================================
  // 2. RENDER 3D STACKED CARD DECK (Matching user's reference video 200%)
  // Cards are physically stacked on top of one another ("oka danimida inkoti unnay")
  // Swiping horizontally reveals them one-by-one from the stack.
  // =========================================================================
  const renderDeckCard = (item: any, index: number, diff: number) => {
    const isActive = diff === 0;

    let cardTransform: any[] = [];
    let cardOpacity: any = 1;
    let cardZIndex = 10;

    if (isActive) {
      cardZIndex = 40;
      cardTransform = [
        { translateX: deckPanX },
        {
          rotate: deckPanX.interpolate({
            inputRange: [-300, 0, 300],
            outputRange: ['-8deg', '0deg', '8deg'],
            extrapolate: 'clamp',
          }),
        },
        {
          scale: deckPanX.interpolate({
            inputRange: [-300, 0, 300],
            outputRange: [0.96, 1, 0.96],
            extrapolate: 'clamp',
          }),
        },
      ];
      cardOpacity = deckPanX.interpolate({
        inputRange: [-320, -180, 0, 180, 320],
        outputRange: [0.25, 0.95, 1, 0.95, 0.25],
        extrapolate: 'clamp',
      });
    } else if (diff === 1) {
      cardZIndex = 30;
      cardTransform = [
        {
          translateX: deckPanX.interpolate({
            inputRange: [-250, 0],
            outputRange: [0, 20],
            extrapolate: 'clamp',
          }),
        },
        {
          scale: deckPanX.interpolate({
            inputRange: [-250, 0],
            outputRange: [1, 0.95],
            extrapolate: 'clamp',
          }),
        },
      ];
      cardOpacity = deckPanX.interpolate({
        inputRange: [-250, 0],
        outputRange: [1, 0.92],
        extrapolate: 'clamp',
      });
    } else if (diff === 2) {
      cardZIndex = 20;
      cardTransform = [
        {
          translateX: deckPanX.interpolate({
            inputRange: [-250, 0],
            outputRange: [20, 38],
            extrapolate: 'clamp',
          }),
        },
        {
          scale: deckPanX.interpolate({
            inputRange: [-250, 0],
            outputRange: [0.95, 0.90],
            extrapolate: 'clamp',
          }),
        },
      ];
      cardOpacity = deckPanX.interpolate({
        inputRange: [-250, 0],
        outputRange: [0.92, 0.75],
        extrapolate: 'clamp',
      });
    } else if (diff === 3) {
      cardZIndex = 10;
      cardTransform = [
        {
          translateX: deckPanX.interpolate({
            inputRange: [-250, 0],
            outputRange: [38, 54],
            extrapolate: 'clamp',
          }),
        },
        {
          scale: deckPanX.interpolate({
            inputRange: [-250, 0],
            outputRange: [0.90, 0.85],
            extrapolate: 'clamp',
          }),
        },
      ];
      cardOpacity = deckPanX.interpolate({
        inputRange: [-250, 0],
        outputRange: [0.75, 0.52],
        extrapolate: 'clamp',
      });
    } else if (diff === -1) {
      cardZIndex = 25;
      cardTransform = [
        {
          translateX: deckPanX.interpolate({
            inputRange: [0, 250],
            outputRange: [-22, 0],
            extrapolate: 'clamp',
          }),
        },
        {
          scale: deckPanX.interpolate({
            inputRange: [0, 250],
            outputRange: [0.95, 1],
            extrapolate: 'clamp',
          }),
        },
      ];
      cardOpacity = deckPanX.interpolate({
        inputRange: [0, 250],
        outputRange: [0.65, 1],
        extrapolate: 'clamp',
      });
    }

    return (
      <Animated.View
        key={item.id}
        style={[
          styles.stackedDeckCardWrapper,
          {
            zIndex: cardZIndex,
            opacity: cardOpacity,
            transform: cardTransform,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.floatingDeckCard,
            {
              borderColor: isActive
                ? 'rgba(224, 40, 125, 0.75)'
                : 'rgba(255, 255, 255, 0.16)',
              shadowColor: colors.primary,
            },
          ]}
          onPress={() => {
            if (isActive) {
              setIsDeckPaused((prev) => !prev);
            } else if (diff > 0) {
              nextCard();
            } else {
              prevCard();
            }
          }}
          activeOpacity={isActive ? 0.95 : 0.85}
        >
          {/* Card Media Preview */}
          <Image
            source={{ uri: item.thumbnailUrl }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />

          {isActive && (
            <Video
              source={{ uri: item.videoUrl }}
              style={StyleSheet.absoluteFillObject}
              resizeMode={ResizeMode.COVER}
              shouldPlay={isDeckMode && !isDeckPaused}
              isLooping
              isMuted={isMuted}
              useNativeControls={false}
            />
          )}

          {/* Vignette */}
          <LinearGradient
            colors={['rgba(0,0,0,0.65)', 'transparent', 'rgba(0,0,0,0.88)']}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />

          {/* Center Play Indicator on Active Card when paused */}
          {isActive && isDeckPaused && (
            <View style={styles.centerPlayPauseOverlay} pointerEvents="none">
              <View style={styles.centerPlayPauseCircle}>
                <Play size={34} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 4 }} />
              </View>
            </View>
          )}

          {/* Top Bar on Active Card (← @creator + Play/Pause + Mute) */}
          {isActive && (
            <View style={styles.deckCardTopBar}>
              <View style={styles.deckCardUserRow}>
                <TouchableOpacity
                  onPress={() => {
                    if (deckSource === 'comments') {
                      handleCloseDeckToComments();
                    } else {
                      setIsDeckMode(false);
                    }
                  }}
                  activeOpacity={0.7}
                  style={{ paddingRight: 5 }}
                >
                  <ArrowLeft size={14} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => onOpenProfile && onOpenProfile(item.user.username)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.deckCardUsername}>@{item.user.username}</Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* Play/Pause Button */}
                <TouchableOpacity
                  style={[styles.deckCardMuteBtn, { marginRight: 8 }]}
                  onPress={() => setIsDeckPaused((prev) => !prev)}
                  activeOpacity={0.8}
                >
                  {isDeckPaused ? (
                    <Play size={14} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 2 }} />
                  ) : (
                    <Pause size={14} color="#FFFFFF" fill="#FFFFFF" />
                  )}
                </TouchableOpacity>

                {/* Volume Button */}
                <TouchableOpacity
                  style={styles.deckCardMuteBtn}
                  onPress={() => setIsMuted(!isMuted)}
                  activeOpacity={0.8}
                >
                  {isMuted ? (
                    <VolumeX size={15} color="#FFFFFF" />
                  ) : (
                    <Volume2 size={15} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Bottom Meta on Active Card */}
          {isActive && (
            <View style={styles.deckCardBottomMeta}>
              <View style={styles.deckCardCreatorRow}>
                <TouchableOpacity
                  onPress={() => onOpenProfile && onOpenProfile(item.user.username)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: item.user.avatarUrl }} style={styles.deckCardAvatar} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <TouchableOpacity
                    onPress={() => onOpenProfile && onOpenProfile(item.user.username)}
                    activeOpacity={0.8}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.deckCardCreatorName}>{item.user.username}</Text>
                      <Text style={styles.deckCardTimeAgo}>• {item.timeAgo || '5d'}</Text>
                    </View>
                  </TouchableOpacity>
                  <Text style={styles.deckCardCaption} numberOfLines={2}>
                    {item.caption}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => toggleLike(index)}
                  style={styles.deckCardLikeBtn}
                >
                  <Heart
                    size={22}
                    color={item.isLiked ? '#EF4444' : '#FFFFFF'}
                    fill={item.isLiked ? '#EF4444' : 'none'}
                  />
                  <Text style={styles.deckCardLikeCount}>
                    {item.likeCount > 999 ? `${(item.likeCount / 1000).toFixed(1)}K` : item.likeCount}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Render cards in order from back-to-front so DOM layering is 100% physically stacked
  const renderStackedCards = () => {
    const list: { item: any; index: number; diff: number }[] = [];

    // Right peeking cards (diff > 0): render from furthest (diff = 3) to closest (diff = 1)
    if (deckActiveIndex + 3 < videos.length) {
      list.push({ item: videos[deckActiveIndex + 3], index: deckActiveIndex + 3, diff: 3 });
    }
    if (deckActiveIndex + 2 < videos.length) {
      list.push({ item: videos[deckActiveIndex + 2], index: deckActiveIndex + 2, diff: 2 });
    }
    if (deckActiveIndex + 1 < videos.length) {
      list.push({ item: videos[deckActiveIndex + 1], index: deckActiveIndex + 1, diff: 1 });
    }
    // Left peeking card (diff = -1)
    if (deckActiveIndex - 1 >= 0) {
      list.push({ item: videos[deckActiveIndex - 1], index: deckActiveIndex - 1, diff: -1 });
    }
    // Top active card (diff = 0)
    if (deckActiveIndex < videos.length) {
      list.push({ item: videos[deckActiveIndex], index: deckActiveIndex, diff: 0 });
    }

    return list.map(({ item, index, diff }) => renderDeckCard(item, index, diff));
  };

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (height > 0 && height !== containerHeight) {
          setContainerHeight(height);
        }
        if (width > 0 && width !== containerWidth) {
          setContainerWidth(width);
        }
      }}
    >
      {/* 1. TOP HEADER BAR (Hidden in deck mode so background reel is clean) */}
      {!isDeckMode && (
        <View style={styles.topHeaderBar}>
          {/* Left: Transparent Besides Logo */}
          <TouchableOpacity style={styles.logoCircleWrapper} activeOpacity={0.8}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.headerLogoImg}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Center: Following | For You Switcher */}
          <View style={styles.segmentedSwitcher}>
            <TouchableOpacity
              style={[
                styles.switchTab,
                activeTab === 'following' && styles.switchTabActive,
              ]}
              onPress={() => setActiveTab('following')}
              activeOpacity={0.8}
            >
              {activeTab === 'following' ? (
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.activeTabGradient}
                >
                  <Text style={styles.activeTabText}>Following</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.inactiveTabText}>Following</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.switchTab,
                activeTab === 'for_you' && styles.switchTabActive,
              ]}
              onPress={() => setActiveTab('for_you')}
              activeOpacity={0.8}
            >
              {activeTab === 'for_you' ? (
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.activeTabGradient}
                >
                  <Text style={styles.activeTabText}>For You</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.inactiveTabText}>For You</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Right: Search & Bell Buttons */}
          <View style={styles.rightTopButtons}>
            <TouchableOpacity
              style={styles.topCircleIconBtn}
              onPress={onOpenSearch}
              activeOpacity={0.8}
            >
              <Search size={17} color="#FFFFFF" strokeWidth={2.4} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.topCircleIconBtn, { marginLeft: 8 }]}
              onPress={onOpenNotifications || onOpenChat}
              activeOpacity={0.8}
            >
              <Bell size={17} color="#FFFFFF" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 2. FULL-SCREEN VERTICAL REEL FEED (Always mounted, paused when in deck mode) */}
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const h = containerHeight > 0 ? containerHeight : 660;
          const index = Math.round(e.nativeEvent.contentOffset.y / h);
          if (index !== currentIndex) {
            setIsPaused(false);
          }
          setCurrentIndex(index);
        }}
        snapToInterval={containerHeight > 0 ? containerHeight : 660}
        snapToAlignment="start"
        decelerationRate="fast"
        style={styles.flatList}
      />

      {/* 3. 3D STACKED CARD DECK OVERLAY (Cards physically stacked on top of each other) */}
      {isDeckMode && (
        <View style={styles.deckModeOverlay}>
          {/* Semi-transparent Dimmer showing either Video Comments grid or background reel */}
          <TouchableOpacity
            style={styles.deckBackdropDimmer}
            onPress={deckSource === 'comments' ? handleCloseDeckToComments : () => setIsDeckMode(false)}
            activeOpacity={1}
          />

          {/* Interactive Stacked Cards Area */}
          <View style={styles.deckCarouselWrapper} {...panResponder.panHandlers}>
            <View style={styles.stackedDeckContainer}>
              {renderStackedCards()}
            </View>
          </View>

          {/* Bottom Deck Indicator Pill */}
          <TouchableOpacity
            style={styles.deckResumeIndicator}
            onPress={
              deckSource === 'comments'
                ? handleCloseDeckToComments
                : () => handleSelectReelFromDeck(deckActiveIndex)
            }
            activeOpacity={0.85}
          >
            <View style={styles.deckIndicatorRow}>
              <Text style={{ fontWeight: '900', color: '#FFFFFF', fontSize: 12 }}>
                {deckActiveIndex + 1}/15
              </Text>
              <Text style={styles.deckResumeDot}> • </Text>
              <Undo2 size={12} color="#CBD5E1" style={{ marginRight: 4 }} />
              <Text style={styles.deckResumeText} numberOfLines={1}>
                {deckSource === 'comments'
                  ? 'Tap outside for all comments'
                  : 'Tap the Reel to resume • 0:01'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Mini preview deck inside Deck Mode Overlay beside resume pill */}
          {!selectedVideoForReply && !isVideoCommentsOpen && !selectedVideoForComments && (
            renderMiniPreviewDeck()
          )}
        </View>
      )}

      {/* 5. VIDEO COMMENTS 3-COLUMN MODAL (Opens when clicking 15-grid button) */}
      <VideoCommentsModal
        visible={isVideoCommentsOpen}
        parentVideo={videos[currentIndex]}
        replies={videos}
        currentViewingIndex={isDeckMode ? deckActiveIndex : -1}
        onClose={() => setIsVideoCommentsOpen(false)}
        onSelectReply={(index) => {
          handleOpenDeckFromComments(index);
        }}
        onOpenRecordReply={() => {
          setIsVideoCommentsOpen(false);
          setSelectedVideoForReply(videos[currentIndex]);
        }}
      />

      {/* 6. NEW VIDEO REPLY MODAL (Opens when clicking Video Camera button) */}
      {selectedVideoForReply && (
        <NewReplyModal
          visible={true}
          video={selectedVideoForReply}
          onClose={() => setSelectedVideoForReply(null)}
          onReplyPosted={(reply) => {
            console.log('Reply posted:', reply);
          }}
        />
      )}

      {/* 7. COMMENTS MODAL */}
      {selectedVideoForComments && (
        <CommentsModal
          visible={true}
          video={selectedVideoForComments}
          onClose={() => setSelectedVideoForComments(null)}
        />
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
  flatList: {
    flex: 1,
  },
  videoContainer: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#000000',
  },

  // 1. TOP HEADER BAR
  topHeaderBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 14 : 10,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  logoCircleWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerLogoImg: {
    width: 28,
    height: 28,
  },
  segmentedSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 22,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  switchTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
  },
  switchTabActive: {
    backgroundColor: 'transparent',
  },
  activeTabGradient: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  inactiveTabText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  rightTopButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topCircleIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },

  // MUTE BUTTON
  muteButton: {
    position: 'absolute',
    top: 64,
    right: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },

  // RIGHT ACTIONS COLUMN (Shifted higher so it sits cleanly above the small preview card)
  rightActionsColumn: {
    position: 'absolute',
    right: 14,
    bottom: 204,
    alignItems: 'center',
    zIndex: 20,
    gap: 12,
  },
  actionItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  commentGridBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E0287D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  shareIconContainer: {
    width: 44,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(30, 24, 48, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },

  // 3D STACKED PREVIEW DECK (Matching client video reference 200%)
  floatingMiniPreviewDeck: {
    position: 'absolute',
    bottom: 76,
    right: 14,
    width: 124,
    height: 126,
    zIndex: 300,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer', userSelect: 'none' } : {}),
  },
  miniCardMain: {
    width: 94,
    height: 122,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.6,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    backgroundColor: '#1E1836',
    position: 'relative',
    zIndex: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  miniStackImg: {
    width: '100%',
    height: '100%',
  },
  miniStackTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  miniStackTintDark: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
  },
  miniStackTintDarker: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.76)',
  },

  // Left stack layers
  miniStackLeftTouchZone: {
    position: 'absolute',
    left: 0,
    top: 4,
    width: 26,
    height: 118,
    zIndex: 35,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  miniStackRightTouchZone: {
    position: 'absolute',
    right: 0,
    top: 4,
    width: 26,
    height: 118,
    zIndex: 35,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  miniStackLeft1: {
    position: 'absolute',
    left: 7,
    top: 6,
    width: 94,
    height: 112,
    borderRadius: 17,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 10,
  },
  miniStackLeft2: {
    position: 'absolute',
    left: 1,
    top: 10,
    width: 94,
    height: 104,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    zIndex: 8,
  },
  miniStackLeft3: {
    position: 'absolute',
    left: -5,
    top: 14,
    width: 94,
    height: 96,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 6,
  },

  // Right stack layers
  miniStackRight1: {
    position: 'absolute',
    right: 7,
    top: 6,
    width: 94,
    height: 112,
    borderRadius: 17,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 10,
  },
  miniStackRight2: {
    position: 'absolute',
    right: 1,
    top: 10,
    width: 94,
    height: 104,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    zIndex: 8,
  },
  miniStackRight3: {
    position: 'absolute',
    right: -5,
    top: 14,
    width: 94,
    height: 96,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 6,
  },

  deckThumbnail: {
    width: '100%',
    height: '100%',
  },
  deckBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161420',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    zIndex: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 6,
  },
  deckBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  deckAvatarBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#22C55E',
    backgroundColor: '#120F1D',
    zIndex: 20,
  },
  deckAvatarImg: {
    width: '100%',
    height: '100%',
  },

  // BOTTOM CREATOR INFO
  bottomCreatorContainer: {
    position: 'absolute',
    bottom: 84,
    left: 16,
    right: 144,
    zIndex: 25,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    zIndex: 30,
  },
  creatorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    marginRight: 8,
  },
  creatorUsername: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginRight: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  followButtonGradient: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  followingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  captionText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  musicRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  musicText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.9,
  },

  // =========================================================================
  // 3D HORIZONTAL CARD DECK CAROUSEL OVERLAY
  // =========================================================================
  deckModeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 150,
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 24 : 18,
    paddingBottom: 70,
  },
  deckBackdropDimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  deckCarouselWrapper: {
    width: '100%',
    height: CARD_HEIGHT + 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackedDeckContainer: {
    width: CARD_WIDTH + 60,
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  stackedDeckCardWrapper: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingDeckCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#161129',
    position: 'relative',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.65,
    shadowRadius: 20,
    elevation: 14,
  },
  deckCardTopBar: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  deckCardUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  deckCardTopAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  deckCardUsername: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  deckCardMuteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  deckCardBottomMeta: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    zIndex: 10,
  },
  deckCardCreatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deckCardAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    marginRight: 10,
  },
  deckCardCreatorName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  deckCardTimeAgo: {
    color: '#94A3B8',
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '500',
  },
  deckCardCaption: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 2,
    opacity: 0.95,
  },
  deckCardLikeBtn: {
    marginLeft: 8,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckCardLikeCount: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  deckResumeIndicator: {
    position: 'absolute',
    bottom: 84,
    left: 14,
    backgroundColor: 'rgba(22, 17, 41, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(224, 40, 125, 0.45)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    shadowColor: '#E0287D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 170,
    maxWidth: 215,
  },
  deckIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deckResumeDot: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  deckResumeText: {
    color: '#CBD5E1',
    fontSize: 11.5,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  centerPlayPauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
  },
  centerPlayPauseCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#E0287D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
  },
});
