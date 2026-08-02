import { create } from 'zustand';
import type { UserProfile } from '../types';

interface AuthState {
  firebaseUid: string | null;
  profile: UserProfile | null;
  initializing: boolean;
  setFirebaseUid: (uid: string | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setInitializing: (value: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUid: null,
  profile: null,
  initializing: true,
  setFirebaseUid: (uid) => set({ firebaseUid: uid }),
  setProfile: (profile) => set({ profile }),
  setInitializing: (value) => set({ initializing: value }),
  reset: () => set({ firebaseUid: null, profile: null }),
}));
