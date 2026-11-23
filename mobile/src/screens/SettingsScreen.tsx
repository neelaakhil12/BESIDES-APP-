import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import {
  ArrowLeft,
  User,
  Shield,
  Bell,
  MapPin,
  Moon,
  Globe,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface SettingsScreenProps {
  onBack: () => void;
  onLogout: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onLogout }) => {
  const { colors, mode, setMode, isDark } = useTheme();
  const { user } = useAuth();

  const [locationVisibility, setLocationVisibility] = useState(
    user?.profile?.locationVisibility ?? true
  );

  const handleToggleLocation = async (val: boolean) => {
    setLocationVisibility(val);
    try {
      await api.post('/maps/visibility', { enabled: val });
    } catch (err) {
      console.log('Location visibility toggle error:', err);
    }
  };

  const handleThemeCycle = () => {
    if (mode === 'dark') setMode('light');
    else if (mode === 'light') setMode('system');
    else setMode('dark');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.tabBarBorder }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
        {/* Account */}
        <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.cardBorder }]}>
          <View style={styles.iconLabelRow}>
            <User size={18} color={colors.text} style={styles.rowIcon} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>Account</Text>
          </View>
          <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Privacy */}
        <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.cardBorder }]}>
          <View style={styles.iconLabelRow}>
            <Shield size={18} color={colors.text} style={styles.rowIcon} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>Privacy</Text>
          </View>
          <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.cardBorder }]}>
          <View style={styles.iconLabelRow}>
            <Bell size={18} color={colors.text} style={styles.rowIcon} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>Notifications</Text>
          </View>
          <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Location Visibility Switch (Matching screenshot) */}
        <View style={[styles.settingRow, { borderBottomColor: colors.cardBorder }]}>
          <View style={styles.iconLabelRow}>
            <MapPin size={18} color={colors.primary} style={styles.rowIcon} />
            <View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Location Visibility</Text>
              <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
                Allow discovery on Maps (300m)
              </Text>
            </View>
          </View>
          <Switch
            value={locationVisibility}
            onValueChange={handleToggleLocation}
            trackColor={{ false: colors.surfaceLight, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Theme Preferences */}
        <TouchableOpacity
          style={[styles.settingRow, { borderBottomColor: colors.cardBorder }]}
          onPress={handleThemeCycle}
        >
          <View style={styles.iconLabelRow}>
            <Moon size={18} color={colors.text} style={styles.rowIcon} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>Theme</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.themeValueText, { color: colors.primary }]}>
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Text>
            <ChevronRight size={18} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

        {/* Language */}
        <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.cardBorder }]}>
          <View style={styles.iconLabelRow}>
            <Globe size={18} color={colors.text} style={styles.rowIcon} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>Language</Text>
          </View>
          <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Help & Support */}
        <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.cardBorder }]}>
          <View style={styles.iconLabelRow}>
            <HelpCircle size={18} color={colors.text} style={styles.rowIcon} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>Help & Support</Text>
          </View>
          <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* About Besides */}
        <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.cardBorder }]}>
          <View style={styles.iconLabelRow}>
            <Info size={18} color={colors.text} style={styles.rowIcon} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>About Besides</Text>
          </View>
          <Text style={[styles.versionText, { color: colors.textMuted }]}>v1.0.0 (MVP)</Text>
        </TouchableOpacity>

        {/* Logout (Red matching screenshot) */}
        <TouchableOpacity
          style={[styles.settingRow, { borderBottomColor: 'transparent', marginTop: 16 }]}
          onPress={onLogout}
        >
          <View style={styles.iconLabelRow}>
            <LogOut size={18} color={colors.danger} style={styles.rowIcon} />
            <Text style={[styles.logoutLabel, { color: colors.danger }]}>Logout</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  scrollList: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  iconLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  subLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  themeValueText: {
    fontSize: 13,
    fontWeight: '700',
    marginRight: 4,
  },
  versionText: {
    fontSize: 12,
  },
  logoutLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
});
