import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
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
  | 'maps';

const MainNavigator: React.FC = () => {
  const { user, logout } = useAuth();
  // Starts on 'splash' screen so user sees the glowing Beside logo first like Instagram!
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('splash');
  const [activeTab, setActiveTab] = useState<TabName>('home');
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

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
          onOpenSettings={() => setCurrentScreen('settings')}
        />
      </MobileFrame>
    );
  }

  // 10. Main 5-Tab Application Container (Home, Reels, Chat, Explore, Profile)
  return (
    <MobileFrame>
      <View style={styles.appContainer}>
        {/* Tab Screen Content */}
        <View style={styles.contentArea}>
          {/* Tab 1: Immersive Video Feed Home Page matching screenshot */}
          {activeTab === 'home' && (
            <HomeScreen
              onOpenSearch={() => setActiveTab('explore')}
              onOpenNotifications={() => setActiveTab('chat')}
              onOpenChat={() => setActiveTab('chat')}
              onOpenProfile={(id) => {
                setSelectedProfileId(id);
                setCurrentScreen('view_profile');
              }}
            />
          )}

          {/* Tab 2: Dedicated Reels Tab (Full-screen vertical video reels) */}
          {activeTab === 'reels' && (
            <ReelsScreen
              onOpenChat={() => setActiveTab('chat')}
              onOpenProfile={(id) => {
                setSelectedProfileId(id);
                setCurrentScreen('view_profile');
              }}
            />
          )}

          {/* Tab 3: Instagram Direct Messages / Friend Chat */}
          {activeTab === 'chat' && (
            <ChatScreen
              onOpenConversation={(conv) => {
                setSelectedConversation(conv);
                setCurrentScreen('chat_detail');
              }}
              onOpenMap={() => setCurrentScreen('maps')}
            />
          )}

          {/* Tab 4: Explore / Nearby / Map / People */}
          {activeTab === 'explore' && (
            <ExploreScreen
              onOpenProfile={(id) => {
                setSelectedProfileId(id);
                setCurrentScreen('view_profile');
              }}
              onOpenChat={() => setActiveTab('chat')}
            />
          )}

          {/* Tab 5: User Profile */}
          {activeTab === 'me' && (
            <ProfileScreen
              userId={user?.id}
              onOpenSettings={() => setCurrentScreen('settings')}
            />
          )}
        </View>

        {/* Floating Instagram-Style Rounded Pill Navigation Bar */}
        <BottomNavBar
          currentTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'create') {
              setCurrentScreen('create_video');
            } else {
              setActiveTab(tab);
            }
          }}
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
  },
  contentArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    height: '100%',
  },
});
