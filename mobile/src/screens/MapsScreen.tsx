import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, MapPin, Navigation, Radio, RefreshCw, UserCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { MOCK_NEARBY_USERS } from '../services/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MapsScreenProps {
  onBack?: () => void;
  onOpenProfile: (userId: string) => void;
}

export const MapsScreen: React.FC<MapsScreenProps> = ({ onBack, onOpenProfile }) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();

  const [showLocation, setShowLocation] = useState(true);
  const [nearbyUsers, setNearbyUsers] = useState<any[]>(MOCK_NEARBY_USERS);
  const [selectedUser, setSelectedUser] = useState<any | null>(MOCK_NEARBY_USERS[0]);
  const [loading, setLoading] = useState(false);

  // Fetch nearby users within 300m
  const fetchNearby = async () => {
    setLoading(true);
    try {
      // Base location matching seed data (Hyderabad Tech City: 17.4435, 78.3772)
      const res = await api.post('/maps/nearby', {
        latitude: 17.4435,
        longitude: 78.3772,
      });

      if (res.data?.success && res.data.nearbyUsers?.length > 0) {
        setNearbyUsers(res.data.nearbyUsers);
        setSelectedUser(res.data.nearbyUsers[0]);
      } else {
        setNearbyUsers(MOCK_NEARBY_USERS);
        setSelectedUser(MOCK_NEARBY_USERS[0]);
      }
    } catch (err) {
      setNearbyUsers(MOCK_NEARBY_USERS);
      setSelectedUser(MOCK_NEARBY_USERS[0]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (val: boolean) => {
    setShowLocation(val);
    try {
      await api.post('/maps/visibility', { enabled: val });
    } catch (err) {
      // offline fallback
    }
    if (val) {
      setNearbyUsers(MOCK_NEARBY_USERS);
      setSelectedUser(MOCK_NEARBY_USERS[0]);
    } else {
      setNearbyUsers([]);
      setSelectedUser(null);
    }
  };

  useEffect(() => {
    fetchNearby();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.tabBarBorder }]}>
        <View style={styles.headerLeft}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <ArrowLeft size={20} color={colors.text} />
            </TouchableOpacity>
          )}
          <Text style={[styles.title, { color: colors.text }]}>Nearby Users</Text>
        </View>

        <TouchableOpacity onPress={fetchNearby} style={styles.refreshButton}>
          <RefreshCw size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Show My Location Toggle Banner */}
      <View style={[styles.toggleBanner, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.toggleLabelRow}>
          <Radio size={18} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.toggleLabel, { color: colors.text }]}>
            Show My Location
          </Text>
        </View>
        <Switch
          value={showLocation}
          onValueChange={handleToggleVisibility}
          trackColor={{ false: colors.surfaceLight, true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Interactive Radar & Map Area */}
      <View style={styles.mapContainer}>
        {/* Background Radar concentric rings (300m perimeter) */}
        <View style={[styles.radarOuterRing, { borderColor: 'rgba(224, 40, 125, 0.25)' }]}>
          <View style={[styles.radarMiddleRing, { borderColor: 'rgba(224, 40, 125, 0.4)' }]}>
            <View style={[styles.radarInnerRing, { borderColor: 'rgba(0, 242, 254, 0.5)' }]}>
              {/* User Center Pin (You) */}
              <View style={[styles.userCenterPin, { backgroundColor: colors.accentCyan }]}>
                <View style={styles.pulseDot} />
              </View>
            </View>
          </View>
        </View>

        {/* 300m Perimeter Badge */}
        <View style={[styles.perimeterBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.perimeterBadgeText}>300 m</Text>
        </View>

        {/* Dynamic Nearby User Markers dotted within the 300m circle */}
        {showLocation &&
          nearbyUsers.map((u, i) => {
            // Convert angle and relativeDistanceRatio to polar coordinates on radar
            const radarRadius = 135;
            const distanceRatio = Math.max(0.3, Math.min(0.9, u.relativeDistanceRatio || 0.4 + i * 0.15));
            const angleRad = ((u.angleDegrees || 45 + i * 75) * Math.PI) / 180;
            const x = Math.cos(angleRad) * (radarRadius * distanceRatio);
            const y = Math.sin(angleRad) * (radarRadius * distanceRatio);

            const isSelected = selectedUser?.id === u.id;

            return (
              <TouchableOpacity
                key={u.id}
                style={[
                  styles.markerContainer,
                  {
                    transform: [{ translateX: x }, { translateY: y }],
                  },
                ]}
                onPress={() => setSelectedUser(u)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.markerAvatarBorder,
                    {
                      borderColor: isSelected ? colors.primary : '#FFFFFF',
                      shadowColor: isSelected ? colors.primary : '#000000',
                    },
                  ]}
                >
                  <Image
                    source={{
                      uri:
                        u.avatarUrl ||
                        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
                    }}
                    style={styles.markerAvatar}
                  />
                </View>
                {isSelected && (
                  <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]} />
                )}
              </TouchableOpacity>
            );
          })}

        {/* Re-center GPS button */}
        <TouchableOpacity
          style={[styles.gpsButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          onPress={fetchNearby}
        >
          <Navigation size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Floating Selected User Profile Preview Card */}
      {selectedUser && showLocation && (
        <View style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Image
            source={{
              uri:
                selectedUser.avatarUrl ||
                'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
            }}
            style={styles.previewAvatar}
          />
          <View style={styles.previewInfo}>
            <Text style={[styles.previewName, { color: colors.text }]}>
              {selectedUser.fullName || selectedUser.username}
            </Text>
            <View style={styles.distanceRow}>
              <MapPin size={12} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.distanceText, { color: colors.textSecondary }]}>
                {selectedUser.distanceMeters || 120} m away
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewProfileButton}
            onPress={() => onOpenProfile(selectedUser.id)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.viewProfileGradient}
            >
              <Text style={styles.viewProfileText}>View Profile</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Disabled state helper */}
      {!showLocation && (
        <View style={[styles.disabledBanner, { backgroundColor: colors.card }]}>
          <Text style={[styles.disabledBannerTitle, { color: colors.text }]}>
            Location Sharing is Disabled
          </Text>
          <Text style={[styles.disabledBannerSubtitle, { color: colors.textSecondary }]}>
            Turn on 'Show My Location' to discover and interact with verified creators within 300 meters.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
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
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  refreshButton: {
    padding: 6,
  },
  toggleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  toggleLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  mapContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  radarOuterRing: {
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(224, 40, 125, 0.03)',
  },
  radarMiddleRing: {
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(155, 48, 255, 0.05)',
  },
  radarInnerRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 242, 254, 0.08)',
  },
  userCenterPin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#00F2FE',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  perimeterBadge: {
    position: 'absolute',
    top: 30,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  perimeterBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  markerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerAvatarBorder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2.5,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  markerAvatar: {
    width: '100%',
    height: '100%',
  },
  selectedIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 3,
  },
  gpsButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  previewAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 12,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '500',
  },
  viewProfileButton: {
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  viewProfileGradient: {
    flex: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewProfileText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  disabledBanner: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  disabledBannerSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
