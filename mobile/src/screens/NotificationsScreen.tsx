import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Bell,
  Sparkles,
  MessageSquare,
  UserPlus,
  Heart,
  CheckCircle2,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

interface NotificationsScreenProps {
  onBack: () => void;
  onOpenProfile?: (userId: string) => void;
  onOpenChat?: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBack,
  onOpenProfile,
  onOpenChat,
}) => {
  const { colors } = useTheme();
  const [filterTab, setFilterTab] = useState<'all' | 'requests' | 'mentions'>('all');

  return (
    <View style={styles.container}>
      {/* 1. TOP HEADER (← Notifications) */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2.4} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {/* 2. FILTER PILLS (All • Requests • Mentions) in Besides Brand Colors */}
      <View style={styles.filterPillsRow}>
        <TouchableOpacity
          style={[
            styles.filterPill,
            filterTab === 'all' && styles.filterPillActive,
          ]}
          onPress={() => setFilterTab('all')}
          activeOpacity={0.8}
        >
          {filterTab === 'all' ? (
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.activePillGradient}
            >
              <Text style={styles.activePillText}>All</Text>
            </LinearGradient>
          ) : (
            <Text style={styles.inactivePillText}>All</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterPill,
            filterTab === 'requests' && styles.filterPillActive,
          ]}
          onPress={() => setFilterTab('requests')}
          activeOpacity={0.8}
        >
          {filterTab === 'requests' ? (
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.activePillGradient}
            >
              <Text style={styles.activePillText}>Audience Requests</Text>
            </LinearGradient>
          ) : (
            <Text style={styles.inactivePillText}>Audience Requests</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterPill,
            filterTab === 'mentions' && styles.filterPillActive,
          ]}
          onPress={() => setFilterTab('mentions')}
          activeOpacity={0.8}
        >
          {filterTab === 'mentions' ? (
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.activePillGradient}
            >
              <Text style={styles.activePillText}>Mentions</Text>
            </LinearGradient>
          ) : (
            <Text style={styles.inactivePillText}>Mentions</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 3. EMPTY STATE: "You're all caught up" (Matching reference screenshot with app colors) */}
      <View style={styles.emptyContentContainer}>
        {/* Glow Ring Behind Icon */}
        <View style={styles.glowOuterWrapper}>
          <LinearGradient
            colors={['rgba(224, 40, 125, 0.22)', 'rgba(138, 43, 226, 0.22)']}
            style={styles.bellIconCircle}
          >
            <View style={styles.bellIconInner}>
              <Bell size={32} color={colors.primary} strokeWidth={2.2} />
            </View>
          </LinearGradient>
        </View>

        {/* Primary Headline */}
        <Text style={styles.emptyHeadline}>You're all caught up</Text>

        {/* Subtitle */}
        <Text style={styles.emptySubtitle}>
          Messages and Audience requests will appear here.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07050E',
    position: 'relative',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 48 : 20,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  filterPillsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  filterPill: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterPillActive: {
    borderColor: 'transparent',
  },
  activePillGradient: {
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  activePillText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  inactivePillText: {
    color: '#94A3B8',
    fontSize: 12.5,
    fontWeight: '600',
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  emptyContentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginTop: -40,
  },
  glowOuterWrapper: {
    marginBottom: 24,
    shadowColor: '#E0287D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
  },
  bellIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(224, 40, 125, 0.5)',
  },
  bellIconInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(15, 11, 30, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.4)',
  },
  emptyHeadline: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 280,
    fontWeight: '500',
  },
});
