import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { MessageSquare, Settings } from 'lucide-react-native';
import { TabName } from './BottomNavBar';

interface HeaderProps {
  title?: string;
  onOpenChat?: () => void;
  onOpenSettings?: () => void;
  unreadCount?: number;
  showChatIcon?: boolean;
  showSettingsIcon?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onOpenChat,
  onOpenSettings,
  unreadCount = 2,
  showChatIcon = true,
  showSettingsIcon = false,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.headerContainer, { borderBottomColor: colors.tabBarBorder }]}>
      {/* Brand logo & Title */}
      <View style={styles.brandRow}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={[styles.brandTitle, { color: colors.text }]}>
          {title || 'Besides'}
        </Text>
      </View>

      {/* Right Action Icons */}
      <View style={styles.actionRow}>
        {showSettingsIcon && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onOpenSettings}
            activeOpacity={0.7}
          >
            <Settings size={22} color={colors.text} />
          </TouchableOpacity>
        )}

        {showChatIcon && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onOpenChat}
            activeOpacity={0.7}
          >
            <MessageSquare size={22} color={colors.text} />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    zIndex: 90,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});
