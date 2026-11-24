import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { X, Heart, Send, Camera, Play } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { MOCK_COMMENTS, MOCK_USERS } from '../services/mockData';

interface CommentsModalProps {
  visible?: boolean;
  video: any;
  onClose: () => void;
  onCommentAdded?: () => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  visible = true,
  video,
  onClose,
  onCommentAdded,
}) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();

  const [comments, setComments] = useState<any[]>(MOCK_COMMENTS);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any | null>(null);

  // Video Reply (<= 10s) state
  const [recordingVideoReply, setRecordingVideoReply] = useState(false);
  const [videoReplyDuration, setVideoReplyDuration] = useState(8.0); // Demo 8s (<=10s)

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/video/${video.id}`);
      if (res.data?.success && res.data.comments?.length > 0) {
        setComments(res.data.comments);
      }
    } catch (err) {
      // Keep MOCK_COMMENTS
    }
  };

  useEffect(() => {
    fetchComments();
  }, [video.id]);

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    setIsSubmitting(true);
    const content = commentText.trim();
    try {
      const res = await api.post(`/comments/video/${video.id}`, {
        content,
        parentCommentId: replyingTo?.id || null,
      });

      if (res.data?.success) {
        setCommentText('');
        setReplyingTo(null);
        fetchComments();
        if (onCommentAdded) onCommentAdded();
        setIsSubmitting(false);
        return;
      }
    } catch (err) {
      // Standalone / Vercel fallback
    }

    const newCommentItem = {
      id: `comment-${Date.now()}`,
      content,
      likeCount: 0,
      createdAt: 'Just now',
      user: user || MOCK_USERS.harshitha,
      replies: [],
      videoReplies: [],
    };

    if (replyingTo) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === replyingTo.id
            ? { ...c, replies: [...(c.replies || []), newCommentItem] }
            : c
        )
      );
    } else {
      setComments((prev) => [newCommentItem, ...prev]);
    }

    setCommentText('');
    setReplyingTo(null);
    if (onCommentAdded) onCommentAdded();
    setIsSubmitting(false);
  };

  // Submit a Video Reply (strictly restricted to <= 10s)
  const handleCreateVideoReply = async (commentId: string) => {
    setIsSubmitting(true);
    try {
      const res = await api.post(`/comments/${commentId}/video-reply`, {
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
        duration: 8.0, // Strictly <= 10 seconds
      });

      if (res.data?.success) {
        setRecordingVideoReply(false);
        fetchComments();
        if (onCommentAdded) onCommentAdded();
        setIsSubmitting(false);
        return;
      }
    } catch (err) {
      // Standalone / Vercel fallback
    }

    const newVideoReply = {
      id: `vr-${Date.now()}`,
      thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      duration: 8.0,
      user: user || MOCK_USERS.harshitha,
    };

    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, videoReplies: [...(c.videoReplies || []), newVideoReply] }
          : c
      )
    );

    setRecordingVideoReply(false);
    if (onCommentAdded) onCommentAdded();
    setIsSubmitting(false);
  };

  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <TouchableOpacity
        style={styles.backdropDismiss}
        onPress={onClose}
        activeOpacity={1}
      />
      <View style={[styles.bottomSheet, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Comments ({comments.length > 0 ? comments.length : '1,248'})
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
            {comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <Image
                  source={{
                    uri:
                      comment.user.profile?.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
                  }}
                  style={styles.avatar}
                />
                <View style={styles.commentBody}>
                  <View style={styles.authorRow}>
                    <Text style={[styles.authorName, { color: colors.textSecondary }]}>
                      @{comment.user.username}
                    </Text>
                    {comment.user.id === video.userId && (
                      <View style={styles.creatorBadge}>
                        <Text style={styles.creatorBadgeText}>Creator</Text>
                      </View>
                    )}
                    <Text style={[styles.timestamp, { color: colors.textMuted }]}>
                      · 3h
                    </Text>
                  </View>

                  <Text style={[styles.commentContent, { color: colors.text }]}>
                    {comment.content}
                  </Text>

                  <View style={styles.commentActions}>
                    <TouchableOpacity
                      onPress={() => setReplyingTo(comment)}
                      style={styles.actionButton}
                    >
                      <Text style={[styles.replyText, { color: colors.textSecondary }]}>
                        Reply
                      </Text>
                    </TouchableOpacity>

                    {/* Camera button to trigger <=10s video reply */}
                    <TouchableOpacity
                      onPress={() => handleCreateVideoReply(comment.id)}
                      style={styles.videoReplyTrigger}
                    >
                      <Camera size={13} color={colors.primary} />
                      <Text style={[styles.videoReplyTriggerText, { color: colors.primary }]}>
                        Video Reply (≤10s)
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Dedicated Video Reply (<= 10s) card matching the screenshot */}
                  {comment.videoReplies && comment.videoReplies.length > 0 && (
                    <View style={[styles.videoReplyCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                      <Text style={[styles.videoReplyLabel, { color: colors.primary }]}>
                        Video Reply (≤ 10s)
                      </Text>
                      <View style={styles.videoReplyThumbnailBox}>
                        <Image
                          source={{
                            uri:
                              comment.videoReplies[0].thumbnailUrl ||
                              'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
                          }}
                          style={styles.videoReplyThumbnail}
                        />
                        <View style={styles.durationPill}>
                          <Play size={8} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 3 }} />
                          <Text style={styles.durationText}>
                            0:0{Math.round(comment.videoReplies[0].duration)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Nested Text Replies */}
                  {comment.replies && comment.replies.map((reply: any) => (
                    <View key={reply.id} style={styles.nestedReply}>
                      <Image
                        source={{
                          uri:
                            reply.user.profile?.avatarUrl ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
                        }}
                        style={styles.nestedAvatar}
                      />
                      <View style={{ flex: 1 }}>
                        <View style={styles.authorRow}>
                          <Text style={[styles.authorName, { color: colors.textSecondary }]}>
                            @{reply.user.username}
                          </Text>
                          {reply.user.id === video.userId && (
                            <View style={styles.creatorBadge}>
                              <Text style={styles.creatorBadgeText}>Creator</Text>
                            </View>
                          )}
                          <Text style={[styles.timestamp, { color: colors.textMuted }]}>
                            · 1h
                          </Text>
                        </View>
                        <Text style={[styles.commentContent, { color: colors.text }]}>
                          {reply.content}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Comment Like Heart */}
                <View style={styles.commentLikeBox}>
                  <Heart size={14} color={colors.textSecondary} />
                  <Text style={[styles.likeCountText, { color: colors.textSecondary }]}>
                    {comment.likeCount || 426}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Replying banner */}
          {replyingTo && (
            <View style={[styles.replyingBanner, { backgroundColor: colors.surfaceLight }]}>
              <Text style={[styles.replyingText, { color: colors.textSecondary }]}>
                Replying to @{replyingTo.user.username}
              </Text>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <X size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Bottom Input Bar */}
          <View style={[styles.inputBar, { backgroundColor: colors.tabBar, borderTopColor: colors.cardBorder }]}>
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
              placeholder="Add a comment..."
              placeholderTextColor={colors.textMuted}
              value={commentText}
              onChangeText={setCommentText}
            />

            {/* Quick Camera button to record video reply */}
            <TouchableOpacity
              style={[styles.cameraButton, { backgroundColor: colors.surfaceLight }]}
              onPress={() => {
                if (comments.length > 0) {
                  handleCreateVideoReply(comments[0].id);
                }
              }}
              activeOpacity={0.7}
            >
              <Camera size={18} color={colors.primary} />
            </TouchableOpacity>

            {/* Send button */}
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: colors.primary }]}
              onPress={handleSendComment}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Send size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  backdropDismiss: {
    flex: 1,
  },
  bottomSheet: {
    height: '68%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    position: 'relative',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 6,
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
  },
  commentBody: {
    flex: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  authorName: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 6,
  },
  creatorBadge: {
    backgroundColor: '#E0287D',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginRight: 6,
  },
  creatorBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  timestamp: {
    fontSize: 11,
  },
  commentContent: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 14,
  },
  replyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  videoReplyTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoReplyTriggerText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  videoReplyCard: {
    marginTop: 8,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    width: 130,
  },
  videoReplyLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
  },
  videoReplyThumbnailBox: {
    width: 112,
    height: 140,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000',
  },
  videoReplyThumbnail: {
    width: '100%',
    height: '100%',
  },
  durationPill: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  nestedReply: {
    flexDirection: 'row',
    marginTop: 10,
  },
  nestedAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  commentLikeBox: {
    alignItems: 'center',
    marginLeft: 8,
    paddingTop: 4,
  },
  likeCountText: {
    fontSize: 10,
    marginTop: 2,
  },
  replyingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  replyingText: {
    fontSize: 11,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13,
    marginRight: 8,
  },
  cameraButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
