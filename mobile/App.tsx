import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/theme/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { MobileFrame } from './src/components/MobileFrame';
import { Header } from './src/components/Header';
import { BottomNavBar, TabName } from './src/components/BottomNavBar';
import { ErrorBoundary } from './src/components/ErrorBoundary';

// Screens
import { SplashScreen } from './src/screens/SplashScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ExploreScreen } from './src/screens/ExploreScreen';
import { MapsScreen } from './src/screens/MapsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { ChatDetailScreen } from './src/screens/ChatDetailScreen';
import { CreateVideoScreen } from './src/screens/CreateVideoScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

type AppScreen =
  | 'splash'
  | 'login'
  | 'register'
  | 'forgot_password'
  | 'main'
  | 'chat'
  | 'chat_detail'
  | 'settings'
  | 'view_profile';

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

  // 5. Full-page Modal / Dedicated Screens
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

  if (currentScreen === 'chat') {
    return (
      <MobileFrame>
        <ChatScreen
          onBack={() => setCurrentScreen('main')}
          onOpenConversation={(conv) => {
            setSelectedConversation(conv);
            setCurrentScreen('chat_detail');
          }}
        />
      </MobileFrame>
    );
  }

  if (currentScreen === 'chat_detail' && selectedConversation) {
    return (
      <MobileFrame>
        <ChatDetailScreen
          conversation={selectedConversation}
          onBack={() => setCurrentScreen('chat')}
        />
      </MobileFrame>
    );
  }

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

  // Create Video Full Screen
  if (activeTab === 'create') {
    return (
      <MobileFrame>
        <CreateVideoScreen
          onClose={() => setActiveTab('home')}
          onPublishSuccess={() => setActiveTab('home')}
        />
      </MobileFrame>
    );
  }

  // Main 5-Tab Application Container (Home, Explore, Create, Maps, Me)
  return (
    <MobileFrame>
      <View style={styles.appContainer}>
        {/* Top Header - Not shown on full-screen video feed home page to match TikTok/Instagram immersive look */}
        {activeTab !== 'home' && (
          <Header
            title={
              activeTab === 'explore'
                ? 'Explore'
                : activeTab === 'maps'
                ? 'Nearby Users'
                : activeTab === 'me'
                ? 'Profile'
                : 'Besides'
            }
            onOpenChat={() => setCurrentScreen('chat')}
            onOpenSettings={() => setCurrentScreen('settings')}
            showChatIcon={activeTab !== 'me'}
            showSettingsIcon={activeTab === 'me'}
          />
        )}

        {/* Tab Screen Content */}
        <View style={styles.contentArea}>
          {activeTab === 'home' && (
            <HomeScreen
              onOpenChat={() => setCurrentScreen('chat')}
              onOpenProfile={(id) => {
                setSelectedProfileId(id);
                setCurrentScreen('view_profile');
              }}
            />
          )}

          {activeTab === 'explore' && (
            <ExploreScreen
              onOpenProfile={(id) => {
                setSelectedProfileId(id);
                setCurrentScreen('view_profile');
              }}
            />
          )}

          {activeTab === 'maps' && (
            <MapsScreen
              onOpenProfile={(id) => {
                setSelectedProfileId(id);
                setCurrentScreen('view_profile');
              }}
            />
          )}

          {activeTab === 'me' && (
            <ProfileScreen
              userId={user?.id}
              onOpenSettings={() => setCurrentScreen('settings')}
            />
          )}
        </View>

        {/* Bottom 5-Tab Navigation Bar */}
        <BottomNavBar
          currentTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
          }}
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
