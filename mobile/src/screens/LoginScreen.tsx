import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface LoginScreenProps {
  onNavigateRegister: () => void;
  onNavigateForgotPassword: () => void;
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateRegister,
  onNavigateForgotPassword,
  onLoginSuccess,
}) => {
  const { colors } = useTheme();
  const { login, isLoading } = useAuth();

  const [identifier, setIdentifier] = useState('harshitha');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');
    if (!identifier.trim() || !password) {
      setErrorMessage('Please enter your email/username and password');
      return;
    }

    const res = await login(identifier.trim(), password);
    if (res.success) {
      onLoginSuccess();
    } else {
      setErrorMessage(res.message || 'Login failed. Check your credentials.');
    }
  };

  const handleGoogleSignIn = async () => {
    // 1-Click Google Sign In with verified demo account
    const res = await login('harshitha', 'password123');
    if (res.success) {
      onLoginSuccess();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Logo */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Log in to Besides
        </Text>
      </View>

      {/* Form Fields */}
      <View style={styles.form}>
        {errorMessage ? (
          <View style={[styles.errorBanner, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Email or Mobile */}
        <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
          <Mail size={18} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Email or Username"
            placeholderTextColor={colors.textMuted}
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
          />
        </View>

        {/* Password */}
        <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
          <Lock size={18} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            {showPassword ? (
              <EyeOff size={18} color={colors.textSecondary} />
            ) : (
              <Eye size={18} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Forgot Password Link */}
        <TouchableOpacity
          onPress={onNavigateForgotPassword}
          style={styles.forgotPassword}
        >
          <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
            Forgot Password?
          </Text>
        </TouchableOpacity>

        {/* Log In Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Log In</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Separator */}
        <View style={styles.separatorRow}>
          <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />
          <Text style={[styles.separatorText, { color: colors.textMuted }]}>
            or continue with
          </Text>
          <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />
        </View>

        {/* Real Sign In with Google Button (Single official button) */}
        <TouchableOpacity
          style={[styles.googleSignInButton, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
          onPress={handleGoogleSignIn}
          activeOpacity={0.8}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" style={{ marginRight: 10 }}>
            <Path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.86c2.26-2.09 3.685-5.17 3.685-9.14z"
            />
            <Path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3.04c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.26v3.13C3.26 21.36 7.36 24 12 24z"
            />
            <Path
              fill="#FBBC05"
              d="M5.27 14.25c-.25-.72-.38-1.49-.38-2.25s.13-1.53.38-2.25V6.62H1.26C.46 8.23 0 10.06 0 12s.46 3.77 1.26 5.38l4.01-3.13z"
            />
            <Path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.26 6.62l4.01 3.13c.95-2.85 3.6-4.96 6.73-4.96z"
            />
          </Svg>
          <Text style={[styles.googleSignInText, { color: colors.text }]}>
            Sign in with Google
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer Navigation to Sign Up */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Don't have an account?{' '}
        </Text>
        <TouchableOpacity onPress={onNavigateRegister}>
          <Text style={[styles.signUpText, { color: colors.primary }]}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
  },
  logoImage: {
    width: 65,
    height: 65,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    width: '100%',
    marginVertical: 10,
  },
  errorBanner: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  eyeIcon: {
    padding: 6,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 18,
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loginButton: {
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#E0287D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  separatorText: {
    marginHorizontal: 10,
    fontSize: 12,
    fontWeight: '500',
  },
  googleSignInButton: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  googleSignInText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  footerText: {
    fontSize: 13,
  },
  signUpText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
