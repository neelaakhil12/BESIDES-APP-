import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Search,
  X,
  Play,
  Eye,
  Sparkles,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MomentItem {
  id: string;
  thumbnailUrl: string;
  views: string;
  category: string;
  title: string;
  user: {
    username: string;
    avatarUrl: string;
  };
}

const SEARCH_CATEGORIES = [
  { id: 'all', label: 'All', icon: '' },
  { id: 'movies', label: 'Movies', emoji: '🎬' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'food', label: 'Food', emoji: '🍜' },
  { id: 'comedy', label: 'Comedy', emoji: '😄' },
  { id: 'fashion', label: 'Fashion', emoji: '✨' },
  { id: 'fitness', label: 'Fitness', emoji: '💪' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'technology', label: 'Technology', emoji: '💻' },
  { id: 'art', label: 'Art', emoji: '🎨' },
  { id: 'nature', label: 'Nature', emoji: '🌿' },
];

const MOCK_EXPLORE_MOMENTS: MomentItem[] = [
  {
    id: 'm1',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600',
    views: '412K',
    category: 'travel',
    title: 'Gimbal vlog in the forest',
    user: { username: 'maya.films', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' },
  },
  {
    id: 'm2',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600',
    views: '120.5K',
    category: 'sports',
    title: 'High altitude mountain ascent',
    user: { username: 'climb.peak', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
  },
  {
    id: 'm3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600',
    views: '88.4K',
    category: 'movies',
    title: 'Night highway light trails',
    user: { username: 'urban.cinematics', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200' },
  },
  {
    id: 'm4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600',
    views: '64.2K',
    category: 'art',
    title: 'Artistic monochrome portrait',
    user: { username: 'monochrome.art', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' },
  },
  {
    id: 'm5',
    thumbnailUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600',
    views: '53.1K',
    category: 'fashion',
    title: 'Studio lookbook editorial',
    user: { username: 'studio.mira', avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200' },
  },
  {
    id: 'm6',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600',
    views: '5.8K',
    category: 'nature',
    title: 'Sunset ridge exploration',
    user: { username: 'sol.and.sand', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200' },
  },
  {
    id: 'm7',
    thumbnailUrl: 'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?w=600',
    views: '94.1K',
    category: 'sports',
    title: 'Skater sunset ramp drop',
    user: { username: 'rollerjune', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200' },
  },
  {
    id: 'm8',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600',
    views: '230K',
    category: 'technology',
    title: 'Cyberpunk neon night crosswalk',
    user: { username: 'nightshift.studio', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
  },
  {
    id: 'm9',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
    views: '175K',
    category: 'travel',
    title: 'Ocean coastal aerial wave break',
    user: { username: 'dia.de.ana', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' },
  },
  {
    id: 'm10',
    thumbnailUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600',
    views: '48.7K',
    category: 'food',
    title: 'Artisan cappuccino pouring',
    user: { username: 'cafe.corner', avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200' },
  },
  {
    id: 'm11',
    thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600',
    views: '310K',
    category: 'music',
    title: 'Festival strobe laser stage',
    user: { username: 'lena.vale', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' },
  },
  {
    id: 'm12',
    thumbnailUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600',
    views: '85.3K',
    category: 'fashion',
    title: 'Milan streetwear styling',
    user: { username: 'theo.frames', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200' },
  },
  {
    id: 'm13',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600',
    views: '142K',
    category: 'gaming',
    title: 'Esports arena final match',
    user: { username: 'game.pulse', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200' },
  },
  {
    id: 'm14',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600',
    views: '98.2K',
    category: 'fitness',
    title: 'Outdoor morning workout routine',
    user: { username: 'fit.life', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
  },
  {
    id: 'm15',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=600',
    views: '61.4K',
    category: 'comedy',
    title: 'Funny pet moments compilation',
    user: { username: 'laugh.hub', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200' },
  },
];

interface SearchExploreScreenProps {
  onBack: () => void;
  onSelectMoment?: (moment: MomentItem) => void;
  onOpenProfile?: (userId: string) => void;
}

export const SearchExploreScreen: React.FC<SearchExploreScreenProps> = ({
  onBack,
  onSelectMoment,
  onOpenProfile,
}) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Filter moments by category and search query
  const filteredMoments = MOCK_EXPLORE_MOMENTS.filter((item) => {
    const matchesCategory =
      activeCategory === 'all' || item.category === activeCategory;
    const matchesQuery =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const renderMomentCard = ({ item }: { item: MomentItem }) => {
    return (
      <TouchableOpacity
        style={styles.momentCard}
        onPress={() => onSelectMoment && onSelectMoment(item)}
        activeOpacity={0.85}
      >
        <Image
          source={{ uri: item.thumbnailUrl }}
          style={styles.cardThumbnail}
          resizeMode="cover"
        />

        {/* Top-Right Translucent Play Badge */}
        <View style={styles.cardPlayBadge}>
          <Play size={10} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 1.5 }} />
        </View>

        {/* Bottom Views Tag with Eye Icon */}
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.82)']}
          style={styles.cardBottomGradient}
        >
          <View style={styles.viewsTagRow}>
            <Eye size={12} color="#FFFFFF" strokeWidth={2.4} style={{ marginRight: 4 }} />
            <Text style={styles.viewsText}>{item.views}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. TOP SEARCH BAR ROW (← + [🔍 Search Input] + 🔍) */}
      <View style={styles.topHeaderBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2.4} />
        </TouchableOpacity>

        {/* Search Input Box */}
        <View style={styles.searchInputWrapper}>
          <Search size={16} color="#94A3B8" strokeWidth={2.2} style={styles.searchIconLeft} />
          <TextInput
            style={styles.searchInput}
            placeholder="People, moments, interests"
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchBtn}
            >
              <X size={14} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Trailing Search Icon Button */}
        <TouchableOpacity style={styles.searchActionBtn} activeOpacity={0.7}>
          <Search size={20} color="#FFFFFF" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      {/* 2. HORIZONTAL CATEGORY PILLS CAROUSEL (Movies, Sports, Music, Travel, Food, etc.) */}
      <View style={styles.categoriesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        >
          {SEARCH_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryPill,
                  isActive && styles.categoryPillActive,
                ]}
                onPress={() => setActiveCategory(cat.id)}
                activeOpacity={0.8}
              >
                {isActive ? (
                  <LinearGradient
                    colors={[colors.gradientStart, colors.gradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.activePillGradient}
                  >
                    {cat.emoji ? <Text style={styles.categoryEmoji}>{cat.emoji}</Text> : null}
                    <Text style={styles.activePillText}>{cat.label}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.inactivePillContent}>
                    {cat.emoji ? <Text style={styles.categoryEmoji}>{cat.emoji}</Text> : null}
                    <Text style={styles.inactivePillText}>{cat.label}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. SECTION TITLE: "Explore Moments" */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Explore Moments</Text>
      </View>

      {/* 4. 3-COLUMN PORTRAIT VIDEO GRID */}
      <FlatList
        data={filteredMoments}
        renderItem={renderMomentCard}
        keyExtractor={(item) => item.id}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.momentsGridContainer}
        columnWrapperStyle={styles.momentsRowWrapper}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07050E',
    position: 'relative',
  },
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 48 : 20,
    paddingBottom: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    gap: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInputWrapper: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#130E24',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchIconLeft: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '500',
    paddingVertical: 0,
    outlineStyle: 'none',
  } as any,
  clearSearchBtn: {
    padding: 4,
  },
  searchActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesSection: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  categoriesScrollContent: {
    paddingHorizontal: 14,
    gap: 8,
  },
  categoryPill: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
  },
  categoryPillActive: {
    borderColor: 'transparent',
    shadowColor: '#E0287D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  activePillGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 6.5,
  },
  inactivePillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 6.5,
  },
  categoryEmoji: {
    fontSize: 13,
    marginRight: 6,
  },
  activePillText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  inactivePillText: {
    color: '#CBD5E1',
    fontSize: 12.5,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 8,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  momentsGridContainer: {
    paddingHorizontal: 12,
    paddingBottom: 90,
  },
  momentsRowWrapper: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  momentCard: {
    width: '32%',
    height: 168,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#161129',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardThumbnail: {
    width: '100%',
    height: '100%',
  },
  cardPlayBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  cardBottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingBottom: 8,
    paddingTop: 20,
  },
  viewsTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewsText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
