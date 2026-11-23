import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Plus,
  Heart,
  MessageCircle,
  Send,
  MoreHorizontal,
  Lock,
  X,
  Play,
  Flame,
  Users,
  TrendingUp,
  MapPin,
  Check,
  UserPlus,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { MOCK_STORIES, MOCK_SUGGESTED_USERS, MOCK_POSTS } from '../services/mockData';
import { CommentsModal } from './CommentsModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FeedHomeScreenProps {
  onOpenCreate?: () => void;
  onOpenNotifications?: () => void;
  onOpenChat?: () => void;
  onOpenProfile?: (userId: string) => void;
  onOpenExplore?: () => void;
  onOpenMap?: () => void;
}

export const FeedHomeScreen: React.FC<FeedHomeScreenProps> = ({
  onOpenCreate,
  onOpenNotifications,
  onOpenChat,
  onOpenProfile,
  onOpenExplore,
  onOpenMap,
}) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();

  const [activeFilter, setActiveFilter] = useState<'for_you' | 'following' | 'trending' | 'nearby'>('for_you');
  const [suggestedUsers, setSuggestedUsers] = useState(MOCK_SUGGESTED_USERS);
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [selectedPostForComments, setSelectedPostForComments] = useState<any | null>(null);

  const toggleFollowSuggested = (id: string) => {
    setSuggestedUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isFollowing: !u.isFollowing } : u))
    );
  };

  const removeSuggested = (id: string) => {
    setSuggestedUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const toggleLikePost = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newLiked = !p.isLiked;
          return {
            ...p,
            isLiked: newLiked,
            likeCount: p.likeCount + (newLiked ? 1 : -1),
          };
        }
        return p;
      })
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. Bright Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onOpenCreate} style={styles.topBarButton} activeOpacity={0.7}>
          <Plus size={26} color="#FFFFFF" strokeWidth={2.4} />
        </TouchableOpacity>

        {/* Center: Glowing Beside Logo + Title */}
        <View style={styles.brandTitleContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <Text style={styles.brandTitleText}>Besides</Text>
        </View>

        {/* Right: Heart Notifications */}
        <TouchableOpacity
          onPress={onOpenNotifications || onOpenChat}
          style={styles.topBarButton}
          activeOpacity={0.7}
        >
          <View style={styles.heartWrapper}>
            <Heart size={24} color="#FFFFFF" strokeWidth={2} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Vibrant Stories Tray */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesContainer}
        >
          {MOCK_STORIES.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.storyItem}
              activeOpacity={0.8}
              onPress={() => item.isUser && onOpenCreate ? onOpenCreate() : null}
            >
              {item.isUser ? (
                <View style={styles.yourStoryWrapper}>
                  <Image
                    source={{ uri: user?.profile?.avatarUrl || item.avatarUrl }}
                    style={styles.storyAvatar}
                  />
                  <View style={styles.yourStoryPlusBadge}>
                    <Plus size={11} color="#FFFFFF" strokeWidth={3.5} />
                  </View>
                </View>
              ) : (
                <LinearGradient
                  colors={['#FF5E3A', '#FF2A6D', '#9B51E0', '#00F2FE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.storyGradientRing}
                >
                  <View style={styles.storyAvatarInner}>
                    <Image source={{ uri: item.avatarUrl }} style={styles.storyAvatar} />
                  </View>
                </LinearGradient>
              )}
              <Text style={styles.storyUsername} numberOfLines={1}>
                {item.username}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 3. Welcome to Besides - Glowing Hero Banner (Exact Match to User's Circle) */}
        <View style={styles.bannerOuterContainer}>
          <LinearGradient
            colors={['#180D38', '#2A115E', '#4A147E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBannerCard}
          >
            {/* Banner Left Content */}
            <View style={styles.bannerLeftContent}>
              <Text style={styles.bannerTitle}>
                Welcome to <Text style={{ color: '#00F2FE' }}>Be</Text><Text style={{ color: '#FF2A6D' }}>sides</Text>
              </Text>
              <Text style={styles.bannerSubtitle}>
                Follow people, watch videos, and discover content you'll love.
              </Text>

              {/* "▶ Explore Now >" Button */}
              <TouchableOpacity
                style={styles.exploreNowBtnWrapper}
                onPress={onOpenExplore}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#3B82F6', '#8B5CF6', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.exploreNowGradient}
                >
                  <Play size={12} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.exploreNowText}>Explore Now</Text>
                  <Text style={styles.exploreNowArrow}> ›</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Banner Right 3D Glossy Logo */}
            <View style={styles.bannerLogoContainer}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.banner3DLogo}
                resizeMode="contain"
              />
            </View>
          </LinearGradient>

          {/* Filter Pills Underneath Banner (For You | Following | Trending | Nearby) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterPillsScroll}
          >
            {/* 1. For You */}
            <TouchableOpacity
              onPress={() => setActiveFilter('for_you')}
              activeOpacity={0.85}
              style={styles.filterPillWrapper}
            >
              {activeFilter === 'for_you' ? (
                <LinearGradient
                  colors={['#8B5CF6', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.activePillGradient}
                >
                  <Flame size={14} color="#FFFFFF" style={{ marginRight: 5 }} />
                  <Text style={styles.activePillText}>For You</Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactivePill}>
                  <Flame size={14} color="#C4B5FD" style={{ marginRight: 5 }} />
                  <Text style={styles.inactivePillText}>For You</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* 2. Following */}
            <TouchableOpacity
              onPress={() => setActiveFilter('following')}
              activeOpacity={0.85}
              style={styles.filterPillWrapper}
            >
              {activeFilter === 'following' ? (
                <LinearGradient
                  colors={['#8B5CF6', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.activePillGradient}
                >
                  <Users size={14} color="#FFFFFF" style={{ marginRight: 5 }} />
                  <Text style={styles.activePillText}>Following</Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactivePill}>
                  <Users size={14} color="#C4B5FD" style={{ marginRight: 5 }} />
                  <Text style={styles.inactivePillText}>Following</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* 3. Trending */}
            <TouchableOpacity
              onPress={() => setActiveFilter('trending')}
              activeOpacity={0.85}
              style={styles.filterPillWrapper}
            >
              {activeFilter === 'trending' ? (
                <LinearGradient
                  colors={['#8B5CF6', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.activePillGradient}
                >
                  <TrendingUp size={14} color="#FFFFFF" style={{ marginRight: 5 }} />
                  <Text style={styles.activePillText}>Trending</Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactivePill}>
                  <TrendingUp size={14} color="#C4B5FD" style={{ marginRight: 5 }} />
                  <Text style={styles.inactivePillText}>Trending</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* 4. Nearby (Links to 300m Discovery Map) */}
            <TouchableOpacity
              onPress={() => {
                setActiveFilter('nearby');
                if (onOpenMap) onOpenMap();
              }}
              activeOpacity={0.85}
              style={styles.filterPillWrapper}
            >
              {activeFilter === 'nearby' ? (
                <LinearGradient
                  colors={['#8B5CF6', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.activePillGradient}
                >
                  <MapPin size={14} color="#FFFFFF" style={{ marginRight: 5 }} />
                  <Text style={styles.activePillText}>Nearby</Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactivePill}>
                  <MapPin size={14} color="#C4B5FD" style={{ marginRight: 5 }} />
                  <Text style={styles.inactivePillText}>Nearby</Text>
                </View>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* 4. "Suggested for you" Section (Exact Match to User's Screenshot) */}
        {suggestedUsers.length > 0 && (
          <View style={styles.suggestedSection}>
            <View style={styles.suggestedSectionHeader}>
              <Text style={styles.suggestedSectionTitle}>Suggested for you</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestedScroll}
            >
              {suggestedUsers.map((sug) => (
                <LinearGradient
                  key={sug.id}
                  colors={['#231247', '#341865', '#200D3E']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.suggestedCardGradient}
                >
                  {/* Close 'X' */}
                  <TouchableOpacity
                    style={styles.closeCardBtn}
                    onPress={() => removeSuggested(sug.id)}
                  >
                    <X size={14} color="#A78BFA" />
                  </TouchableOpacity>

                  {/* Avatar with subtle glow */}
                  <View style={styles.suggestedAvatarRing}>
                    <Image source={{ uri: sug.avatarUrl }} style={styles.suggestedAvatar} />
                  </View>

                  <Text style={styles.suggestedUsername} numberOfLines={1}>
                    {sug.username}
                  </Text>
                  <Text style={styles.suggestedFullName} numberOfLines={1}>
                    {sug.fullName}
                  </Text>

                  {/* Private badge or subtitle */}
                  <View style={styles.privateBadgeRow}>
                    {sug.isPrivate ? (
                      <>
                        <Lock size={11} color="#C4B5FD" style={{ marginRight: 4 }} />
                        <Text style={styles.privateText}>Private Account</Text>
                      </>
                    ) : (
                      <Text style={styles.privateText}>{sug.subtitle}</Text>
                    )}
                  </View>

                  {/* Follow Button */}
                  <TouchableOpacity
                    style={styles.followBtnWrapper}
                    onPress={() => toggleFollowSuggested(sug.id)}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={
                        sug.isFollowing
                          ? ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.08)']
                          : ['#2563EB', '#6366F1', '#A855F7']
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.followBtnGradient}
                    >
                      {sug.isFollowing ? (
                        <>
                          <Check size={12} color="#FFFFFF" strokeWidth={3} style={{ marginRight: 4 }} />
                          <Text style={styles.followBtnText}>Following</Text>
                        </>
                      ) : (
                        <>
                          <UserPlus size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                          <Text style={styles.followBtnText}>Follow</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 5. Rich Post Cards with Center Play Button (Exact Match to User's Screenshot) */}
        {posts.map((post) => (
          <View key={post.id} style={styles.postCard}>
            {/* Post Header */}
            <View style={styles.postHeader}>
              <TouchableOpacity
                style={styles.postAuthorInfo}
                onPress={() => onOpenProfile && onOpenProfile(post.user.username)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: post.user.avatarUrl }} style={styles.postAvatar} />
                <View>
                  <View style={styles.postAuthorNameRow}>
                    <Text style={styles.postAuthorName}>{post.user.username}</Text>
                    {post.user.isVerified && (
                      <View style={styles.verifiedBadge}>
                        <Check size={9} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}
                  </View>
                  {post.location ? (
                    <Text style={styles.postLocation}>
                      📍 {post.location} • 2h ago
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.postMenuBtn}>
                <MoreHorizontal size={20} color="#CBD5E1" />
              </TouchableOpacity>
            </View>

            {/* Video/Image Container with Center Play Button */}
            <View style={styles.postMediaContainer}>
              <Image source={{ uri: post.imageUrl }} style={styles.postImage} resizeMode="cover" />

              {/* Glossy Center Play Button */}
              <TouchableOpacity
                style={styles.centerPlayButton}
                onPress={() => setSelectedPostForComments(post)}
                activeOpacity={0.85}
              >
                <View style={styles.playButtonInner}>
                  <Play size={24} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 3 }} />
                </View>
              </TouchableOpacity>

              {/* Right Floating Actions (Heart, Message, Share) */}
              <View style={styles.postMediaRightActions}>
                <TouchableOpacity
                  style={styles.mediaActionBtn}
                  onPress={() => toggleLikePost(post.id)}
                >
                  <Heart
                    size={24}
                    color={post.isLiked ? '#EF4444' : '#FFFFFF'}
                    fill={post.isLiked ? '#EF4444' : 'rgba(0,0,0,0.3)'}
                  />
                  <Text style={styles.mediaActionText}>
                    {post.likeCount > 999 ? `${(post.likeCount / 1000).toFixed(1)}K` : post.likeCount}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mediaActionBtn}
                  onPress={() => setSelectedPostForComments(post)}
                >
                  <MessageCircle size={23} color="#FFFFFF" fill="rgba(0,0,0,0.3)" />
                  <Text style={styles.mediaActionText}>{post.commentCount}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.mediaActionBtn} onPress={onOpenChat}>
                  <Send size={22} color="#FFFFFF" />
                  <Text style={styles.mediaActionText}>1.1K</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Post Caption */}
            <View style={styles.postDetails}>
              <Text style={styles.captionText}>
                <Text style={styles.captionUsername}>{post.user.username} </Text>
                {post.caption}
              </Text>
            </View>
          </View>
        ))}

        {/* Space at bottom for floating nav bar */}
        <View style={{ height: 96 }} />
      </ScrollView>

      {/* Comments Modal */}
      {selectedPostForComments && (
        <CommentsModal
          visible={true}
          video={selectedPostForComments}
          onClose={() => setSelectedPostForComments(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0718',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topBarButton: {
    padding: 4,
  },
  brandTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  brandTitleText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  heartWrapper: {
    position: 'relative',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  storiesContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  storyItem: {
    alignItems: 'center',
    marginHorizontal: 7,
    width: 68,
  },
  yourStoryWrapper: {
    position: 'relative',
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2,
  },
  storyGradientRing: {
    width: 66,
    height: 66,
    borderRadius: 33,
    padding: 2.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyAvatarInner: {
    width: 61.6,
    height: 61.6,
    borderRadius: 30.8,
    padding: 2,
    backgroundColor: '#0A0718',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  yourStoryPlusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0095F6',
    borderWidth: 2,
    borderColor: '#0A0718',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyUsername: {
    fontSize: 11,
    marginTop: 5,
    textAlign: 'center',
    color: '#CBD5E1',
    fontWeight: '500',
  },
  bannerOuterContainer: {
    paddingHorizontal: 14,
    marginVertical: 8,
  },
  heroBannerCard: {
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  bannerLeftContent: {
    flex: 1,
    paddingRight: 10,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 16,
    marginBottom: 14,
  },
  exploreNowBtnWrapper: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    overflow: 'hidden',
  },
  exploreNowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  exploreNowText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  exploreNowArrow: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  bannerLogoContainer: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner3DLogo: {
    width: '100%',
    height: '100%',
  },
  filterPillsScroll: {
    paddingVertical: 12,
    flexDirection: 'row',
  },
  filterPillWrapper: {
    marginRight: 8,
  },
  activePillGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  activePillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  inactivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inactivePillText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  suggestedSection: {
    marginVertical: 8,
  },
  suggestedSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  suggestedSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C084FC',
  },
  suggestedScroll: {
    paddingHorizontal: 14,
    paddingBottom: 6,
  },
  suggestedCardGradient: {
    width: 165,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.28)',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  closeCardBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 4,
    zIndex: 2,
  },
  suggestedAvatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(168, 85, 247, 0.5)',
    padding: 2,
    marginBottom: 8,
    marginTop: 4,
  },
  suggestedAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  suggestedUsername: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  suggestedFullName: {
    fontSize: 11,
    color: '#C4B5FD',
    marginBottom: 8,
    textAlign: 'center',
  },
  privateBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  privateText: {
    fontSize: 10.5,
    color: '#A78BFA',
    fontWeight: '600',
  },
  followBtnWrapper: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  followBtnGradient: {
    flexDirection: 'row',
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  followBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  postCard: {
    marginTop: 12,
    marginHorizontal: 14,
    borderRadius: 22,
    backgroundColor: '#140D2E',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.22)',
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  postAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#A855F7',
  },
  postAuthorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postAuthorName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginRight: 5,
  },
  verifiedBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postLocation: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  postMenuBtn: {
    padding: 4,
  },
  postMediaContainer: {
    width: '100%',
    height: 380,
    position: 'relative',
    backgroundColor: '#000000',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  centerPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -28 }, { translateY: -28 }],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  playButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  postMediaRightActions: {
    position: 'absolute',
    right: 12,
    bottom: 16,
    alignItems: 'center',
  },
  mediaActionBtn: {
    alignItems: 'center',
    marginBottom: 14,
  },
  mediaActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  postDetails: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  captionText: {
    fontSize: 13,
    color: '#E2E8F0',
    lineHeight: 18,
  },
  captionUsername: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
