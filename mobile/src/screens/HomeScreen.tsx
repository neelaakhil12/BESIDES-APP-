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
  MessageCircle,
  Send,
  Search,
  Bell,
  LayoutGrid,
  Video as VideoIcon,
  Volume2,
  VolumeX,
  Music,
  Check,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { CommentsModal } from './CommentsModal';
import { MOCK_VIDEOS } from '../services/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HomeScreenProps {
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
  onOpenChat?: () => void;
  onOpenProfile?: (userId: string) => void;
}

const feedVideos = [
  {
    id: 'reel-maya-1',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900',
    caption: 'Shooting a full vlog on just a gimbal...',
    musicTitle: 'Original audio • maya.films',
    likeCount: 48200,
    commentCount: 15,
    shareCount: 1300,
    isLiked: false,
    isFollowing: false,
    user: {
      id: 'maya.films',
      username: 'maya.films',
      fullName: 'Maya Films',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    },
    nextPreview: {
      thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      countLabel: '1/15',
    },
  },
  {
    id: 'reel-maya-2',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900',
    caption: 'When you try cooking after watching one reel 😂🍳 #Comedy #Food',
    musicTitle: 'Original audio • vamsi',
    likeCount: 15300,
    commentCount: 88,
    shareCount: 1200,
    isLiked: false,
    isFollowing: false,
    user: {
      id: 'vamsi',
      username: 'vamsi',
      fullName: 'Vamsi Krishna',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    },
    nextPreview: {
      thumbnailUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
      countLabel: '2/15',
    },
  },
  {
    id: 'reel-maya-3',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900',
    caption: 'Dancing under the neon lights ✨ #Dance #Vibe #Besides',
    musicTitle: 'Original audio • priya.patel',
    likeCount: 29400,
    commentCount: 412,
    shareCount: 2300,
    isLiked: false,
    isFollowing: true,
    user: {
      id: 'priya',
      username: 'priya.patel',
      fullName: 'Priya Patel',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    },
    nextPreview: {
      thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
      countLabel: '3/15',
    },
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenSearch,
  onOpenNotifications,
  onOpenChat,
  onOpenProfile,
}) => {
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'following' | 'for_you'>('for_you');
  const [videos, setVideos] = useState<any[]>(feedVideos);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [selectedVideoForComments, setSelectedVideoForComments] = useState<any | null>(null);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  const flatListRef = useRef<FlatList>(null);

  const toggleLike = (videoId: string, index: number) => {
    setVideos((prev) => {
      const updated = [...prev];
      const currentLiked = updated[index]?.isLiked;
      const count = updated[index]?.likeCount || 48200;
      updated[index] = {
        ...updated[index],
        isLiked: !currentLiked,
        likeCount: count + (currentLiked ? -1 : 1),
      };
      return updated;
    });
  };

  const toggleFollow = (index: number) => {
    setVideos((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        isFollowing: !updated[index]?.isFollowing,
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

  const scrollToPrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      flatListRef.current?.scrollToIndex({ index: prevIdx, animated: true });
    }
  };

  const renderVideoItem = ({ item, index }: { item: any; index: number }) => {
    const isFocused = index === currentIndex;
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

        {/* Soft gradient vignette over video */}
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.65)']}
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

        {/* Right Side: Action Column (Heart, Grid/Comment, Share, Camera, Next Card) */}
        <View style={styles.rightActionsColumn}>
          {/* 1. Like Heart */}
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => toggleLike(item.id, index)}
            activeOpacity={0.7}
          >
            <Heart
              size={28}
              color={item.isLiked ? '#EF4444' : '#FFFFFF'}
              fill={item.isLiked ? '#EF4444' : 'none'}
              strokeWidth={2}
            />
            <Text style={styles.actionText}>
              {item.likeCount > 999 ? `${(item.likeCount / 1000).toFixed(1)}K` : item.likeCount}
            </Text>
          </TouchableOpacity>

          {/* 2. Comments / Grid Rounded Square Button (with brand colors!) */}
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => setSelectedVideoForComments(item)}
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
            <Send size={24} color="#FFFFFF" strokeWidth={2} style={{ transform: [{ rotate: '-20deg' }] }} />
            <Text style={styles.actionText}>
              {item.shareCount > 999 ? `${(item.shareCount / 1000).toFixed(1)}K` : item.shareCount}
            </Text>
          </TouchableOpacity>

          {/* 4. Video Camera / Reply Icon */}
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => setSelectedVideoForComments(item)}
            activeOpacity={0.7}
          >
            <VideoIcon size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>

          {/* 5. Stacked Video Preview Deck Card (📹 1/15) */}
          {item.nextPreview && (
            <TouchableOpacity
              style={styles.nextPreviewDeck}
              onPress={scrollToNext}
              activeOpacity={0.85}
            >
              {/* Stack background layer */}
              <View style={styles.deckCardUnderlay} />
              {/* Main Preview Card */}
              <View style={styles.deckCardMain}>
                <Image
                  source={{ uri: item.nextPreview.thumbnailUrl }}
                  style={styles.deckThumbnail}
                />
                {/* 📹 1/15 Badge */}
                <View style={styles.deckBadge}>
                  <VideoIcon size={10} color="#FFFFFF" style={{ marginRight: 3 }} />
                  <Text style={styles.deckBadgeText}>{item.nextPreview.countLabel}</Text>
                </View>
                {/* Mini Creator Circle Badge */}
                <View style={styles.deckAvatarBadge}>
                  <Image
                    source={{ uri: item.user.avatarUrl }}
                    style={styles.deckAvatarImg}
                  />
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom Left: Creator Avatar, Username, Follow button, Caption, Music */}
        <View style={styles.bottomCreatorContainer}>
          {/* Creator Profile Row */}
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

            {/* Follow Button with Besides Brand Colors */}
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

          {/* Music Audio Row */}
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
      {/* 1. Top Header Bar (Exact match to screenshot: Logo Left | Following / For You Center | Search & Bell Right) */}
      <View style={styles.topHeaderBar}>
        {/* Left: 3D Transparent Logo */}
        <TouchableOpacity style={styles.logoCircleWrapper} activeOpacity={0.8}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.headerLogoImg}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Center: Segmented Switcher (Following | For You) */}
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

        {/* Right: Search & Bell Notification Circular Buttons */}
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

      {/* 2. Vertical Full-screen Reel Carousel */}
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

      {/* 3. Comments Modal with 10s Video Replies */}
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchTabActive: {
    overflow: 'hidden',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  activeTabGradient: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  inactiveTabText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 13,
    fontWeight: '600',
  },
  rightTopButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topCircleIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  flatList: {
    flex: 1,
  },
  videoContainer: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#000000',
  },
  muteButton: {
    position: 'absolute',
    top: 64,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  rightActionsColumn: {
    position: 'absolute',
    right: 14,
    bottom: 82,
    alignItems: 'center',
    zIndex: 20,
  },
  actionItem: {
    alignItems: 'center',
    marginBottom: 16,
  },
  commentGridBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E0287D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  nextPreviewDeck: {
    position: 'relative',
    width: 48,
    height: 64,
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckCardUnderlay: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 46,
    height: 60,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  deckCardMain: {
    width: 46,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    position: 'relative',
  },
  deckThumbnail: {
    width: '100%',
    height: '100%',
  },
  deckBadge: {
    position: 'absolute',
    top: 3,
    left: 3,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  deckBadgeText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: '800',
  },
  deckAvatarBadge: {
    position: 'absolute',
    bottom: 3,
    left: 3,
    width: 14,
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  deckAvatarImg: {
    width: '100%',
    height: '100%',
  },
  bottomCreatorContainer: {
    position: 'absolute',
    bottom: 78,
    left: 14,
    right: 88,
    zIndex: 20,
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
    fontSize: 14,
    fontWeight: '800',
    marginRight: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  followButtonGradient: {
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  captionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
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
    fontSize: 11.5,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
