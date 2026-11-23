import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import {
  Search,
  Edit3,
  MoreHorizontal,
  ChevronDown,
  Briefcase,
  Globe,
  ArrowLeft,
  Camera,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { MOCK_INSTAGRAM_CHATS } from '../services/mockData';

interface ChatScreenProps {
  onBack?: () => void;
  onOpenConversation: (conversation: any) => void;
  onOpenMap?: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  onBack,
  onOpenConversation,
  onOpenMap,
}) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'primary' | 'general' | 'requests'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState(MOCK_INSTAGRAM_CHATS);

  const filtered = conversations.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. Header (Image 3 Match: Briefcase, username ⌵, ..., compose) */}
      <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
        <View style={styles.headerLeft}>
          {onBack ? (
            <TouchableOpacity onPress={onBack} style={styles.headerBtn}>
              <ArrowLeft size={22} color={colors.text} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.headerBtn}>
              <Briefcase size={20} color={colors.text} />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.usernameDropdown} activeOpacity={0.7}>
            <Text style={[styles.headerUsername, { color: colors.text }]} numberOfLines={1}>
              {user?.username || 'harshitha'}
            </Text>
            <ChevronDown size={16} color={colors.text} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn}>
            <MoreHorizontal size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Edit3 size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Search Bar with "Filter" on the right */}
        <View style={styles.searchRow}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: isDark ? '#1C1C26' : '#F1F5F9',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              },
            ]}
          >
            <Search size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search"
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={[styles.filterBtnText, { color: '#6366F1' }]}>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* 3. Instagram Notes Tray (Image 3 Match: "Your note", "Map", friend notes) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.notesContainer}
        >
          {/* Your Note */}
          <View style={styles.noteItem}>
            {/* Thought Bubble */}
            <View
              style={[
                styles.thoughtBubble,
                {
                  backgroundColor: isDark ? '#2D2D3D' : '#F1F5F9',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                },
              ]}
            >
              <Text style={[styles.thoughtBubbleText, { color: colors.text }]} numberOfLines={2}>
                Obsessed with...
              </Text>
            </View>
            <View style={styles.noteAvatarWrapper}>
              <Image
                source={{
                  uri:
                    user?.profile?.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
                }}
                style={styles.noteAvatar}
              />
            </View>
            <Text style={[styles.noteName, { color: colors.text }]}>Your note</Text>
            <Text style={[styles.locationOffText, { color: colors.textMuted }]}>📍 Location off</Text>
          </View>

          {/* Map Shortcut Note (Opens 300m Nearby Discovery!) */}
          <TouchableOpacity
            style={styles.noteItem}
            onPress={onOpenMap}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.thoughtBubble,
                {
                  backgroundColor: isDark ? '#2D2D3D' : '#F1F5F9',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                },
              ]}
            >
              <Text style={[styles.thoughtBubbleText, { color: colors.text }]}>
                300m Radar
              </Text>
            </View>
            <View style={[styles.mapGlobeWrapper, { backgroundColor: '#38BDF8' }]}>
              <Globe size={32} color="#FFFFFF" strokeWidth={1.8} />
            </View>
            <Text style={[styles.noteName, { color: colors.text }]}>Map</Text>
            <Text style={[styles.locationOffText, { color: '#10B981' }]}>● Live 300m</Text>
          </TouchableOpacity>

          {/* Friend Note 1 */}
          <View style={styles.noteItem}>
            <View
              style={[
                styles.thoughtBubble,
                {
                  backgroundColor: isDark ? '#2D2D3D' : '#F1F5F9',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                },
              ]}
            >
              <Text style={[styles.thoughtBubbleText, { color: colors.text }]}>
                Coding all night 💻✨
              </Text>
            </View>
            <LinearGradient
              colors={['#F58529', '#DD2A7B', '#8134AF']}
              style={styles.storyGradientRing}
            >
              <View style={[styles.storyAvatarInner, { backgroundColor: colors.background }]}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200' }}
                  style={styles.noteAvatar}
                />
              </View>
            </LinearGradient>
            <Text style={[styles.noteName, { color: colors.text }]}>dr.kadari.ak</Text>
          </View>

          {/* Friend Note 2 */}
          <View style={styles.noteItem}>
            <View
              style={[
                styles.thoughtBubble,
                {
                  backgroundColor: isDark ? '#2D2D3D' : '#F1F5F9',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                },
              ]}
            >
              <Text style={[styles.thoughtBubbleText, { color: colors.text }]}>
                Weekend vibes 🌸
              </Text>
            </View>
            <View style={styles.noteAvatarWrapper}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' }}
                style={styles.noteAvatar}
              />
            </View>
            <Text style={[styles.noteName, { color: colors.text }]}>Priya</Text>
          </View>
        </ScrollView>

        {/* 4. Filter Tabs (Image 3: All 2 | Primary 1 | General | Requests 1) */}
        <View style={styles.filterTabsRow}>
          <TouchableOpacity
            style={[
              styles.tabPill,
              activeTab === 'all' && [
                styles.tabPillActive,
                { backgroundColor: isDark ? '#282836' : '#E0E7FF' },
              ],
            ]}
            onPress={() => setActiveTab('all')}
          >
            <Text
              style={[
                styles.tabPillText,
                { color: activeTab === 'all' ? (isDark ? '#FFFFFF' : '#4F46E5') : colors.textSecondary },
              ]}
            >
              ● All 2
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabPill,
              activeTab === 'primary' && [
                styles.tabPillActive,
                { backgroundColor: isDark ? '#282836' : '#E0E7FF' },
              ],
            ]}
            onPress={() => setActiveTab('primary')}
          >
            <Text
              style={[
                styles.tabPillText,
                { color: activeTab === 'primary' ? (isDark ? '#FFFFFF' : '#4F46E5') : colors.textSecondary },
              ]}
            >
              ● Primary 1
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabPill,
              activeTab === 'general' && [
                styles.tabPillActive,
                { backgroundColor: isDark ? '#282836' : '#E0E7FF' },
              ],
            ]}
            onPress={() => setActiveTab('general')}
          >
            <Text
              style={[
                styles.tabPillText,
                { color: activeTab === 'general' ? (isDark ? '#FFFFFF' : '#4F46E5') : colors.textSecondary },
              ]}
            >
              General
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabPill,
              activeTab === 'requests' && [
                styles.tabPillActive,
                { backgroundColor: isDark ? '#282836' : '#E0E7FF' },
              ],
            ]}
            onPress={() => setActiveTab('requests')}
          >
            <Text
              style={[
                styles.tabPillText,
                { color: activeTab === 'requests' ? (isDark ? '#FFFFFF' : '#4F46E5') : colors.textSecondary },
              ]}
            >
              ● Requests 1
            </Text>
          </TouchableOpacity>
        </View>

        {/* 5. Chat List (Image 3: neelasathyam, mahadev, dr.kadari, Akhil, etc.) */}
        <View style={styles.chatListContainer}>
          {filtered.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.chatRow,
                { borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' },
              ]}
              onPress={() => onOpenConversation(item)}
              activeOpacity={0.7}
            >
              {/* Avatar (with story ring if active) */}
              {item.hasStoryRing ? (
                <LinearGradient
                  colors={['#F58529', '#DD2A7B', '#8134AF']}
                  style={styles.chatStoryRing}
                >
                  <View style={[styles.chatAvatarInner, { backgroundColor: colors.background }]}>
                    <Image source={{ uri: item.avatarUrl }} style={styles.chatAvatar} />
                  </View>
                </LinearGradient>
              ) : (
                <View style={styles.chatAvatarWrapper}>
                  <Image source={{ uri: item.avatarUrl }} style={styles.chatAvatar} />
                </View>
              )}

              {/* Chat Info */}
              <View style={styles.chatInfo}>
                <Text style={[styles.chatName, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </Text>

                <View style={styles.chatLastMessageRow}>
                  <Text
                    style={[
                      styles.chatLastMessage,
                      {
                        color: item.unread ? colors.text : colors.textSecondary,
                        fontWeight: item.unread ? '700' : '400',
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {item.lastMessage}
                  </Text>
                  {item.time ? (
                    <Text style={[styles.chatTime, { color: colors.textMuted }]}>
                      {' '}• {item.time}
                    </Text>
                  ) : null}
                </View>

                {item.tag ? (
                  <Text style={[styles.chatTag, { color: colors.textSecondary }]}>
                    {item.tag}
                  </Text>
                ) : null}
              </View>

              {/* Right Indicator (Blue unread dot or camera icon) */}
              <View style={styles.chatRight}>
                {item.unread ? (
                  <View style={styles.blueUnreadDot} />
                ) : (
                  <Camera size={20} color={colors.textMuted} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Space at bottom for floating nav bar */}
        <View style={{ height: 90 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn: {
    padding: 6,
  },
  usernameDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
    maxWidth: 180,
  },
  headerUsername: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  filterBtn: {
    paddingLeft: 12,
    paddingVertical: 6,
  },
  filterBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notesContainer: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  noteItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 78,
  },
  thoughtBubble: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 82,
  },
  thoughtBubbleText: {
    fontSize: 9.5,
    fontWeight: '600',
    textAlign: 'center',
  },
  noteAvatarWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  noteAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  mapGlobeWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyGradientRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyAvatarInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteName: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  locationOffText: {
    fontSize: 9,
    marginTop: 1,
    textAlign: 'center',
  },
  filterTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tabPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
  },
  tabPillActive: {},
  tabPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chatListContainer: {
    paddingHorizontal: 14,
    marginTop: 6,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  chatAvatarWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    marginRight: 12,
  },
  chatStoryRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  chatAvatarInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  chatLastMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatLastMessage: {
    fontSize: 12,
    flexShrink: 1,
  },
  chatTime: {
    fontSize: 11,
  },
  chatTag: {
    fontSize: 10,
    marginTop: 2,
  },
  chatRight: {
    paddingLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blueUnreadDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#3B82F6',
  },
});
