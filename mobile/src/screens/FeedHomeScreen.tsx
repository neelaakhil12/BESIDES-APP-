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
import { Plus, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Lock, X } from 'lucide-react-native';
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
}

export const FeedHomeScreen: React.FC<FeedHomeScreenProps> = ({
  onOpenCreate,
  onOpenNotifications,
  onOpenChat,
  onOpenProfile,
}) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();

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

  const toggleSavePost = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isSaved: !p.isSaved } : p))
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. Instagram-Style Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
        <TouchableOpacity onPress={onOpenCreate} style={styles.topBarButton} activeOpacity={0.7}>
          <Plus size={26} color={colors.text} strokeWidth={2.2} />
        </TouchableOpacity>

        {/* Center Branding: Besides Logo + Text */}
        <View style={styles.brandTitleContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <Text style={[styles.brandTitleText, { color: colors.text }]}>Besides</Text>
        </View>

        {/* Right Action: Notifications Heart with red dot */}
        <TouchableOpacity
          onPress={onOpenNotifications || onOpenChat}
          style={styles.topBarButton}
          activeOpacity={0.7}
        >
          <View style={styles.heartWrapper}>
            <Heart size={24} color={colors.text} strokeWidth={2} />
            <View style={styles.headerRedDot} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Instagram Stories Tray */}
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
                    <Plus size={12} color="#FFFFFF" strokeWidth={3} />
                  </View>
                </View>
              ) : (
                <LinearGradient
                  colors={['#F58529', '#DD2A7B', '#8134AF', '#515BD4']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.storyGradientRing}
                >
                  <View style={[styles.storyAvatarInner, { backgroundColor: colors.background }]}>
                    <Image source={{ uri: item.avatarUrl }} style={styles.storyAvatar} />
                  </View>
                </LinearGradient>
              )}
              <Text
                style={[styles.storyUsername, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {item.username}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={[styles.sectionDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]} />

        {/* 3. "Welcome to Besides" Header */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>Welcome to Besides</Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
            When you follow people, you'll see the photos and videos that they post here.
          </Text>
        </View>

        {/* 4. "Suggested for you" Carousel Cards (Image 2 Match) */}
        {suggestedUsers.length > 0 && (
          <View style={styles.suggestedContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestedScroll}>
              {suggestedUsers.map((sug) => (
                <View
                  key={sug.id}
                  style={[
                    styles.suggestedCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.closeCardBtn}
                    onPress={() => removeSuggested(sug.id)}
                  >
                    <X size={15} color={colors.textSecondary} />
                  </TouchableOpacity>

                  <Image source={{ uri: sug.avatarUrl }} style={styles.suggestedAvatar} />

                  <Text style={[styles.suggestedUsername, { color: colors.text }]} numberOfLines={1}>
                    {sug.username}
                  </Text>
                  <Text style={[styles.suggestedFullName, { color: colors.textSecondary }]} numberOfLines={1}>
                    {sug.fullName}
                  </Text>

                  {sug.isPrivate ? (
                    <View style={styles.privateBadgeRow}>
                      <Lock size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                      <Text style={[styles.privateText, { color: colors.textSecondary }]}>
                        This profile is private
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.privateBadgeRow}>
                      <Text style={[styles.privateText, { color: colors.textSecondary }]}>
                        {sug.subtitle}
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.followBtn,
                      {
                        backgroundColor: sug.isFollowing
                          ? isDark
                            ? 'rgba(255,255,255,0.12)'
                            : '#E2E8F0'
                          : '#0095F6',
                      },
                    ]}
                    onPress={() => toggleFollowSuggested(sug.id)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.followBtnText,
                        { color: sug.isFollowing ? colors.text : '#FFFFFF' },
                      ]}
                    >
                      {sug.isFollowing ? 'Following' : 'Follow'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 5. Rich Feed Posts List */}
        {posts.map((post) => (
          <View
            key={post.id}
            style={[
              styles.postCard,
              {
                backgroundColor: colors.surface,
                borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              },
            ]}
          >
            {/* Post Header */}
            <View style={styles.postHeader}>
              <TouchableOpacity
                style={styles.postAuthorInfo}
                onPress={() => onOpenProfile && onOpenProfile(post.user.username)}
              >
                <Image source={{ uri: post.user.avatarUrl }} style={styles.postAvatar} />
                <View>
                  <Text style={[styles.postAuthorName, { color: colors.text }]}>
                    {post.user.username}
                  </Text>
                  {post.location ? (
                    <Text style={[styles.postLocation, { color: colors.textSecondary }]}>
                      {post.location}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.postMenuBtn}>
                <MoreHorizontal size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Post Media Image */}
            <Image
              source={{ uri: post.imageUrl }}
              style={styles.postImage}
              resizeMode="cover"
            />

            {/* Post Actions Bar */}
            <View style={styles.postActionsBar}>
              <View style={styles.postActionsLeft}>
                <TouchableOpacity
                  onPress={() => toggleLikePost(post.id)}
                  style={styles.actionBtn}
                >
                  <Heart
                    size={24}
                    color={post.isLiked ? '#EF4444' : colors.text}
                    fill={post.isLiked ? '#EF4444' : 'none'}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedPostForComments(post)}
                  style={styles.actionBtn}
                >
                  <MessageCircle size={23} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity onPress={onOpenChat} style={styles.actionBtn}>
                  <Send size={22} color={colors.text} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={() => toggleSavePost(post.id)}>
                <Bookmark
                  size={24}
                  color={post.isSaved ? colors.primary : colors.text}
                  fill={post.isSaved ? colors.primary : 'none'}
                />
              </TouchableOpacity>
            </View>

            {/* Post Likes & Caption */}
            <View style={styles.postDetails}>
              <Text style={[styles.likesCountText, { color: colors.text }]}>
                {post.likeCount.toLocaleString()} likes
              </Text>

              <Text style={[styles.captionText, { color: colors.text }]}>
                <Text style={styles.captionUsername}>{post.user.username} </Text>
                {post.caption}
              </Text>

              {post.commentCount > 0 && (
                <TouchableOpacity
                  onPress={() => setSelectedPostForComments(post)}
                  style={{ marginTop: 4 }}
                >
                  <Text style={[styles.viewCommentsText, { color: colors.textSecondary }]}>
                    View all {post.commentCount} comments
                  </Text>
                </TouchableOpacity>
              )}

              <Text style={[styles.timeAgoText, { color: colors.textMuted }]}>
                {post.timeAgo}
              </Text>
            </View>
          </View>
        ))}

        {/* Space at bottom for floating nav bar */}
        <View style={{ height: 90 }} />
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
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  topBarButton: {
    padding: 4,
  },
  brandTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogo: {
    width: 28,
    height: 28,
    marginRight: 6,
  },
  brandTitleText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heartWrapper: {
    position: 'relative',
  },
  headerRedDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  storiesContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  storyItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 70,
  },
  yourStoryWrapper: {
    position: 'relative',
    width: 66,
    height: 66,
    borderRadius: 33,
    padding: 2,
  },
  storyGradientRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyAvatarInner: {
    width: 63,
    height: 63,
    borderRadius: 31.5,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
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
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyUsername: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionDivider: {
    height: 1,
    width: '100%',
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
  },
  suggestedContainer: {
    marginBottom: 16,
  },
  suggestedScroll: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  suggestedCard: {
    width: 170,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  closeCardBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    zIndex: 2,
  },
  suggestedAvatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    marginTop: 6,
    marginBottom: 8,
  },
  suggestedUsername: {
    fontSize: 13,
    fontWeight: '700',
  },
  suggestedFullName: {
    fontSize: 11,
    marginBottom: 8,
  },
  privateBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 18,
  },
  privateText: {
    fontSize: 10,
    fontWeight: '500',
  },
  followBtn: {
    width: '100%',
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  postCard: {
    marginBottom: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
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
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
  },
  postAuthorName: {
    fontSize: 13,
    fontWeight: '700',
  },
  postLocation: {
    fontSize: 10,
  },
  postMenuBtn: {
    padding: 4,
  },
  postImage: {
    width: '100%',
    height: 360,
  },
  postActionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  postActionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    marginRight: 16,
  },
  postDetails: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  likesCountText: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  captionText: {
    fontSize: 13,
    lineHeight: 18,
  },
  captionUsername: {
    fontWeight: '700',
  },
  viewCommentsText: {
    fontSize: 12,
    marginTop: 2,
  },
  timeAgoText: {
    fontSize: 10,
    marginTop: 4,
    letterSpacing: 0.2,
  },
});
