import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAuthToken } from '../services/api';
import { MOCK_USERS } from '../services/mockData';

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  profile?: {
    avatarUrl?: string;
    bio?: string;
    locationVisibility?: boolean;
    themePreference?: string;
  };
  voiceBio?: {
    audioUrl?: string;
    duration?: number;
  };
  stats?: {
    videos: number;
    audience: number | string;
    interests: number;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (fullName: string, username: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

// Pre-seeded default user so the UI is immediately interactive
const defaultDemoUser: User = {
  id: 'harshitha',
  fullName: 'Harshitha Rao',
  username: 'harshitha',
  email: 'harshitha@besides.app',
  profile: {
    bio: 'Content Creator | Travel | Lifestyle ✨',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
    locationVisibility: true,
    themePreference: 'dark',
  },
  voiceBio: {
    audioUrl: 'https://actions.google.com/sounds/v1/water/rain_heavy.ogg',
    duration: 7.0,
  },
  stats: {
    videos: 124,
    audience: '18.4K',
    interests: 328,
  },
};

const AuthContext = createContext<AuthContextType>({
  user: defaultDemoUser,
  token: 'demo-token',
  isLoading: false,
  login: async () => ({ success: true }),
  register: async () => ({ success: true }),
  logout: () => {},
  updateUser: () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(defaultDemoUser);
  const [token, setToken] = useState<string | null>('demo-token');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync with live backend in background if available
  useEffect(() => {
    const syncBackend = async () => {
      try {
        const res = await api.post('/auth/login', {
          identifier: 'harshitha',
          password: 'password123',
        });
        if (res.data?.success) {
          setUser(res.data.user);
          setToken(res.data.tokens.accessToken);
          setAuthToken(res.data.tokens.accessToken);
        }
      } catch (err) {
        // Fallback to pre-seeded demo user
      }
    };
    syncBackend();
  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { identifier, password });
      if (res.data?.success) {
        const { user: loggedInUser, tokens } = res.data;
        setUser(loggedInUser);
        setToken(tokens.accessToken);
        setAuthToken(tokens.accessToken);
        setIsLoading(false);
        return { success: true };
      }
    } catch (err: any) {
      // Backend offline or running standalone on Vercel
    }

    // Accept ANY credentials for client demo!
    const cleanId = (identifier || 'harshitha').trim().toLowerCase().replace(/[@\.\s]/g, '_');
    const matchedMock = (MOCK_USERS as any)[cleanId];

    const resolvedUser: User = matchedMock
      ? {
          ...matchedMock,
          stats: {
            ...matchedMock.stats,
            videos: typeof matchedMock.stats.videos === 'number' ? matchedMock.stats.videos : 124,
          },
        }
      : {
          id: cleanId,
          fullName: identifier.includes('@')
            ? identifier.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
            : identifier.charAt(0).toUpperCase() + identifier.slice(1),
          username: cleanId,
          email: identifier.includes('@') ? identifier : `${cleanId}@besides.app`,
          profile: {
            bio: 'Besides Creator ✨ | Sharing moments & connecting nearby',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
            locationVisibility: true,
            themePreference: 'dark',
          },
          voiceBio: {
            audioUrl: 'https://actions.google.com/sounds/v1/water/rain_heavy.ogg',
            duration: 7.0,
          },
          stats: {
            videos: 24,
            audience: '4.8K',
            interests: 156,
          },
        };

    setUser(resolvedUser);
    setToken('demo-jwt-token-besides-client');
    setAuthToken('demo-jwt-token-besides-client');
    setIsLoading(false);
    return { success: true };
  };

  const register = async (fullName: string, username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', { fullName, username, email, password });
      if (res.data?.success) {
        const { user: registeredUser, tokens } = res.data;
        setUser(registeredUser);
        setToken(tokens.accessToken);
        setAuthToken(tokens.accessToken);
        setIsLoading(false);
        return { success: true };
      }
    } catch (err: any) {
      // Backend offline or on Vercel
    }

    // Universal registration for demo
    const cleanUsername = (username || 'user').trim().toLowerCase().replace(/[@\.\s]/g, '_');
    const newUser: User = {
      id: cleanUsername,
      fullName: fullName.trim() || 'New User',
      username: cleanUsername,
      email: email.trim() || `${cleanUsername}@besides.app`,
      profile: {
        bio: 'Welcome to my Besides profile! ✨',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500',
        locationVisibility: true,
        themePreference: 'dark',
      },
      voiceBio: {
        audioUrl: 'https://actions.google.com/sounds/v1/water/rain_heavy.ogg',
        duration: 6.0,
      },
      stats: {
        videos: 0,
        audience: 0,
        interests: 0,
      },
    };

    setUser(newUser);
    setToken('demo-jwt-token-besides-client');
    setAuthToken('demo-jwt-token-besides-client');
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
  };

  const updateUser = (updated: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : null));
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.log('Refresh user error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
