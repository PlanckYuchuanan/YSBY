import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setToken as apiSetToken, clearToken as apiClearToken } from '../services/api';

interface User {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  phone: string;
  email?: string;
  status: 'active' | 'banned' | 'deleted';
  points: number;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updatePoints: (points: number) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setToken: async (token, user) => {
    await apiSetToken(token);
    await AsyncStorage.setItem('ysby_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: async () => {
    await apiClearToken();
    await AsyncStorage.removeItem('ysby_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('ysby_token');
      const userStr = await AsyncStorage.getItem('ysby_user');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ token, user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.error('Failed to check auth:', err);
      set({ isLoading: false });
    }
  },

  updatePoints: (points) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, points } });
    }
  },
}));
