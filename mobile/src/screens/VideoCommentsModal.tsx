import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Play,
  Heart,
  Video as VideoIcon,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export interface VideoReplyItem {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  timeAgo: string;
  likeCount: number;
  user: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string;
  };
}

interface VideoCommentsModalProps {
  visible: boolean;
  parentVideo: any;
  replies: VideoReplyItem[];
  currentViewingIndex?: number;
  onClose: () => void;
  onSelectReply: (index: number) => void;
  onOpenRecordReply?: () => void;
}

export const VideoCommentsModal: React.FC<VideoCommentsModalProps> = ({
  visible,
  parentVideo,
  replies,
  currentViewingIndex = -1,
  onClose,
  onSelectReply,
  onOpenRecordReply,
}) => {
  const { colors } = useTheme();

  if (!visible) return null;

  const parentUsername = parentVideo?.user?.username || 'maya.films';
  const totalCount = replies.length || 15;

  const renderReplyCard = ({ item, index }: { item: VideoReplyItem; index: number }) => {
    const isViewing = currentViewingIndex === index;
    const formattedLikes =
      item.likeCount > 999 ? `${(item.likeCount / 1000).toFixed(1)}K` : item.likeCount;

    return (
      <TouchableOpacity
        style={[
          styles.replyGridItem,
          isViewing && styles.replyGridItemActive,
        ]}
        onPress={() => onSelectReply(index)}
        activeOpacity={0.82}
      >
        <Image
          source={{ uri: item.thumbnailUrl }}
          style={styles.replyThumbnail}
          resizeMode="cover"
        />

        {/* Top-Right Play Badge */}
        <View style={styles.playBadge}>
          <Play size={10} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 1 }} />
        </View>

        {/* Viewing Indicator if this item is currently active in deck */}
        {isViewing && (
          <View style={styles.viewingBadge}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.viewingGradient}
            >
              <Text style={styles.viewingText}>Viewing</Text>
            </LinearGradient>
          </View>
        )}

        {/* Bottom Metadata Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(11, 8, 20, 0.92)']}
          style={styles.bottomMetaGradient}
        >
          <View style={styles.metaRow}>
            {/* Left: Avatar + Username */}
            <View style={styles.userLeftCol}>
              <Image source={{ uri: item.user.avatarUrl }} style={styles.avatarImg} />
              <Text style={styles.usernameText} numberOfLines={1}>
                {item.user.username.replace('@', '')}
              </Text>
            </View>

            {/* Right: Heart + Like Count */}
            <View style={styles.likeRightCol}>
              <Heart size={11} color="#FFFFFF" fill="none" strokeWidth={2.2} />
              <Text style={styles.likeCountText}>{formattedLikes}</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.modalOverlay}>
      {/* Dimmer backdrop - tap to close */}
      <TouchableOpacity
        style={styles.backdropDismiss}
        onPress={onClose}
        activeOpacity={1}
      />

      {/* Main Sheet Container */}
      <View style={styles.sheetContainer}>
        {/* Drag Handle Bar */}
        <View style={styles.dragHandleWrapper}>
          <View style={styles.dragHandle} />
        </View>

        {/* Header Row: Title, Subtitle & Close Button */}
        <View style={styles.headerRow}>
          <View style={styles.headerTitleCol}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>Video Comments</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{totalCount}</Text>
              </View>
            </View>
            <Text style={styles.headerSubtitle}>
              {totalCount} replies to @{parentUsername.replace('@', '')}
            </Text>
          </View>

          <View style={styles.headerActions}>
            {/* Record Reply Button */}
            {onOpenRecordReply && (
              <TouchableOpacity
                style={styles.recordActionBtn}
                onPress={onOpenRecordReply}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.recordActionGradient}
                >
                  <VideoIcon size={14} color="#FFFFFF" strokeWidth={2.4} />
                  <Text style={styles.recordActionText}>Reply</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeCircleBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={18} color="#FFFFFF" strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 3-Column Video Comments Grid */}
        <FlatList
          data={replies}
          renderItem={renderReplyCard}
          keyExtractor={(item) => item.id}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContentContainer}
          columnWrapperStyle={styles.gridRowWrapper}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 120,
    backgroundColor: 'rgba(5, 3, 10, 0.72)',
    justifyContent: 'flex-end',
  },
  backdropDismiss: {
    flex: 1,
  },
  sheetContainer: {
    height: Platform.OS === 'web' ? '78%' : '75%',
    backgroundColor: '#0F0B1E',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(224, 40, 125, 0.25)',
    shadowColor: '#E0287D',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 24,
    overflow: 'hidden',
  },
  dragHandleWrapper: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  countBadge: {
    backgroundColor: 'rgba(224, 40, 125, 0.25)',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(224, 40, 125, 0.5)',
  },
  countBadgeText: {
    color: '#E0287D',
    fontSize: 11,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 12.5,
    marginTop: 2,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordActionBtn: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  recordActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 5,
  },
  recordActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  closeCircleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContentContainer: {
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 30,
  },
  gridRowWrapper: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  replyGridItem: {
    width: '32%',
    height: 156,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#171228',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  replyGridItemActive: {
    borderColor: '#E0287D',
    borderWidth: 2,
    shadowColor: '#E0287D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  replyThumbnail: {
    width: '100%',
    height: '100%',
  },
  playBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  viewingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 6,
    overflow: 'hidden',
  },
  viewingGradient: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  viewingText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  bottomMetaGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 7,
    paddingBottom: 6,
    paddingTop: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 4,
  },
  avatarImg: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 4,
    borderWidth: 0.8,
    borderColor: '#FFFFFF',
  },
  usernameText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    flex: 1,
  },
  likeRightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  likeCountText: {
    color: '#E2E8F0',
    fontSize: 9.5,
    fontWeight: '700',
  },
});
