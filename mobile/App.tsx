import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, PanResponder, Animated } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/theme/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { MobileFrame } from './src/components/MobileFrame';
import { BottomNavBar, TabName } from './src/components/BottomNavBar';
import { ErrorBoundary } from './src/components/ErrorBoundary';

// Screens
import { SplashScreen } from './src/screens/SplashScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { FeedHomeScreen } from './src/screens/FeedHomeScreen';
import { ReelsScreen } from './src/screens/ReelsScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { ChatDetailScreen } from './src/screens/ChatDetailScreen';
import { ExploreScreen } from './src/screens/ExploreScreen';
import { MapsScreen } from './src/screens/MapsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { CreateVideoScreen } from './src/screens/CreateVideoScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { SearchExploreScreen } from './src/screens/SearchExploreScreen';

type AppScreen =
  | 'splash'
  | 'login'
  | 'register'
  | 'forgot_password'
  | 'main'
  | 'chat_detail'
  | 'settings'
  | 'view_profile'
  | 'create_video'
  | 'maps'
  | 'notifications'
  | 'search';

const TABS: TabName[] = ['home', 'explore', 'chat', 'me'];

const MainNavigator: React.FC = () => {
  const { user, logout } = useAuth();
  // Starts on 'splash' screen so user sees the glowing Beside logo first like Instagram!
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('splash');
  const [activeTab, setActiveTab] = useState<TabName>('home');
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // Tab horizontal sliding track & gesture state (Instagram style sequential tab-by-tab slide)
  const [containerWidth, setContainerWidth] = useState<number>(390);
  const containerWidthRef = useRef<number>(390);
  const activeTabRef = useRef<TabName>('home');
  activeTabRef.current = activeTab;

  const slideAnim = useRef(new Animated.Value(0)).current;

  // Animate horizontal sliding track to target tab
  const animateToTab = (tab: TabName, instant = false) => {
    const idx = TABS.indexOf(tab);
    if (idx !== -1) {
      const targetX = -idx * containerWidthRef.current;
      if (instant) {
        slideAnim.setValue(targetX);
      } else {
        Animated.spring(slideAnim, {
          toValue: targetX,
          friction: 9,
          tension: 70,
          useNativeDriver: false,
        }).start();
      }
    }
  };

  const handleSelectTab = (tab: TabName) => {
    if (tab === 'create') {
      setCurrentScreen('create_video');
      return;
    }
    setActiveTab(tab);
    activeTabRef.current = tab;
    animateToTab(tab);
    if (currentScreen !== 'main') {
      setCurrentScreen('main');
    }
  };

  // Sync track when returning to main screen
  useEffect(() => {
    if (currentScreen === 'main') {
      animateToTab(activeTab, true);
    }
  }, [currentScreen]);

  // PanResponder to enable smooth horizontal swiping across tabs (Instagram style)
  const tabPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        // 1. On 'explore' tab: map dragging and bottom sheet card dragging must not be hijacked!
        if (activeTabRef.current === 'explore') {
          const locX = evt.nativeEvent.locationX;
          const locY = evt.nativeEvent.locationY;
          const isEdge = locX < 45 || locX > (containerWidthRef.current - 45);
          const isHeader = locY < 110;
          if (
            (isEdge || isHeader) &&
            Math.abs(gestureState.dx) > 20 &&
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5
          ) {
            return true;
          }
          return false;
        }

        // 2. On 'home' tab: don't hijack small card scrubber at bottom-right
        if (activeTabRef.current === 'home') {
          const locX = evt.nativeEvent.locationX;
          const locY = evt.nativeEvent.locationY;
          const isMiniCardArea = locX > (containerWidthRef.current - 120) && locY > 400;
          if (isMiniCardArea) return false;

          return (
            Math.abs(gestureState.dx) > 25 &&
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.8
          );
        }

        // 3. On 'chat' tab: don't hijack horizontal notes carousel (between y: 90 and 190)
        if (activeTabRef.current === 'chat') {
          const locY = evt.nativeEvent.locationY;
          if (locY >= 90 && locY <= 190) return false;
          return (
            Math.abs(gestureState.dx) > 25 &&
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.8
          );
        }

        // 4. On 'me' tab:
        if (activeTabRef.current === 'me') {
          return (
            Math.abs(gestureState.dx) > 25 &&
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.8
          );
        }

        return false;
      },
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dx) > 25 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.8
        );
      },
      onPanResponderMove: (_, gestureState) => {
        const currentIdx = TABS.indexOf(activeTabRef.current);
        const baseOffset = -currentIdx * containerWidthRef.current;
        let dx = gestureState.dx;
        // Rubber-band resistance on boundary edges
        if ((currentIdx === 0 && dx > 0) || (currentIdx === TABS.length - 1 && dx < 0)) {
          dx = dx * 0.25;
        }
        slideAnim.setValue(baseOffset + dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentIdx = TABS.indexOf(activeTabRef.current);
        let nextIdx = currentIdx;

        // Threshold: 40px drag or high velocity flick
        if ((gestureState.dx < -40 || gestureState.vx < -0.5) && currentIdx < TABS.length - 1) {
          nextIdx = currentIdx + 1;
        } else if ((gestureState.dx > 40 || gestureState.vx > 0.5) && currentIdx > 0) {
          nextIdx = currentIdx - 1;
        }

        const nextTab = TABS[nextIdx];
        setActiveTab(nextTab);
        activeTabRef.current = nextTab;

        Animated.spring(slideAnim, {
          toValue: -nextIdx * containerWidthRef.current,
          friction: 9,
          tension: 70,
          useNativeDriver: false,
        }).start();
      },
      onPanResponderTerminate: () => {
        const currentIdx = TABS.indexOf(activeTabRef.current);
        Animated.spring(slideAnim, {
          toValue: -currentIdx * containerWidthRef.current,
          friction: 9,
          tension: 70,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  // 1. Splash Screen (Initial Instagram-like entry)
  if (currentScreen === 'splash') {
    return (
      <MobileFrame>
        <SplashScreen
          onGetStarted={() => setCurrentScreen('register')}
          onLogin={() => setCurrentScreen('login')}
          autoTransition={true}
        />
      </MobileFrame>
    );
  }

  // 2. Login Screen ("Welcome Back" with Sign Up button)
  if (currentScreen === 'login') {
    return (
      <MobileFrame>
        <LoginScreen
          onNavigateRegister={() => setCurrentScreen('register')}
          onNavigateForgotPassword={() => setCurrentScreen('forgot_password')}
          onLoginSuccess={() => setCurrentScreen('main')}
        />
      </MobileFrame>
    );
  }

  // 3. Register Screen ("Create Account" with Log In link)
  if (currentScreen === 'register') {
    return (
      <MobileFrame>
        <RegisterScreen
          onNavigateLogin={() => setCurrentScreen('login')}
          onRegisterSuccess={() => setCurrentScreen('main')}
        />
      </MobileFrame>
    );
  }

  // 4. Forgot Password Screen
  if (currentScreen === 'forgot_password') {
    return (
      <MobileFrame>
        <ForgotPasswordScreen onBackToLogin={() => setCurrentScreen('login')} />
      </MobileFrame>
    );
  }

  // 5. Create Video / Post Screen
  if (currentScreen === 'create_video') {
    return (
      <MobileFrame>
        <CreateVideoScreen
          onClose={() => setCurrentScreen('main')}
          onPublishSuccess={() => setCurrentScreen('main')}
        />
      </MobileFrame>
    );
  }

  // 6. 1-on-1 Chat Detail Screen (Friend Chat conversation)
  if (currentScreen === 'chat_detail' && selectedConversation) {
    return (
      <MobileFrame>
        <ChatDetailScreen
          conversation={selectedConversation}
          onBack={() => setCurrentScreen('main')}
        />
      </MobileFrame>
    );
  }

  // 7. Maps Screen (300m Nearby Discovery)
  if (currentScreen === 'maps') {
    return (
      <MobileFrame>
        <MapsScreen
          onBack={() => setCurrentScreen('main')}
          onOpenProfile={(id) => {
            setSelectedProfileId(id);
            setCurrentScreen('view_profile');
          }}
        />
      </MobileFrame>
    );
  }

  // 8. Settings Screen
  if (currentScreen === 'settings') {
    return (
      <MobileFrame>
        <SettingsScreen
          onBack={() => setCurrentScreen('main')}
          onLogout={() => {
            logout();
            setCurrentScreen('login');
          }}
        />
      </MobileFrame>
    );
  }

  // 9. View Other Profile Screen
  if (currentScreen === 'view_profile' && selectedProfileId) {
    return (
      <MobileFrame>
        <ProfileScreen
          userId={selectedProfileId}
          onBack={() => setCurrentScreen('main')}
          onOpenSettings={() => setCurrentScreen('settings')}
        />
      </MobileFrame>
    );
  }

  // 10. Notifications Screen ("You're all caught up" in Beside Brand Colors)
  if (currentScreen === 'notifications') {
    return (
      <MobileFrame>
        <View style={styles.appContainer}>
          <View style={styles.contentArea}>
            <NotificationsScreen
              onBack={() => setCurrentScreen('main')}
              onOpenProfile={(id) => {
                setSelectedProfileId(id);
                setCurrentScreen('view_profile');
              }}
              onOpenChat={() => handleSelectTab('chat')}
            />
          </View>
          <BottomNavBar
            currentTab={activeTab}
            onSelectTab={handleSelectTab}
            userAvatarUrl={user?.profile?.avatarUrl}
          />
        </View>
      </MobileFrame>
    );
  }

  // 11. Search / Explore Moments Screen ("People, moments, interests")
  if (currentScreen === 'search') {
    return (
      <MobileFrame>
        <View style={styles.appContainer}>
          <View style={styles.contentArea}>
            <SearchExploreScreen
              onBack={() => setCurrentScreen('main')}
              onSelectMoment={() => handleSelectTab('home')}
              onOpenProfile={(id) => {
                setSelectedProfileId(id);
                setCurrentScreen('view_profile');
              }}
            />
          </View>
          <BottomNavBar
            currentTab={activeTab}
            onSelectTab={handleSelectTab}
            userAvatarUrl={user?.profile?.avatarUrl}
          />
        </View>
      </MobileFrame>
    );
  }

  // 12. Main 4-Tab Application Container with Instagram-style horizontal slide
  return (
    <MobileFrame>
      <View style={styles.appContainer}>
        {/* Tab Screen Content */}
        <View
          style={styles.contentArea}
          onLayout={(e) => {
            const width = Math.round(e.nativeEvent.layout.width);
            if (width > 0 && Math.abs(width - containerWidthRef.current) > 1) {
              setContainerWidth(width);
              containerWidthRef.current = width;
              const idx = TABS.indexOf(activeTabRef.current);
              slideAnim.setValue(-idx * width);
            }
          }}
          {...tabPanResponder.panHandlers}
        >
          <Animated.View
            style={[
              styles.tabsSliderTrack,
              {
                width: containerWidth * TABS.length,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            {/* Tab 1: Immersive Video Feed Home Page */}
            <View style={[styles.tabContentPane, { width: containerWidth }]}>
              <HomeScreen
                isActiveTab={activeTab === 'home' && currentScreen === 'main'}
                onOpenSearch={() => setCurrentScreen('search')}
                onOpenNotifications={() => setCurrentScreen('notifications')}
                onOpenChat={() => handleSelectTab('chat')}
                onOpenProfile={(id) => {
                  setSelectedProfileId(id);
                  setCurrentScreen('view_profile');
                }}
              />
            </View>

            {/* Tab 2: Explore / Nearby / Map / People */}
            <View style={[styles.tabContentPane, { width: containerWidth }]}>
              <ExploreScreen
                onOpenProfile={(id) => {
                  setSelectedProfileId(id);
                  setCurrentScreen('view_profile');
                }}
                onOpenChat={() => handleSelectTab('chat')}
                onOpenNotifications={() => setCurrentScreen('notifications')}
                onOpenSearch={() => setCurrentScreen('search')}
              />
            </View>

            {/* Tab 3: Instagram Direct Messages / Friend Chat */}
            <View style={[styles.tabContentPane, { width: containerWidth }]}>
              <ChatScreen
                onOpenConversation={(conv) => {
                  setSelectedConversation(conv);
                  setCurrentScreen('chat_detail');
                }}
                onOpenMap={() => setCurrentScreen('maps')}
              />
            </View>

            {/* Tab 4: User Profile */}
            <View style={[styles.tabContentPane, { width: containerWidth }]}>
              <ProfileScreen
                userId={user?.id}
                onOpenSettings={() => setCurrentScreen('settings')}
              />
            </View>
          </Animated.View>
        </View>

        {/* Floating Instagram-Style Rounded Pill Navigation Bar */}
        <BottomNavBar
          currentTab={activeTab}
          onSelectTab={handleSelectTab}
          userAvatarUrl={user?.profile?.avatarUrl}
        />
      </View>
    </MobileFrame>
  );
};

const initialMetrics = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider
        initialMetrics={initialMetrics}
        style={{ flex: 1, width: '100%', height: '100%', backgroundColor: '#06040B' }}
      >
        <ThemeProvider>
          <AuthProvider>
            <MainNavigator />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  },
  contentArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    height: '100%',
    width: '100%',
  },
  tabsSliderTrack: {
    flexDirection: 'row',
    height: '100%',
    position: 'relative',
  },
  tabContentPane: {
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  hiddenPane: {
    display: 'none',
  },
});
