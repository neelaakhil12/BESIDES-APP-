import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
} from 'react-native';
import { Search, Edit3, ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import api from '../services/api';
import { MOCK_CONVERSATIONS } from '../services/mockData';

interface ChatScreenProps {
  onBack?: () => void;
  onOpenConversation: (conversation: any) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ onBack, onOpenConversation }) => {
  const { colors, isDark } = useTheme();
  const [activeFilter, setActiveFilter] = useState<'all' | 'direct' | 'groups'>('all');
  const [conversations, setConversations] = useState<any[]>(MOCK_CONVERSATIONS);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchConversations = async () => {
    try {
      const res = await api.get(`/chat/conversations?filter=${activeFilter}`);
      if (res.data?.success && res.data.conversations?.length > 0) {
        setConversations(res.data.conversations);
      } else {
        const filtered = MOCK_CONVERSATIONS.filter((c) => {
          if (activeFilter === 'direct') return !c.isGroup;
          if (activeFilter === 'groups') return c.isGroup;
          return true;
        });
        setConversations(filtered);
      }
    } catch (err) {
      const filtered = MOCK_CONVERSATIONS.filter((c) => {
        if (activeFilter === 'direct') return !c.isGroup;
        if (activeFilter === 'groups') return c.isGroup;
        return true;
      });
      setConversations(filtered);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [activeFilter]);

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.tabBarBorder }]}>
        <View style={styles.headerLeft}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <ArrowLeft size={20} color={colors.text} />
            </TouchableOpacity>
          )}
          <Text style={[styles.title, { color: colors.text }]}>Chats</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Search size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Edit3 size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Segmented Filter Tabs: All | Direct | Groups */}
      <View style={styles.tabContainer}>
        {(['all', 'direct', 'groups'] as const).map((tab) => {
          const isActive = activeFilter === tab;
          const label = tab === 'all' ? 'All' : tab === 'direct' ? 'Direct' : 'Groups';

          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveFilter(tab)}
              style={[
                styles.tabPill,
                {
                  backgroundColor: isActive ? colors.primary : colors.surface,
                },
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabPillText,
                  { color: isActive ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Conversation List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.conversationItem, { borderBottomColor: colors.cardBorder }]}
            onPress={() => onOpenConversation(item)}
            activeOpacity={0.7}
          >
            {/* Avatar with Online indicator */}
            <View style={styles.avatarWrapper}>
              <Image
                source={{
                  uri:
                    item.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
                }}
                style={styles.avatar}
              />
              <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
            </View>

            {/* Conversation Details */}
            <View style={styles.contentWrapper}>
              <View style={styles.nameRow}>
                <Text style={[styles.nameText, { color: colors.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.timeText, { color: colors.textMuted }]}>
                  {item.lastMessage ? '9:41 PM' : 'Just now'}
                </Text>
              </View>

              <View style={styles.messageRow}>
                <Text
                  style={[
                    styles.lastMessageText,
                    {
                      color: item.unreadCount > 0 ? colors.text : colors.textSecondary,
                      fontWeight: item.unreadCount > 0 ? '700' : '400',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.lastMessage?.text || 'Sent a photo/video'}
                </Text>

                {item.unreadCount > 0 && (
                  <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.unreadText}>{item.unreadCount}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  tabPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0B0814',
  },
  contentWrapper: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 11,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessageText: {
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
