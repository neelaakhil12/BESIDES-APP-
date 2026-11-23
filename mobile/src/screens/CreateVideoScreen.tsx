import React, { useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import {
  Scissors,
  Sliders,
  Sun,
  Type,
  Music,
  Gauge,
  Play,
  Pause,
  X,
  Check,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import api from '../services/api';

interface CreateVideoScreenProps {
  onClose: () => void;
  onPublishSuccess: () => void;
}

export const CreateVideoScreen: React.FC<CreateVideoScreenProps> = ({
  onClose,
  onPublishSuccess,
}) => {
  const { colors, isDark } = useTheme();

  // Video editor state
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeFilter, setActiveFilter] = useState('normal'); // 'normal' | 'vintage' | 'cyber' | 'golden'
  const [brightness, setBrightness] = useState(1.0);
  const [selectedSpeed, setSelectedSpeed] = useState('1.0x');
  const [selectedMusic, setSelectedMusic] = useState('Original Sound');
  const [caption, setCaption] = useState('Enjoying the scenic views! 🌸 #Travel #Besides');
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [activeEditorTool, setActiveEditorTool] = useState<string | null>(null);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const res = await api.post('/videos/upload', {
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
        caption,
        duration: 15.0,
      });

      if (res.data?.success) {
        setShowPublishModal(false);
        onPublishSuccess();
        setIsPublishing(false);
        return;
      }
    } catch (err) {
      // offline fallback
    }
    setShowPublishModal(false);
    onPublishSuccess();
    setIsPublishing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: '#000000' }]}>
      {/* Top Bar: Close 'X' and 'Next' gradient button */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
          <X size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => setShowPublishModal(true)}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nextGradient}
          >
            <Text style={styles.nextText}>Next</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Video Preview Center Area */}
      <View style={styles.videoPreviewArea}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600',
          }}
          style={[
            styles.previewImage,
            activeFilter === 'vintage' && { filter: 'sepia(0.5)' } as any,
            activeFilter === 'cyber' && { filter: 'hue-rotate(90deg)' } as any,
          ]}
        />

        {/* Play/Pause Button overlay */}
        <TouchableOpacity
          style={styles.playOverlayButton}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? (
            <Pause size={28} color="#FFFFFF" />
          ) : (
            <Play size={28} color="#FFFFFF" fill="#FFFFFF" />
          )}
        </TouchableOpacity>

        {/* Video Scrubber Timeline (matching 0:00 / 0:15 in screenshot) */}
        <View style={styles.timelineScrubber}>
          <Text style={styles.timeLabel}>0:00 / 0:15</Text>
          <View style={styles.filmstripRow}>
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <View key={idx} style={styles.filmstripFrame}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' }}
                  style={styles.frameThumbnail}
                />
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Bottom Video Editing Toolbar (Trim, Filters, Adjust, Text, Music, Speed) */}
      <View style={[styles.bottomToolbar, { backgroundColor: 'rgba(11, 8, 20, 0.95)' }]}>
        {/* 1. Trim */}
        <TouchableOpacity
          style={styles.toolItem}
          onPress={() => setActiveEditorTool('trim')}
        >
          <Scissors size={20} color={activeEditorTool === 'trim' ? colors.primary : '#FFFFFF'} />
          <Text style={styles.toolLabel}>Trim</Text>
        </TouchableOpacity>

        {/* 2. Filters */}
        <TouchableOpacity
          style={styles.toolItem}
          onPress={() => setActiveEditorTool('filters')}
        >
          <Sliders size={20} color={activeEditorTool === 'filters' ? colors.primary : '#FFFFFF'} />
          <Text style={styles.toolLabel}>Filters</Text>
        </TouchableOpacity>

        {/* 3. Adjust */}
        <TouchableOpacity
          style={styles.toolItem}
          onPress={() => setActiveEditorTool('adjust')}
        >
          <Sun size={20} color={activeEditorTool === 'adjust' ? colors.primary : '#FFFFFF'} />
          <Text style={styles.toolLabel}>Adjust</Text>
        </TouchableOpacity>

        {/* 4. Text */}
        <TouchableOpacity
          style={styles.toolItem}
          onPress={() => setActiveEditorTool('text')}
        >
          <Type size={20} color={activeEditorTool === 'text' ? colors.primary : '#FFFFFF'} />
          <Text style={styles.toolLabel}>Text</Text>
        </TouchableOpacity>

        {/* 5. Music */}
        <TouchableOpacity
          style={styles.toolItem}
          onPress={() => setActiveEditorTool('music')}
        >
          <Music size={20} color={activeEditorTool === 'music' ? colors.primary : '#FFFFFF'} />
          <Text style={styles.toolLabel}>Music</Text>
        </TouchableOpacity>

        {/* 6. Speed */}
        <TouchableOpacity
          style={styles.toolItem}
          onPress={() => setActiveEditorTool('speed')}
        >
          <Gauge size={20} color={activeEditorTool === 'speed' ? colors.primary : '#FFFFFF'} />
          <Text style={styles.toolLabel}>Speed</Text>
        </TouchableOpacity>
      </View>

      {/* Publish & Caption Modal */}
      <Modal visible={showPublishModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.publishCard, { backgroundColor: colors.surface }]}>
            <View style={styles.publishHeader}>
              <Text style={[styles.publishTitle, { color: colors.text }]}>
                Publish Video
              </Text>
              <TouchableOpacity onPress={() => setShowPublishModal(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Caption & Hashtags
            </Text>
            <TextInput
              style={[styles.captionInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
              placeholder="Write a caption... #Travel #Vibe"
              placeholderTextColor={colors.textMuted}
              value={caption}
              onChangeText={setCaption}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={styles.publishSubmitButton}
              onPress={handlePublish}
              disabled={isPublishing}
            >
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.publishGradient}
              >
                {isPublishing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.publishText}>Publish Now</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 20,
  },
  closeIcon: {
    padding: 6,
  },
  nextButton: {
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  nextGradient: {
    flex: 1,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  videoPreviewArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  playOverlayButton: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineScrubber: {
    position: 'absolute',
    bottom: 14,
    left: 12,
    right: 12,
    alignItems: 'center',
  },
  timeLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  filmstripRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    padding: 3,
  },
  filmstripFrame: {
    width: 44,
    height: 34,
    marginHorizontal: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  frameThumbnail: {
    width: '100%',
    height: '100%',
  },
  bottomToolbar: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  toolItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  toolLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  publishCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  publishHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  publishTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  captionInput: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  publishSubmitButton: {
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  publishGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
