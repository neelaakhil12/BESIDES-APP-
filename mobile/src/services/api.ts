import axios from 'axios';
import { Platform } from 'react-native';

// On Web/Desktop preview: localhost:5000. On Android emulator: 10.0.2.2:5000. On physical device: LAN IP.
export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:5000/api',
  default: 'http://localhost:5000/api',
});

export const SOCKET_URL = Platform.select({
  android: 'http://10.0.2.2:5000',
  default: 'http://localhost:5000',
});

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let storedToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  storedToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const getAuthToken = () => storedToken;

export default api;
