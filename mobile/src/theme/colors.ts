export interface ColorPalette {
  background: string;
  card: string;
  cardBorder: string;
  surface: string;
  surfaceLight: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  gradientStart: string;
  gradientEnd: string;
  accentCyan: string;
  tabBar: string;
  tabBarBorder: string;
  inputBg: string;
  inputBorder: string;
  danger: string;
  success: string;
}

export const darkPalette: ColorPalette = {
  background: '#0B0814',
  card: '#151028',
  cardBorder: '#281F47',
  surface: '#1E1738',
  surfaceLight: '#2C224F',
  text: '#FFFFFF',
  textSecondary: '#A9A2C8',
  textMuted: '#68608A',
  primary: '#E0287D',
  primaryDark: '#B81861',
  primaryLight: '#FF4097',
  gradientStart: '#E0287D',
  gradientEnd: '#8A2BE2',
  accentCyan: '#00F2FE',
  tabBar: '#0E0A1D',
  tabBarBorder: '#1F173B',
  inputBg: '#191330',
  inputBorder: '#2B2050',
  danger: '#EF4444',
  success: '#10B981',
};

export const lightPalette: ColorPalette = {
  background: '#F8F9FE',
  card: '#FFFFFF',
  cardBorder: '#E5E7EB',
  surface: '#F1F3F9',
  surfaceLight: '#E8ECF5',
  text: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  primary: '#E0287D',
  primaryDark: '#B81861',
  primaryLight: '#FF4097',
  gradientStart: '#E0287D',
  gradientEnd: '#8A2BE2',
  accentCyan: '#00B4D8',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E5E7EB',
  inputBg: '#FFFFFF',
  inputBorder: '#D1D5DB',
  danger: '#EF4444',
  success: '#10B981',
};
