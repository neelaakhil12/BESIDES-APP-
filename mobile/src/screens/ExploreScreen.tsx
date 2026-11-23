import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Search, Flame, Hash, User, Film, Play } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import api from '../services/api';
import { MOCK_TRENDING_TAGS, MOCK_VIDEOS, MOCK_USERS } from '../services/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ExploreScreenProps {
  onSelectVideo?: (video: any) => void;
  onOpenProfile?: (userId: string) => void;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  onSelectVideo,
  onOpenProfile,
}) => {
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'trending' | 'hashtags' | 'users' | 'videos'>('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingTags, setTrendingTags] = useState<any[]>(MOCK_TRENDING_TAGS);
  const [videos, setVideos] = useState<any[]>(MOCK_VIDEOS);
  const [users, setUsers] = useState<any[]>(Object.values(MOCK_USERS));

  const fetchExploreData = async () => {
    try {
      const res = await api.get(`/explore?q=${encodeURIComponent(searchQuery)}&tab=${activeTab}`);
      if (res.data?.success) {
        setTrendingTags(res.data.trendingHashtags || MOCK_TRENDING_TAGS);
        setVideos(res.data.videos || MOCK_VIDEOS);
        setUsers(res.data.users || Object.values(MOCK_USERS));
      } else {
        setTrendingTags(MOCK_TRENDING_TAGS);
        setVideos(MOCK_VIDEOS);
        setUsers(Object.values(MOCK_USERS));
      }
    } catch (err) {
      setTrendingTags(MOCK_TRENDING_TAGS);
      setVideos(MOCK_VIDEOS);
      setUsers(Object.values(MOCK_USERS));
    }
  };

  useEffect(() => {
    fetchExploreData();
  }, [activeTab, searchQuery]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Search Input Bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
        <Search size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search users, videos, #hashtags"
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Tabs: Trending | Hashtags | Users | Videos */}
      <View style={styles.tabsRow}>
        {(['trending', 'hashtags', 'users', 'videos'] as const).map((tab) => {
          const isActive = activeTab === tab;
          const label = tab.charAt(0).toUpperCase() + tab.slice(1);

          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabItem,
                isActive && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
              ]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? colors.primary : colors.textSecondary },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Trending Now Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Trending Now 🔥
        </Text>
      </View>

      {/* Trending Hashtag Cards Grid (Matching mockup #Travel, #Dance, #Comedy, #Food) */}
      <View style={styles.trendingCardsGrid}>
        {[
          { name: 'Travel', count: '2.4M videos', bg: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300' },
          { name: 'Dance', count: '6.7M videos', bg: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=300' },
          { name: 'Comedy', count: '5.1M videos', bg: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300' },
          { name: 'Food', count: '1.9M videos', bg: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300' },
        ].map((card, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.trendingCard}
            onPress={() => setSearchQuery(card.name)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: card.bg }} style={styles.cardImage} />
            <View style={styles.cardGradientOverlay}>
              <Text style={styles.cardHashtagText}>#{card.name}</Text>
              <Text style={styles.cardCountText}>{card.count}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* For You to Explore Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          For You to Explore
        </Text>
      </View>

      {/* Video Discovery Grid */}
      <View style={styles.videoGrid}>
        {videos.map((vid) => (
          <TouchableOpacity
            key={vid.id}
            style={styles.gridVideoCard}
            onPress={() => onSelectVideo && onSelectVideo(vid)}
            activeOpacity={0.8}
          >
            <Image
              source={{
                uri:
                  vid.thumbnailUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
              }}
              style={styles.gridVideoThumbnail}
            />
            <View style={styles.gridVideoOverlay}>
              <Play size={10} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.gridVideoViews}>{vid.viewCount || '14.2K'}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  tabItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  trendingCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  trendingCard: {
    width: '48%',
    height: 90,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
    padding: 10,
  },
  cardHashtagText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  cardCountText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  videoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 20,
  },
  gridVideoCard: {
    width: '33.33%',
    height: 140,
    padding: 1,
    position: 'relative',
  },
  gridVideoThumbnail: {
    width: '100%',
    height: '100%',
  },
  gridVideoOverlay: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gridVideoViews: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
