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
import { Heart, MessageCircle, Share2, Music2, Plus, Volume2, VolumeX } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { CommentsModal } from './CommentsModal';
import api from '../services/api';

interface HomeScreenProps {
  onOpenChat: () => void;
  onOpenProfile: (userId: string) => void;
}

const initialDemoVideos = [
  {
    id: 'demo-video-1',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
    caption: 'Vibes on point 🌸 #Travel #Vibe #Besides',
    duration: 15.0,
    likeCount: 12400,
    commentCount: 1248,
    shareCount: 642,
    isLiked: false,
    isFollowing: false,
    user: {
      id: 'harshitha',
      username: 'harshitha',
      fullName: 'Harshitha Rao',
      profile: {
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      },
    },
  },
  {
    id: 'demo-video-2',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800',
    caption: 'When you try cooking after watching one reel 😂🍳 #Comedy #Food',
    duration: 14.0,
    likeCount: 15300,
    commentCount: 880,
    shareCount: 1200,
    isLiked: false,
    isFollowing: false,
    user: {
      id: 'vamsi',
      username: 'vamsi',
      fullName: 'Vamsi Krishna',
      profile: {
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      },
    },
  },
  {
    id: 'demo-video-3',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800',
    caption: 'Dancing under the neon lights ✨ #Dance #Vibe',
    duration: 12.0,
    likeCount: 8900,
    commentCount: 410,
    shareCount: 290,
    isLiked: false,
    isFollowing: false,
    user: {
      id: 'priya',
      username: 'priya',
      fullName: 'Priya Patel',
      profile: {
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      },
    },
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenChat, onOpenProfile }) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'for_you' | 'following'>('for_you');
  const [videos, setVideos] = useState<any[]>(initialDemoVideos);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [selectedVideoForComments, setSelectedVideoForComments] = useState<any | null>(null);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  // Fetch feed videos
  const fetchFeed = async () => {
    try {
      const res = await api.get(`/videos/feed?type=${activeTab}`);
      if (res.data?.success && res.data.videos?.length > 0) {
        setVideos(res.data.videos);
      }
    } catch (err) {
      // Keep initial demo videos
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [activeTab]);

  const toggleLike = async (videoId: string, index: number) => {
    try {
      const res = await api.post(`/likes/${videoId}/toggle`);
      if (res.data?.success) {
        setVideos((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            isLiked: res.data.isLiked,
            likeCount: res.data.likeCount,
          };
          return updated;
        });
      }
    } catch {
      setVideos((prev) => {
        const updated = [...prev];
        const currentLiked = updated[index]?.isLiked;
        updated[index] = {
          ...updated[index],
          isLiked: !currentLiked,
          likeCount: (updated[index]?.likeCount || 0) + (currentLiked ? -1 : 1),
        };
        return updated;
      });
    }
  };

  const toggleFollow = async (userId: string, index: number) => {
    try {
      const res = await api.post(`/users/${userId}/follow`);
      if (res.data?.success) {
        setVideos((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            isFollowing: res.data.isFollowing,
          };
          return updated;
        });
      }
    } catch {
      setVideos((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          isFollowing: !updated[index]?.isFollowing,
        };
        return updated;
      });
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const cardHeight = containerHeight > 0 ? containerHeight : 660;

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        const h = e.nativeEvent.layout.height;
        if (h > 0 && h !== containerHeight) {
          setContainerHeight(h);
        }
      }}
    >
      {/* Top Segmented Tabs: For You | Following */}
      <View style={styles.topTabsContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('for_you')}
          style={[styles.tabButton, activeTab === 'for_you' && styles.activeTabBorder]}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'for_you' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)' },
            ]}
          >
            For You
          </Text>
        </TouchableOpacity>

        <View style={styles.tabDivider} />

        <TouchableOpacity
          onPress={() => setActiveTab('following')}
          style={[styles.tabButton, activeTab === 'following' && styles.activeTabBorder]}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'following' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)' },
            ]}
          >
            Following
          </Text>
        </TouchableOpacity>
      </View>

      {/* Vertical Video Feed */}
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 70 }}
        getItemLayout={(data, index) => ({
          length: cardHeight,
          offset: cardHeight * index,
          index,
        })}
        renderItem={({ item, index }) => {
          const isActive = index === currentIndex;

          return (
            <View style={[styles.videoCard, { height: cardHeight }]}>
              {/* Background Poster Image (Guarantees visible image immediately) */}
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
                shouldPlay={isActive}
                isLooping
                isMuted={isMuted}
                useNativeControls={false}
              />

              {/* Tap to mute/unmute overlay */}
              <TouchableOpacity
                style={styles.muteButton}
                onPress={() => setIsMuted(!isMuted)}
                activeOpacity={0.7}
              >
                {isMuted ? (
                  <VolumeX size={18} color="#FFFFFF" />
                ) : (
                  <Volume2 size={18} color="#FFFFFF" />
                )}
              </TouchableOpacity>

              {/* Right Action Column */}
              <View style={styles.rightActionColumn}>
                {/* Creator Avatar with Follow (+) */}
                <View style={styles.avatarActionWrapper}>
                  <TouchableOpacity
                    onPress={() => onOpenProfile(item.user.id)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{
                        uri:
                          item.user.profile?.avatarUrl ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
                      }}
                      style={styles.creatorAvatar}
                    />
                  </TouchableOpacity>
                  {!item.isFollowing && (
                    <TouchableOpacity
                      style={styles.followBadge}
                      onPress={() => toggleFollow(item.user.id, index)}
                      activeOpacity={0.8}
                    >
                      <Plus size={10} color="#FFFFFF" strokeWidth={3} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Like Button */}
                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={() => toggleLike(item.id, index)}
                  activeOpacity={0.7}
                >
                  <Heart
                    size={26}
                    color={item.isLiked ? '#E0287D' : '#FFFFFF'}
                    fill={item.isLiked ? '#E0287D' : 'transparent'}
                  />
                  <Text style={styles.actionCount}>
                    {item.likeCount > 1000
                      ? `${(item.likeCount / 1000).toFixed(1)}K`
                      : item.likeCount}
                  </Text>
                </TouchableOpacity>

                {/* Comment Button */}
                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={() => setSelectedVideoForComments(item)}
                  activeOpacity={0.7}
                >
                  <MessageCircle size={26} color="#FFFFFF" />
                  <Text style={styles.actionCount}>
                    {item.commentCount > 1000
                      ? `${(item.commentCount / 1000).toFixed(1)}K`
                      : item.commentCount}
                  </Text>
                </TouchableOpacity>

                {/* Share Button (Fully visible!) */}
                <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
                  <Share2 size={24} color="#FFFFFF" />
                  <Text style={styles.actionCount}>{item.shareCount}</Text>
                </TouchableOpacity>
              </View>

              {/* Bottom-Left Information Overlay */}
              <View style={styles.bottomInfoOverlay}>
                {/* Creator Handle & Follow Pill */}
                <View style={styles.creatorRow}>
                  <TouchableOpacity
                    onPress={() => onOpenProfile(item.user.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.creatorUsername}>@{item.user.username}</Text>
                  </TouchableOpacity>

                  {!item.isFollowing ? (
                    <TouchableOpacity
                      style={styles.followPillButton}
                      onPress={() => toggleFollow(item.user.id, index)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.followPillText}>Follow</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.followingPill}>
                      <Text style={styles.followingPillText}>Following</Text>
                    </View>
                  )}
                </View>

                {/* Caption & Hashtags */}
                <Text style={styles.captionText} numberOfLines={2}>
                  {item.caption}
                </Text>

                {/* Audio Ticker */}
                <View style={styles.audioRow}>
                  <Music2 size={12} color="#FFFFFF" style={styles.musicIcon} />
                  <Text style={styles.audioText} numberOfLines={1}>
                    Original Sound - @{item.user.username}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* Video Comments & Video Reply (<= 10s) Bottom Sheet */}
      {selectedVideoForComments && (
        <CommentsModal
          video={selectedVideoForComments}
          onClose={() => setSelectedVideoForComments(null)}
          onCommentAdded={() => {
            fetchFeed();
          }}
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
    height: '100%',
    width: '100%',
  },
  topTabsContainer: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  tabButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  activeTabBorder: {
    borderBottomWidth: 2.5,
    borderBottomColor: '#E0287D',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tabDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  videoCard: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#000000',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  muteButton: {
    position: 'absolute',
    top: 50,
    right: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  rightActionColumn: {
    position: 'absolute',
    right: 10,
    bottom: 12, // Positioned safely above bottom nav
    alignItems: 'center',
    zIndex: 20,
  },
  avatarActionWrapper: {
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  creatorAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  followBadge: {
    position: 'absolute',
    bottom: -5,
    backgroundColor: '#E0287D',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  actionItem: {
    alignItems: 'center',
    marginVertical: 8,
  },
  actionCount: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bottomInfoOverlay: {
    paddingHorizontal: 14,
    paddingBottom: 14, // Positioned safely above bottom nav
    width: '82%',
    zIndex: 20,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  creatorUsername: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginRight: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  followPillButton: {
    backgroundColor: '#E0287D',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  followPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  followingPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  followingPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  captionText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  musicIcon: {
    marginRight: 6,
  },
  audioText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
