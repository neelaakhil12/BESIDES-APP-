import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Dimensions,
  Platform,
  Animated,
  PanResponder,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Radio,
  Map as MapIcon,
  Users,
  Compass,
  Search,
  Bell,
  MapPin,
  Shield,
  Plus,
  Minus,
  Crosshair,
  Navigation,
  SlidersHorizontal,
  MessageCircle,
  UserCheck,
  Check,
  CheckCircle,
  X,
  BadgeCheck,
  UserPlus,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { MOCK_EXPLORE_PEOPLE } from '../services/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ExploreScreenProps {
  onOpenProfile?: (userId: string) => void;
  onOpenChat?: () => void;
  onOpenNotifications?: () => void;
  onOpenSearch?: () => void;
  onSelectVideo?: (video: any) => void;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  onOpenProfile,
  onOpenChat,
  onOpenNotifications,
  onOpenSearch,
}) => {
  const { colors } = useTheme();

  // Top header toggle: 'following' | 'for_you'
  const [headerFeedTab, setHeaderFeedTab] = useState<'following' | 'for_you'>('for_you');

  // Main 3-segment switcher: 'nearby' | 'map' | 'people' (Map active by default)
  const [segmentTab, setSegmentTab] = useState<'nearby' | 'map' | 'people'>('map');

  // Location discovery permission state (enabled so map radar & people are interactive immediately)
  const [isLocationEnabled, setIsLocationEnabled] = useState(true);

  // Filter distance (100m, 300m, 500m, 2km)
  const [distanceFilter, setDistanceFilter] = useState('Within 100 m');
  const [isDiscoverable, setIsDiscoverable] = useState(true);
  const [showDiscoverySettings, setShowDiscoverySettings] = useState(false);

  // Dynamic radar radius and avatar spacing according to selected distance
  const getDistanceMetrics = () => {
    switch (distanceFilter) {
      case 'Within 100 m':
        return { radarSize: 170, waveSize: 260, baseRadius: 85 };
      case 'Within 300 m':
        return { radarSize: 220, waveSize: 330, baseRadius: 110 };
      case 'Within 500 m':
        return { radarSize: 270, waveSize: 400, baseRadius: 135 };
      case 'Within 2 km':
        return { radarSize: 320, waveSize: 470, baseRadius: 160 };
      default:
        return { radarSize: 220, waveSize: 330, baseRadius: 110 };
    }
  };

  const { radarSize, waveSize, baseRadius } = getDistanceMetrics();

  // Selected user for map pin highlight & profile preview bottom sheet
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [followedUsers, setFollowedUsers] = useState<{ [id: string]: boolean }>({});

  // Search mode toggle
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive Map State & Pan/Zoom Animations
  const [mapZoom, setMapZoom] = useState(1.0);
  const currentZoomRef = useRef(1.0);
  currentZoomRef.current = mapZoom;

  const initialPinchDist = useRef<number | null>(null);
  const initialPinchZoom = useRef<number>(1.0);

  const zoomAnim = useRef(new Animated.Value(1.0)).current;
  const panAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const panOffset = useRef({ x: 0, y: 0 });

  // Map PanResponder for smooth dragging/panning and 2-finger hand pinch-to-zoom
  const mapPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        // Immediate grab for multi-touch (pinch)
        return (evt.nativeEvent.touches?.length || 0) >= 2;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches?.length || 0;
        return touches >= 2 || Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3;
      },
      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches && touches.length >= 2) {
          const dist = Math.hypot(
            touches[0].pageX - touches[1].pageX,
            touches[0].pageY - touches[1].pageY
          );
          initialPinchDist.current = dist;
          initialPinchZoom.current = currentZoomRef.current;
        } else {
          panAnim.setOffset({
            x: panOffset.current.x,
            y: panOffset.current.y,
          });
          panAnim.setValue({ x: 0, y: 0 });
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;
        if (touches && touches.length >= 2) {
          // Hand pinch zoom gesture (2 fingers)
          const dist = Math.hypot(
            touches[0].pageX - touches[1].pageX,
            touches[0].pageY - touches[1].pageY
          );
          if (initialPinchDist.current === null) {
            initialPinchDist.current = dist;
            initialPinchZoom.current = currentZoomRef.current;
          } else if (initialPinchDist.current > 0) {
            const scaleFactor = dist / initialPinchDist.current;
            const newZoom = Math.min(Math.max(initialPinchZoom.current * scaleFactor, 0.5), 3.0);
            zoomAnim.setValue(newZoom);
            setMapZoom(newZoom);
          }
        } else if (!touches || touches.length === 1) {
          initialPinchDist.current = null;
          panAnim.setValue({ x: gestureState.dx, y: gestureState.dy });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        initialPinchDist.current = null;
        panAnim.flattenOffset();
        panOffset.current = {
          x: panOffset.current.x + gestureState.dx,
          y: panOffset.current.y + gestureState.dy,
        };
      },
      onPanResponderTerminate: () => {
        initialPinchDist.current = null;
      },
    })
  ).current;

  // Zoom In (+)
  const handleZoomIn = () => {
    setMapZoom((prev) => {
      const nextZoom = Math.min(prev + 0.3, 2.5);
      Animated.spring(zoomAnim, {
        toValue: nextZoom,
        friction: 6,
        tension: 50,
        useNativeDriver: false,
      }).start();
      return nextZoom;
    });
  };

  // Zoom Out (-)
  const handleZoomOut = () => {
    setMapZoom((prev) => {
      const nextZoom = Math.max(prev - 0.3, 0.55);
      Animated.spring(zoomAnim, {
        toValue: nextZoom,
        friction: 6,
        tension: 50,
        useNativeDriver: false,
      }).start();
      return nextZoom;
    });
  };

  // Recenter (⌖)
  const handleRecenter = () => {
    panOffset.current = { x: 0, y: 0 };
    setMapZoom(1.0);
    Animated.parallel([
      Animated.spring(panAnim, {
        toValue: { x: 0, y: 0 },
        friction: 6,
        tension: 50,
        useNativeDriver: false,
      }),
      Animated.spring(zoomAnim, {
        toValue: 1.0,
        friction: 6,
        tension: 50,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // Cycle distance filter
  const cycleDistance = () => {
    if (distanceFilter === 'Within 100 m') setDistanceFilter('Within 300 m');
    else if (distanceFilter === 'Within 300 m') setDistanceFilter('Within 500 m');
    else if (distanceFilter === 'Within 500 m') setDistanceFilter('Within 1 km');
    else setDistanceFilter('Within 100 m');
  };

  const handleEnableLocation = () => {
    setIsLocationEnabled(true);
    setIsDiscoverable(true);
    setSegmentTab('map');
  };

  // Only reveal nearby people if location discovery is enabled and discoverable!
  const isLocationActive = isLocationEnabled && isDiscoverable;

  const filteredPeople = isLocationActive
    ? MOCK_EXPLORE_PEOPLE.filter((p) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.fullName.toLowerCase().includes(q) ||
          p.username.toLowerCase().includes(q)
        );
      })
    : [];

  return (
    <View style={[styles.container, { backgroundColor: '#0B0814' }]}>
      {/* 1. TOP HEADER BAR (Identical to HomeScreen for 100% seamless tab transitions) */}
      <View style={styles.topHeaderBar}>
        {/* Left: Transparent Besides Logo */}
        <TouchableOpacity style={styles.logoCircleWrapper} activeOpacity={0.8}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.headerLogoImg}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Center: Following | For You Switcher */}
        <View style={styles.segmentedSwitcher}>
          <TouchableOpacity
            style={[
              styles.switchTab,
              headerFeedTab === 'following' && styles.switchTabActive,
            ]}
            onPress={() => setHeaderFeedTab('following')}
            activeOpacity={0.8}
          >
            {headerFeedTab === 'following' ? (
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.activeTabGradient}
              >
                <Text style={styles.activeTabText}>Following</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.inactiveTabText}>Following</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.switchTab,
              headerFeedTab === 'for_you' && styles.switchTabActive,
            ]}
            onPress={() => setHeaderFeedTab('for_you')}
            activeOpacity={0.8}
          >
            {headerFeedTab === 'for_you' ? (
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.activeTabGradient}
              >
                <Text style={styles.activeTabText}>For You</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.inactiveTabText}>For You</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Right: Search & Bell Buttons */}
        <View style={styles.rightTopButtons}>
          <TouchableOpacity
            style={styles.topCircleIconBtn}
            onPress={() => (onOpenSearch ? onOpenSearch() : setShowSearchBar(!showSearchBar))}
            activeOpacity={0.8}
          >
            <Search size={17} color="#FFFFFF" strokeWidth={2.4} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.topCircleIconBtn, { marginLeft: 8 }]}
            onPress={() => (onOpenNotifications ? onOpenNotifications() : onOpenChat && onOpenChat())}
            activeOpacity={0.8}
          >
            <Bell size={17} color="#FFFFFF" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Optional Search Bar Input */}
      {showSearchBar && (
        <View style={styles.searchBarContainer}>
          <Search size={16} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search nearby users, hashtags, places..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
      )}

      {/* 2. THREE-SEGMENT SWITCHER PILL (Nearby | Map | People) */}
      <View style={styles.switcherContainer}>
        <View style={styles.switcherTrack}>
          {/* A. Nearby Tab */}
          <TouchableOpacity
            style={styles.segmentButton}
            onPress={() => setSegmentTab('nearby')}
            activeOpacity={0.85}
          >
            {segmentTab === 'nearby' ? (
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.segmentActiveGradient}
              >
                <Compass size={17} color="#FFFFFF" strokeWidth={2.4} style={{ marginRight: 6 }} />
                <Text style={styles.segmentActiveText}>Nearby</Text>
              </LinearGradient>
            ) : (
              <View style={styles.segmentInactiveWrapper}>
                <Compass size={17} color="#94A3B8" strokeWidth={2} style={{ marginRight: 6 }} />
                <Text style={styles.segmentInactiveText}>Nearby</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* B. Map Tab */}
          <TouchableOpacity
            style={styles.segmentButton}
            onPress={() => setSegmentTab('map')}
            activeOpacity={0.85}
          >
            {segmentTab === 'map' ? (
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.segmentActiveGradient}
              >
                <MapIcon size={17} color="#FFFFFF" strokeWidth={2.4} style={{ marginRight: 6 }} />
                <Text style={styles.segmentActiveText}>Map</Text>
              </LinearGradient>
            ) : (
              <View style={styles.segmentInactiveWrapper}>
                <MapIcon size={17} color="#94A3B8" strokeWidth={2} style={{ marginRight: 6 }} />
                <Text style={styles.segmentInactiveText}>Map</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* C. People Tab */}
          <TouchableOpacity
            style={styles.segmentButton}
            onPress={() => setSegmentTab('people')}
            activeOpacity={0.85}
          >
            {segmentTab === 'people' ? (
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.segmentActiveGradient}
              >
                <Users size={17} color="#FFFFFF" strokeWidth={2.4} style={{ marginRight: 6 }} />
                <Text style={styles.segmentActiveText}>People</Text>
              </LinearGradient>
            ) : (
              <View style={styles.segmentInactiveWrapper}>
                <Users size={17} color="#94A3B8" strokeWidth={2} style={{ marginRight: 6 }} />
                <Text style={styles.segmentInactiveText}>People</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. SUB-FILTER BADGES (Within 100m • Discoverable) - Shown on Map & People */}
      {(segmentTab === 'map' || segmentTab === 'people' || isLocationEnabled) && (
        <View style={styles.filtersRow}>
          <TouchableOpacity
            style={styles.filterPill}
            onPress={() => setShowDiscoverySettings(true)}
            activeOpacity={0.8}
          >
            <Compass size={13} color={colors.primary} style={{ marginRight: 5 }} />
            <Text style={styles.filterPillText}>{distanceFilter}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, { marginLeft: 8 }]}
            onPress={() => setIsDiscoverable(!isDiscoverable)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isDiscoverable ? '#00F2FE' : '#64748B' },
              ]}
            />
            <Text style={styles.filterPillText}>
              {isDiscoverable ? 'Discoverable' : 'Hidden'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 4. MAIN CONTENT AREA DEPENDING ON ACTIVE SEGMENT */}
      <View style={styles.contentContainer}>
        {/* ============================================================== */}
        {/* TAB 1: NEARBY (Permission Landing if not enabled) */}
        {/* ============================================================== */}
        {segmentTab === 'nearby' && !isLocationEnabled && (
          <View style={styles.nearbyPermissionContainer}>
            {/* Glowing Center Radar Pin */}
            <View style={styles.radarGraphicWrapper}>
              <View style={styles.radarOuterGlowRing}>
                <View style={styles.radarInnerGlowRing}>
                  <LinearGradient
                    colors={['rgba(224, 40, 125, 0.35)', 'rgba(138, 43, 226, 0.35)']}
                    style={styles.centerIconPill}
                  >
                    <MapPin size={34} color={colors.primary} strokeWidth={2.4} />
                  </LinearGradient>
                </View>
              </View>
            </View>

            {/* Headline & Subtitle */}
            <Text style={styles.nearbyHeadline}>People, closer to you.</Text>
            <Text style={styles.nearbySubtitle}>
              Find your community nearby. Your exact location is never shared.
            </Text>

            {/* Enable Location Discovery CTA Button */}
            <TouchableOpacity
              style={styles.enableButtonWrapper}
              onPress={handleEnableLocation}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.enableButtonGradient}
              >
                <Crosshair size={18} color="#FFFFFF" strokeWidth={2.6} style={{ marginRight: 8 }} />
                <Text style={styles.enableButtonText}>Enable location discovery</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Security note */}
            <View style={styles.privacyNoteRow}>
              <Shield size={14} color="#64748B" style={{ marginRight: 5 }} />
              <Text style={styles.privacyNoteText}>Only while using Besides</Text>
            </View>
          </View>
        )}

        {/* If location is enabled and on 'nearby', render quick cards preview */}
        {segmentTab === 'nearby' && isLocationEnabled && (
          <View style={styles.nearbyEnabledContainer}>
            <View style={styles.nearbyEnabledHeader}>
              <Text style={styles.nearbyEnabledTitle}>Nearby Connections</Text>
              <TouchableOpacity onPress={() => setSegmentTab('people')}>
                <Text style={[styles.seeAllLink, { color: colors.primary }]}>View List</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>
              {filteredPeople.map((person) => (
                <TouchableOpacity
                  key={person.id}
                  style={styles.peopleCard}
                  onPress={() => onOpenProfile && onOpenProfile(person.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.peopleCardLeft}>
                    {person.isInitialAvatar ? (
                      <View style={[styles.avatarInitialCircle, { backgroundColor: '#1F1937', borderColor: colors.primary }]}>
                        <Text style={[styles.avatarInitialLetter, { color: colors.primary }]}>
                          {person.initial}
                        </Text>
                      </View>
                    ) : (
                      <View style={[styles.avatarImageWrapper, { borderColor: colors.primary }]}>
                        <Image source={{ uri: person.avatarUrl }} style={styles.avatarPhoto} />
                      </View>
                    )}
                    <View style={styles.peopleMeta}>
                      <View style={styles.nameRow}>
                        <Text style={styles.fullNameText}>{person.fullName}</Text>
                        {person.isDemo && (
                          <View style={styles.demoBadge}>
                            <Text style={styles.demoBadgeText}>DEMO</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.usernameText}>@{person.username}</Text>
                    </View>
                  </View>
                  <View style={styles.peopleCardRight}>
                    <Text style={styles.distanceTag}>{person.distance}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ============================================================== */}
        {/* TAB 2: MAP VIEW (Interactive Dark Mode Map with Cluster Pins) */}
        {/* ============================================================== */}
        {segmentTab === 'map' && (
          <View style={styles.mapViewWrapper}>
            {/* Styled Dark Cartography Surface with simulated street vectors */}
            <View
              style={styles.mapCanvas}
              {...mapPanResponder.panHandlers}
              {...(Platform.OS === 'web'
                ? {
                    onWheel: (e: any) => {
                      if (e.ctrlKey) {
                        const zoomFactor = -e.deltaY * 0.01;
                        setMapZoom((prev) => {
                          const nextZoom = Math.min(Math.max(prev + zoomFactor, 0.5), 3.0);
                          zoomAnim.setValue(nextZoom);
                          return nextZoom;
                        });
                      } else {
                        if (e.deltaY < 0) {
                          handleZoomIn();
                        } else {
                          handleZoomOut();
                        }
                      }
                    },
                  }
                : {})}
            >
              {/* Scalable & Pannable Cartography Surface */}
              <Animated.View
                style={[
                  styles.animatedMapSurface,
                  {
                    transform: [
                      { translateX: panAnim.x },
                      { translateY: panAnim.y },
                      { scale: zoomAnim },
                    ],
                  },
                ]}
              >
                {/* Dark Map Street Grid Pattern Overlay */}
                <View style={styles.mapGridStreets}>
                  <View style={[styles.mapRoadLine, { top: '20%', left: -200, right: -200, transform: [{ rotate: '18deg' }] }]} />
                  <View style={[styles.mapRoadLine, { top: '45%', left: -200, right: -200, transform: [{ rotate: '-12deg' }] }]} />
                  <View style={[styles.mapRoadLine, { top: '70%', left: -200, right: -200, transform: [{ rotate: '8deg' }] }]} />
                  <View style={[styles.mapRoadLine, { left: '30%', top: -200, bottom: -200, transform: [{ rotate: '15deg' }] }]} />
                  <View style={[styles.mapRoadLine, { left: '65%', top: -200, bottom: -200, transform: [{ rotate: '-25deg' }] }]} />

                  {/* Suburbs & River Contours */}
                  <View style={styles.mapWaterBody} />
                  <View style={styles.mapParkArea} />
                </View>

                {/* Central Glowing Radar Circle & User Indicator */}
                <View style={styles.centralRadarContainer} pointerEvents="box-none">
                  <View
                    style={[
                      styles.radarOuterWave,
                      {
                        width: waveSize,
                        height: waveSize,
                        borderRadius: waveSize / 2,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.centralRadarBoundary,
                      {
                        width: radarSize,
                        height: radarSize,
                        borderRadius: radarSize / 2,
                      },
                    ]}
                  >
                    <View style={styles.userCenterDot}>
                      <View style={styles.userCenterInnerDot} />
                    </View>
                  </View>
                </View>

                {/* Clustered User Pins (Only rendered when Location Discovery is active!) */}
                {isLocationActive && (
                  <View style={styles.pinsClusterContainer} pointerEvents="box-none">
                    {filteredPeople.map((person, idx) => {
                      const isSelected = selectedUser?.id === person.id;
                      const angles = [-65, -15, 50, 130, 210];
                      const radiusRatio = [1.0, 1.15, 0.95, 1.1, 0.9][idx % 5];
                      const radius = baseRadius * radiusRatio;
                      const angle = (angles[idx % angles.length] * Math.PI) / 180;
                      const offsetX = Math.cos(angle) * radius;
                      const offsetY = Math.sin(angle) * radius;

                      return (
                        <TouchableOpacity
                          key={person.id}
                          style={[
                            styles.mapPinItem,
                            {
                              transform: [{ translateX: offsetX }, { translateY: offsetY }],
                              zIndex: isSelected ? 30 : 10 + idx,
                            },
                          ]}
                          onPress={() => setSelectedUser(person)}
                          activeOpacity={0.85}
                        >
                          <View
                            style={[
                              styles.pinAvatarRing,
                              isSelected && styles.pinAvatarRingActive,
                            ]}
                          >
                            {person.isInitialAvatar ? (
                              <View style={styles.pinInitialCircle}>
                                <Text style={styles.pinInitialLetter}>{person.initial}</Text>
                              </View>
                            ) : (
                              <Image source={{ uri: person.avatarUrl }} style={styles.pinPhoto} />
                            )}
                          </View>
                          {isSelected ? (
                            <View style={styles.pinSelectedHandlePill}>
                              <Text style={styles.pinSelectedHandleText}>@{person.username}</Text>
                            </View>
                          ) : (
                            <View style={styles.pinDemoBadge}>
                              <Text style={styles.pinDemoText}>DEMO</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </Animated.View>

              {/* Privacy Mode: When Location Discovery is OFF */}
              {!isLocationActive && (
                <View style={styles.mapPrivacyOverlay}>
                  <View style={styles.mapPrivacyCard}>
                    <MapPin size={26} color={colors.primary} style={{ marginBottom: 8 }} />
                    <Text style={styles.mapPrivacyTitle}>Location Discovery is Off</Text>
                    <Text style={styles.mapPrivacySubtitle}>
                      Enable location discovery to see nearby people on the map and allow others to find you.
                    </Text>
                    <TouchableOpacity
                      style={styles.enableButtonSmall}
                      onPress={handleEnableLocation}
                      activeOpacity={0.85}
                    >
                      <LinearGradient
                        colors={[colors.gradientStart, colors.gradientEnd]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.enableButtonSmallGradient}
                      >
                        <Crosshair size={14} color="#FFFFFF" strokeWidth={2.4} style={{ marginRight: 6 }} />
                        <Text style={styles.enableButtonSmallText}>Enable location discovery</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Floating Map Controls on Right Edge */}
              <View style={styles.mapControlsColumn}>
                <TouchableOpacity
                  style={styles.mapControlButton}
                  onPress={handleZoomIn}
                  activeOpacity={0.7}
                >
                  <Plus size={18} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mapControlButton}
                  onPress={handleZoomOut}
                  activeOpacity={0.7}
                >
                  <Minus size={18} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mapControlButton}
                  onPress={handleRecenter}
                  activeOpacity={0.7}
                >
                  <Crosshair size={18} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mapControlButton}
                  onPress={handleRecenter}
                  activeOpacity={0.7}
                >
                  <Navigation size={18} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mapControlButton}
                  onPress={() => setShowDiscoverySettings(true)}
                  activeOpacity={0.7}
                >
                  <SlidersHorizontal size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Sheet Overlay: Profile Preview Card when selectedUser is present, else 5 People Nearby list */}
            <View
              style={styles.mapBottomSheet}
              onStartShouldSetResponder={() => true}
              onTouchEnd={(e) => e.stopPropagation?.()}
              {...(Platform.OS === 'web'
                ? {
                    onMouseDown: (e: any) => e.stopPropagation?.(),
                    onTouchStart: (e: any) => e.stopPropagation?.(),
                    onWheel: (e: any) => e.stopPropagation?.(),
                  }
                : {})}
            >
                {selectedUser ? (
                  /* ======================================================= */
                  /* USER PROFILE PREVIEW CARD (Matching Video Reference)   */
                  /* ======================================================= */
                  <View style={styles.previewCardContainer}>
                    <View style={styles.settingsDragIndicator} />

                    {/* Top Row: Avatar, Name + Verified Badge, Distance, Close */}
                    <View style={styles.previewHeaderRow}>
                      <TouchableOpacity
                        onPress={() => onOpenProfile && onOpenProfile(selectedUser.id)}
                        activeOpacity={0.85}
                      >
                        <View style={styles.previewAvatarRing}>
                          {selectedUser.isInitialAvatar ? (
                            <View style={styles.previewInitialCircle}>
                              <Text style={styles.previewInitialText}>{selectedUser.initial}</Text>
                            </View>
                          ) : (
                            <Image
                              source={{ uri: selectedUser.avatarUrl }}
                              style={styles.previewAvatarImg}
                            />
                          )}
                        </View>
                      </TouchableOpacity>

                      <View style={styles.previewHeaderTextCol}>
                        <TouchableOpacity
                          onPress={() => onOpenProfile && onOpenProfile(selectedUser.id)}
                          activeOpacity={0.85}
                        >
                          <View style={styles.previewNameRow}>
                            <Text style={styles.previewNameText}>{selectedUser.fullName}</Text>
                            <BadgeCheck size={16} color="#00F2FE" style={{ marginLeft: 5 }} />
                          </View>
                          <Text style={styles.previewHandleText}>
                            @{selectedUser.username} • {selectedUser.distance} away
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Close button to return to 5 people nearby list */}
                      <TouchableOpacity
                        onPress={() => setSelectedUser(null)}
                        style={styles.previewCloseBtn}
                        activeOpacity={0.7}
                      >
                        <X size={18} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>

                    {/* Stats Row: Audience | Interests | Moments */}
                    <View style={styles.previewStatsRow}>
                      <View style={styles.previewStatItem}>
                        <Text style={styles.previewStatValue}>2</Text>
                        <Text style={styles.previewStatLabel}>Audience</Text>
                      </View>
                      <View style={styles.previewStatDivider} />
                      <View style={styles.previewStatItem}>
                        <Text style={styles.previewStatValue}>2</Text>
                        <Text style={styles.previewStatLabel}>Interests</Text>
                      </View>
                      <View style={styles.previewStatDivider} />
                      <View style={styles.previewStatItem}>
                        <Text style={styles.previewStatValue}>3</Text>
                        <Text style={styles.previewStatLabel}>Moments</Text>
                      </View>
                    </View>

                    {/* Location Row */}
                    <View style={styles.previewLocationRow}>
                      <MapPin size={13} color={colors.primary} style={{ marginRight: 6 }} />
                      <Text style={styles.previewLocationText}>Madrid</Text>
                    </View>

                    {/* Action Buttons: Follow + Message */}
                    <View style={styles.previewActionsRow}>
                      <TouchableOpacity
                        style={[
                          styles.previewFollowBtn,
                          followedUsers[selectedUser.id] && styles.previewFollowBtnActive,
                        ]}
                        onPress={() =>
                          setFollowedUsers((prev) => ({
                            ...prev,
                            [selectedUser.id]: !prev[selectedUser.id],
                          }))
                        }
                        activeOpacity={0.85}
                      >
                        <LinearGradient
                          colors={
                            followedUsers[selectedUser.id]
                              ? ['#332D4D', '#251F3D']
                              : [colors.gradientStart, colors.gradientEnd]
                          }
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.previewFollowGradient}
                        >
                          <UserPlus size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                          <Text style={styles.previewFollowBtnText}>
                            {followedUsers[selectedUser.id] ? 'Following' : '+ Follow'}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.previewMessageBtn}
                        onPress={() => {
                          if (onOpenChat) onOpenChat();
                        }}
                        activeOpacity={0.85}
                      >
                        <MessageCircle size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                        <Text style={styles.previewMessageBtnText}>Message</Text>
                      </TouchableOpacity>
                    </View>

                    {/* View profile link */}
                    <TouchableOpacity
                      style={styles.viewProfileLinkBtn}
                      onPress={() => onOpenProfile && onOpenProfile(selectedUser.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.viewProfileLinkText}>View profile</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <View style={styles.bottomSheetHeader}>
                      <Text style={styles.peopleNearbyTitle}>
                        {isLocationActive ? `${filteredPeople.length} people nearby` : '0 people nearby'}
                      </Text>
                      {isLocationActive ? (
                        <TouchableOpacity
                          onPress={() => setSegmentTab('people')}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.seePeopleLink}>See people</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity onPress={handleEnableLocation}>
                          <Text style={[styles.seePeopleLink, { color: colors.primary }]}>Enable</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Horizontal scroll cards */}
                    {isLocationActive ? (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.bottomCardsScroll}
                      >
                        {filteredPeople.map((person) => {
                          return (
                            <TouchableOpacity
                              key={person.id}
                              style={styles.mapUserCard}
                              onPress={() => setSelectedUser(person)}
                              activeOpacity={0.8}
                            >
                              {person.isInitialAvatar ? (
                                <View
                                  style={[
                                    styles.cardInitialCircle,
                                    { backgroundColor: '#1F1937', borderColor: colors.primary },
                                  ]}
                                >
                                  <Text style={[styles.cardInitialText, { color: colors.primary }]}>
                                    {person.initial}
                                  </Text>
                                </View>
                              ) : (
                                <View
                                  style={[
                                    styles.cardPhotoWrapper,
                                    { borderColor: colors.primary },
                                  ]}
                                >
                                  <Image
                                    source={{ uri: person.avatarUrl }}
                                    style={styles.cardPhoto}
                                  />
                                </View>
                              )}
                              <View style={styles.cardInfo}>
                                <View style={styles.nameRow}>
                                  <Text style={styles.cardNameText}>{person.fullName}</Text>
                                  <View style={styles.demoBadge}>
                                    <Text style={styles.demoBadgeText}>DEMO</Text>
                                  </View>
                                </View>
                                <Text style={styles.cardDistanceText}>
                                  {person.distance} away
                                </Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    ) : (
                      <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
                        <Text style={{ color: '#94A3B8', fontSize: 12 }}>
                          Enable location discovery to see nearby members here.
                        </Text>
                      </View>
                    )}

                    {/* Map attribution notice */}
                    <View style={styles.mapAttribution}>
                      <Text style={styles.mapAttributionText}>
                        Leaflet | Tiles © Esri — Esri, HERE, Garmin, USGS, © OpenStreetMap contributors
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          )}

        {/* ============================================================== */}
        {/* TAB 3: PEOPLE VIEW (Clean vertical list matching screenshot)   */}
        {/* ============================================================== */}
        {segmentTab === 'people' && (
          <ScrollView
            style={styles.peopleListScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {isLocationActive ? (
              <>
                <View style={styles.peopleHeaderSection}>
                  <Text style={styles.peopleListTitle}>
                    People nearby {filteredPeople.length}
                  </Text>
                </View>

                {filteredPeople.map((person) => (
                  <TouchableOpacity
                    key={person.id}
                    style={styles.peopleCard}
                    onPress={() => onOpenProfile && onOpenProfile(person.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.peopleCardLeft}>
                      {person.isInitialAvatar ? (
                        <View
                          style={[
                            styles.avatarInitialCircle,
                            { backgroundColor: '#1F1937', borderColor: colors.primary },
                          ]}
                        >
                          <Text
                            style={[
                              styles.avatarInitialLetter,
                              { color: colors.primary },
                            ]}
                          >
                            {person.initial}
                          </Text>
                        </View>
                      ) : (
                        <View
                          style={[
                            styles.avatarImageWrapper,
                            { borderColor: colors.primary },
                          ]}
                        >
                          <Image
                            source={{ uri: person.avatarUrl }}
                            style={styles.avatarPhoto}
                          />
                        </View>
                      )}

                      <View style={styles.peopleMeta}>
                        <View style={styles.nameRow}>
                          <Text style={styles.fullNameText}>{person.fullName}</Text>
                          {person.isDemo && (
                            <View style={styles.demoBadge}>
                              <Text style={styles.demoBadgeText}>DEMO</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.usernameText}>@{person.username}</Text>
                      </View>
                    </View>

                    <View style={styles.peopleCardRight}>
                      <Text style={styles.distanceTag}>{person.distance}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <View style={styles.nearbyPermissionContainer}>
                <View style={styles.radarGraphicWrapper}>
                  <View style={styles.radarOuterGlowRing}>
                    <View style={styles.radarInnerGlowRing}>
                      <Users size={32} color={colors.primary} />
                    </View>
                  </View>
                </View>
                <Text style={styles.nearbyHeadline}>Location discovery is off.</Text>
                <Text style={styles.nearbySubtitle}>
                  Enable location discovery to see people around you and allow them to discover you.
                </Text>
                <TouchableOpacity
                  style={styles.enableButtonWrapper}
                  onPress={handleEnableLocation}
                  activeOpacity={0.88}
                >
                  <LinearGradient
                    colors={[colors.gradientStart, colors.gradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.enableButtonGradient}
                  >
                    <Crosshair size={18} color="#FFFFFF" strokeWidth={2.6} style={{ marginRight: 8 }} />
                    <Text style={styles.enableButtonText}>Enable location discovery</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* 5. DISCOVERY SETTINGS BOTTOM SHEET MODAL */}
      {showDiscoverySettings && (
        <View style={styles.settingsModalOverlay}>
          <TouchableOpacity
            style={styles.settingsModalBackdrop}
            activeOpacity={1}
            onPress={() => setShowDiscoverySettings(false)}
          />
          <View style={styles.settingsModalCard}>
            {/* Top Drag Indicator */}
            <View style={styles.settingsDragIndicator} />

            {/* Header */}
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>Discovery settings</Text>
              <Text style={styles.settingsSubtitle}>Your location stays private.</Text>
            </View>

            {/* Section 1: Discovery distance */}
            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>Discovery distance</Text>
              <View style={styles.distanceOptionsRow}>
                {[
                  { id: 'Within 100 m', label: '100 m' },
                  { id: 'Within 300 m', label: '300 m' },
                  { id: 'Within 500 m', label: '500 m' },
                  { id: 'Within 2 km', label: '2 km' },
                ].map((opt) => {
                  const isActive = distanceFilter === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[
                        styles.distancePillBtn,
                        isActive && styles.distancePillBtnActive,
                      ]}
                      onPress={() => setDistanceFilter(opt.id)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.distancePillText,
                          isActive && styles.distancePillTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 2: Nearby discovery Switch */}
            <View style={styles.settingsSection}>
              <View style={styles.nearbyDiscoveryRow}>
                <View style={{ flex: 1, paddingRight: 16 }}>
                  <Text style={styles.settingsSectionTitle}>Nearby discovery</Text>
                  <Text style={styles.nearbyDiscoveryDesc}>
                    When off, you cannot see nearby people and they cannot see you.
                  </Text>
                </View>
                <Switch
                  value={isDiscoverable}
                  onValueChange={setIsDiscoverable}
                  trackColor={{ false: '#2D2548', true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Section 3: Privacy check note */}
            <View style={styles.privacyGuaranteeRow}>
              <CheckCircle size={18} color={colors.primary} style={{ marginTop: 2, marginRight: 10 }} />
              <Text style={styles.privacyGuaranteeText}>
                Only an approximate position and distance are shared. Location is requested while this page is open, never continuously tracked in the background.
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0814',
  },
  // TOP HEADER BAR (Identical to HomeScreen so there is 0px shift between tabs)
  topHeaderBar: {
    paddingTop: Platform.OS === 'ios' ? 14 : 10,
    paddingBottom: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  logoCircleWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerLogoImg: {
    width: 28,
    height: 28,
  },
  segmentedSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 22,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  switchTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
  },
  switchTabActive: {
    backgroundColor: 'transparent',
  },
  activeTabGradient: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  inactiveTabText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  rightTopButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topCircleIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },

  // SEARCH BAR
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 18,
    paddingHorizontal: 14,
    height: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },

  // 3-SEGMENT SWITCHER
  switcherContainer: {
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 8,
  },
  switcherTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActiveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#E0287D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 4,
  },
  segmentActiveText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  segmentInactiveWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  segmentInactiveText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },

  // SUB-FILTERS ROW
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(224, 40, 125, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(224, 40, 125, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  filterPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  // CONTENT CONTAINER
  contentContainer: {
    flex: 1,
  },

  // TAB 1: NEARBY PERMISSION SCREEN
  nearbyPermissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  radarGraphicWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  radarOuterGlowRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'rgba(224, 40, 125, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(224, 40, 125, 0.04)',
  },
  radarInnerGlowRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: 'rgba(138, 43, 226, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(138, 43, 226, 0.08)',
  },
  centerIconPill: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(224, 40, 125, 0.8)',
    shadowColor: '#E0287D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 8,
  },
  nearbyHeadline: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.4,
  },
  nearbySubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 28,
    paddingHorizontal: 12,
  },
  enableButtonWrapper: {
    width: '100%',
    maxWidth: 290,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#E0287D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  enableButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  enableButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  privacyNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyNoteText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },

  // NEARBY ENABLED PREVIEW
  nearbyEnabledContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  nearbyEnabledHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nearbyEnabledTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  seeAllLink: {
    fontSize: 13,
    fontWeight: '700',
  },

  // TAB 2: MAP VIEW
  mapViewWrapper: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: '#0F0C1B',
    position: 'relative',
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? ({ touchAction: 'none' } as any) : {}),
  },
  animatedMapSurface: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    ...(Platform.OS === 'web' ? ({ cursor: 'grab' } as any) : {}),
  },
  mapGridStreets: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  mapRoadLine: {
    position: 'absolute',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  mapWaterBody: {
    position: 'absolute',
    top: '5%',
    right: '-10%',
    width: 200,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(0, 242, 254, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.1)',
  },
  mapParkArea: {
    position: 'absolute',
    bottom: '25%',
    left: '-5%',
    width: 160,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(138, 43, 226, 0.03)',
  },

  // CENTRAL RADAR & USER PINPOINT
  centralRadarContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarOuterWave: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(224, 40, 125, 0.22)',
    borderStyle: 'dashed',
  },
  centralRadarBoundary: {
    borderWidth: 2,
    borderColor: '#E0287D',
    backgroundColor: 'rgba(224, 40, 125, 0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E0287D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  userCenterDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(224, 40, 125, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCenterInnerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E0287D',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  // DISCOVERY SETTINGS BOTTOM SHEET MODAL
  settingsModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    justifyContent: 'flex-end',
  },
  settingsModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  settingsModalCard: {
    backgroundColor: '#161129',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 95 : 82,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 16,
  },
  settingsDragIndicator: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  settingsHeader: {
    marginBottom: 20,
  },
  settingsTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  settingsSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
  },
  settingsSection: {
    marginBottom: 22,
  },
  settingsSectionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  distanceOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  distancePillBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  distancePillBtnActive: {
    backgroundColor: '#E0287D',
    borderColor: '#E0287D',
    shadowColor: '#E0287D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  distancePillText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  distancePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  nearbyDiscoveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nearbyDiscoveryDesc: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  privacyGuaranteeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(224, 40, 125, 0.08)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(224, 40, 125, 0.2)',
  },
  privacyGuaranteeText: {
    flex: 1,
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 17,
  },

  // PRIVACY OVERLAY (When Location Discovery is OFF)
  mapPrivacyOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 130,
    backgroundColor: 'rgba(11, 8, 20, 0.65)',
  },
  mapPrivacyCard: {
    backgroundColor: 'rgba(22, 17, 41, 0.95)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(224, 40, 125, 0.35)',
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: 'center',
    maxWidth: 290,
    shadowColor: '#E0287D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  mapPrivacyTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  mapPrivacySubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 14,
  },
  enableButtonSmall: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  enableButtonSmallGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  enableButtonSmallText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  // MAP PINS CLUSTER
  pinsClusterContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPinItem: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinAvatarRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2.5,
    overflow: 'hidden',
    backgroundColor: '#161129',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.65,
    shadowRadius: 8,
    elevation: 6,
  },
  pinAvatarRingActive: {
    borderColor: '#E0287D',
    borderWidth: 3,
    shadowColor: '#E0287D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 10,
    transform: [{ scale: 1.15 }],
  },
  pinSelectedHandlePill: {
    position: 'absolute',
    bottom: -22,
    backgroundColor: 'rgba(15, 11, 30, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0287D',
    shadowColor: '#E0287D',
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },
  pinSelectedHandleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  pinInitialCircle: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1836',
  },
  pinInitialLetter: {
    color: '#00F2FE',
    fontSize: 18,
    fontWeight: '900',
  },
  pinPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  pinDemoBadge: {
    marginTop: -4,
    backgroundColor: 'rgba(224, 40, 125, 0.95)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  pinDemoText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  // FLOATING MAP CONTROLS
  mapControlsColumn: {
    position: 'absolute',
    right: 14,
    top: 20,
    gap: 8,
    zIndex: 30,
  },
  mapControlButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(22, 17, 41, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },

  // MAP BOTTOM SHEET
  mapBottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 78 : 68,
    backgroundColor: 'rgba(11, 8, 20, 0.96)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    zIndex: 40,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  peopleNearbyTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  seePeopleLink: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  bottomCardsScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  mapUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161129',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 160,
  },
  cardInitialCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardInitialText: {
    fontSize: 15,
    fontWeight: '800',
  },
  cardPhotoWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginRight: 10,
  },
  cardPhoto: {
    width: '100%',
    height: '100%',
  },
  cardInfo: {
    justifyContent: 'center',
  },
  cardNameText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginRight: 6,
  },
  cardDistanceText: {
    color: '#00F2FE',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  mapAttribution: {
    paddingHorizontal: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  mapAttributionText: {
    color: '#64748B',
    fontSize: 8,
    textAlign: 'center',
  },

  // USER PROFILE PREVIEW CARD IN BOTTOM SHEET
  previewCardContainer: {
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 4,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  previewAvatarRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E0287D',
    overflow: 'hidden',
    backgroundColor: '#1E1836',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewAvatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  previewInitialCircle: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1836',
  },
  previewInitialText: {
    color: '#00F2FE',
    fontSize: 20,
    fontWeight: '900',
  },
  previewHeaderTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  previewNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewNameText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  previewHandleText: {
    color: '#94A3B8',
    fontSize: 12.5,
    marginTop: 2,
  },
  previewCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  previewStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  previewStatValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  previewStatLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  previewStatDivider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  previewLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  previewLocationText: {
    color: '#CBD5E1',
    fontSize: 12.5,
    fontWeight: '600',
  },
  previewActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  previewFollowBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  previewFollowBtnActive: {
    opacity: 0.85,
  },
  previewFollowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  previewFollowBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  previewMessageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  previewMessageBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
  viewProfileLinkBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  viewProfileLinkText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  // TAB 3: PEOPLE VIEW
  peopleListScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  peopleHeaderSection: {
    paddingVertical: 10,
  },
  peopleListTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  peopleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#161129',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  peopleCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarInitialCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitialLetter: {
    fontSize: 17,
    fontWeight: '900',
  },
  avatarImageWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginRight: 12,
  },
  avatarPhoto: {
    width: '100%',
    height: '100%',
  },
  peopleMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullNameText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginRight: 6,
  },
  demoBadge: {
    backgroundColor: 'rgba(224, 40, 125, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(224, 40, 125, 0.6)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  demoBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  usernameText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  peopleCardRight: {
    paddingLeft: 10,
  },
  distanceTag: {
    color: '#00F2FE',
    fontSize: 12,
    fontWeight: '700',
  },
});
