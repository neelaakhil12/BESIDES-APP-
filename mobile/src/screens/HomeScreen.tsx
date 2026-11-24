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
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { CommentsModal } from './CommentsModal';
import { MOCK_DECK_REELS } from '../services/mockData';

const CARD_WIDTH = 270;
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

  // Active index when browsing in 3D Card Deck mode
  const [deckActiveIndex, setDeckActiveIndex] = useState(0);

  // Mute state
  const [isMuted, setIsMuted] = useState(true);

  // Comments modal
  const [selectedVideoForComments, setSelectedVideoForComments] = useState<any | null>(null);

  // Screen container height
  const [containerHeight, setContainerHeight] = useState<number>(0);

  const flatListRef = useRef<FlatList>(null);
  const deckListRef = useRef<FlatList>(null);

  // Open 3D Card Deck Mode
  const handleOpenDeckMode = () => {
    setDeckActiveIndex(currentIndex);
    setIsDeckMode(true);
    setTimeout(() => {
      deckListRef.current?.scrollToIndex({
        index: currentIndex,
        animated: false,
      });
    }, 50);
  };

  // Close Deck Mode and resume full-screen playback of the selected card
  const handleSelectReelFromDeck = (index: number) => {
    setCurrentIndex(index);
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
          shouldPlay={isFocused}
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

        {/* Floating Mute Button */}
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

        {/* Right Side: Action Column */}
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

          {/* 2. Comments / Grid Button -> Opens 3D Deck Carousel */}
          <TouchableOpacity
            style={styles.actionItem}
            onPress={handleOpenDeckMode}
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
            <Text style={styles.actionText}>{item.commentCount}</Text>
          </TouchableOpacity>

          {/* 3. Share Paper Airplane */}
          <TouchableOpacity
            style={styles.actionItem}
            onPress={onOpenChat}
            activeOpacity={0.7}
          >
            <Send
              size={24}
              color="#FFFFFF"
              strokeWidth={2}
              style={{ transform: [{ rotate: '-20deg' }] }}
            />
            <Text style={styles.actionText}>
              {item.shareCount > 999
                ? `${(item.shareCount / 1000).toFixed(1)}K`
                : item.shareCount}
            </Text>
          </TouchableOpacity>

          {/* 4. Video Camera / Comment Button */}
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => setSelectedVideoForComments(item)}
            activeOpacity={0.7}
          >
            <VideoIcon size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>

          {/* 5. Stacked Video Preview Deck Card (Tapping triggers 3D Card Deck Mode!) */}
          <TouchableOpacity
            style={styles.nextPreviewDeck}
            onPress={handleOpenDeckMode}
            activeOpacity={0.85}
          >
            {/* Stack 3D Layer Underlay */}
            <View style={styles.deckCardUnderlay} />
            {/* Main Preview Card */}
            <View style={styles.deckCardMain}>
              <Image
                source={{ uri: nextReel?.thumbnailUrl || item.thumbnailUrl }}
                style={styles.deckThumbnail}
              />
              {/* Badge: 📹 index/15 */}
              <View style={styles.deckBadge}>
                <VideoIcon size={10} color="#FFFFFF" style={{ marginRight: 3 }} />
                <Text style={styles.deckBadgeText}>{`${currentIndex + 1}/15`}</Text>
              </View>
              {/* Mini Creator Avatar Badge */}
              <View style={styles.deckAvatarBadge}>
                <Image
                  source={{ uri: nextReel?.user?.avatarUrl || item.user.avatarUrl }}
                  style={styles.deckAvatarImg}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom Left: Creator Info, Caption, Music Row */}
        <View style={styles.bottomCreatorContainer}>
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
      </View>
    );
  };

  // =========================================================================
  // 2. RENDER 3D HORIZONTAL CARD DECK ITEM (Matching user's reference video)
  // =========================================================================
  const renderDeckCardItem = ({ item, index }: { item: any; index: number }) => {
    const isActive = index === deckActiveIndex;

    return (
      <View
        style={[
          styles.deckCardSlideWrapper,
          {
            width: CARD_WIDTH + 16,
            opacity: isActive ? 1 : 0.65,
            transform: [{ scale: isActive ? 1 : 0.9 }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.floatingDeckCard}
          onPress={() => handleSelectReelFromDeck(index)}
          activeOpacity={0.9}
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
              shouldPlay={true}
              isLooping
              isMuted={isMuted}
              useNativeControls={false}
            />
          )}

          {/* Card Vignette */}
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.85)']}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />

          {/* Card Top Bar (← @username + Mute Button) */}
          <View style={styles.deckCardTopBar}>
            <TouchableOpacity
              style={styles.deckCardUserRow}
              onPress={() => setIsDeckMode(false)}
              activeOpacity={0.8}
            >
              <ArrowLeft size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.deckCardUsername}>@{item.user.username}</Text>
            </TouchableOpacity>

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

          {/* Card Bottom Meta (Avatar, Caption, Likes) */}
          <View style={styles.deckCardBottomMeta}>
            <View style={styles.deckCardCreatorRow}>
              <Image source={{ uri: item.user.avatarUrl }} style={styles.deckCardAvatar} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.deckCardCreatorName}>{item.user.username}</Text>
                  <Text style={styles.deckCardTimeAgo}>• {item.timeAgo}</Text>
                </View>
                <Text style={styles.deckCardCaption} numberOfLines={2}>
                  {item.caption}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => toggleLike(index)}
                style={styles.deckCardLikeBtn}
              >
                <Heart
                  size={20}
                  color={item.isLiked ? '#EF4444' : '#FFFFFF'}
                  fill={item.isLiked ? '#EF4444' : 'none'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        const { height } = e.nativeEvent.layout;
        if (height > 0 && height !== containerHeight) {
          setContainerHeight(height);
        }
      }}
    >
      {/* 1. TOP HEADER BAR */}
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

      {/* 2. FULL-SCREEN VERTICAL REEL FEED */}
      {!isDeckMode && (
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
            setCurrentIndex(index);
          }}
          snapToInterval={containerHeight > 0 ? containerHeight : 660}
          snapToAlignment="start"
          decelerationRate="fast"
          style={styles.flatList}
        />
      )}

      {/* 3. 3D HORIZONTAL CARD DECK CAROUSEL MODE (Activated on Preview/Grid tap) */}
      {isDeckMode && (
        <View style={styles.deckModeOverlay}>
          {/* Dark Backdrop */}
          <View style={styles.deckBackdropDimmer} />

          {/* Left Arrow Button */}
          {deckActiveIndex > 0 && (
            <TouchableOpacity
              style={[styles.deckArrowBtn, { left: 8 }]}
              onPress={() => setDeckActiveIndex((prev) => Math.max(0, prev - 1))}
              activeOpacity={0.7}
            >
              <ChevronLeft size={22} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          )}

          {/* Right Arrow Button */}
          {deckActiveIndex < videos.length - 1 && (
            <TouchableOpacity
              style={[styles.deckArrowBtn, { right: 8 }]}
              onPress={() => setDeckActiveIndex((prev) => Math.min(videos.length - 1, prev + 1))}
              activeOpacity={0.7}
            >
              <ChevronRight size={22} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          )}

          {/* 3D Cards Centered Stage */}
          <View style={styles.deckStageContainer}>
            {/* Left Peeking Sibling Card */}
            {deckActiveIndex > 0 ? (
              <TouchableOpacity
                style={styles.sideDeckCardLeft}
                onPress={() => setDeckActiveIndex((prev) => Math.max(0, prev - 1))}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: videos[deckActiveIndex - 1]?.thumbnailUrl }}
                  style={StyleSheet.absoluteFillObject}
                  resizeMode="cover"
                />
                <View style={styles.sideCardDimmer} />
              </TouchableOpacity>
            ) : (
              <View style={styles.sideCardPlaceholder} />
            )}

            {/* Active Center 3D Card */}
            {videos[deckActiveIndex] && (
              <TouchableOpacity
                style={styles.floatingCenterDeckCard}
                onPress={() => handleSelectReelFromDeck(deckActiveIndex)}
                activeOpacity={0.92}
              >
                <Image
                  source={{ uri: videos[deckActiveIndex].thumbnailUrl }}
                  style={StyleSheet.absoluteFillObject}
                  resizeMode="cover"
                />

                <Video
                  source={{ uri: videos[deckActiveIndex].videoUrl }}
                  style={StyleSheet.absoluteFillObject}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={true}
                  isLooping
                  isMuted={isMuted}
                  useNativeControls={false}
                />

                <LinearGradient
                  colors={['rgba(0,0,0,0.65)', 'transparent', 'rgba(0,0,0,0.85)']}
                  style={StyleSheet.absoluteFillObject}
                  pointerEvents="none"
                />

                {/* Card Top: ← @username and Mute Toggle */}
                <View style={styles.deckCardTopBar}>
                  <TouchableOpacity
                    style={styles.deckCardUserRow}
                    onPress={() => setIsDeckMode(false)}
                    activeOpacity={0.8}
                  >
                    <ArrowLeft size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.deckCardUsername}>
                      @{videos[deckActiveIndex].user.username}
                    </Text>
                  </TouchableOpacity>

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

                {/* Card Bottom Meta */}
                <View style={styles.deckCardBottomMeta}>
                  <View style={styles.deckCardCreatorRow}>
                    <Image
                      source={{ uri: videos[deckActiveIndex].user.avatarUrl }}
                      style={styles.deckCardAvatar}
                    />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.deckCardCreatorName}>
                          {videos[deckActiveIndex].user.username}
                        </Text>
                        <Text style={styles.deckCardTimeAgo}>
                          • {videos[deckActiveIndex].timeAgo || '5d'}
                        </Text>
                      </View>
                      <Text style={styles.deckCardCaption} numberOfLines={2}>
                        {videos[deckActiveIndex].caption}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => toggleLike(deckActiveIndex)}
                      style={styles.deckCardLikeBtn}
                    >
                      <Heart
                        size={22}
                        color={videos[deckActiveIndex].isLiked ? '#EF4444' : '#FFFFFF'}
                        fill={videos[deckActiveIndex].isLiked ? '#EF4444' : 'none'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {/* Right Peeking Sibling Card */}
            {deckActiveIndex < videos.length - 1 ? (
              <TouchableOpacity
                style={styles.sideDeckCardRight}
                onPress={() => setDeckActiveIndex((prev) => Math.min(videos.length - 1, prev + 1))}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: videos[deckActiveIndex + 1]?.thumbnailUrl }}
                  style={StyleSheet.absoluteFillObject}
                  resizeMode="cover"
                />
                <View style={styles.sideCardDimmer} />
              </TouchableOpacity>
            ) : (
              <View style={styles.sideCardPlaceholder} />
            )}
          </View>

          {/* Bottom Deck Indicator: "1/15 • Tap the Reel to resume • 0:03" */}
          <TouchableOpacity
            style={styles.deckResumeIndicator}
            onPress={() => handleSelectReelFromDeck(deckActiveIndex)}
            activeOpacity={0.8}
          >
            <Text style={styles.deckResumeText}>
              <Text style={{ fontWeight: '900', color: '#FFFFFF' }}>
                {deckActiveIndex + 1}/15
              </Text>
              {'  •  Tap the Reel to resume  •  0:03'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 4. COMMENTS MODAL */}
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

  // RIGHT ACTIONS COLUMN
  rightActionsColumn: {
    position: 'absolute',
    right: 14,
    bottom: 90,
    alignItems: 'center',
    zIndex: 20,
    gap: 16,
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

  // 3D STACKED PREVIEW DECK BUTTON
  nextPreviewDeck: {
    width: 58,
    height: 74,
    position: 'relative',
    marginTop: 6,
  },
  deckCardUnderlay: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 58,
    height: 74,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    transform: [{ rotate: '5deg' }],
  },
  deckCardMain: {
    width: 58,
    height: 74,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    backgroundColor: '#1E1836',
    position: 'relative',
  },
  deckThumbnail: {
    width: '100%',
    height: '100%',
  },
  deckBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  deckBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  deckAvatarBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: '#FFFFFF',
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
    right: 90,
    zIndex: 15,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
    backgroundColor: '#000000',
    zIndex: 150,
    justifyContent: 'center',
  },
  deckBackdropDimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 8, 20, 0.94)',
  },
  // 3D STAGE CONTAINER & CARDS
  deckStageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 6,
  },
  sideCardPlaceholder: {
    width: 28,
  },
  sideDeckCardLeft: {
    width: 38,
    height: 380,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#1E1836',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: -16,
    opacity: 0.5,
    transform: [{ scale: 0.88 }],
    zIndex: 5,
  },
  sideDeckCardRight: {
    width: 38,
    height: 380,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#1E1836',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: -16,
    opacity: 0.5,
    transform: [{ scale: 0.88 }],
    zIndex: 5,
  },
  sideCardDimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  floatingCenterDeckCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#161129',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'rgba(224, 40, 125, 0.45)',
    shadowColor: '#E0287D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 12,
    zIndex: 10,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  deckCardUsername: {
    color: '#FFFFFF',
    fontSize: 13,
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
  },

  deckArrowBtn: {
    position: 'absolute',
    top: '48%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  deckResumeIndicator: {
    position: 'absolute',
    bottom: 84,
    alignSelf: 'center',
    backgroundColor: 'rgba(22, 17, 41, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(224, 40, 125, 0.4)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#E0287D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 100,
  },
  deckResumeText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
});
