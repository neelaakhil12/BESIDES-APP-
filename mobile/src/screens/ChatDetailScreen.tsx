import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ArrowLeft, Send, Image as ImageIcon, Video as VideoIcon } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface ChatDetailScreenProps {
  conversation: any;
  onBack: () => void;
}

export const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({
  conversation,
  onBack,
}) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();

  const [messages, setMessages] = useState<any[]>(conversation.messages || []);
  const [inputText, setInputText] = useState('');

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/chat/${conversation.id}/messages`);
      if (res.data?.success && res.data.messages?.length > 0) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      // offline fallback
      if (!messages || messages.length === 0) {
        setMessages(conversation.messages || []);
      }
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [conversation.id]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const textToSend = inputText.trim();
    setInputText('');

    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: user?.id || 'harshitha',
      text: textToSend,
      time: 'Just now',
    };
    setMessages((prev) => [...prev, newMsg]);

    try {
      await api.post(`/chat/${conversation.id}/messages`, {
        text: textToSend,
      });
    } catch (err) {
      // Keep optimistic message
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.tabBarBorder }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>

        <Image
          source={{
            uri:
              conversation.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
          }}
          style={styles.headerAvatar}
        />

        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerName, { color: colors.text }]}>
            {conversation.name}
          </Text>
          <Text style={[styles.onlineStatus, { color: colors.success }]}>Online</Text>
        </View>
      </View>

      {/* Messages Thread */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSelf = item.senderId === user?.id;

          return (
            <View
              style={[
                styles.messageBubbleWrapper,
                isSelf ? styles.selfWrapper : styles.otherWrapper,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  {
                    backgroundColor: isSelf ? colors.primary : colors.surface,
                    borderBottomRightRadius: isSelf ? 2 : 16,
                    borderBottomLeftRadius: isSelf ? 16 : 2,
                  },
                ]}
              >
                {item.text && (
                  <Text
                    style={[
                      styles.messageText,
                      { color: isSelf ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {item.text}
                  </Text>
                )}

                {item.mediaUrl && (
                  <Image
                    source={{ uri: item.mediaUrl }}
                    style={styles.mediaImage}
                    resizeMode="cover"
                  />
                )}
              </View>
              <Text style={[styles.timestampText, { color: colors.textMuted }]}>
                9:41 PM
              </Text>
            </View>
          );
        }}
      />

      {/* Input bar */}
      <View style={[styles.inputContainer, { backgroundColor: colors.tabBar, borderTopColor: colors.tabBarBorder }]}>
        <TouchableOpacity style={styles.mediaButton}>
          <ImageIcon size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
        />

        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: colors.primary }]}
          onPress={handleSendMessage}
        >
          <Send size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 10,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerName: {
    fontSize: 15,
    fontWeight: '700',
  },
  onlineStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  messageBubbleWrapper: {
    marginBottom: 10,
    maxWidth: '75%',
  },
  selfWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherWrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 19,
  },
  mediaImage: {
    width: 180,
    height: 140,
    borderRadius: 10,
    marginTop: 6,
  },
  timestampText: {
    fontSize: 9,
    marginTop: 3,
    paddingHorizontal: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  mediaButton: {
    padding: 8,
    marginRight: 4,
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 13,
    marginRight: 8,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
