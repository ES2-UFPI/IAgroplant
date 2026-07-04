import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In Expo development on an emulator or local machine, localhost or 10.0.2.2 is usually used.
// We point to http://localhost:8000/api by default (standard django port).
const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to automatically add Bearer token
api.interceptors.request.use(
  async (config) => {
    try {
      const storedUser = await AsyncStorage.getItem('@iagroplant/auth-user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        // For simulation, we can pass mock user id/name or JWT token if implemented.
        // We'll generate a simple JWT or pass a demo token.
        // Since PostgresAuthRepository expects credentials, we can pass a token or user ID.
        if (parsed && parsed.id) {
          // We can construct a mock access token for the backend JWTMiddleware to parse,
          // or pass it as Bearer. Let's pass a signed token if we can, or a simple mock.
          // Since the backend uses JWTMiddleware to decode JWT, we should generate an access token.
          // In a real app, signIn would return a real JWT token which we'd store.
          // Let's pass a mock JWT that is decodable if needed, or the stored token.
          const token = await AsyncStorage.getItem('@iagroplant/auth-token') || 'mock-token';
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      console.warn('Could not read auth token', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export async function get(url: string, params?: any) {
  try {
    const response = await api.get(url, { params });
    return response.data;
  } catch (error: any) {
    console.warn(`GET ${url} failed, using local fallback.`, error.message);
    throw error;
  }
}

export async function post(url: string, data?: any) {
  try {
    const response = await api.post(url, data);
    return response.data;
  } catch (error: any) {
    console.warn(`POST ${url} failed, using local fallback.`, error.message);
    throw error;
  }
}

export default api;
