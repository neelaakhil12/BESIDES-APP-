import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  FlatList,
  Platform,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import {
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  Music,
  Plus,
  Check,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { MOCK_VIDEOS } from '../services/mockData';
import { CommentsModal } from './CommentsModal';

interface ReelsScreenProps {
  onOpenChat?: () => void;
  onOpenProfile?: (userId: string) => void;
}

export const ReelsScreen: React.FC<ReelsScreenProps> = ({ onOpenChat, onOpenProfile }) => {
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'for_you' | 'following'>('for_you');
  const [videos, setVideos] = useState<any[]>(MOCK_VIDEOS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [selectedVideoForComments, setSelectedVideoForComments] = useState<any | null>(null);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  const toggleLike = (videoId: string, index: number) => {
    setVideos((prev) => {
      const updated = [...prev];
      const currentLiked = updated[index]?.isLiked;
      const count = typeof updated[index]?.likeCount === 'number' ? updated[index].likeCount : 15300;
      updated[index] = {
        ...updated[index],
        isLiked: !currentLiked,
        likeCount: count + (currentLiked ? -1 : 1),
      };
      return updated;
    });
  };

  const toggleFollow = (userId: string, index: number) => {
    setVideos((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        isFollowing: !updated[index]?.isFollowing,
      };
      return updated;
    });
  };

  const renderVideoItem = ({ item, index }: { item: any; index: number }) => {
    const isFocused = index === currentIndex;
    const cardHeight = containerHeight > 0 ? containerHeight : 660;

    return (
      <View style={[styles.videoContainer, { height: cardHeight }]}>
        {/* Background Poster / Video Preview */}
        <Image
          source={{ uri: item.thumbnailUrl }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />

        {/* Video Player */}
        <Video
          source={{ uri: item.videoUrl }}
          style={StyleSheet.absoluteFillObject}
          resizeMode={ResizeMode.COVER}
          shouldPlay={isFocused}
          isLooping
          isMuted={isMuted}
          useNativeControls={false}
        />

        {/* Overlay Dark Vignette */}
        <View style={styles.gradientOverlay} />

        {/* Top Floating Mute Toggle */}
        <TouchableOpacity
          style={styles.muteButton}
          onPress={() => setIsMuted(!isMuted)}
          activeOpacity={0.8}
        >
          {isMuted ? (
            <VolumeX size={18} color="#FFFFFF" />
          ) : (
            <Volume2 size={18} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        {/* Right Action Icons Column */}
        <View style={styles.rightActionsColumn}>
          {/* Creator Profile Avatar with (+) Follow badge */}
          <TouchableOpacity
            style={styles.avatarActionContainer}
            onPress={() => onOpenProfile && onOpenProfile(item.user.username)}
            activeOpacity={0.85}
          >
            <Image source={{ uri: item.user.avatarUrl }} style={styles.actionAvatar} />
            <TouchableOpacity
              style={[
                styles.followBadge,
                item.isFollowing && { backgroundColor: '#10B981' },
              ]}
              onPress={() => toggleFollow(item.user.id, index)}
            >
              {item.isFollowing ? (
                <Check size={10} color="#FFFFFF" strokeWidth={3} />
              ) : (
                <Plus size={10} color="#FFFFFF" strokeWidth={3} />
              )}
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Like Heart */}
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => toggleLike(item.id, index)}
            activeOpacity={0.7}
          >
            <Heart
              size={28}
              color={item.isLiked ? '#EF4444' : '#FFFFFF'}
              fill={item.isLiked ? '#EF4444' : 'rgba(0,0,0,0.3)'}
              strokeWidth={1.8}
            />
            <Text style={styles.actionText}>
              {typeof item.likeCount === 'number'
                ? item.likeCount > 999
                  ? `${(item.likeCount / 1000).toFixed(1)}K`
                  : item.likeCount
                : item.likeCount || '15.3K'}
            </Text>
          </TouchableOpacity>

          {/* Comments Icon */}
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => setSelectedVideoForComments(item)}
            activeOpacity={0.7}
          >
            <MessageCircle
              size={28}
              color="#FFFFFF"
              fill="rgba(0,0,0,0.3)"
              strokeWidth={1.8}
            />
            <Text style={styles.actionText}>{item.commentCount || 880}</Text>
          </TouchableOpacity>

          {/* Share Icon */}
          <TouchableOpacity
            style={styles.actionItem}
            onPress={onOpenChat}
            activeOpacity={0.7}
          >
            <Share2 size={26} color="#FFFFFF" strokeWidth={1.8} />
            <Text style={styles.actionText}>{item.shareCount || 1200}</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Left Creator Details & Music */}
        <View style={styles.bottomDetailsContainer}>
          <View style={styles.creatorRow}>
            <Text style={styles.usernameText}>@{item.user.username}</Text>
            <TouchableOpacity
              style={[
                styles.inlineFollowButton,
                item.isFollowing && { backgroundColor: 'rgba(255,255,255,0.2)' },
              ]}
              onPress={() => toggleFollow(item.user.id, index)}
            >
              <Text style={styles.inlineFollowText}>
                {item.isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.captionText} numberOfLines={2}>
            {item.caption}
          </Text>

          <View style={styles.musicRow}>
            <Music size={13} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.musicText} numberOfLines={1}>
              Original Sound - @{item.user.username}
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
      {/* Top Floating Segmented Switcher (For You | Following) */}
      <View style={styles.topTabBar}>
        <TouchableOpacity
          onPress={() => setActiveTab('for_you')}
          style={styles.topTabItem}
        >
          <Text
            style={[
              styles.topTabText,
              activeTab === 'for_you' && styles.topTabTextActive,
            ]}
          >
            For You
          </Text>
          {activeTab === 'for_you' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>

        <Text style={styles.tabDivider}>|</Text>

        <TouchableOpacity
          onPress={() => setActiveTab('following')}
          style={styles.topTabItem}
        >
          <Text
            style={[
              styles.topTabText,
              activeTab === 'following' && styles.topTabTextActive,
            ]}
          >
            Following
          </Text>
          {activeTab === 'following' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Vertical Video Carousel */}
      <FlatList
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

      {/* Comments & 10s Video Replies Modal */}
      {selectedVideoForComments && (
        <CommentsModal
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
  topTabBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 12 : 8,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topTabItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  topTabText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  topTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  activeTabIndicator: {
    marginTop: 4,
    height: 2.5,
    width: 24,
    backgroundColor: '#E0287D',
    borderRadius: 2,
  },
  tabDivider: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 14,
    marginHorizontal: 4,
  },
  flatList: {
    flex: 1,
  },
  videoContainer: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#000000',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  muteButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  rightActionsColumn: {
    position: 'absolute',
    right: 12,
    bottom: 80,
    alignItems: 'center',
    zIndex: 20,
  },
  avatarActionContainer: {
    marginBottom: 20,
    position: 'relative',
    alignItems: 'center',
  },
  actionAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  followBadge: {
    position: 'absolute',
    bottom: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E0287D',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  actionItem: {
    alignItems: 'center',
    marginBottom: 18,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomDetailsContainer: {
    position: 'absolute',
    bottom: 76,
    left: 14,
    right: 80,
    zIndex: 20,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  usernameText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginRight: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  inlineFollowButton: {
    backgroundColor: '#E0287D',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  inlineFollowText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  captionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
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
  },
});
